# Django app: legal (consent tracking)
# App name: legal
# Purpose: store & manage user acceptance of Terms & Conditions and Privacy Policy
# Author: generated for Ethical Multimedia
# Notes:
# - Designed to be dropped into an existing Django project
# - Uses Django REST Framework for API endpoints
# - Captures user (optional), email (for guests), terms/privacy version, timestamp, IP address, user agent, source, and metadata

# -----------------------------------------------------------------------------
# FILE: legal/apps.py
# -----------------------------------------------------------------------------
from django.apps import AppConfig


class LegalConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "legal"
    verbose_name = "Legal / Consent"


# -----------------------------------------------------------------------------
# FILE: legal/models.py
# -----------------------------------------------------------------------------
from django.db import models
from django.conf import settings
from django.utils import timezone


class LegalConsent(models.Model):
    """
    Record of a user's acceptance of Terms & Conditions and Privacy Policy.

    Fields:
      - user: optional FK to the authenticated user (if present)
      - email: optional email used for guest signups / bookings
      - terms_version / privacy_version: which version was accepted
      - accepted_at: when the acceptance happened
      - ip_address, user_agent: for audit and legal proof
      - source: a short tag describing where acceptance happened ("signup", "booking", "terms-page")
      - metadata: free-form JSON for extra context (booking id, invoice id, etc.)
      - revoked, revoked_at: support for consent withdrawal
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="legal_consents",
    )
    email = models.EmailField(null=True, blank=True)
    terms_version = models.CharField(max_length=64)
    privacy_version = models.CharField(max_length=64)
    accepted_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    source = models.CharField(
        max_length=100,
        blank=True,
        help_text='Where the acceptance happened: e.g. "signup", "booking", "terms-page"',
    )
    metadata = models.JSONField(null=True, blank=True)

    revoked = models.BooleanField(default=False)
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-accepted_at"]
        verbose_name = "Legal consent"
        verbose_name_plural = "Legal consents"

    def __str__(self):
        who = self.user.get_username() if self.user else (self.email or f"Consent#{self.pk}")
        return f"{who} — T:{self.terms_version} P:{self.privacy_version} at {self.accepted_at.isoformat()}"

    def revoke(self):
        """Mark this consent as revoked (withdrawn)."""
        self.revoked = True
        self.revoked_at = timezone.now()
        self.save(update_fields=["revoked", "revoked_at"]) 


# -----------------------------------------------------------------------------
# FILE: legal/utils.py
# -----------------------------------------------------------------------------
"""
Utility helpers (small and dependency-free).
"""


def get_client_ip(request):
    """Return the best-guess client IP address (X-Forwarded-For fallback).

    When deploying behind proxies/load-balancers you should ensure the
    proxy sets X-Forwarded-For and that Django is configured to use
    SECURE_PROXY_SSL_HEADER or similar as appropriate.
    """
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        # X-Forwarded-For may contain multiple IPs, the first is the client.
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip


# -----------------------------------------------------------------------------
# FILE: legal/permissions.py
# -----------------------------------------------------------------------------
from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow access only to object owner (consent.user) or staff users."""

    def has_object_permission(self, request, view, obj):
        # obj is a LegalConsent instance
        if request.user and request.user.is_staff:
            return True
        if obj.user and request.user.is_authenticated:
            return obj.user == request.user
        return False


# -----------------------------------------------------------------------------
# FILE: legal/serializers.py
# -----------------------------------------------------------------------------
from rest_framework import serializers
from .models import LegalConsent


class LegalConsentSerializer(serializers.ModelSerializer):
    """Serializer for creating and reading consents.

    Notes:
      - 'user' is read-only and populated from request.user in the view.
      - 'accepted_at', 'ip_address', 'user_agent', 'revoked', 'revoked_at' are read-only.
    """

    class Meta:
        model = LegalConsent
        fields = [
            "id",
            "user",
            "email",
            "terms_version",
            "privacy_version",
            "accepted_at",
            "ip_address",
            "user_agent",
            "source",
            "metadata",
            "revoked",
            "revoked_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "accepted_at",
            "ip_address",
            "user_agent",
            "revoked",
            "revoked_at",
        ]

    def validate(self, attrs):
        """Require either an authenticated user or an email address for guests."""
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not (user and user.is_authenticated) and not attrs.get("email"):
            raise serializers.ValidationError(
                "Authentication or email required to record consent."
            )
        # Ensure versions are provided (caller may rely on defaults)
        if not attrs.get("terms_version"):
            raise serializers.ValidationError({"terms_version": "This field is required."})
        if not attrs.get("privacy_version"):
            raise serializers.ValidationError({"privacy_version": "This field is required."})
        return attrs


# -----------------------------------------------------------------------------
# FILE: legal/views.py
# -----------------------------------------------------------------------------
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import LegalConsent
from .serializers import LegalConsentSerializer
from .utils import get_client_ip
from .permissions import IsOwnerOrAdmin


class ConsentCreateView(generics.CreateAPIView):
    """Create a new consent record. Open to anonymous users (guests must provide email)."""

    queryset = LegalConsent.objects.all()
    serializer_class = LegalConsentSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        request = self.request
        user = request.user if request.user.is_authenticated else None
        ip = get_client_ip(request)
        ua = request.META.get("HTTP_USER_AGENT", "")

        # Save with server-side contextual data
        serializer.save(user=user, ip_address=ip, user_agent=ua)


class MyConsentsView(generics.ListAPIView):
    """Return consents belonging to the authenticated user."""

    serializer_class = LegalConsentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LegalConsent.objects.filter(user=self.request.user)


class ConsentListAdminView(generics.ListAPIView):
    """Admin-only listing of all consents (with simple filters via query params)."""

    serializer_class = LegalConsentSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = LegalConsent.objects.all()

    # You can add filter backends (SearchFilter, DjangoFilterBackend) in real projects.


class ConsentDetailView(generics.RetrieveAPIView):
    """Retrieve a consent record — allowed for owner or admin."""

    queryset = LegalConsent.objects.all()
    serializer_class = LegalConsentSerializer
    permission_classes = [IsOwnerOrAdmin]


class ConsentRevokeView(APIView):
    """Revoke (withdraw) a consent. Owner or admin only."""

    permission_classes = [IsOwnerOrAdmin]

    def post(self, request, pk):
        consent = get_object_or_404(LegalConsent, pk=pk)
        self.check_object_permissions(request, consent)
        if consent.revoked:
            return Response({"detail": "Consent already revoked."}, status=status.HTTP_200_OK)
        consent.revoke()
        return Response({"detail": "Consent revoked."}, status=status.HTTP_200_OK)


# -----------------------------------------------------------------------------
# FILE: legal/urls.py
# -----------------------------------------------------------------------------
from django.urls import path
from .views import (
    ConsentCreateView,
    MyConsentsView,
    ConsentListAdminView,
    ConsentDetailView,
    ConsentRevokeView,
)

app_name = "legal"

urlpatterns = [
    # POST: create a consent
    path("consents/", ConsentCreateView.as_view(), name="consent-create"),

    # GET: list consents for authenticated user
    path("consents/me/", MyConsentsView.as_view(), name="consent-me"),

    # Admin list
    path("consents/all/", ConsentListAdminView.as_view(), name="consent-list-all"),

    # Detail & revoke
    path("consents/<int:pk>/", ConsentDetailView.as_view(), name="consent-detail"),
    path("consents/<int:pk>/revoke/", ConsentRevokeView.as_view(), name="consent-revoke"),
]


# -----------------------------------------------------------------------------
# FILE: legal/admin.py
# -----------------------------------------------------------------------------
from django.contrib import admin
from .models import LegalConsent


@admin.register(LegalConsent)
class LegalConsentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "email",
        "terms_version",
        "privacy_version",
        "accepted_at",
        "ip_address",
        "revoked",
    )
    list_filter = ("terms_version", "privacy_version", "revoked", "accepted_at")
    search_fields = ("user__username", "user__email", "email", "ip_address")
    readonly_fields = ("accepted_at", "revoked_at")


# -----------------------------------------------------------------------------
# FILE: legal/tests.py
# -----------------------------------------------------------------------------
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.urls import reverse

User = get_user_model()


class ConsentAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="tester", password="password", email="tester@example.com")
        self.create_url = reverse("legal:consent-create")

    def test_create_consent_guest_requires_email(self):
        # missing email -> should fail
        response = self.client.post(self.create_url, data={
            "terms_version": "v1.0",
            "privacy_version": "v1.0",
            "source": "terms-page",
        }, format="json")
        self.assertEqual(response.status_code, 400)

    def test_create_consent_authenticated(self):
        self.client.login(username="tester", password="password")
        response = self.client.post(self.create_url, data={
            "terms_version": "v1.0",
            "privacy_version": "v1.0",
            "source": "signup",
        }, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertIn("id", response.data)


# -----------------------------------------------------------------------------
# FILE: README.md (instructions)
# -----------------------------------------------------------------------------
"""
Django 'legal' app — install & integration instructions

1) Install dependencies in your environment:
   pip install djangorestframework django-cors-headers

2) Add apps to settings.py:
   INSTALLED_APPS += [
       'rest_framework',
       'corsheaders',
       'legal',
   ]

3) Add middleware (early in the chain):
   MIDDLEWARE = [
       'corsheaders.middleware.CorsMiddleware',
       # ... existing middleware ...
   ]

   # During development you can allow all origins, but in production whitelist only your domains.
   CORS_ALLOW_ALL_ORIGINS = True

4) Configure REST Framework (example):
   REST_FRAMEWORK = {
       'DEFAULT_AUTHENTICATION_CLASSES': (
           'rest_framework.authentication.SessionAuthentication',
           'rest_framework.authentication.TokenAuthentication',
       ),
       'DEFAULT_PERMISSION_CLASSES': (
           'rest_framework.permissions.IsAuthenticatedOrReadOnly',
       ),
   }

5) Include the app urls in your project urls.py:
   path('api/legal/', include('legal.urls', namespace='legal')),

6) Run migrations:
   python manage.py makemigrations legal
   python manage.py migrate

7) Use the API from your frontend (examples below).

Endpoint summary:
  POST  /api/legal/consents/       -> create consent (AllowAny, guests must provide email)
  GET   /api/legal/consents/me/    -> list consents for authenticated user
  GET   /api/legal/consents/all/   -> admin-only list of all consents
  GET   /api/legal/consents/<pk>/  -> owner/admin detail
  POST  /api/legal/consents/<pk>/revoke/ -> owner/admin revoke

Frontend payload (JSON):
  {
    "terms_version": "v1.0",
    "privacy_version": "v1.0",
    "email": "optional-for-guests@example.com",
    "source": "terms-page",
    "metadata": {"booking_id": 123}
  }

Security notes:
 - If you use SessionAuthentication, ensure CSRF token is provided by the frontend.
 - You may prefer JWT or Token auth for APIs called from single-page apps.
 - Capture IP and User-Agent server-side (this code does that) for stronger audit trail.

"""

import axiosInstance from "../axiosInstance"; // Authenticated axios
import publicAxios from "../publicAxios";     // Public access axios
import API from "../authAPI";

/* ---------- Token Helpers ---------- */
function saveTokens({ access, refresh, remember }) {
  const storage = remember ? localStorage : sessionStorage;
  if (access) storage.setItem("access_token", access);
  if (refresh) storage.setItem("refresh_token", refresh);
}

function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
}

function getAccessToken() {
  return (
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token")
  );
}

function getRefreshToken() {
  return (
    localStorage.getItem("refresh_token") ||
    sessionStorage.getItem("refresh_token")
  );
}

/* ---------- Normalize backend auth responses ---------- */
function normalizeAuthResponse(res, remember) {
  let tokens = { access: null, refresh: null };
  let user = null;

  if (res?.data?.tokens) {
    tokens = res.data.tokens;
    user = res.data.user || null;
  } else {
    // Sometimes backend returns tokens directly
    if (res?.data?.access || res?.data?.refresh) {
      tokens = {
        access: res.data.access,
        refresh: res.data.refresh,
      };
    }
    user = res?.data?.user || res?.data || null;
  }

  if (tokens.access && tokens.refresh) {
    saveTokens({ access: tokens.access, refresh: tokens.refresh, remember });
  }

  return { tokens, user };
}

/* ---------- Auth Service ---------- */
const authService = {
  // ------------------- LOGIN -------------------
  login: async (credentials, remember = true) => {
    // Include all required fields for backend validation
    const safeCredentials = {
      email: String(credentials.email || "").trim(),
      password: String(credentials.password || ""),
      role: String(credentials.role || "").trim(),
      accessCode: String(credentials.accessCode || "").trim(),
    };

    const res = await publicAxios.post(API.login, safeCredentials, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });

    return normalizeAuthResponse(res, remember);
  },

  // ------------------- LOGOUT -------------------
  logout: async () => {
    try {
      if (API.logout) {
        await axiosInstance.post(API.logout, {}, { withCredentials: true });
      }
    } finally {
      clearTokens();
    }
  },

  // ------------------- GOOGLE AUTH -------------------
  googleLogin: async (data, remember = true) => {
    const res = await publicAxios.post(API.googleLogin, data, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return normalizeAuthResponse(res, remember);
  },

  googleRegister: async (data, remember = true) => {
    const res = await publicAxios.post(API.googleRegister, data, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return normalizeAuthResponse(res, remember);
  },

  // ------------------- REGISTRATION -------------------
  register: async (data, remember = true) => {
    const res = await publicAxios.post(API.register, data, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return normalizeAuthResponse(res, remember);
  },

  internalRegister: (data) => publicAxios.post(API.internalRegister, data),

  // ------------------- PROFILE & ROLES -------------------
  getProfile: () => axiosInstance.get(API.profile),
  updateProfile: (data) => axiosInstance.patch(API.profile, data),
  changePassword: (data) => axiosInstance.post(API.changePassword, data),
  currentUserRole: () => axiosInstance.get(API.currentUserRole),
  roleChoices: () => axiosInstance.get(API.roleChoices),
  partnerProfile: () => axiosInstance.get(API.partnerProfile),
  vendorProfile: () => axiosInstance.get(API.vendorProfile),

  // ------------------- PASSWORD RESET -------------------
  resetPassword: (data) =>
    publicAxios.post(API.resetPassword, data, { withCredentials: true }),

  resetPasswordConfirm: (uid, token, data) =>
    publicAxios.post(API.resetPasswordConfirm(uid, token), data, {
      withCredentials: true,
    }),

  // ------------------- JWT UTILITIES -------------------
  refreshToken: async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error("No refresh token found");
    const res = await publicAxios.post(API.tokenRefresh, { refresh });
    saveTokens({ access: res.data.access, refresh });
    return res;
  },
  verifyToken: (data) => publicAxios.post(API.tokenVerify, data),

  // ------------------- OTP -------------------
  verifyOtp: (data) =>
    publicAxios.post(API.verifyOtp, data, { withCredentials: true }),
  resendOtp: (data) =>
    publicAxios.post(API.resendOtp, data, { withCredentials: true }),

  // ------------------- ADMIN -------------------
  listUsers: (params) => axiosInstance.get(API.adminListUsers, { params }),
  adminInviteWorker: (data) => axiosInstance.post(API.adminInviteWorker, data),
  adminValidateWorkerInvite: (uid, token) =>
    publicAxios.get(API.adminValidateWorkerInvite(uid, token), {
      withCredentials: true,
    }),
  adminCompleteWorkerInvite: (data) =>
    publicAxios.post(API.adminCompleteWorkerInvite, data, {
      withCredentials: true,
    }),
  adminResetPassword: (data) => axiosInstance.post(API.adminResetPassword, data),
  adminProfileByEmail: (data) => axiosInstance.post(API.adminProfileByEmail, data),
  adminDeleteByEmail: (data) => axiosInstance.post(API.adminDeleteByEmail, data),
  adminSendMessage: (data) => axiosInstance.post(API.adminSendMessage, data),
  adminSpecialOffer: (data) => axiosInstance.post(API.adminSpecialOffer, data),

  // ------------------- WORKER -------------------
  workerCategories: () => axiosInstance.get(API.workerCategories),

  // ------------------- TOKEN HELPERS -------------------
  saveTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
};

export default authService;

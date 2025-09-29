/* ============================
   AUTH SERVICE (self-contained)
============================ */

import { publicAxios, axiosInstance } from '../axiosInstance';
import API from '../authAPI'; // all endpoint URLs

/* ---------- Token Helpers ---------- */
function saveTokens({ access, refresh, remember }) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('access_token', access);
  storage.setItem('refresh_token', refresh);
}

function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
}

function getAccessToken() {
  return (
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token')
  );
}

function getRefreshToken() {
  return (
    localStorage.getItem('refresh_token') ||
    sessionStorage.getItem('refresh_token')
  );
}
/* ----------------------------------- */

const authService = {
  /**
   * Login: POST /login/
   * returns { tokens: {access, refresh}, user } or { user } if OTP verification needed
   */
  login: async (credentials, remember = true) => {
    const res = await publicAxios.post(API.login, credentials, { withCredentials: true });

    let tokens = { access: null, refresh: null };
    let user = null;

    if (res.data.tokens) {
      tokens = res.data.tokens;
      user = res.data.user || null;
      const { access, refresh } = tokens;
      if (access && refresh) saveTokens({ access, refresh, remember });
    } else {
      user = res.data.user || res.data;
    }
    return { tokens, user };
  },

  logout: async () => {
    try {
      if (API.logout) {
        await axiosInstance.post(API.logout, {}, { withCredentials: true });
      }
    } finally {
      clearTokens();
    }
  },

  /* ---------- Google OAuth ---------- */
  googleLogin: async (data, remember = true) => {
    const res = await publicAxios.post(API.googleAuth, data, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.data.access && res.data.refresh) {
      saveTokens({ access: res.data.access, refresh: res.data.refresh, remember });
    }
    return res;
  },

  /* ---------- Registration ---------- */
  register: async (data, remember = true) => {
    const res = await publicAxios.post(API.register, data, { withCredentials: true });
    let tokens = { access: null, refresh: null };
    let user = null;

    if (res.data.tokens) {
      tokens = res.data.tokens;
      user = res.data.user || null;
      const { access, refresh } = tokens;
      if (access && refresh) saveTokens({ access, refresh, remember });
    } else {
      user = res.data.user || res.data;
    }
    return { tokens, user };
  },

  internalRegister: (data) => publicAxios.post(API.internalRegister, data),

  /* ---------- Profile & Roles ---------- */
  getProfile: () => axiosInstance.get(API.profile),
  updateProfile: (data) => axiosInstance.patch(API.profile, data),
  changePassword: (data) => axiosInstance.post(API.changePassword, data),
  currentUserRole: () => axiosInstance.get(API.currentUserRole),
  roleChoices: () => axiosInstance.get(API.roleChoices),
  partnerProfile: () => axiosInstance.get(API.partnerProfile),
  vendorProfile: () => axiosInstance.get(API.vendorProfile),

  /* ---------- Password Reset ---------- */
  resetPassword: (data) => publicAxios.post(API.resetPassword, data, { withCredentials: true }),
  resetPasswordConfirm: (uidb64, token, data) =>
    publicAxios.post(API.resetPasswordConfirm(uidb64, token), data, { withCredentials: true }),

  /* ---------- JWT Utilities ---------- */
  refreshToken: async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error('No refresh token found');
    const res = await publicAxios.post(API.tokenRefresh, { refresh });
    saveTokens({ access: res.data.access, refresh });
    return res;
  },
  verifyToken: (data) => publicAxios.post(API.tokenVerify, data),

  /* ---------- OTP ---------- */
  verifyOtp: (data) => publicAxios.post(API.verifyOtp, data, { withCredentials: true }),
  resendOtp: (data) => publicAxios.post(API.resendOtp, data, { withCredentials: true }),
  resendWelcomeEmail: (data) => axiosInstance.post(API.resendWelcomeEmail, data),

  /* ---------- Admin ---------- */
  listUsers: (params) => axiosInstance.get(API.adminListUsers, { params }),
  adminInviteWorker: (data) => axiosInstance.post(API.adminInviteWorker, data),
  adminValidateWorkerInvite: (uidb64, token) =>
    publicAxios.get(API.adminValidateWorkerInvite(uidb64, token), { withCredentials: true }),
  adminCompleteWorkerInvite: (data) =>
    publicAxios.post(API.adminCompleteWorkerInvite, data, { withCredentials: true }),
  adminResetPassword: (data) => axiosInstance.post(API.adminResetPassword, data),
  adminProfileByEmail: (data) => axiosInstance.post(API.adminProfileByEmail, data),
  adminDeleteByEmail: (data) => axiosInstance.post(API.adminDeleteByEmail, data),
  adminSendMessage: (data) => axiosInstance.post(API.adminSendMessage, data),
  adminSpecialOffer: (data) => axiosInstance.post(API.adminSpecialOffer, data),

  /* ---------- Worker ---------- */
  workerCategories: () => axiosInstance.get(API.workerCategories),

  /* ---------- Expose token helpers if needed ---------- */
  saveTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
};

export default authService;

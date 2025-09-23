import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import API from "./authAPI";

// ===== TOKEN KEYS =====
const TOKEN_KEY = "access";
const REFRESH_KEY = "refresh";
const REMEMBER_KEY = "remember";

// ===== STORAGE HELPERS =====
const getStorage = () =>
  localStorage.getItem(REMEMBER_KEY) === "true" ? localStorage : sessionStorage;

const saveTokens = ({ access, refresh, remember = true }) => {
  const storage = remember ? localStorage : sessionStorage;
  if (access) storage.setItem(TOKEN_KEY, access);
  if (refresh) storage.setItem(REFRESH_KEY, refresh);
  storage.setItem(REMEMBER_KEY, remember ? "true" : "false");
  axiosInstance.defaults.headers.common["Authorization"] = access ? `Bearer ${access}` : "";
};

const clearTokens = () => {
  [localStorage, sessionStorage].forEach((storage) => {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(REFRESH_KEY);
    storage.removeItem(REMEMBER_KEY);
  });
  delete axiosInstance.defaults.headers.common["Authorization"];
};

const getAccessToken = () => getStorage().getItem(TOKEN_KEY);
const getRefreshToken = () => getStorage().getItem(REFRESH_KEY);

// Initialize Authorization header on load
(() => {
  const token = getAccessToken();
  if (token) axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
})();

// ===== AUTH SERVICE =====
const authService = {
  // ---- AUTH ----
  login: async (data, remember = true) => {
    const res = await publicAxios.post(API.login, data, { withCredentials: true });
    saveTokens({ ...res.data, remember });
    return res;
  },
  logout: async () => {
    try {
      await axiosInstance.post(API.logout, {}, { withCredentials: true });
    } finally {
      clearTokens();
    }
  },
  googleLogin: async (data, remember = true) => {
    const res = await publicAxios.post(API.googleLogin, data, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
    saveTokens({ ...res.data, remember });
    return res;
  },
  googleRegister: (data) =>
    publicAxios.post(API.googleRegister, data, { withCredentials: true }),

  // ---- REGISTRATION ----
  register: (data) => publicAxios.post(API.register, data, { withCredentials: true }),
  internalRegister: (data) => publicAxios.post(API.internalRegister, data),

  // ---- PROFILE ----
  getProfile: () => axiosInstance.get(API.profilesProfile),
  updateProfile: (data) => axiosInstance.patch(API.profilesProfile, data),
  changePassword: (data) => axiosInstance.post(API.changePassword, data),
  currentUserRole: () => axiosInstance.get(API.currentUserRole),
  roleChoices: () => axiosInstance.get(API.roleChoices),
  partnerProfile: () => axiosInstance.get(API.partnerProfile),
  vendorProfile: () => axiosInstance.get(API.vendorProfile),

  // ---- PASSWORD RESET ----
  resetPassword: (data) => publicAxios.post(API.resetPassword, data, { withCredentials: true }),
  resetPasswordConfirm: (uid, token, data) =>
    publicAxios.post(API.resetPasswordConfirm(uid, token), data, { withCredentials: true }),

  // ---- JWT TOKENS ----
  getToken: (data) => publicAxios.post(API.token, data),
  refreshToken: async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error("No refresh token found");
    const res = await publicAxios.post(API.tokenRefresh, { refresh });
    saveTokens({ access: res.data.access, refresh });
    return res;
  },
  verifyToken: (data) => publicAxios.post(API.tokenVerify, data),

  // ---- EMAIL / OTP ----
  verifyEmail: (uidOrUidb64, token) =>
    publicAxios.get(API.verifyEmail(uidOrUidb64, token), { withCredentials: true }),
  verifyOtp: (data) => publicAxios.post(API.verifyOtp, data, { withCredentials: true }),
  verifyOtpEmail: (data) => publicAxios.post(API.verifyOtpEmail, data, { withCredentials: true }),
  resendOtp: (data) => publicAxios.post(API.resendOtp, data, { withCredentials: true }),
  resendOtpEmail: (data) => publicAxios.post(API.resendOtpEmail, data, { withCredentials: true }),
  resendWelcomeEmail: (data) => axiosInstance.post(API.resendWelcomeEmail, data),

  // ---- ADMIN ----
  listUsers: (params) => axiosInstance.get(API.adminListUsers, { params }),
  adminInviteWorker: (data) => axiosInstance.post(API.adminInviteWorker, data),
  adminValidateWorkerInvite: (uidOrUidb64, token) =>
    publicAxios.get(API.adminValidateWorkerInvite(uidOrUidb64, token), { withCredentials: true }),
  adminCompleteWorkerInvite: (data) =>
    publicAxios.post(API.adminCompleteWorkerInvite, data, { withCredentials: true }),
  adminResetPassword: (data) => axiosInstance.post(API.adminResetPassword, data),
  adminProfileByEmail: (data) => axiosInstance.post(API.adminProfileByEmail, data),
  adminDeleteByEmail: (data) => axiosInstance.post(API.adminDeleteByEmail, data),
  adminSendMessage: (data) => axiosInstance.post(API.adminSendMessage, data),
  adminSpecialOffer: (data) => axiosInstance.post(API.adminSpecialOffer, data),

  // ---- WORKERS ----
  workerCategories: () => axiosInstance.get(API.workerCategories),

  // ---- TOKEN HELPERS ----
  saveTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
};

export default authService;

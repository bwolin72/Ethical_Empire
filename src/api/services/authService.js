/* ============================
   AUTH SERVICE
============================ */
const authService = {
  /**
   * Login:
   * POST API.login → expects { tokens: {access, refresh}, user }
   * Returns { tokens, user }
   */
  login: async (credentials, remember = true) => {
    const res = await publicAxios.post(API.login, credentials, { withCredentials: true });

    const { tokens, user } = res.data || {};
    const { access, refresh } = tokens || {};

    if (access && refresh) {
      saveTokens({ access, refresh, remember });
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

  /* ---------- Google auth ---------- */
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

  /* ---------- Registration ---------- */
  register: async (data, remember = true) => {
    const res = await publicAxios.post(API.register, data, { withCredentials: true });

    // assume backend returns the same shape as login
    const { tokens, user } = res.data || {};
    const { access, refresh } = tokens || {};

    if (access && refresh) {
      saveTokens({ access, refresh, remember });
    }

    return { tokens, user };
  },
  internalRegister: (data) => publicAxios.post(API.internalRegister, data),

  /* ---------- Profile & Roles ---------- */
  getProfile: () => axiosInstance.get(API.profilesProfile),
  updateProfile: (data) => axiosInstance.patch(API.profilesProfile, data),
  changePassword: (data) => axiosInstance.post(API.changePassword, data),
  currentUserRole: () => axiosInstance.get(API.currentUserRole),
  roleChoices: () => axiosInstance.get(API.roleChoices),
  partnerProfile: () => axiosInstance.get(API.partnerProfile),
  vendorProfile: () => axiosInstance.get(API.vendorProfile),

  /* ---------- Password Reset ---------- */
  resetPassword: (data) => publicAxios.post(API.resetPassword, data, { withCredentials: true }),
  resetPasswordConfirm: (uid, token, data) =>
    publicAxios.post(API.resetPasswordConfirm(uid, token), data, { withCredentials: true }),

  /* ---------- JWT Utilities ---------- */
  refreshToken: async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error("No refresh token found");
    const res = await publicAxios.post(API.tokenRefresh, { refresh });
    saveTokens({ access: res.data.access, refresh });
    return res;
  },
  verifyToken: (data) => publicAxios.post(API.tokenVerify, data),

  /* ---------- Email / OTP ---------- */
  verifyEmail: (uidOrUidb64, token) =>
    publicAxios.get(API.verifyEmail(uidOrUidb64, token), { withCredentials: true }),
  verifyOtp: (data) => publicAxios.post(API.verifyOtp, data, { withCredentials: true }),
  verifyOtpEmail: (data) => publicAxios.post(API.verifyOtpEmail, data, { withCredentials: true }),
  resendOtp: (data) => publicAxios.post(API.resendOtp, data, { withCredentials: true }),
  resendOtpEmail: (data) => publicAxios.post(API.resendOtpEmail, data, { withCredentials: true }),
  resendWelcomeEmail: (data) => axiosInstance.post(API.resendWelcomeEmail, data),

  /* ---------- Admin ---------- */
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

  /* ---------- Worker ---------- */
  workerCategories: () => axiosInstance.get(API.workerCategories),

  /* ---------- Token Helpers ---------- */
  saveTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
};

export default authService;

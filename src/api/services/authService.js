import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import API from '../api';

const authService = {
  login: (data) => publicAxios.post(API.auth.login, data),
  register: (data) => publicAxios.post(API.auth.register, data),
  googleLogin: (data) => publicAxios.post(API.auth.googleLogin, data),
  googleRegister: (data) => publicAxios.post(API.auth.googleRegister, data),
  logout: () => axiosInstance.post(API.auth.logout),

  getProfile: () => axiosInstance.get(API.auth.profile),
  updateProfile: (data) => axiosInstance.patch(API.auth.updateProfile, data),
  changePassword: (data) => axiosInstance.post(API.auth.changePassword, data),

  resetPassword: (data) => publicAxios.post(API.auth.resetPassword, data),
  resetPasswordConfirm: (uid, token, data) =>
    publicAxios.post(API.auth.resetPasswordConfirm(uid, token), data),

  getToken: (data) => publicAxios.post(API.auth.token, data),
  refreshToken: (data) => publicAxios.post(API.auth.tokenRefresh, data),
  verifyToken: (data) => publicAxios.post(API.auth.tokenVerify, data),

  verifyEmail: (uid, token) => publicAxios.get(API.auth.verifyEmail(uid, token)),
  resendOtp: () => publicAxios.post(API.auth.resendOtp),
  resendOtpEmail: () => publicAxios.post(API.auth.resendOtpEmail),
  verifyOtp: (data) => publicAxios.post(API.auth.verifyOtp, data),
  verifyOtpEmail: (data) => publicAxios.post(API.auth.verifyOtpEmail, data),
  resendWelcomeEmail: () => publicAxios.post(API.auth.resendWelcomeEmail),

  listUsers: () => axiosInstance.get(API.auth.adminListUsers),
  adminResetPassword: (data) => axiosInstance.post(API.auth.adminResetPassword, data),
  inviteWorker: (data) => axiosInstance.post(API.auth.adminInviteWorker, data),

  validateWorkerInvite: (uid, token) =>
    publicAxios.get(API.auth.workerValidateInvite(uid, token)),
  completeWorkerInvite: (data) =>
    publicAxios.post(API.auth.workerCompleteInvite, data),
};

export default authService;

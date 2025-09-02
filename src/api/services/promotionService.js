// src/api/services/promotionService.js
import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import promotionsAPI from '../promotionsAPI';

const promotionService = {
  // Public endpoints
  getPromotions: () => publicAxios.get(promotionsAPI.list),
  getActivePromotions: () => publicAxios.get(promotionsAPI.active),
  getPromotionDetail: (id) => publicAxios.get(promotionsAPI.detail(id)),

  // Admin-only endpoints
  createPromotion: (data) => axiosInstance.post(promotionsAPI.create, data),
  updatePromotion: (id, data) => axiosInstance.patch(promotionsAPI.update(id), data),
  deletePromotion: (id) => axiosInstance.delete(promotionsAPI.delete(id)),
};

export default promotionService;

// src/api/services/promotionService.js
import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import API from '../api';

const promotionService = {
  // Public endpoints
  getPromotions: () => publicAxios.get(API.promotions.list),
  getActivePromotions: () => publicAxios.get(API.promotions.active),
  getPromotionDetail: (id) => publicAxios.get(API.promotions.detail(id)),

  // Admin-only endpoints
  createPromotion: (data) => axiosInstance.post(API.promotions.create, data),
  updatePromotion: (id, data) => axiosInstance.patch(API.promotions.update(id), data),
  deletePromotion: (id) => axiosInstance.delete(API.promotions.delete(id)),
};

export default promotionService;

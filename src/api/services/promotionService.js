import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import API from '../api';

const promotionService = {
  getPromotions: () => publicAxios.get(API.promotions.list),
  getPromotionDetail: (id) => publicAxios.get(API.promotions.detail(id)),
  createPromotion: (data) => axiosInstance.post(API.promotions.create, data),
  updatePromotion: (id, data) => axiosInstance.patch(API.promotions.update(id), data),
  deletePromotion: (id) => axiosInstance.delete(API.promotions.delete(id)),
};

export default promotionService;

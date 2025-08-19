import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import API from '../api';

const videoService = {
  getVideos: () => publicAxios.get(API.videos.list),
  getVideoDetail: (id) => publicAxios.get(API.videos.detail(id)),
  uploadVideo: (data) => axiosInstance.post(API.videos.upload, data),
  updateVideo: (id, data) => axiosInstance.patch(API.videos.update(id), data),
  deleteVideo: (id) => axiosInstance.delete(API.videos.delete(id)),
  toggleVideoFeatured: (id) => axiosInstance.post(API.videos.toggleFeatured(id)),
  reorderVideos: (data) => axiosInstance.post(API.videos.reorder, data),
};

export default videoService;

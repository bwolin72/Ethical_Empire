// src/api/mediaAPI.js
import mediaService from "./services/mediaService";

const mediaAPI = {
  // Public
  list: (params) => mediaService.list(params),
  banners: (params) => mediaService.listBanners(params),
  featured: (params) => mediaService.listFeatured(params),
  vendor: (params) => mediaService.listVendor(params),
  partner: (params) => mediaService.listPartner(params),
  user: (params) => mediaService.listUser(params),
  home: (params) => mediaService.listHome(params),
  about: (params) => mediaService.listAbout(params),
  decor: (params) => mediaService.listDecor(params),
  liveBand: (params) => mediaService.listLiveBand(params),
  catering: (params) => mediaService.listCatering(params),
  mediaHosting: (params) => mediaService.listMediaHosting(params),
  partnerVendorDashboard: (params) => mediaService.listPartnerVendorDashboard(params),
  stats: () => mediaService.stats(),

  // Admin
  upload: (files, extra) => mediaService.upload(files, extra),
  update: (id, payload) => mediaService.update(id, payload),
  toggle: (id) => mediaService.toggleActive(id),
  toggleFeatured: (id) => mediaService.toggleFeatured(id),
  delete: (id) => mediaService.softDelete(id),
  restore: (id) => mediaService.restore(id),
  all: (params) => mediaService.listAll(params),
  archived: (params) => mediaService.listArchived(params),
  reorder: (payload) => mediaService.reorder(payload),
};

export default mediaAPI;

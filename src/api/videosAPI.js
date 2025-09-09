// src/api/videosAPI.js

const BASE = "/videos/";

const videosAPI = {
  list: () => `${BASE}`,
  active: () => `${BASE}active/`,
  detail: (id) => `${BASE}${id}/`,
  create: () => `${BASE}create/`,
  update: (id) => `${BASE}${id}/update/`,
  delete: (id) => `${BASE}${id}/delete/`,
  defaultList: () => `${BASE}`,
};

export default videosAPI;

// src/api/mediaAPI.js

const BASE = "/media/"; // adjust if your backend prefix is different

const mediaAPI = {
  list: () => `${BASE}`, // GET all media
  active: () => `${BASE}active/`, // GET active media
  detail: (id) => `${BASE}${id}/`, // GET single media
  upload: () => `${BASE}upload/`, // POST create media
  update: (id) => `${BASE}${id}/update/`, // PATCH/PUT update
  delete: (id) => `${BASE}${id}/delete/`, // DELETE
  defaultBase: BASE, // fallback
};

export default mediaAPI;

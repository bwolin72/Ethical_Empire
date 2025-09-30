import promotionsAPI from "../promotionsAPI";

const promotionService = {
  // ---- Public ----
  list: (params) => promotionsAPI.list(params),
  active: (params) => promotionsAPI.active(params),
  detail: (id) => promotionsAPI.detail(id),

  // ---- Admin ----
  create: (data) => promotionsAPI.create(data),
  update: (id, data) => promotionsAPI.update(id, data),
  patch: (id, data) => promotionsAPI.patch(id, data),
  remove: (id) => promotionsAPI.delete(id),
};

export default promotionService;

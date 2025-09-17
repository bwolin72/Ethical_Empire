/**
 * Newsletter API layer – thin wrappers around Django REST endpoints.
 * Public endpoints use publicAxios, admin endpoints use axiosInstance.
 */

import publicAxios from './publicAxios';
import axiosInstance from './axiosInstance';

// === Public endpoints ===

export const subscribe = (payload) =>
  publicAxios.post('/api/newsletter/subscribe/', payload);

export const confirmSubscription = (token) =>
  publicAxios.get(`/api/newsletter/confirm/?token=${encodeURIComponent(token)}`);

export const unsubscribe = (payload) =>
  publicAxios.post('/api/newsletter/unsubscribe/', payload);

export const resubscribe = (payload) =>
  publicAxios.post('/api/newsletter/resubscribe/', payload);

export const resendConfirmation = (payload) =>
  publicAxios.post('/api/newsletter/resend-confirmation/', payload);

// === Admin endpoints ===

export const fetchSubscribers = () =>
  axiosInstance.get('/api/newsletter/list/');

export const fetchSubscriberCount = () =>
  axiosInstance.get('/api/newsletter/count/');

export const fetchNewsletterLogs = () =>
  axiosInstance.get('/api/newsletter/logs/');

export const sendNewsletter = (payload) =>
  axiosInstance.post('/api/newsletter/send/', payload);

export const deleteSubscriber = (id) =>
  axiosInstance.delete(`/api/newsletter/delete/${id}/`);

export default {
  subscribe,
  confirmSubscription,
  unsubscribe,
  resubscribe,
  resendConfirmation,
  fetchSubscribers,
  fetchSubscriberCount,
  fetchNewsletterLogs,
  sendNewsletter,
  deleteSubscriber,
};

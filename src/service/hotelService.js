// ============================================================
// src/services/hotelService.js
// Semua function call API yang berkaitan dengan hotel
// ============================================================

import apiClient from './apiClient';

/**
 * Fetch semua hotel berdasarkan filter pencarian
 * @param {Object} params
 * @param {string} params.city - Nama kota
 * @param {string} params.checkIn - Format ISO: "2025-08-10"
 * @param {string} params.checkOut - Format ISO: "2025-08-12"
 * @param {number} params.rooms - Jumlah kamar
 * @param {number} params.guests - Jumlah tamu
 * @param {string} params.app - 'este' | 'view' | 'heal'
 */
export async function searchHotels(data) {
  const response = await apiClient.post('/hotel/discovery', data);
  return response.data;
}

/**
 * Fetch detail satu hotel beserta kamar-kamarnya
 * @param {string|number} hotelId
 * @param {Object} params - checkIn, checkOut untuk ketersediaan kamar
 */
export async function getHotelDetail(hotelId, { checkIn, checkOut } = {}) {
  const response = await apiClient.get(`/hotel/${hotelId}`, {
    params: { checkIn, checkOut },
  });
  return response.data; // { hotel: {...}, rooms: [...] }
}

/**
 * Fetch daftar kota yang tersedia (untuk autocomplete search)
 * @param {string} query - keyword pencarian kota
 */
export async function getCitySuggestions(query) {
  const response = await apiClient.post('/hotel/geo', {
    "countryCode": "ID",
    "offset": "0",
    "limit": "15",
    "key": query
  });
  return response.data;
}
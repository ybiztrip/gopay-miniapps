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
export async function searchHotels(data, signal) {
  const response = await apiClient.post('/hotel/discovery', data, { signal });
  return response.data;
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
    "key": query,
    "parentId": ""
  });
  return response.data;
}

/**
 * Fetch list of rooms for a specific hotel
 * @param {Object} data
 * @param {string} data.propertyId
 * @param {string} data.checkInDate   - format "YYYY-MM-DD"
 * @param {string} data.checkOutDate  - format "YYYY-MM-DD"
 * @param {number} data.numRooms
 * @param {number} data.numAdults
 * @param {number} data.numChildrens
 * @param {string} data.displayCurrency
 * @param {string} data.userNationality
 * @param {string} data.language
 */
export const getRoomList = async (data) => {
  try {
    const response = await apiClient.post('/hotel/room-rate', data);
    return response.data;
  } catch (error) {
    console.error('Error fetching room list:', error);
    return null;
  }
};
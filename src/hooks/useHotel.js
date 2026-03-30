// ============================================================
// src/hooks/useHotels.js
// Custom hook — abstraksi antara komponen UI dan service layer
// ============================================================

import { useState, useCallback } from 'react';
import { searchHotels, getHotelDetail } from '../services/hotelService';

/**
 * Hook untuk pencarian hotel
 * Contoh pemakaian di HomeView:
 *
 *   const { hotels, loading, error, search } = useHotels();
 *   <button onClick={() => search({ city, checkIn, checkOut, rooms, guests, app })}>Cari</button>
 */
export function useHotels() {
  const [hotels, setHotels]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const search = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchHotels(params);
      setHotels(data.hotels);
    } catch (err) {
      setError(err.message || 'Gagal memuat hotel');
    } finally {
      setLoading(false);
    }
  }, []);

  return { hotels, loading, error, search };
}

/**
 * Hook untuk detail satu hotel
 * Contoh pemakaian di DetailView:
 *
 *   const { hotel, rooms, loading, fetchDetail } = useHotelDetail();
 *   useEffect(() => { fetchDetail(hotelId, { checkIn, checkOut }); }, [hotelId]);
 */
export function useHotelDetail() {
  const [hotel, setHotel]     = useState(null);
  const [rooms, setRooms]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchDetail = useCallback(async (hotelId, dateRange) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHotelDetail(hotelId, dateRange);
      setHotel(data.hotel);
      setRooms(data.rooms);
    } catch (err) {
      setError(err.message || 'Gagal memuat detail hotel');
    } finally {
      setLoading(false);
    }
  }, []);

  return { hotel, rooms, loading, error, fetchDetail };
}
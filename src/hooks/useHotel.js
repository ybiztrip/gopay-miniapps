// ============================================================
// src/hooks/useHotels.js
// Custom hook — abstraksi antara komponen UI dan service layer
// ============================================================

import { useState, useCallback, useRef } from 'react';
import { searchHotels, getRoomList } from '../service/hotelService.js';

/**
 * Hook untuk pencarian hotel
 * Contoh pemakaian di HomeView:
 *
 *   const { hotels, loading, error, search } = useHotels();
 *   <button onClick={() => search({ city, checkIn, checkOut, rooms, guests, app })}>Cari</button>
 */
export function useHotels() {
  const [hotels, setHotels]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const abortRef              = useRef(null);

  const search = useCallback(async (data) => {
    // Batalkan request sebelumnya jika masih pending
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const res = await searchHotels(data, abortRef.current.signal);
      setHotels(res?.data?.properties ?? []);
    } catch (err) {
      // Abaikan error dari request yang sengaja di-cancel
      setError(err.message || 'Gagal memuat hotel');
      setHotels([]); // reset agar UI tidak stuck
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
 *   const { rooms, loading, error, fetchDetail } = useHotelDetail();
 */
export function useHotelDetail() {
  const [rooms, setRooms]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchDetail = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRoomList(data);
      setRooms(res?.data ?? []);
    } catch (err) {
      setError(err.message || 'Gagal memuat detail hotel');
    } finally {
      setLoading(false);
    }
  }, []);

  return { rooms, loading, error, fetchDetail };
}
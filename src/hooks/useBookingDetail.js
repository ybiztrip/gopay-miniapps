import { useState, useRef, useCallback } from 'react';
import { getBookingDetail } from '../service/bookingService.js';

export function useBookingDetail() {
  const [bookingDetailResult, setBookingDetailResult] = useState(undefined);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const abortRef                          = useRef(null);

  const bookingDetail = useCallback(async (bookingId, token) => {
    // Batalkan request sebelumnya jika masih pending
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const res = await getBookingDetail(bookingId, token, abortRef.current.signal);
      setBookingDetailResult(res?.data ?? res);
      return res;
    } catch (err) {
      // Abaikan error dari request yang sengaja di-cancel
      if (err.name === 'AbortError') return;
      setError(err.message || 'Gagal memuat detail booking');
      setBookingDetailResult(undefined);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setBookingDetailResult(undefined);
    setError(null);
  }, []);

  return { bookingDetailResult, loading, error, bookingDetail, reset };
}
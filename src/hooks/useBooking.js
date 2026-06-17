import { useState, useRef, useCallback } from 'react';
import { createBooking } from '../service/bookingService.js';

export function useBooking() {
  const [bookingResult, setBookingResult] = useState(undefined);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const abortRef                          = useRef(null);

  const booking = useCallback(async (payload, token) => {
    // Batalkan request sebelumnya jika masih pending
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const res = await createBooking(payload, token, abortRef.current.signal);
      setBookingResult(res?.data ?? res);
      return res;
    } catch (err) {
      // Abaikan error dari request yang sengaja di-cancel
      if (err.name === 'AbortError') return;
      setError(err.message || 'Gagal membuat booking');
      setBookingResult(undefined);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setBookingResult(undefined);
    setError(null);
  }, []);

  return { bookingResult, loading, error, booking, reset };
}
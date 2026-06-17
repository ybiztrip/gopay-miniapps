import { useState, useRef, useCallback } from 'react';
import { getETicket } from '../service/bookingService.js';

export function useGetETicket() {
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const abortRef                        = useRef(null);

  const fetchETicket = useCallback(async (bookingCode, token) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const res = await getETicket(bookingCode, token, abortRef.current.signal);
      return res;
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Gagal memuat riwayat e-ticket');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, fetchETicket };
}
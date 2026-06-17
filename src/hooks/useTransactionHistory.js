import { useState, useRef, useCallback } from 'react';
import { getTransactionHistory } from '../service/bookingService.js';

export function useTransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const abortRef                        = useRef(null);

  const fetchHistory = useCallback(async (token) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const res = await getTransactionHistory(token, abortRef.current.signal);
      setTransactions(res?.data ?? res ?? []);
      return res;
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Gagal memuat riwayat transaksi');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { transactions, loading, error, fetchHistory };
}
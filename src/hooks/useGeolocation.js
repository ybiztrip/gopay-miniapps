import { useState, useCallback } from "react";

export function useGeolocation() {
  const [state, setState] = useState({
    loading: false,
    error: null,
    location: null,
  });

  const getLocation = useCallback(async () => {
    setState({ loading: true, error: null, location: null });

    // 1. Cek dukungan browser
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation tidak didukung oleh browser ini.",
      }));
      return;
    }

    setState({ loading: true, error: null, location: null });

    // 2. Ambil Koordinat dari Browser
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // 3. Reverse Geocoding untuk mendapatkan Nama Kota
          // Menggunakan API BigDataCloud (Gratis & No API Key untuk basic)
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`
          );
          const data = await response.json();

          setState({
            loading: false,
            error: null,
            location: {
              latitude,
              longitude,
              city: data?.city || data?.locality || "Kota tidak ditemukan",
              accuracy: position.coords.accuracy,
              timestamp: new Date(position.timestamp).toLocaleString("id-ID"),
            },
          });
        } catch (fetchError) {
          // Jika API Geocoding gagal, tetap tampilkan koordinat
          setState({
            loading: false,
            error: "Gagal mengambil nama kota, tapi koordinat berhasil didapat.",
            location: {
              latitude,
              longitude,
              city: "Gagal memuat nama kota",
              timestamp: new Date(position.timestamp).toLocaleString("id-ID"),
            },
          });
        }
      },
      (err) => {
        const messages = {
          1: "Izin lokasi ditolak oleh pengguna.",
          2: "Informasi lokasi tidak tersedia.",
          3: "Permintaan lokasi habis waktu (timeout).",
        };
        setState({
          loading: false,
          error: messages[err.code] || "Terjadi kesalahan yang tidak diketahui.",
          location: null,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return { ...state, getLocation };
}
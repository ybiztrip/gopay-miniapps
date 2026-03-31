import { useState } from 'react';

const LocationDisplay = () => {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser Anda.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position, 'ini position');
        
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(`Gagal mengambil lokasi: ${err.message}`);
        setLoading(false);
      }
    );
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Cek Lokasi Perangkat</h2>
      
      <button onClick={getLocation} disabled={loading}>
        {loading ? 'Mengambil data...' : 'Dapatkan Lokasi Saya'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {location.lat && (
        <div style={{ marginTop: '15px' }}>
          <p><strong>Latitude:</strong> {location.lat}</p>
          <p><strong>Longitude:</strong> {location.lng}</p>
          <a 
            href={`https://www.google.com/maps?q=${location.lat},${location.lng}`} 
            target="_blank" 
            rel="noreferrer"
          >
            Buka di Google Maps
          </a>
        </div>
      )}
    </div>
  );
};

export default LocationDisplay;
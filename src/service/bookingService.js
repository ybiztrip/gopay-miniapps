import apiClient from './apiClient';

export async function createBooking(data, token, signal) {
  const response = await apiClient.post('/booking', data, { signal, headers: { 'Authorization': `Bearer ${token ?? 'token'}` } });
  return response.data;
}

export async function getBookingDetail(bookingId, token, signal) {
  const response = await apiClient.get(`/booking/${bookingId}`, { signal, headers: { 'Authorization': `Bearer ${token ?? 'token'}` } });
  return response.data;
}

export async function getTransactionHistory(token, signal) {
  const response = await apiClient.get('/booking?size=100', { signal, headers: { 'Authorization': `Bearer ${token ?? 'token'}` } });
  return response.data;
}

export async function getETicket(bookingCode, token, signal) {
  const response = await apiClient.post(
    `/booking/file/fetch`,
    { code: bookingCode },
    {
      signal,
      responseType: 'blob', 
      headers: {
        'Authorization': `Bearer ${token ?? 'token'}`,
        'Accept': 'application/pdf',
      },
    }
  );
  return response.data;
}
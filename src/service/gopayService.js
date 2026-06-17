import axios from 'axios';
import generateRequestId from '../helpers/generateRandomUUID.js';

const GOPAY_HOST_URL = import.meta.env.VITE_GOPAY_HOST_URL;

// ─── Get Authorization Token ───
export async function getAuthorizationToken(authCode) {
  const requestId = generateRequestId();

  const response = await axios.post(
    `${GOPAY_HOST_URL}/v1/mini-apps/authorizations/token`,
    { auth_code: authCode },
    {
      headers: {
        'Content-Type': 'application/json',
        'Request-Id':    requestId,
        'Authorization': import.meta.env.VITE_GOPAY_AUTHORIZATION,
      },
      timeout: 10_000,
    }
  );

  // response.data = { auth_token, gopay_account_id }
  localStorage.setItem('gopayAuthToken', response?.data?.auth_token);
  return response.data;
}

// ─── Get GoPay Profile ───
// Docs: https://docs.midtrans.com/reference/get-profile-v2
// Dipanggil saat user click "Choose" pada room
export async function getGopayProfile(authToken) {
  const requestId = generateRequestId();

  const response = await axios.get(
    `${GOPAY_HOST_URL}/v1/mini-apps/profile`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Request-Id':    requestId,
        // Authorization menggunakan auth_token hasil dari getAuthorizationToken
        'Authorization': `Bearer ${authToken ?? 'token'}`,
      },
      timeout: 10_000,
    }
  );

  // response.data = { username, phone_number, email }
  localStorage.setItem('gopayProfile', JSON.stringify(response.data));
  return response.data;
}
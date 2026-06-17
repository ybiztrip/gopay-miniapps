// ─────────────────────────────────────────────
// Helper: polling gpContainer sampai ready
// ─────────────────────────────────────────────
function callGetAuthCode({ onSuccess, onError, maxRetry = 10, interval = 300 }) {
  let attempt = 0;

  function tryCall() {
    if (typeof window === 'undefined' || !window.gpContainer) {
      attempt++;
      if (attempt < maxRetry) {
        setTimeout(tryCall, interval);
      } else {
        console.warn('[GoPay] gpContainer tidak tersedia setelah', maxRetry, 'percobaan.');
        onError?.({ code: 'GP_CONTAINER_NOT_FOUND', message: 'gpContainer tidak tersedia' });
      }
      return;
    }

    try {
      window.gpContainer.call(
        'GPMiniAppAuth',
        'getAuthCode',
        {},
        function (response) {
          if (response?.success === false || response?.ret === 'GP_EXCEPTION') {
            console.warn('[GoPay] getAuthCode non-success response:', response);
            onError?.(response);
            return;
          }
          console.log('[GoPay] getAuthCode success:', response);
          onSuccess?.(response);
        },
        function (error) {
          if (error?.errorCode === 1003 || error?.errorType === 'JS_BRIDGE_ERROR') {
            console.warn('[GoPay] Bukan GoPay WebView environment, skip auth:', error?.errorMessage);
            return;
          }
          console.error('[GoPay] getAuthCode error:', error);
          onError?.(error);
        }
      );
    } catch (e) {
      console.warn('[GoPay] gpContainer.call threw exception:', e);
      onError?.({ code: 'GP_CALL_EXCEPTION', message: e?.message });
    }
  }

  tryCall();
}

// ─────────────────────────────────────────────
// Helper: parse phone number dari GoPay profile
// GoPay mengembalikan format: "08123456789" atau "+628123456789"
// ─────────────────────────────────────────────
function parseGopayPhone(rawPhone) {
  if (!rawPhone) return { code: '+62', number: '' };

  // Jika sudah pakai format +62
  const intlMatch = rawPhone.match(/^(\+\d{1,3})(\d+)$/);
  if (intlMatch) {
    const matchedCode = PHONE_CODES.find((p) => p.code === intlMatch[1]);
    return {
      code:   matchedCode ? matchedCode.code : '+62',
      number: intlMatch[2],
    };
  }

  // Jika format lokal "08xx" → strip leading 0, pakai +62
  if (rawPhone.startsWith('0')) {
    return { code: '+62', number: rawPhone.slice(1) };
  }

  return { code: '+62', number: rawPhone };
}

export { callGetAuthCode, parseGopayPhone };
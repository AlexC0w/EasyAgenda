import axios from 'axios';

const normalizePhoneNumber = (input) => {
  if (!input) return null;

  const digits = String(input).replace(/\D+/g, '');
  if (!digits) return null;

  const { WHATSAPP_DEFAULT_COUNTRY_CODE } = process.env;
  const countryDigits = WHATSAPP_DEFAULT_COUNTRY_CODE
    ? WHATSAPP_DEFAULT_COUNTRY_CODE.replace(/\D+/g, '')
    : '';

  if (digits.startsWith('00')) {
    return digits.slice(2);
  }

  if (countryDigits && digits.length <= 10 && !digits.startsWith(countryDigits)) {
    return `${countryDigits}${digits}`;
  }

  return digits;
};

const sendWhatsApp = async (to, message, settings = {}) => {
  const { WHATSAPP_API_URL, WHATSAPP_API_KEY } = process.env;
  const token = settings?.whatsappToken || WHATSAPP_API_KEY;
  const number = normalizePhoneNumber(to);

  console.log('--- [WhatsApp Debug] Start ---');
  console.log('To (Original):', to);
  console.log('To (Normalized):', number);
  console.log('API URL:', WHATSAPP_API_URL);
  console.log('Token Present:', !!token);
  console.log('Settings:', JSON.stringify(settings, null, 2));

  if (!WHATSAPP_API_URL || !token) {
    console.log('--- [WhatsApp Debug] Simulated (Missing Config) ---');
    console.log(`Mensaje WhatsApp simulado para ${to}: ${message}`);
    return { simulated: true, number: to };
  }

  if (settings && settings.whatsappSender === '') {
    console.warn('--- [WhatsApp Debug] Warning: Sender not configured ---');
    return { success: false, error: 'WhatsApp no configurado en este negocio.', number: to };
  }

  if (!number) {
    console.warn('--- [WhatsApp Debug] Invalid Number ---');
    return { success: false, error: 'Número de teléfono inválido', number: to };
  }

  try {
    const payload = { 
        number, 
        body: message
    };
    
    console.log('--- [WhatsApp Debug] Sending Request ---');
    console.log('URL:', WHATSAPP_API_URL);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(
      WHATSAPP_API_URL,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }
    );

    console.log('--- [WhatsApp Debug] Success Response ---');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

    return {
      success: true,
      number,
      response: response.data,
    };
  } catch (error) {
    const status = error.response?.status;
    const details = error.response?.data || error.message;
    
    console.error('--- [WhatsApp Debug] Error ---');
    console.error('Status:', status);
    console.error('Details:', JSON.stringify(details, null, 2));

    let errorType = 'UNKNOWN';
    let errorMessage = details?.message || details;
    
    if (JSON.stringify(details).includes('Nenhum número de Whatsapp foi configurado')) {
      errorType = 'PROVIDER_NOT_CONFIGURED';
      errorMessage = 'No se pudo enviar el mensaje por falta de configuración.';
    }

    return {
      success: false,
      number,
      status,
      error: errorMessage,
      errorType,
      response: details,
    };
  }
};

export default sendWhatsApp;

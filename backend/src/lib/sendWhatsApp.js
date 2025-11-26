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
  const number = normalizePhoneNumber(to);

  if (!WHATSAPP_API_URL || !WHATSAPP_API_KEY) {
    console.log(`Mensaje WhatsApp simulado para ${to}: ${message}`);
    return { simulated: true, number: to };
  }

  if (settings && settings.whatsappSender === '') {
    console.warn('WhatsApp no configurado para este negocio.');
    return { success: false, error: 'WhatsApp no configurado en este negocio.', number: to };
  }

  if (!number) {
    console.warn('Número de WhatsApp inválido o vacío:', to);
    return { success: false, error: 'Número de teléfono inválido', number: to };
  }

  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      { 
        number, 
        body: message,
        sender: settings?.whatsappSender,
        instanceId: settings?.whatsappSender,
        sessionId: settings?.whatsappSender
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    return {
      success: true,
      number,
      response: response.data,
    };
  } catch (error) {
    const status = error.response?.status;
    const details = error.response?.data || error.message;
    console.error('Error enviando WhatsApp', { status, details });

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

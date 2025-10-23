import axios from 'axios';

const sendWhatsApp = async (to, message) => {
  const { WHATSAPP_API_URL, WHATSAPP_API_KEY } = process.env;

  if (!WHATSAPP_API_URL || !WHATSAPP_API_KEY) {
    console.log(`Mensaje WhatsApp simulado para ${to}: ${message}`);
    return { simulated: true };
  }

  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      { to, message },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error enviando WhatsApp', error.message);
    throw new Error('No se pudo enviar el mensaje de WhatsApp');
  }
};

export default sendWhatsApp;

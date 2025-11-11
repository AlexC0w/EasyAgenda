import prisma from './prisma.js';

let cachedConfig = null;
let lastFetch = 0;
const CACHE_TTL_MS = 60 * 1000;

const fallbackConfig = () => ({
  url: process.env.WHATSAPP_API_URL || null,
  key: process.env.WHATSAPP_API_KEY || null,
});

export const getWhatsAppConfig = async () => {
  const now = Date.now();
  if (cachedConfig && now - lastFetch < CACHE_TTL_MS) {
    const fallback = fallbackConfig();
    return {
      url: cachedConfig.url || fallback.url,
      key: cachedConfig.key || fallback.key,
    };
  }

  try {
    const settings = await prisma.businessSetting.findMany({
      where: { key: { in: ['whatsappApiUrl', 'whatsappToken'] } },
    });

    const map = settings.reduce(
      (acc, setting) => ({ ...acc, [setting.key]: setting.value }),
      {}
    );

    cachedConfig = {
      url: map.whatsappApiUrl || null,
      key: map.whatsappToken || null,
    };
    lastFetch = now;
  } catch (error) {
    console.warn('No se pudieron cargar ajustes de WhatsApp desde la base de datos.', error);
    cachedConfig = null;
    lastFetch = 0;
  }

  const fallback = fallbackConfig();
  return {
    url: cachedConfig?.url || fallback.url,
    key: cachedConfig?.key || fallback.key,
  };
};

export const invalidateWhatsAppConfig = () => {
  cachedConfig = null;
  lastFetch = 0;
};

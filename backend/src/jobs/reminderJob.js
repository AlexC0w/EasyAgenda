import cron from 'node-cron';
import prisma from '../lib/prisma.js';
import sendWhatsApp from '../lib/sendWhatsApp.js';
import { formatTimeToMeridiem } from '../utils/time.js';

const job = cron.schedule('*/5 * * * *', async () => {
  try {
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

    const citas = await prisma.cita.findMany({
      where: {
        recordatorioEnviado: false,
        estado: { in: ['confirmada', 'pendiente'] },
        fecha: {
          equals: new Date(inOneHour.toISOString().split('T')[0]),
        },
      },
      include: { barbero: true, servicio: true },
    });

    await Promise.all(
      citas.map(async (cita) => {
        const citaDateTime = new Date(`${cita.fecha.toISOString().split('T')[0]}T${cita.hora}:00`);
        const diff = citaDateTime.getTime() - inOneHour.getTime();
        if (Math.abs(diff) <= 5 * 60 * 1000) {
          const message = `¡Hola ${cita.cliente}! Te recordamos tu cita con ${cita.barbero.nombre} para ${cita.servicio.nombre} a las ${formatTimeToMeridiem(cita.hora)}. Duración estimada: ${cita.servicio.duracion} minutos.`;
          await sendWhatsApp(cita.telefono, message);
          await prisma.cita.update({
            where: { id: cita.id },
            data: { recordatorioEnviado: true },
          });
        }
      })
    );
  } catch (error) {
    console.error('Error en job de recordatorios', error);
  }
});

export default job;

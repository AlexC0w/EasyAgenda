import prisma from '../lib/prisma.js';

const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const toTimeString = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const normalizeDay = (date) =>
  new Intl.DateTimeFormat('en-US', { weekday: 'long' })
    .format(date)
    .toLowerCase();

export const getAvailability = async (barberoId, fechaISO) => {
  const fecha = new Date(`${fechaISO}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) {
    throw new Error('Fecha inválida');
  }

  const barbero = await prisma.barbero.findUnique({ where: { id: barberoId } });
  if (!barbero) {
    const error = new Error('Barbero no encontrado');
    error.status = 404;
    throw error;
  }

  const workingDays = JSON.parse(barbero.dias_laborales || '[]');
  const dayName = normalizeDay(fecha);
  if (!workingDays.includes(dayName)) {
    return [];
  }

  const inicio = toMinutes(barbero.horario_inicio);
  const fin = toMinutes(barbero.horario_fin);

  const citas = await prisma.cita.findMany({
    where: {
      barbero_id: barberoId,
      fecha: new Date(`${fechaISO}T00:00:00`),
      estado: { in: ['confirmada', 'pendiente'] },
    },
    include: { servicio: true },
  });

  const ocupados = new Set();
  citas.forEach((cita) => {
    const duration = cita.servicio?.duracion || barbero.duracion_cita;
    const start = toMinutes(cita.hora);
    const blocks = Math.ceil(duration / barbero.duracion_cita);
    for (let block = 0; block < blocks; block += 1) {
      ocupados.add(toTimeString(start + block * barbero.duracion_cita));
    }
  });

  const slots = [];
  for (let minutes = inicio; minutes + barbero.duracion_cita <= fin; minutes += barbero.duracion_cita) {
    const time = toTimeString(minutes);
    if (!ocupados.has(time)) {
      slots.push(time);
    }
  }

  return slots;
};

export const isSlotAvailable = async (barberoId, fechaISO, hora, duration) => {
  const available = await getAvailability(barberoId, fechaISO);
  if (!available.includes(hora)) {
    return false;
  }

  if (!duration) {
    return true;
  }

  const barbero = await prisma.barbero.findUnique({ where: { id: barberoId } });
  const blocksNeeded = Math.ceil(duration / barbero.duracion_cita);
  const startMinutes = toMinutes(hora);
  const slotSet = new Set(available);

  for (let block = 0; block < blocksNeeded; block += 1) {
    const slotTime = toTimeString(startMinutes + block * barbero.duracion_cita);
    if (!slotSet.has(slotTime)) {
      return false;
    }
  }
  return true;
};

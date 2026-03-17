import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import morgan from 'morgan';
import prisma from './lib/prisma.js';
import authRouter from './routes/auth.js';
import barberosRouter from './routes/barberos.js';
import businessRouter from './routes/business.js';
import citasRouter from './routes/citas.js';
import disponiblesRouter from './routes/disponibles.js';
import serviciosRouter from './routes/servicios.js';
import usersRouter from './routes/users.js';
import publicRouter from './routes/public.js';
import stripeRouter, { stripeWebhook } from './routes/stripe.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import reminderJob from './jobs/reminderJob.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
// Webhook for Stripe must be before express.json()
app.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());
app.use(morgan('dev'));

app.use(morgan('dev'));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  message: { message: 'Demasiadas solicitudes desde esta IP, por favor inténtalo de nuevo después de 15 minutos' },
  standardHeaders: true, 
  legacyHeaders: false, 
});
app.use(globalLimiter);

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20, 
  message: { message: 'Límite de peticiones alcanzado. Por favor, espera antes de intentar nuevamente.' },
  standardHeaders: true, 
  legacyHeaders: false, 
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', strictLimiter, authRouter);
app.use('/barberos', barberosRouter);
app.use('/disponibles', disponiblesRouter);
app.use('/servicios', serviciosRouter);
app.use('/citas/create', strictLimiter);
app.use('/citas', citasRouter);
app.use('/users', usersRouter);
app.use('/business', businessRouter);
app.use('/public', publicRouter);
app.use('/stripe', stripeRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

reminderJob.start();

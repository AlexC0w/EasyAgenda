import 'dotenv/config';
import express from 'express';
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
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import reminderJob from './jobs/reminderJob.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/barberos', barberosRouter);
app.use('/disponibles', disponiblesRouter);
app.use('/servicios', serviciosRouter);
app.use('/citas', citasRouter);
app.use('/users', usersRouter);
app.use('/business', businessRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

reminderJob.start();

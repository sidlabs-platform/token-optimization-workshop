import cors from 'cors';
import express from 'express';
import { createStore } from './data/store';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { incidentsRouter } from './routes/incidents';
import { servicesRouter } from './routes/services';
import { statsRouter } from './routes/stats';
export function createApp() {
  const app = express();
  const store = createStore();
  app.use(cors());
  app.use(express.json());
  app.use('/api/health', healthRouter());
  app.use('/api/services', servicesRouter(store));
  app.use('/api/incidents', incidentsRouter(store));
  app.use('/api/stats', statsRouter(store));
  app.use(errorHandler);
  return app;
}

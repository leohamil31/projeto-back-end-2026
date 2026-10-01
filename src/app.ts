import 'dotenv/config';
import path from 'node:path';
import express from 'express';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import kitchenRoutes from './routes/kitchenRoutes';
import { isSupabaseConfigured } from './config/supabaseClient';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler';

const app = express();
const publicDir = path.join(process.cwd(), 'public');

app.use(express.json());
app.use(express.static(publicDir));

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    name: 'Pastifico API',
    message: 'API de autoatendimento do restaurante Pastifico',
    persistence: isSupabaseConfigured() ? 'supabase' : 'local-json',
    payments: 'cashier-only',
    endpoints: [
      'GET /categories',
      'GET /categories/:id',
      'POST /categories',
      'PUT /categories/:id',
      'DELETE /categories/:id',
      'GET /products',
      'GET /products/:id',
      'POST /products',
      'PUT /products/:id',
      'DELETE /products/:id',
      'GET /orders',
      'GET /orders/:id',
      'POST /orders',
      'PATCH /orders/:id/status',
      'DELETE /orders/:id',
      'GET /orders/kitchen',
      'GET /orders/table/:tableNumber'
    ]
  });
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/kitchen-dashboard', (_req, res) => {
  res.sendFile(path.join(publicDir, 'kitchen.html'));
});

app.get('/order-status', (_req, res) => {
  res.sendFile(path.join(publicDir, 'order-status.html'));
});

app.get('/order-history', (_req, res) => {
  res.sendFile(path.join(publicDir, 'order-history.html'));
});

app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/kitchen', kitchenRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
export default app;

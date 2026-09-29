import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import { app } from '../src/app';
import { ensureDatabaseFile, saveDatabase } from '../src/data/database';
import fs from 'node:fs';
import path from 'node:path';

process.env.SUPABASE_URL = '';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';

const localDatabasePath = path.join(process.cwd(), 'data', 'pastifico-db.json');
const originalLocalDatabase = fs.readFileSync(localDatabasePath, 'utf8');

after(() => {
  fs.writeFileSync(localDatabasePath, originalLocalDatabase, 'utf8');
});

test('ensureDatabaseFile sanitizes duplicated or stale catalog entries', () => {
  const dbPath = path.join(process.cwd(), 'data', 'pastifico-db.json');
  const originalDatabase = fs.readFileSync(dbPath, 'utf8');
  const stale = {
    categories: [
      { id: 'massas', name: 'Massas', description: 'Mais massas', createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 'massas', name: 'Massas', description: 'duplicado', createdAt: '2026-09-18T00:00:00.000Z' },
      { id: 'entradas', name: 'Entradas', description: 'Antipasti', createdAt: '2026-01-01T00:00:00.000Z' }
    ],
    products: [
      { id: 'spaghetti-carbonara', name: 'Spaghetti Carbonara', description: 'Massa', price: 42.9, image: 'https://example.com/fake.jpg', isAvailable: true, categoryId: 'massas', createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 'bruschetta-classica', name: 'Bruschetta Clássica', description: 'Pão', price: 18.9, image: 'https://images.unsplash.com/example.jpg', isAvailable: true, categoryId: 'entradas', createdAt: '2026-01-01T00:00:00.000Z' }
    ],
    orders: []
  };

  saveDatabase(stale as any);

  const normalized = ensureDatabaseFile();

  const categoryNames = normalized.categories.map((category) => category.name);
  const duplicateCategories = categoryNames.filter((name, index) => categoryNames.indexOf(name) !== index);

  assert.deepEqual(duplicateCategories.length, 0);
  assert.ok(normalized.products.every((product) => product.image.startsWith('http') || product.image.startsWith('/')));

  fs.writeFileSync(dbPath, originalDatabase, 'utf8');
});

test('GET /categories returns a list of categories', async () => {
  const response = await request(app).get('/categories');

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
});

test('GET /categories includes the complete Pastifico menu groups', async () => {
  const response = await request(app).get('/categories');

  assert.equal(response.status, 200);

  const names = response.body.map((category: { name: string }) => category.name);
  assert.deepEqual(names.includes('Massas'), true);
  assert.deepEqual(names.includes('Entradas'), true);
  assert.deepEqual(names.includes('Bebidas'), true);
  assert.deepEqual(names.includes('Sobremesas'), true);
});

test('GET /products includes rich menu items with image URLs', async () => {
  const response = await request(app).get('/products');

  assert.equal(response.status, 200);
  assert.ok(response.body.length >= 8);
  assert.ok(response.body.every((product: { image: string }) => product.image && (product.image.startsWith('http') || product.image.startsWith('/'))));
});

test('POST /categories creates a new category', async () => {
  const response = await request(app).post('/categories').send({
    name: 'Sobremesas',
    description: 'Pudins e doces italianos'
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.name, 'Sobremesas');
});

test('GET /products returns a list of products', async () => {
  const response = await request(app).get('/products');

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
});

test('POST /products creates a new product', async () => {
  const response = await request(app).post('/products').send({
    name: 'Penne al Pomodoro',
    description: 'Penne ao molho de tomate fresco com manjericão.',
    price: 36.5,
    image: 'https://example.com/penne-al-pomodoro.jpg',
    isAvailable: true,
    categoryId: 'massas'
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.name, 'Penne al Pomodoro');
});

test('POST /orders creates a new order with status Recebido', async () => {
  const response = await request(app).post('/orders').send({
    customerName: 'Maria',
    tableNumber: 5,
    items: [
      {
        productId: 'spaghetti-carbonara',
        name: 'Spaghetti Carbonara',
        quantity: 2,
        unitPrice: 42.9
      }
    ]
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.status, 'Recebido');
  assert.equal(response.body.customerName, 'Maria');
});

test('PATCH /orders/:id/status updates the kitchen status', async () => {
  const createResponse = await request(app).post('/orders').send({
    customerName: 'João',
    tableNumber: 8,
    items: [
      {
        productId: 'lasanha-bolognesa',
        name: 'Lasanha à Bolonhesa',
        quantity: 1,
        unitPrice: 48.5
      }
    ]
  });

  const orderId = createResponse.body.id;
  const response = await request(app).patch(`/orders/${orderId}/status`).send({
    status: 'Preparando'
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'Preparando');
});

test('GET /products/:id returns a specific product', async () => {
  const response = await request(app).get('/products/spaghetti-carbonara');

  assert.equal(response.status, 200);
  assert.equal(response.body.name, 'Spaghetti Carbonara');
});

test('PUT /products/:id updates a product', async () => {
  const createResponse = await request(app).post('/products').send({
    name: 'Produto de teste PUT',
    description: 'Produto criado apenas para validar a atualização via PUT.',
    price: 10,
    image: 'https://example.com/produto-teste-put.jpg',
    isAvailable: true,
    categoryId: 'massas'
  });

  const response = await request(app).put(`/products/${createResponse.body.id}`).send({
    price: 52.9,
    isAvailable: false
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.price, 52.9);
  assert.equal(response.body.isAvailable, false);
});

test('GET /orders/kitchen returns pending orders for the kitchen panel', async () => {
  const response = await request(app).get('/orders/kitchen');

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
});

test('GET /orders/table/:tableNumber returns the orders of a table', async () => {
  const response = await request(app).get('/orders/table/5');

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
});

test('GET /order-history returns the recent order history page', async () => {
  const response = await request(app).get('/order-history');

  assert.equal(response.status, 200);
  assert.match(response.text, /Pastifico/i);
});

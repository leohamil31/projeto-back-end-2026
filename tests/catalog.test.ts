import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import { app } from '../src/app';
import { ensureDatabaseFile, saveDatabase } from '../src/config/localDatabase';
import fs from 'node:fs';
import path from 'node:path';

process.env.SUPABASE_URL = '';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';

const localDatabasePath = path.join(process.cwd(), 'data', 'pastifico-db.json');
ensureDatabaseFile();
const originalLocalDatabase = fs.readFileSync(localDatabasePath, 'utf8');

after(() => {
  fs.writeFileSync(localDatabasePath, originalLocalDatabase, 'utf8');
});

test('ensureDatabaseFile sanitizes duplicated or stale catalog entries', () => {
  const dbPath = path.join(process.cwd(), 'data', 'pastifico-db.json');
  const originalDatabase = fs.readFileSync(dbPath, 'utf8');
  const stale = {
    categories: [
      { id: 'massas-1', name: 'Massas', description: 'Mais massas', createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 'massas-2', name: 'Massas', description: 'duplicado', createdAt: '2026-09-18T00:00:00.000Z' },
      { id: 'entradas-1', name: 'Entradas', description: 'Antipasti', createdAt: '2026-01-01T00:00:00.000Z' }
    ],
    products: [
      { id: 'produto-1', name: 'Spaghetti Carbonara', description: 'Massa', price: 42.9, image: 'https://example.com/fake.jpg', isAvailable: true, categoryId: 'massas-1', createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 'produto-2', name: 'Bruschetta Clássica', description: 'Pão', price: 18.9, image: 'https://images.unsplash.com/example.jpg', isAvailable: true, categoryId: 'entradas-1', createdAt: '2026-01-01T00:00:00.000Z' }
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

test('GET /categories/:id returns a specific category with a UUID id', async () => {
  const listResponse = await request(app).get('/categories');
  const [firstCategory] = listResponse.body;

  const response = await request(app).get(`/categories/${firstCategory.id}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.id, firstCategory.id);
  assert.match(firstCategory.id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
});

test('GET /categories/:id returns 404 for an unknown category', async () => {
  const response = await request(app).get('/categories/00000000-0000-0000-0000-000000000000');

  assert.equal(response.status, 404);
});

test('GET /products includes rich menu items with image URLs', async () => {
  const response = await request(app).get('/products');

  assert.equal(response.status, 200);
  assert.ok(response.body.length >= 8);
  assert.ok(response.body.every((product: { image: string }) => product.image && (product.image.startsWith('http') || product.image.startsWith('/'))));
});

test('POST /categories creates a new category with a UUID id', async () => {
  const response = await request(app).post('/categories').send({
    name: 'Categoria de teste POST',
    description: 'Categoria criada apenas para validar o cadastro.'
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.name, 'Categoria de teste POST');
  assert.match(response.body.id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
});

test('PUT /categories/:id updates a category', async () => {
  const createResponse = await request(app).post('/categories').send({
    name: 'Categoria de teste PUT',
    description: 'Descrição original.'
  });

  const response = await request(app).put(`/categories/${createResponse.body.id}`).send({
    description: 'Descrição atualizada.'
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.description, 'Descrição atualizada.');
});

test('DELETE /categories/:id removes a category', async () => {
  const createResponse = await request(app).post('/categories').send({
    name: 'Categoria de teste DELETE',
    description: 'Categoria criada apenas para validar a remoção.'
  });

  const deleteResponse = await request(app).delete(`/categories/${createResponse.body.id}`);
  assert.equal(deleteResponse.status, 204);

  const showResponse = await request(app).get(`/categories/${createResponse.body.id}`);
  assert.equal(showResponse.status, 404);
});

test('GET /products returns a list of products', async () => {
  const response = await request(app).get('/products');

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
});

test('POST /products creates a new product with a UUID id', async () => {
  const categoriesResponse = await request(app).get('/categories');
  const categoryId = categoriesResponse.body[0].id;

  const response = await request(app).post('/products').send({
    name: 'Penne al Pomodoro - teste',
    description: 'Penne ao molho de tomate fresco com manjericão.',
    price: 36.5,
    image: 'https://example.com/penne-al-pomodoro.jpg',
    isAvailable: true,
    categoryId
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.name, 'Penne al Pomodoro - teste');
  assert.match(response.body.id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
});

test('POST /orders creates a new order with status Recebido', async () => {
  const productsResponse = await request(app).get('/products');
  const product = productsResponse.body.find((item: { name: string }) => item.name === 'Spaghetti Carbonara');

  const response = await request(app).post('/orders').send({
    customerName: 'Maria',
    tableNumber: 5,
    items: [
      {
        productId: product.id,
        quantity: 2
      }
    ]
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.status, 'Recebido');
  assert.equal(response.body.customerName, 'Maria');
});

test('PATCH /orders/:id/status updates the kitchen status', async () => {
  const productsResponse = await request(app).get('/products');
  const product = productsResponse.body.find((item: { name: string }) => item.name === 'Lasanha à Bolonhesa');

  const createResponse = await request(app).post('/orders').send({
    customerName: 'João',
    tableNumber: 8,
    items: [
      {
        productId: product.id,
        quantity: 1
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

test('DELETE /orders/:id removes an order', async () => {
  const productsResponse = await request(app).get('/products');
  const product = productsResponse.body.find((item: { name: string }) => item.name === 'Tiramisu');

  const createResponse = await request(app).post('/orders').send({
    customerName: 'Pedro',
    tableNumber: 3,
    items: [
      {
        productId: product.id,
        quantity: 1
      }
    ]
  });

  const deleteResponse = await request(app).delete(`/orders/${createResponse.body.id}`);
  assert.equal(deleteResponse.status, 204);

  const showResponse = await request(app).get(`/orders/${createResponse.body.id}`);
  assert.equal(showResponse.status, 404);
});

test('GET /products/:id returns a specific product', async () => {
  const productsResponse = await request(app).get('/products');
  const product = productsResponse.body.find((item: { name: string }) => item.name === 'Spaghetti Carbonara');

  const response = await request(app).get(`/products/${product.id}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.name, 'Spaghetti Carbonara');
});

test('PUT /products/:id updates a product', async () => {
  const categoriesResponse = await request(app).get('/categories');
  const categoryId = categoriesResponse.body[0].id;

  const createResponse = await request(app).post('/products').send({
    name: 'Produto de teste PUT',
    description: 'Produto criado apenas para validar a atualização via PUT.',
    price: 10,
    image: 'https://example.com/produto-teste-put.jpg',
    isAvailable: true,
    categoryId
  });

  const response = await request(app).put(`/products/${createResponse.body.id}`).send({
    price: 52.9,
    isAvailable: false
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.price, 52.9);
  assert.equal(response.body.isAvailable, false);
});

test('DELETE /products/:id removes a product', async () => {
  const categoriesResponse = await request(app).get('/categories');
  const categoryId = categoriesResponse.body[0].id;

  const createResponse = await request(app).post('/products').send({
    name: 'Produto de teste DELETE',
    description: 'Produto criado apenas para validar a remoção.',
    price: 15,
    image: 'https://example.com/produto-teste-delete.jpg',
    isAvailable: true,
    categoryId
  });

  const deleteResponse = await request(app).delete(`/products/${createResponse.body.id}`);
  assert.equal(deleteResponse.status, 204);

  const showResponse = await request(app).get(`/products/${createResponse.body.id}`);
  assert.equal(showResponse.status, 404);
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

test('GET /unknown-route returns a JSON 404 through the central error handler', async () => {
  const response = await request(app).get('/unknown-route');

  assert.equal(response.status, 404);
  assert.ok(response.body.message);
});

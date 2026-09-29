import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env antes da migração.');
}

const database = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'pastifico-db.json'), 'utf8'));
const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const run = async (): Promise<void> => {
  const categories = database.categories.map((category: any) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    created_at: category.createdAt
  }));
  const products = database.products.map((product: any) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    is_available: product.isAvailable,
    category_id: product.categoryId,
    created_at: product.createdAt
  }));

  const categoriesResult = await supabase.from('categories').upsert(categories);
  if (categoriesResult.error) throw categoriesResult.error;
  const productsResult = await supabase.from('products').upsert(products);
  if (productsResult.error) throw productsResult.error;

  for (const order of database.orders) {
    const orderResult = await supabase.from('orders').upsert({
      id: order.id,
      customer_name: order.customerName,
      table_number: order.tableNumber,
      status: order.status,
      total: order.total,
      created_at: order.createdAt
    });
    if (orderResult.error) throw orderResult.error;

    const itemsResult = await supabase.from('order_items').upsert(order.items.map((item: any) => ({
      id: item.id,
      order_id: order.id,
      product_id: item.productId,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.subtotal,
      options: Array.isArray(item.options) ? item.options : []
    })));
    if (itemsResult.error) throw itemsResult.error;
  }

  console.log(`Migração concluída: ${categories.length} categorias, ${products.length} produtos e ${database.orders.length} pedidos.`);
};

run().catch((error: Error) => {
  console.error(`Falha na migração: ${error.message}`);
  process.exitCode = 1;
});

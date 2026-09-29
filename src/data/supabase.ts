import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Category, Product } from '../types';
import { Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus } from './orderData';

let client: SupabaseClient | null = null;

const getClient = (): SupabaseClient | null => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  client ??= createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return client;
};

export const isSupabaseConfigured = (): boolean => Boolean(getClient());

const requireClient = (): SupabaseClient => {
  const supabase = getClient();
  if (!supabase) throw new Error('Supabase não está configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
  return supabase;
};

const mapCategory = (row: any): Category => ({
  id: row.id,
  name: row.name,
  description: row.description,
  createdAt: row.created_at
});

const mapProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  description: row.description,
  price: Number(row.price),
  image: row.image,
  isAvailable: row.is_available,
  categoryId: row.category_id,
  createdAt: row.created_at
});

const mapOrder = (row: any): Order => ({
  id: row.id,
  customerName: row.customer_name,
  tableNumber: row.table_number,
  status: row.status as OrderStatus,
  total: Number(row.total),
  createdAt: row.created_at,
  paymentMethod: row.payment_method ?? 'Dinheiro',
  paymentStatus: row.payment_status === 'Pago' ? 'Pago' : 'Aguardando no caixa',
  items: (row.order_items ?? []).map((item: any): OrderItem => ({
    id: item.id,
    productId: item.product_id,
    name: item.name,
    quantity: item.quantity,
    unitPrice: Number(item.unit_price),
    subtotal: Number(item.subtotal),
    options: item.options ?? []
  }))
});

export const supabaseData = {
  async listCategories(): Promise<Category[]> {
    const { data, error } = await requireClient().from('categories').select('*').order('name');
    if (error) throw error;
    return (data ?? []).map(mapCategory);
  },

  async createCategory(name: string, description: string): Promise<Category> {
    const { data: existing, error: existingError } = await requireClient().from('categories').select('*').ilike('name', name).maybeSingle();
    if (existingError) throw existingError;
    if (existing) return mapCategory(existing);

    const { data, error } = await requireClient().from('categories').insert({ name, description }).select().single();
    if (error) throw error;
    return mapCategory(data);
  },

  async listProducts(): Promise<Product[]> {
    const { data, error } = await requireClient().from('products').select('*').order('name');
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  },

  async getProductById(id: string): Promise<Product | undefined> {
    const { data, error } = await requireClient().from('products').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapProduct(data) : undefined;
  },

  async createProduct(product: Omit<Product, 'createdAt'>): Promise<Product> {
    const { data: existing, error: existingError } = await requireClient().from('products').select('*').ilike('name', product.name).maybeSingle();
    if (existingError) throw existingError;
    if (existing) return mapProduct(existing);

    const { data, error } = await requireClient().from('products').insert({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      is_available: product.isAvailable,
      category_id: product.categoryId
    }).select().single();
    if (error) throw error;
    return mapProduct(data);
  },

  async updateProduct(id: string, changes: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product | undefined> {
    const payload: Record<string, unknown> = { ...changes };
    if ('isAvailable' in changes) {
      payload.is_available = changes.isAvailable;
      delete payload.isAvailable;
    }
    if ('categoryId' in changes) {
      payload.category_id = changes.categoryId;
      delete payload.categoryId;
    }
    const { data, error } = await requireClient().from('products').update(payload).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data ? mapProduct(data) : undefined;
  },

  async listOrders(): Promise<Order[]> {
    const { data, error } = await requireClient().from('orders').select('*, order_items(*)').order('created_at');
    if (error) throw error;
    return (data ?? []).map(mapOrder);
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    const { data, error } = await requireClient().from('orders').select('*, order_items(*)').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapOrder(data) : undefined;
  },

  async createOrder(customerName: string, tableNumber: number, items: OrderItem[], total: number, paymentMethod: PaymentMethod): Promise<Order> {
    const supabase = requireClient();
    const paymentStatus: PaymentStatus = 'Aguardando no caixa';
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      customer_name: customerName,
      table_number: tableNumber,
      status: 'Recebido',
      total,
      payment_method: paymentMethod,
      payment_status: paymentStatus
    }).select().single();
    if (orderError) throw orderError;

    const { error: itemsError } = await supabase.from('order_items').insert(items.map((item) => ({
      id: item.id,
      order_id: order.id,
      product_id: item.productId,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.subtotal,
      options: item.options ?? []
    })));
    if (itemsError) throw itemsError;

    return mapOrder({ ...order, payment_method: paymentMethod, payment_status: paymentStatus, order_items: items });
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
    const { data, error } = await requireClient().from('orders').update({ status }).eq('id', id).select('*, order_items(*)').maybeSingle();
    if (error) throw error;
    return data ? mapOrder(data) : undefined;
  }
};

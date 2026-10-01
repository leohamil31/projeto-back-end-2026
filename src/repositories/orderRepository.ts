import { randomUUID } from 'node:crypto';
import { Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus } from '../models/Order';
import { isSupabaseConfigured, requireSupabaseClient } from '../config/supabaseClient';
import { ensureDatabaseFile, saveDatabase } from '../config/localDatabase';
import { productRepository } from './productRepository';

const foodOptionPrices: Record<string, number> = {
  'Molho extra da casa': 4,
  'Parmesão ralado na hora': 3,
  'Bacon crocante': 5,
  'Frango grelhado': 8,
  'Pimenta calabresa': 2
};

const wineProductNames = new Set(['Vinho Toscano', 'Chianti Classico', 'Pinot Grigio delle Venezie', 'Prosecco Veneto', 'Montepulciano d’Abruzzo']);
const sodaProductNames = new Set(['Coca-Cola 600ml', 'Guaraná Antarctica 600ml', 'Fanta Laranja 600ml']);

const getAuthoritativeItemPrice = (productName: string, basePrice: number, options: string[]): number => {
  let price = basePrice;

  if (wineProductNames.has(productName)) {
    if (options.some((option) => !['Taça de vinho', 'Garrafa de vinho'].includes(option))) throw new Error('Adicional inválido para vinho.');
    if (options.includes('Taça de vinho')) price = 18;
    return price;
  }

  if (sodaProductNames.has(productName)) {
    const allowed = ['Lata 350 ml', 'Garrafa 600 ml', 'Copo com gelo', 'Com limão', 'Com laranja'];
    if (options.some((option) => !allowed.includes(option))) throw new Error('Adicional inválido para refrigerante.');
    if (options.includes('Lata 350 ml')) price = 7.5;
    return price + (options.includes('Copo com gelo') ? 1.5 : 0) + (options.includes('Com limão') ? 1 : 0) + (options.includes('Com laranja') ? 1 : 0);
  }

  const extras = options.reduce((total, option) => {
    if (!(option in foodOptionPrices)) throw new Error('Adicional de prato inválido.');
    return total + foodOptionPrices[option];
  }, 0);
  return price + extras;
};

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

const findAllLocal = (): Order[] => ensureDatabaseFile().orders;

const persistLocal = (orders: Order[]): void => {
  const db = ensureDatabaseFile();
  saveDatabase({ ...db, orders });
};

const buildOrderItems = async (items: any[]): Promise<OrderItem[]> => Promise.all(items.map(async (item) => {
  const quantity = Number(item.quantity ?? 1);
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error('A quantidade do item deve ser um inteiro maior que zero.');

  const product = await productRepository.findById(String(item.productId ?? ''));
  if (!product || !product.isAvailable) throw new Error('Produto não encontrado ou indisponível.');

  const options = Array.isArray(item.options) ? item.options.filter((option: unknown): option is string => typeof option === 'string') : [];
  const unitPrice = getAuthoritativeItemPrice(product.name, product.price, options);
  const subtotal = quantity * unitPrice;

  return {
    id: randomUUID(),
    productId: product.id,
    name: product.name,
    quantity,
    unitPrice,
    subtotal,
    options
  };
}));

export const orderRepository = {
  async findAll(): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await requireSupabaseClient().from('orders').select('*, order_items(*)').order('created_at');
      if (error) throw error;
      return (data ?? []).map(mapOrder);
    }
    return findAllLocal();
  },

  async findById(id: string): Promise<Order | undefined> {
    if (isSupabaseConfigured()) {
      const { data, error } = await requireSupabaseClient().from('orders').select('*, order_items(*)').eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? mapOrder(data) : undefined;
    }
    return findAllLocal().find((order) => order.id === id);
  },

  async findForKitchen(): Promise<Order[]> {
    const orders = await this.findAll();
    return orders.filter((order) => order.status !== 'Entregue');
  },

  async findByTable(tableNumber: number): Promise<Order[]> {
    const orders = await this.findAll();
    return orders.filter((order) => order.tableNumber === tableNumber);
  },

  async create(customerName: string, tableNumber: number, items: any[], paymentMethod: PaymentMethod = 'Dinheiro'): Promise<Order> {
    const orderItems = await buildOrderItems(items);
    const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const paymentStatus: PaymentStatus = 'Aguardando no caixa';

    if (isSupabaseConfigured()) {
      const supabase = requireSupabaseClient();
      const { data: order, error: orderError } = await supabase.from('orders').insert({
        id: randomUUID(),
        customer_name: customerName,
        table_number: tableNumber,
        status: 'Recebido',
        total,
        payment_method: paymentMethod,
        payment_status: paymentStatus
      }).select().single();
      if (orderError) throw orderError;

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems.map((item) => ({
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

      return mapOrder({ ...order, payment_method: paymentMethod, payment_status: paymentStatus, order_items: orderItems });
    }

    const order: Order = {
      id: randomUUID(),
      customerName,
      tableNumber,
      status: 'Recebido',
      items: orderItems,
      total,
      createdAt: new Date().toISOString(),
      paymentMethod,
      paymentStatus
    };

    const orders = findAllLocal();
    orders.push(order);
    persistLocal(orders);
    return order;
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
    if (isSupabaseConfigured()) {
      const { data, error } = await requireSupabaseClient().from('orders').update({ status }).eq('id', id).select('*, order_items(*)').maybeSingle();
      if (error) throw error;
      return data ? mapOrder(data) : undefined;
    }

    const orders = findAllLocal();
    const order = orders.find((current) => current.id === id);
    if (!order) return undefined;

    order.status = status;
    persistLocal(orders);
    return order;
  },

  async remove(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const { error, count } = await requireSupabaseClient().from('orders').delete({ count: 'exact' }).eq('id', id);
      if (error) throw error;
      return Boolean(count);
    }

    const orders = findAllLocal();
    const index = orders.findIndex((order) => order.id === id);
    if (index === -1) return false;

    orders.splice(index, 1);
    persistLocal(orders);
    return true;
  }
};

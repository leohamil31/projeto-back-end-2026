import { Order, OrderItem, OrderStatus, PaymentMethod, orders, persistOrders } from '../data/orderData';
import { isSupabaseConfigured, supabaseData } from '../data/supabase';
import { getProductById } from './catalogService';

const foodOptionPrices: Record<string, number> = {
  'Molho extra da casa': 4,
  'Parmesão ralado na hora': 3,
  'Bacon crocante': 5,
  'Frango grelhado': 8,
  'Pimenta calabresa': 2
};

const wineProductIds = new Set(['vinho-toscano', 'chianti-classico', 'pinot-grigio', 'prosecco-veneto', 'montepulciano-dabruzzo']);
const sodaProductIds = new Set(['coca-cola', 'guarana-antarctica', 'fanta-laranja']);

const getAuthoritativeItemPrice = (productId: string, basePrice: number, options: string[]): number => {
  let price = basePrice;
  if (wineProductIds.has(productId)) {
    if (options.some((option) => !['Taça de vinho', 'Garrafa de vinho'].includes(option))) throw new Error('Adicional inválido para vinho.');
    if (options.includes('Taça de vinho')) price = 18;
    return price;
  }

  if (sodaProductIds.has(productId)) {
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

export const getOrders = async (): Promise<Order[]> => {
  if (isSupabaseConfigured()) return supabaseData.listOrders();
  return orders;
};

export const getOrdersForKitchen = async (): Promise<Order[]> => {
  const allOrders = await getOrders();
  return allOrders.filter((order) => order.status !== 'Entregue');
};

export const getOrdersByTable = async (tableNumber: number): Promise<Order[]> => {
  const allOrders = await getOrders();
  return allOrders.filter((order) => order.tableNumber === tableNumber);
};

export const createOrder = async (customerName: string, tableNumber: number, items: any[], paymentMethod: PaymentMethod = 'Dinheiro'): Promise<Order> => {
  const orderItems: OrderItem[] = await Promise.all(items.map(async (item, index) => {
    const quantity = Number(item.quantity ?? 1);
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error('A quantidade do item deve ser um inteiro maior que zero.');
    const product = await getProductById(String(item.productId ?? ''));
    if (!product || !product.isAvailable) throw new Error('Produto não encontrado ou indisponível.');
    const options = Array.isArray(item.options) ? item.options.filter((option: unknown): option is string => typeof option === 'string') : [];
    const unitPrice = getAuthoritativeItemPrice(product.id, product.price, options);
    const subtotal = quantity * unitPrice;

    return {
      id: `${item.productId}-${index}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      quantity,
      unitPrice,
      subtotal,
      options
    };
  }));

  const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  const order: Order = {
    id: `order-${Date.now()}`,
    customerName,
    tableNumber,
    status: 'Recebido',
    items: orderItems,
    total,
    createdAt: new Date().toISOString(),
    paymentMethod,
    paymentStatus: 'Aguardando no caixa'
  };

  if (isSupabaseConfigured()) return supabaseData.createOrder(customerName, tableNumber, orderItems, total, paymentMethod);

  orders.push(order);
  persistOrders();
  return order;
};

export const getOrderById = async (orderId: string): Promise<Order | undefined> => {
  if (isSupabaseConfigured()) return supabaseData.getOrderById(orderId);
  return orders.find((current) => current.id === orderId);
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order | undefined> => {
  if (isSupabaseConfigured()) return supabaseData.updateOrderStatus(orderId, status);

  const order = orders.find((currentOrder) => currentOrder.id === orderId);

  if (!order) {
    return undefined;
  }

  order.status = status;
  persistOrders();
  return order;
};

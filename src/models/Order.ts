export type OrderStatus = 'Recebido' | 'Preparando' | 'Pronto' | 'Entregue';
export type PaymentMethod = 'PIX' | 'Cartão' | 'Dinheiro';
export type PaymentStatus = 'Aguardando no caixa' | 'Pago';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  options: string[];
}

export interface Order {
  id: string;
  customerName: string;
  tableNumber: number;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
}

import { Request, Response } from 'express';
import { createOrder, getOrderById, getOrders, updateOrderStatus } from '../services/orderService';

export const listOrders = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json(await getOrders());
};

export const storeOrder = async (req: Request, res: Response): Promise<void> => {
  const { customerName, tableNumber, items, paymentMethod = 'Dinheiro' } = req.body;

  if (!customerName || !tableNumber || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: 'Customer name, table number and items are required' });
    return;
  }

  if (!Number.isInteger(Number(tableNumber)) || Number(tableNumber) < 1) {
    res.status(400).json({ message: 'Número da mesa inválido.' });
    return;
  }

  if (!['PIX', 'Cartão', 'Dinheiro'].includes(paymentMethod)) {
    res.status(400).json({ message: 'Método de pagamento inválido.' });
    return;
  }

  let order;
  try {
    order = await createOrder(customerName.trim(), Number(tableNumber), items, paymentMethod);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Os itens do pedido são inválidos.' });
    return;
  }
  res.status(201).json(order);
};

export const showOrder = async (req: Request, res: Response): Promise<void> => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const order = await getOrderById(id);
  if (!order) {
    res.status(404).json({ message: 'Pedido não encontrado.' });
    return;
  }
  res.status(200).json(order);
};

export const updateOrderStatusController = async (req: Request, res: Response): Promise<void> => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { status } = req.body;

  const validStatuses = ['Recebido', 'Preparando', 'Pronto', 'Entregue'];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ message: 'Invalid order status' });
    return;
  }

  const order = await updateOrderStatus(id, status);

  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  res.status(200).json(order);
};

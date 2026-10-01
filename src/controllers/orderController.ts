import { Request, Response } from 'express';
import { orderRepository } from '../repositories/orderRepository';
import { asyncHandler } from '../middlewares/asyncHandler';
import { getIdParam } from '../utils/params';

export const listOrders = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json(await orderRepository.findAll());
});

export const storeOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { customerName, tableNumber, items, paymentMethod = 'Dinheiro' } = req.body;

  if (!customerName || !tableNumber || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: 'Nome do cliente, número da mesa e itens são obrigatórios.' });
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
    order = await orderRepository.create(customerName.trim(), Number(tableNumber), items, paymentMethod);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Os itens do pedido são inválidos.' });
    return;
  }
  res.status(201).json(order);
});

export const showOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const order = await orderRepository.findById(getIdParam(req.params.id));
  if (!order) {
    res.status(404).json({ message: 'Pedido não encontrado.' });
    return;
  }
  res.status(200).json(order);
});

export const updateOrderStatusController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { status } = req.body;
  const validStatuses = ['Recebido', 'Preparando', 'Pronto', 'Entregue'];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ message: 'Status do pedido inválido.' });
    return;
  }

  const order = await orderRepository.updateStatus(getIdParam(req.params.id), status);

  if (!order) {
    res.status(404).json({ message: 'Pedido não encontrado.' });
    return;
  }

  res.status(200).json(order);
});

export const destroyOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const removed = await orderRepository.remove(getIdParam(req.params.id));

  if (!removed) {
    res.status(404).json({ message: 'Pedido não encontrado.' });
    return;
  }

  res.status(204).send();
});

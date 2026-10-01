import { Request, Response } from 'express';
import { orderRepository } from '../repositories/orderRepository';
import { asyncHandler } from '../middlewares/asyncHandler';

export const listKitchenOrders = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json(await orderRepository.findForKitchen());
});

export const listTableOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const tableNumber = Number(req.params.tableNumber);

  if (Number.isNaN(tableNumber)) {
    res.status(400).json({ message: 'Número da mesa é inválido.' });
    return;
  }

  res.status(200).json(await orderRepository.findByTable(tableNumber));
});

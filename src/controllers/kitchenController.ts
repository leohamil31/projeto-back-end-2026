import { Request, Response } from 'express';
import { getOrdersByTable, getOrdersForKitchen } from '../services/orderService';

export const listKitchenOrders = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json(await getOrdersForKitchen());
};

export const listTableOrders = async (req: Request, res: Response): Promise<void> => {
  const tableNumber = Number(req.params.tableNumber);

  if (Number.isNaN(tableNumber)) {
    res.status(400).json({ message: 'Table number is invalid' });
    return;
  }

  res.status(200).json(await getOrdersByTable(tableNumber));
};

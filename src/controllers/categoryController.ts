import { Request, Response } from 'express';
import { createCategory, getCategories } from '../services/catalogService';

export const listCategories = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json(await getCategories());
};

export const storeCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body;

  if (!name || !description) {
    res.status(400).json({ message: 'Name and description are required' });
    return;
  }

  const category = await createCategory(name, description);
  res.status(201).json(category);
};

import { Request, Response } from 'express';
import { createProduct, getProductById, getProducts, updateProduct } from '../services/catalogService';

export const listProducts = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json(await getProducts());
};

export const showProduct = async (req: Request, res: Response): Promise<void> => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const product = await getProductById(id);

  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  res.status(200).json(product);
};

export const storeProduct = async (req: Request, res: Response): Promise<void> => {
  const { name, description, price, image, isAvailable, categoryId } = req.body;

  if (!name || !description || price === undefined || !image || !categoryId) {
    res.status(400).json({ message: 'All product fields are required' });
    return;
  }

  const product = await createProduct(name, description, Number(price), image, Boolean(isAvailable), categoryId);
  res.status(201).json(product);
};

export const updateProductController = async (req: Request, res: Response): Promise<void> => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const product = await updateProduct(id, req.body);

  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  res.status(200).json(product);
};

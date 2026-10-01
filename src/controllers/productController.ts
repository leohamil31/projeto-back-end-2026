import { Request, Response } from 'express';
import { productRepository } from '../repositories/productRepository';
import { asyncHandler } from '../middlewares/asyncHandler';
import { getIdParam } from '../utils/params';

export const listProducts = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json(await productRepository.findAll());
});

export const showProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const product = await productRepository.findById(getIdParam(req.params.id));

  if (!product) {
    res.status(404).json({ message: 'Produto não encontrado.' });
    return;
  }

  res.status(200).json(product);
});

export const storeProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, description, price, image, isAvailable, categoryId } = req.body;

  if (!name || !description || price === undefined || !image || !categoryId) {
    res.status(400).json({ message: 'Todos os campos do produto são obrigatórios.' });
    return;
  }

  if (Number.isNaN(Number(price)) || Number(price) < 0) {
    res.status(400).json({ message: 'O preço do produto é inválido.' });
    return;
  }

  const product = await productRepository.create({
    name,
    description,
    price: Number(price),
    image,
    isAvailable: Boolean(isAvailable),
    categoryId
  });
  res.status(201).json(product);
});

export const updateProductController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const product = await productRepository.update(getIdParam(req.params.id), req.body);

  if (!product) {
    res.status(404).json({ message: 'Produto não encontrado.' });
    return;
  }

  res.status(200).json(product);
});

export const destroyProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const removed = await productRepository.remove(getIdParam(req.params.id));

  if (!removed) {
    res.status(404).json({ message: 'Produto não encontrado.' });
    return;
  }

  res.status(204).send();
});

import { Request, Response } from 'express';
import { categoryRepository } from '../repositories/categoryRepository';
import { asyncHandler } from '../middlewares/asyncHandler';
import { getIdParam } from '../utils/params';

export const listCategories = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json(await categoryRepository.findAll());
});

export const showCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const category = await categoryRepository.findById(getIdParam(req.params.id));

  if (!category) {
    res.status(404).json({ message: 'Categoria não encontrada.' });
    return;
  }

  res.status(200).json(category);
});

export const storeCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body;

  if (!name || !description) {
    res.status(400).json({ message: 'Nome e descrição são obrigatórios.' });
    return;
  }

  const category = await categoryRepository.create(name, description);
  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body;

  if (name === undefined && description === undefined) {
    res.status(400).json({ message: 'Informe ao menos um campo para atualizar (name ou description).' });
    return;
  }

  const changes: Partial<{ name: string; description: string }> = {};
  if (name !== undefined) changes.name = name;
  if (description !== undefined) changes.description = description;

  const category = await categoryRepository.update(getIdParam(req.params.id), changes);

  if (!category) {
    res.status(404).json({ message: 'Categoria não encontrada.' });
    return;
  }

  res.status(200).json(category);
});

export const destroyCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const removed = await categoryRepository.remove(getIdParam(req.params.id));

  if (!removed) {
    res.status(404).json({ message: 'Categoria não encontrada.' });
    return;
  }

  res.status(204).send();
});

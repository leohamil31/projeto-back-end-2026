import { NextFunction, Request, Response } from 'express';

export class HttpError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({ message: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  const message = error instanceof Error ? error.message : 'Erro interno do servidor.';
  console.error('Erro não tratado:', error);
  res.status(500).json({ message });
};

import { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Envolve um controller assíncrono para encaminhar qualquer erro lançado
 * (ou promise rejeitada) ao middleware de erro central, evitando handlers
 * "soltos" sem tratamento em cada controller.
 */
export const asyncHandler = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler => (req, res, next) => {
  handler(req, res, next).catch(next);
};

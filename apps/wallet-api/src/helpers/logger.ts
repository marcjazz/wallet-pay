import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  Logger.log(
    `${req.originalUrl} (origin: ${req.headers.origin}, client IP: ${req.ip})`,
    req.method
  );
  next();
}

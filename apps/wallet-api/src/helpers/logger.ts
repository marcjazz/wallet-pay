import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, _res: Response, next: NextFunction) {
  Logger.log(
    `${req.originalUrl} (User agent: ${req.headers['user-agent']}, client IP: ${req.socket.remoteAddress})`,
    req.method
  );
  next();
}

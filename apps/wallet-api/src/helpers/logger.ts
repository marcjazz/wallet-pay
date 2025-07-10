import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;

    Logger.log(
      `${req.method} ${req.originalUrl} (${res.statusCode}) ${duration}ms`,
      'RequestLog'
    );

    console.log(
      ` - User agent: ${req.headers['user-agent']}
        - Client Ip: ${req.socket.remoteAddress || req.ip || 'unknown'}
        - Request headers: ${JSON.stringify(req.headers)} 
        - Request parameters: ${JSON.stringify(req.query)} 
        - Response sent: Status Code ${res.statusCode} 
        - Time taken: ${duration}ms`,
      'RequestLog'
    );
  });

  next();
}

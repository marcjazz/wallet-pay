import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'http-message-signatures';
import { SignatureService } from '../../../pawapay/signature.service';

@Injectable()
export class PawapayCallbacksGuard implements CanActivate {
  constructor(private readonly signatureService: SignatureService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const isRequestValid = await this.signatureService.verifyRequest(request);
    if (!isRequestValid) {
      throw new UnauthorizedException(`Request could not be authenticated!`);
    }
    return isRequestValid;
  }
}

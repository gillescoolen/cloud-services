import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';

type Exception = {
  code: number;
  message: string;
};

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  private exceptions: Exception[] = [{ code: 11000, message: 'Value already exist' }];

  public catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(400).json({
      statusCode: 400,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: this.getMessage(exception.code).message
    });
  }

  private getMessage(code: string | number) {
    const errorCode = typeof code === 'string' ? parseInt(code) : code;
    return this.exceptions.find((e) => e.code === errorCode);
  }
}

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import * as jsontoxml from 'jsontoxml';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class XMLInterceptor<T> implements NestInterceptor<T, string> {
  public intercept(context: ExecutionContext, next: CallHandler): Observable<string> {
    const regex = /\/xml/gi;
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const requestedXML = request.headers['api-return-format'] && request.headers['api-return-format'].match(regex);

    return next.handle().pipe(
      map((data) => this.toXML(requestedXML, data, context)),
      catchError((error) => of(this.toXML(requestedXML, error.response, context)))
    );
  }

  private toXML(requestedXML: boolean, data: any, context: any) {
    if (requestedXML && typeof data === 'object') {
      const req = context.switchToHttp().getRequest();
      const root = this.handleArray(JSON.parse(JSON.stringify(data)));

      req.res.header('content-type', 'text/xml');

      return jsontoxml(
        { root },
        {
          xmlHeader: true
        }
      );
    }

    return data;
  }

  private handleArray(object: unknown): unknown {
    if (Array.isArray(object)) return object.map((item) => ({ item }));

    if (object instanceof Object) {
      const result = {};

      for (const property in object)
        if (object.hasOwnProperty(property)) result[property] = this.handleArray(object[property]);

      return result;
    }

    return object;
  }
}

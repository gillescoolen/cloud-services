export class PaginationResponse {
  page: number;
  count: number;
  data: any;

  constructor(response: PaginationResponse) {
    Object.assign(this, response);
  }
}

import type { ApiErrorResponse } from "../types/Api";

export class ApiRequestError extends Error {
  status: number;

  code: string;

  errors: ApiErrorResponse["errors"];

  traceId?: string;


  constructor(
    status: number,
    response: ApiErrorResponse
  ) {
    super(response.message);

    this.name = "ApiRequestError";

    this.status = status;

    this.code = response.code;

    this.errors =
      response.errors ?? [];

    this.traceId =
      response.traceId;
  }
}
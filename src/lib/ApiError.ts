import type { ApiErrorDetail } from "../types/Api";

export class ApiRequestError extends Error {
  status: number;
  code: string;
  errors: ApiErrorDetail[];

  constructor(
    status: number,
    response: {
      success: boolean;
      message: string;
      code?: string;
      errors?: ApiErrorDetail[];
    },
  ) {
    super(response.message);

    this.name = "ApiRequestError";

    this.status = status;

    this.code =
      response.code ?? "API_ERROR";

    this.errors =
      response.errors ?? [];

    Object.setPrototypeOf(
      this,
      ApiRequestError.prototype,
    );
  }
}
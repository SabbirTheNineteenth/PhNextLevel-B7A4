import { Response } from 'express';

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ResponsePayload<T> {
  statusCode: number;
  success?: boolean;
  message: string;
  meta?: Meta;
  data: T;
}

// Consistent shape for every successful response:
// { success, message, meta?, data }
export const sendResponse = <T>(res: Response, payload: ResponsePayload<T>): void => {
  res.status(payload.statusCode).json({
    success: payload.success ?? true,
    message: payload.message,
    ...(payload.meta ? { meta: payload.meta } : {}),
    data: payload.data,
  });
};

export default sendResponse;

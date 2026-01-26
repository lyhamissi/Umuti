import { Request, Response, NextFunction } from "express";

export interface ApiError extends Error {
  statusCode?: number;
  errors?: any[];
  data?: any;
}

export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || undefined,
    data: err.data || undefined,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
}

export class AppError extends Error {
  statusCode: number;
  errors?: any[];
  data?: any;

  constructor(message: string, statusCode: number = 500, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

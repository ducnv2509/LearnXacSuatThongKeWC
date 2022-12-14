import mongoose from 'mongoose';
import { NextFunction, Request, Response } from 'express';

import { logger, getExtraParams, ErrorHandler } from '../../utils';
import { MyError } from '../../utils/error';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.message, getExtraParams(req));

  if (err instanceof mongoose.Error) {
    return res
      .status(500)
      .json({
        error: {
          code: 50001,
          message: 'Operation error'
        }
      })
  }

  if (err instanceof ErrorHandler) {
    return res
      .status(err.statusCode)
      .json({
        error: {
          code: err.code,
          message: err.message
        }
      })
  }

  if (err instanceof MyError) {
    return res
      .status(400)
      .json({
        error: {
          code: "BAD_REQUEST",
          message: err.message
        }
      })
  }

  return res
    .status(500)
    .json({
      error: {
        code: 50000,
        message: 'Internal server error'
      }
    })
}
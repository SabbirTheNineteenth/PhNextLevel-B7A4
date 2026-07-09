import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

// Validates req.body/query/params against a Zod schema.
// On failure, the ZodError is forwarded to the global error handler,
// which formats it into the standard errorDetails array.
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // overwrite with parsed/coerced values
      if (parsed.body) req.body = parsed.body;
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default validate;

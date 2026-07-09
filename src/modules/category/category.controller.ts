import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { CategoryService } from './category.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.create(req.body);
  sendResponse(res, {
    statusCode: 201,
    message: 'Category created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (_req: Request, res: Response) => {
  const result = await CategoryService.getAll();
  sendResponse(res, {
    statusCode: 200,
    message: 'Categories fetched successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.update(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    message: 'Category updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.remove(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    message: 'Category deleted successfully',
    data: result,
  });
});

export const CategoryController = { create, getAll, update, remove };

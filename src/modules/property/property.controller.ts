import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { PropertyService } from './property.service';

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.getAll(req.query as Record<string, string>);
  sendResponse(res, {
    statusCode: 200,
    message: 'Properties fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.getById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    message: 'Property fetched successfully',
    data: result,
  });
});

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.create(req.user!.userId, req.body);
  sendResponse(res, {
    statusCode: 201,
    message: 'Property created successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.update(req.params.id, req.user!.userId, req.body);
  sendResponse(res, {
    statusCode: 200,
    message: 'Property updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.remove(req.params.id, req.user!.userId);
  sendResponse(res, {
    statusCode: 200,
    message: 'Property deleted successfully',
    data: result,
  });
});

export const PropertyController = { getAll, getById, create, update, remove };

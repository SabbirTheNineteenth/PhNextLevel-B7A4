import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AdminService } from './admin.service';

const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminService.getAllUsers();
  sendResponse(res, { statusCode: 200, message: 'All users fetched successfully', data: result });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.updateUserStatus(req.params.id, req.body.status);
  sendResponse(res, {
    statusCode: 200,
    message: `User ${req.body.status === 'BANNED' ? 'banned' : 'unbanned'} successfully`,
    data: result,
  });
});

const getAllProperties = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminService.getAllProperties();
  sendResponse(res, { statusCode: 200, message: 'All properties fetched successfully', data: result });
});

const getAllRentals = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminService.getAllRentals();
  sendResponse(res, { statusCode: 200, message: 'All rental requests fetched successfully', data: result });
});

const getStats = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminService.getStats();
  sendResponse(res, { statusCode: 200, message: 'Platform stats fetched successfully', data: result });
});

export const AdminController = {
  getAllUsers,
  updateUserStatus,
  getAllProperties,
  getAllRentals,
  getStats,
};

import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { RentalService } from './rental.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.create(req.user!.userId, req.body);
  sendResponse(res, {
    statusCode: 201,
    message: 'Rental request submitted successfully',
    data: result,
  });
});

const getMyRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.getMyRequests(req.user!.userId);
  sendResponse(res, {
    statusCode: 200,
    message: 'Your rental requests fetched successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.getById(req.params.id, req.user!.userId);
  sendResponse(res, {
    statusCode: 200,
    message: 'Rental request fetched successfully',
    data: result,
  });
});

const getLandlordRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.getLandlordRequests(req.user!.userId);
  sendResponse(res, {
    statusCode: 200,
    message: 'Landlord rental requests fetched successfully',
    data: result,
  });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.updateStatus(
    req.params.id,
    req.user!.userId,
    req.body.status
  );
  sendResponse(res, {
    statusCode: 200,
    message: `Rental request ${req.body.status.toLowerCase()} successfully`,
    data: result,
  });
});

export const RentalController = {
  create,
  getMyRequests,
  getById,
  getLandlordRequests,
  updateStatus,
};

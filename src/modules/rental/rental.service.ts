import { RentalStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { CreateRentalInput } from './rental.validation';

// Tenant submits a rental request
const create = async (tenantId: string, data: CreateRentalInput) => {
  const property = await prisma.property.findUnique({ where: { id: data.propertyId } });
  if (!property) throw new AppError(404, 'Property not found.');
  if (!property.isAvailable) {
    throw new AppError(400, 'This property is not available for rent.');
  }
  if (property.landlordId === tenantId) {
    throw new AppError(400, 'You cannot request your own property.');
  }

  // Prevent duplicate pending/approved requests on the same property
  const existing = await prisma.rentalRequest.findFirst({
    where: {
      propertyId: data.propertyId,
      tenantId,
      status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] },
    },
  });
  if (existing) {
    throw new AppError(409, 'You already have an active request for this property.');
  }

  return prisma.rentalRequest.create({
    data: {
      propertyId: data.propertyId,
      tenantId,
      message: data.message,
      moveInDate: data.moveInDate ? new Date(data.moveInDate) : undefined,
    },
    include: { property: { select: { id: true, title: true, price: true } } },
  });
};

// Tenant: list own requests
const getMyRequests = async (tenantId: string) => {
  return prisma.rentalRequest.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    include: {
      property: { select: { id: true, title: true, price: true, location: true } },
      payment: { select: { id: true, status: true, amount: true } },
    },
  });
};

const getById = async (id: string, userId: string) => {
  const request = await prisma.rentalRequest.findUnique({
    where: { id },
    include: {
      property: true,
      tenant: { select: { id: true, name: true, email: true } },
      payment: true,
      review: true,
    },
  });
  if (!request) throw new AppError(404, 'Rental request not found.');

  // Only the tenant who made it or the landlord who owns the property may view it
  if (request.tenantId !== userId && request.property.landlordId !== userId) {
    throw new AppError(403, 'You are not allowed to view this rental request.');
  }
  return request;
};

// Landlord: all requests across their properties
const getLandlordRequests = async (landlordId: string) => {
  return prisma.rentalRequest.findMany({
    where: { property: { landlordId } },
    orderBy: { createdAt: 'desc' },
    include: {
      property: { select: { id: true, title: true } },
      tenant: { select: { id: true, name: true, email: true } },
      payment: { select: { id: true, status: true } },
    },
  });
};

// Landlord: approve / reject / complete
const updateStatus = async (
  id: string,
  landlordId: string,
  status: 'APPROVED' | 'REJECTED' | 'COMPLETED'
) => {
  const request = await prisma.rentalRequest.findUnique({
    where: { id },
    include: { property: true },
  });
  if (!request) throw new AppError(404, 'Rental request not found.');
  if (request.property.landlordId !== landlordId) {
    throw new AppError(403, 'You can only manage requests for your own properties.');
  }

  // Enforce valid transitions
  const current = request.status;
  const allowed: Record<string, RentalStatus[]> = {
    PENDING: ['APPROVED', 'REJECTED'],
    ACTIVE: ['COMPLETED'],
  };

  if (!allowed[current] || !allowed[current].includes(status as RentalStatus)) {
    throw new AppError(
      400,
      `Cannot change status from ${current} to ${status}.`
    );
  }

  return prisma.rentalRequest.update({
    where: { id },
    data: { status: status as RentalStatus },
  });
};

export const RentalService = {
  create,
  getMyRequests,
  getById,
  getLandlordRequests,
  updateStatus,
};

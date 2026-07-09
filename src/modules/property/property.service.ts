import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { CreatePropertyInput, UpdatePropertyInput } from './property.validation';

interface PropertyFilters {
  search?: string;
  location?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  isAvailable?: string;
  page?: string;
  limit?: string;
}

// Public listing with search + filters + pagination
const getAll = async (filters: PropertyFilters) => {
  const page = Math.max(parseInt(filters.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(filters.limit || '10', 10), 1), 100);
  const skip = (page - 1) * limit;

  const where: Prisma.PropertyWhereInput = {};

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { location: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.location) {
    where.location = { contains: filters.location, mode: 'insensitive' };
  }
  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters.isAvailable !== undefined) {
    where.isAvailable = filters.isAvailable === 'true';
  }
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = parseInt(filters.minPrice, 10);
    if (filters.maxPrice) where.price.lte = parseInt(filters.maxPrice, 10);
  }

  const [data, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true } },
        landlord: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getById = async (id: string) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      landlord: { select: { id: true, name: true, email: true, phone: true } },
      reviews: {
        include: { tenant: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!property) throw new AppError(404, 'Property not found.');
  return property;
};

const create = async (landlordId: string, data: CreatePropertyInput) => {
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) throw new AppError(404, 'Category not found.');

  return prisma.property.create({
    data: { ...data, landlordId },
  });
};

// Ensures the property exists AND belongs to this landlord
const ensureOwnership = async (id: string, landlordId: string) => {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw new AppError(404, 'Property not found.');
  if (property.landlordId !== landlordId) {
    throw new AppError(403, 'You can only manage your own properties.');
  }
  return property;
};

const update = async (id: string, landlordId: string, data: UpdatePropertyInput) => {
  await ensureOwnership(id, landlordId);
  if (data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new AppError(404, 'Category not found.');
  }
  return prisma.property.update({ where: { id }, data });
};

const remove = async (id: string, landlordId: string) => {
  await ensureOwnership(id, landlordId);
  await prisma.property.delete({ where: { id } });
  return { id };
};

export const PropertyService = { getAll, getById, create, update, remove };

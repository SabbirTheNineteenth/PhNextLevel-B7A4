import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';

const create = async (data: { name: string; description?: string }) => {
  return prisma.category.create({ data });
};

const getAll = async () => {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { properties: true } } },
  });
};

const update = async (id: string, data: { name?: string; description?: string }) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Category not found.');
  return prisma.category.update({ where: { id }, data });
};

const remove = async (id: string) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Category not found.');
  await prisma.category.delete({ where: { id } });
  return { id };
};

export const CategoryService = { create, getAll, update, remove };

import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';

const getAllUsers = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
};

const updateUserStatus = async (id: string, status: 'ACTIVE' | 'BANNED') => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError(404, 'User not found.');
  if (user.role === 'ADMIN') {
    throw new AppError(400, 'You cannot change the status of an admin account.');
  }

  return prisma.user.update({
    where: { id },
    data: { status },
    select: { id: true, name: true, email: true, role: true, status: true },
  });
};

const getAllProperties = async () => {
  return prisma.property.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      landlord: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true } },
    },
  });
};

const getAllRentals = async () => {
  return prisma.rentalRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      property: { select: { id: true, title: true } },
      tenant: { select: { id: true, name: true, email: true } },
      payment: { select: { id: true, status: true, amount: true } },
    },
  });
};

const getStats = async () => {
  const [users, properties, rentals, payments] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.rentalRequest.count(),
    prisma.payment.count({ where: { status: 'COMPLETED' } }),
  ]);
  return { totalUsers: users, totalProperties: properties, totalRentals: rentals, completedPayments: payments };
};

export const AdminService = {
  getAllUsers,
  updateUserStatus,
  getAllProperties,
  getAllRentals,
  getStats,
};

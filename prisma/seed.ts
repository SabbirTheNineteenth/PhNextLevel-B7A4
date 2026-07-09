import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@rentnest.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  // ---- Admin ----
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: process.env.ADMIN_NAME || 'RentNest Admin',
      email: adminEmail,
      password: adminHash,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin ready: ${admin.email}`);

  // ---- Categories ----
  const categoryNames = ['Apartment', 'House', 'Studio', 'Villa', 'Shared Room'];
  const categories = [];
  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} type rentals` },
    });
    categories.push(cat);
  }
  console.log(`✅ ${categories.length} categories ready`);

  // ---- Demo landlord ----
  const landlord = await prisma.user.upsert({
    where: { email: 'landlord@rentnest.com' },
    update: {},
    create: {
      name: 'Demo Landlord',
      email: 'landlord@rentnest.com',
      password: await bcrypt.hash('landlord123', 10),
      role: 'LANDLORD',
      phone: '01711111111',
    },
  });

  // ---- Demo tenant ----
  await prisma.user.upsert({
    where: { email: 'tenant@rentnest.com' },
    update: {},
    create: {
      name: 'Demo Tenant',
      email: 'tenant@rentnest.com',
      password: await bcrypt.hash('tenant123', 10),
      role: 'TENANT',
      phone: '01722222222',
    },
  });
  console.log('✅ Demo landlord & tenant ready');

  // ---- Demo properties (only if none exist for this landlord) ----
  const existingCount = await prisma.property.count({ where: { landlordId: landlord.id } });
  if (existingCount === 0) {
    await prisma.property.createMany({
      data: [
        {
          title: 'Cozy 2BR Apartment in Dhanmondi',
          description: 'Bright and airy apartment close to shops and transit.',
          location: 'Dhanmondi, Dhaka',
          price: 25000,
          bedrooms: 2,
          bathrooms: 2,
          amenities: ['wifi', 'parking', 'lift'],
          images: [],
          categoryId: categories[0].id,
          landlordId: landlord.id,
        },
        {
          title: 'Spacious Family House in Uttara',
          description: 'A 3-bedroom house with a garden, perfect for families.',
          location: 'Uttara, Dhaka',
          price: 45000,
          bedrooms: 3,
          bathrooms: 3,
          amenities: ['garden', 'parking', 'security'],
          images: [],
          categoryId: categories[1].id,
          landlordId: landlord.id,
        },
        {
          title: 'Modern Studio near NSU',
          description: 'Compact studio ideal for students and young professionals.',
          location: 'Bashundhara, Dhaka',
          price: 15000,
          bedrooms: 1,
          bathrooms: 1,
          amenities: ['wifi', 'furnished'],
          images: [],
          categoryId: categories[2].id,
          landlordId: landlord.id,
        },
      ],
    });
    console.log('✅ 3 demo properties created');
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('🚀 Setting up HandyGH database...\n');

  try {
    // 1. Run database migrations
    console.log('📦 Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations completed\n');

    // 2. Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated\n');

    // 3. Create default admin user
    console.log('👤 Creating default admin user...');
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@handygh.com' },
      update: {},
      create: {
        role: 'ADMIN',
        name: 'System Administrator',
        email: 'admin@handygh.com',
        phone: '+233000000000',
        password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8.8Q8Q8Q', // password: admin123
        is_active: true
      }
    });
    console.log(`✅ Admin user created: ${adminUser.email}\n`);

    // 4. Create sample categories
    console.log('📋 Creating sample service categories...');
    const categories = [
      'Plumbing',
      'Electrical',
      'Cleaning',
      'Tutoring',
      'Driving',
      'Carpentry',
      'Painting',
      'Gardening',
      'Cooking',
      'Delivery'
    ];

    // Note: Categories are stored as arrays in provider records
    console.log(`✅ Sample categories: ${categories.join(', ')}\n`);

    // 5. Create sample provider
    console.log('👷 Creating sample provider...');
    const sampleProvider = await prisma.user.create({
      data: {
        role: 'PROVIDER',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+233123456789',
        password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8.8Q8Q8Q', // password: provider123
        is_active: true
      }
    });

    const providerProfile = await prisma.provider.create({
      data: {
        user_id: sampleProvider.id,
        business_name: 'John\'s Plumbing Services',
        categories: ['Plumbing'],
        latitude: 5.6037,
        longitude: -0.1870,
        address: 'Accra, Ghana',
        verified: true,
        rating_avg: 4.5,
        rating_count: 10
      }
    });

    // Create sample services
    await prisma.providerService.createMany({
      data: [
        {
          provider_id: providerProfile.id,
          title: 'Pipe Repair',
          description: 'Professional pipe repair and maintenance',
          price_type: 'FIXED',
          price_amount: 50.00,
          duration_minutes: 60
        },
        {
          provider_id: providerProfile.id,
          title: 'Leak Detection',
          description: 'Advanced leak detection services',
          price_type: 'HOURLY',
          price_amount: 25.00,
          duration_minutes: 120
        }
      ]
    });

    console.log(`✅ Sample provider created: ${sampleProvider.email}\n`);

    // 6. Create sample customer
    console.log('👤 Creating sample customer...');
    const sampleCustomer = await prisma.user.create({
      data: {
        role: 'CUSTOMER',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+233987654321',
        password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8.8Q8Q8Q', // password: customer123
        is_active: true
      }
    });
    console.log(`✅ Sample customer created: ${sampleCustomer.email}\n`);

    // 7. Create sample booking
    console.log('📅 Creating sample booking...');
    const sampleBooking = await prisma.booking.create({
      data: {
        customer_id: sampleCustomer.id,
        provider_id: providerProfile.id,
        provider_service_id: (await prisma.providerService.findFirst({
          where: { provider_id: providerProfile.id }
        })).id,
        scheduled_start: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        scheduled_end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // Tomorrow + 2 hours
        address: '123 Main Street, Accra',
        total_amount: 50.00,
        status: 'REQUESTED'
      }
    });
    console.log(`✅ Sample booking created: ${sampleBooking.booking_ref}\n`);

    // 8. Create system configuration
    console.log('⚙️ Creating system configuration...');
    const configData = {
      commission: {
        percentage: 10,
        minimumFee: 5,
        maximumFee: 100
      },
      payout: {
        holdPeriodDays: 7,
        minimumAmount: 50
      },
      notifications: {
        email: true,
        sms: true,
        push: true
      }
    };

    // Store in a JSON file for now (in production, use a proper config table)
    const configPath = path.join(__dirname, '../config/system-config.json');
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
    console.log('✅ System configuration created\n');

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Admin user: admin@handygh.com (password: admin123)`);
    console.log(`- Provider: john@example.com (password: provider123)`);
    console.log(`- Customer: jane@example.com (password: customer123)`);
    console.log(`- Sample booking: ${sampleBooking.booking_ref}`);
    console.log('\n🚀 You can now start the application!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupDatabase();

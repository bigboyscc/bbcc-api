import mongoose from 'mongoose';
import { User } from '../src/models/User.model';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const ADMIN_EMAIL = 'vvdwivedi@gmail.com';
const ADMIN_PASSWORD = 'bad3ladk3@123';
const ADMIN_NAME = 'Vivek Dwivedi';

async function seedAdmin() {
  try {
    // Connect to MongoDB
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(dbUrl);
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log(`\n⚠️  Admin user already exists with email: ${ADMIN_EMAIL}`);
      console.log('📝 Updating admin user...');

      // Update password and ensure role is admin
      existingAdmin.password = ADMIN_PASSWORD;
      existingAdmin.role = 'admin';
      existingAdmin.name = ADMIN_NAME;
      existingAdmin.isActive = true;
      await existingAdmin.save();

      console.log('✅ Admin user updated successfully!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
    } else {
      console.log(`\n📝 Creating admin user...`);

      // Create new admin user
      const adminUser = await User.create({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: ADMIN_NAME,
        role: 'admin',
        isActive: true
      });

      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Role: ${adminUser.role}`);
    }

    console.log('\n🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedAdmin();

import mongoose from 'mongoose';
import { User } from '../src/models/User.model';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

async function createAdmin() {
  try {
    // Get arguments from command line
    const args = process.argv.slice(2);

    if (args.length < 3) {
      console.error('❌ Usage: npm run create:admin <email> <password> <name>');
      console.error('   Example: npm run create:admin admin@example.com password123 "Admin Name"');
      process.exit(1);
    }

    const email = args[0];
    const password = args[1];
    const name = args[2];

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format');
      process.exit(1);
    }

    // Validate password length
    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters');
      process.exit(1);
    }

    // Connect to MongoDB
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(dbUrl);
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log(`\n⚠️  User already exists with email: ${email}`);
      console.log('📝 Updating user to admin role...');

      // Update password and ensure role is admin
      existingAdmin.password = password;
      existingAdmin.role = 'admin';
      existingAdmin.name = name;
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
        email,
        password,
        name,
        role: 'admin',
        isActive: true
      });

      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Role: ${adminUser.role}`);
    }

    console.log('\n🎉 Operation completed successfully!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the function
createAdmin();

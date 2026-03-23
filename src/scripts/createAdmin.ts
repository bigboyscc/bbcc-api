/**
 * Script to create the first admin user
 * Usage: npx tsx src/scripts/createAdmin.ts
 */

import mongoose from 'mongoose';
import { User } from '../models/User.model';
import { env } from '../config/env';
import { logger } from '../config/logger';

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(env.DATABASE_URL);
    logger.info('Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      logger.warn('An admin user already exists');
      logger.info(`Existing admin: ${existingAdmin.email}`);
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      email: process.env.ADMIN_EMAIL || 'admin@bbcc.com',
      password: process.env.ADMIN_PASSWORD || 'admin123456',
      name: process.env.ADMIN_NAME || 'Admin User',
      role: 'admin' as const
    };

    const admin = await User.create(adminData);

    logger.info('✅ Admin user created successfully!');
    logger.info({
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    });

    logger.warn('\n⚠️  IMPORTANT: Please change the admin password immediately after first login!');

    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Failed to create admin user');
    process.exit(1);
  }
};

createAdmin();

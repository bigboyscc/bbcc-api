import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { Ground } from '@/models/Ground.model';
import { User } from '@/models/User.model';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

describe('Ground API Endpoints', () => {
  let authToken: string;
  let adminToken: string;
  let regularUserId: string;
  let adminUserId: string;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bbcc-test');
    }

    // Create a regular user
    const regularUser = await User.create({
      email: 'user@test.com',
      password: 'password123',
      name: 'Test User',
      role: 'user'
    });
    regularUserId = regularUser._id.toString();
    authToken = jwt.sign({ userId: regularUserId }, env.JWT_ACCESS_SECRET);

    // Create an admin user
    const adminUser = await User.create({
      email: 'admin@test.com',
      password: 'adminpass123',
      name: 'Admin User',
      role: 'admin'
    });
    adminUserId = adminUser._id.toString();
    adminToken = jwt.sign({ userId: adminUserId }, env.JWT_ACCESS_SECRET);
  });

  afterAll(async () => {
    // Clean up test data
    await Ground.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear grounds before each test
    await Ground.deleteMany({});
  });

  describe('POST /api/v1/grounds', () => {
    it('should create a new ground when admin authenticated', async () => {
      const groundData = {
        name: 'Phoenix Cricket Arena',
        pitchType: 'turf',
        groundCondition: 'lush_green',
        mapLocation: {
          latitude: 12.9716,
          longitude: 77.5946,
          address: '123 MG Road, Bangalore'
        },
        ownerContacts: [
          {
            name: 'John Doe',
            phone: '+91 9876543210',
            role: 'Owner'
          }
        ],
        facilities: ['Parking', 'Washroom', 'Seating', 'Floodlights'],
        bigBoysRating: 4.5,
        costPerMatch: 5000,
        notes: 'Excellent ground for competitive matches'
      };

      const response = await request(app)
        .post('/api/v1/grounds')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(groundData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(groundData.name);
      expect(response.body.data.pitchType).toBe('turf');
      expect(response.body.data.facilities).toEqual(groundData.facilities);
      expect(response.body.data.averagePlayerRating).toBe(0);
    });

    it('should fail when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/grounds')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Incomplete Ground'
          // Missing pitchType and groundCondition
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid pitchType', async () => {
      const response = await request(app)
        .post('/api/v1/grounds')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Ground',
          pitchType: 'invalid_type',
          groundCondition: 'lush_green'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail when regular user tries to create ground', async () => {
      const groundData = {
        name: 'Unauthorized Ground',
        pitchType: 'turf',
        groundCondition: 'lush_green'
      };

      await request(app)
        .post('/api/v1/grounds')
        .set('Authorization', `Bearer ${authToken}`)
        .send(groundData)
        .expect(403);
    });

    it('should fail when not authenticated', async () => {
      const groundData = {
        name: 'No Auth Ground',
        pitchType: 'turf',
        groundCondition: 'lush_green'
      };

      await request(app)
        .post('/api/v1/grounds')
        .send(groundData)
        .expect(401);
    });
  });

  describe('GET /api/v1/grounds', () => {
    beforeEach(async () => {
      // Create test grounds
      await Ground.create([
        {
          name: 'Turf Ground 1',
          pitchType: 'turf',
          groundCondition: 'lush_green',
          isActive: true
        },
        {
          name: 'Astro Ground 2',
          pitchType: 'astro',
          groundCondition: 'green_cover',
          isActive: true
        },
        {
          name: 'Mat Ground 3',
          pitchType: 'mat',
          groundCondition: 'semi_green',
          isActive: false
        }
      ]);
    });

    it('should get all grounds when authenticated', async () => {
      const response = await request(app)
        .get('/api/v1/grounds')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(3);
    });

    it('should filter grounds by pitchType', async () => {
      const response = await request(app)
        .get('/api/v1/grounds?pitchType=turf')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].pitchType).toBe('turf');
    });

    it('should filter grounds by isActive', async () => {
      const response = await request(app)
        .get('/api/v1/grounds?isActive=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);
    });

    it('should fail when not authenticated', async () => {
      await request(app)
        .get('/api/v1/grounds')
        .expect(401);
    });
  });

  describe('GET /api/v1/grounds/:id', () => {
    let groundId: string;

    beforeEach(async () => {
      const ground = await Ground.create({
        name: 'Test Ground',
        pitchType: 'turf',
        groundCondition: 'lush_green',
        ownerContacts: [
          {
            name: 'Owner Name',
            phone: '1234567890',
            role: 'Owner'
          }
        ],
        isActive: true
      });
      groundId = ground._id.toString();
    });

    it('should get ground by ID with all details when authenticated', async () => {
      const response = await request(app)
        .get(`/api/v1/grounds/${groundId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(groundId);
      expect(response.body.data.name).toBe('Test Ground');
      expect(response.body.data.ownerContacts).toBeInstanceOf(Array);
      expect(response.body.data.ownerContacts.length).toBe(1);
    });

    it('should return 404 for non-existent ground', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/grounds/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail when not authenticated', async () => {
      await request(app)
        .get(`/api/v1/grounds/${groundId}`)
        .expect(401);
    });
  });

  describe('PUT /api/v1/grounds/:id', () => {
    let groundId: string;

    beforeEach(async () => {
      const ground = await Ground.create({
        name: 'Original Ground',
        pitchType: 'turf',
        groundCondition: 'lush_green',
        bigBoysRating: 4.0,
        isActive: true
      });
      groundId = ground._id.toString();
    });

    it('should update ground when admin authenticated', async () => {
      const updateData = {
        name: 'Updated Ground',
        bigBoysRating: 4.5,
        facilities: ['Parking', 'Washroom'],
        notes: 'Updated with new facilities'
      };

      const response = await request(app)
        .put(`/api/v1/grounds/${groundId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Ground');
      expect(response.body.data.bigBoysRating).toBe(4.5);
      expect(response.body.data.facilities).toEqual(['Parking', 'Washroom']);
    });

    it('should return 404 for non-existent ground', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/v1/grounds/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail when regular user tries to update', async () => {
      await request(app)
        .put(`/api/v1/grounds/${groundId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Unauthorized Update' })
        .expect(403);
    });

    it('should fail when not authenticated', async () => {
      await request(app)
        .put(`/api/v1/grounds/${groundId}`)
        .send({ name: 'No Auth Update' })
        .expect(401);
    });
  });

  describe('DELETE /api/v1/grounds/:id', () => {
    let groundId: string;

    beforeEach(async () => {
      const ground = await Ground.create({
        name: 'Ground to Delete',
        pitchType: 'turf',
        groundCondition: 'lush_green',
        isActive: true
      });
      groundId = ground._id.toString();
    });

    it('should soft delete ground when admin authenticated', async () => {
      const response = await request(app)
        .delete(`/api/v1/grounds/${groundId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Ground deleted successfully');
      expect(response.body.data.ground.isActive).toBe(false);

      // Verify it's soft deleted
      const ground = await Ground.findById(groundId);
      expect(ground?.isActive).toBe(false);
    });

    it('should return 404 for non-existent ground', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/v1/grounds/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail when regular user tries to delete', async () => {
      await request(app)
        .delete(`/api/v1/grounds/${groundId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });

    it('should fail when not authenticated', async () => {
      await request(app)
        .delete(`/api/v1/grounds/${groundId}`)
        .expect(401);
    });
  });

});

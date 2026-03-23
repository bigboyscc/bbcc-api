import { Router } from 'express';
import { GroundController } from '@/controllers/ground.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { adminOnly } from '@/middleware/authorize.middleware';

const router = Router();

// All ground routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/grounds:
 *   get:
 *     summary: Get all grounds
 *     description: Retrieve all grounds with optional filtering by pitch type and active status
 *     tags: [Grounds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pitchType
 *         schema:
 *           type: string
 *           enum: [turf, astro, mat]
 *         description: Filter by pitch type
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of grounds (sorted by name ascending)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ground'
 *       401:
 *         description: Unauthorized - Authentication required
 */
router.get('/', GroundController.getAllGrounds);

/**
 * @swagger
 * /api/v1/grounds/{id}:
 *   get:
 *     summary: Get ground by ID
 *     description: Retrieve a single ground with all reviews and contact details
 *     tags: [Grounds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ground ID
 *     responses:
 *       200:
 *         description: Ground details with reviews and contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Ground'
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Ground not found
 */
router.get('/:id', GroundController.getGroundById);

/**
 * @swagger
 * /api/v1/grounds:
 *   post:
 *     summary: Create a new ground
 *     description: Create a new cricket ground (Admin only)
 *     tags: [Grounds]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - pitchType
 *               - groundCondition
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Phoenix Cricket Arena"
 *               pitchType:
 *                 type: string
 *                 enum: [turf, astro, mat]
 *                 example: "turf"
 *               groundCondition:
 *                 type: string
 *                 enum: [lush_green, green_cover, semi_green, mud]
 *                 example: "lush_green"
 *               mapLocation:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     example: 12.9716
 *                   longitude:
 *                     type: number
 *                     example: 77.5946
 *                   address:
 *                     type: string
 *                     example: "123 MG Road, Bangalore"
 *               ownerContacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     phone:
 *                       type: string
 *                       example: "+91 9876543210"
 *                     role:
 *                       type: string
 *                       example: "Owner"
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Parking", "Washroom", "Seating", "Floodlights"]
 *               bigBoysRating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *                 example: 4.5
 *               costPerMatch:
 *                 type: number
 *                 example: 5000
 *               notes:
 *                 type: string
 *                 example: "Excellent ground for competitive matches"
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Ground created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Ground'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/', adminOnly, GroundController.createGround);

/**
 * @swagger
 * /api/v1/grounds/{id}:
 *   put:
 *     summary: Update a ground
 *     description: Update ground details (Admin only)
 *     tags: [Grounds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ground ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               pitchType:
 *                 type: string
 *                 enum: [turf, astro, mat]
 *               groundCondition:
 *                 type: string
 *                 enum: [lush_green, green_cover, semi_green, mud]
 *               mapLocation:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *                   address:
 *                     type: string
 *               ownerContacts:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/OwnerContact'
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *               bigBoysRating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *               costPerMatch:
 *                 type: number
 *               notes:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Ground updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Ground'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Ground not found
 */
router.put('/:id', adminOnly, GroundController.updateGround);

/**
 * @swagger
 * /api/v1/grounds/{id}:
 *   delete:
 *     summary: Delete a ground
 *     description: Soft delete a ground by setting isActive to false (Admin only)
 *     tags: [Grounds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ground ID
 *     responses:
 *       200:
 *         description: Ground deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Ground deleted successfully"
 *                     ground:
 *                       $ref: '#/components/schemas/Ground'
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Ground not found
 */
router.delete('/:id', adminOnly, GroundController.deleteGround);

export default router;

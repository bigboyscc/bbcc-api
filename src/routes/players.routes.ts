import { Router } from 'express';
import { Player } from '@/models/Player.model';
import { ApiResponse } from '@/utils/apiResponse';
import { authenticate } from '@/middleware/auth.middleware';
import { adminOnly } from '@/middleware/authorize.middleware';

const router = Router();

// All player routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/players:
 *   get:
 *     summary: Get all players
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all players
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Player'
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res, next) => {
  try {
    const players = await Player.find().sort({ createdAt: -1 });
    return ApiResponse.success(res, players);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/players/{id}:
 *   get:
 *     summary: Get a player by ID
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Player details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Player not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return ApiResponse.notFound(res, 'Player not found');
    }
    return ApiResponse.success(res, player);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/players:
 *   post:
 *     summary: Create a new player (Admin only)
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Player'
 *     responses:
 *       201:
 *         description: Player created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/', adminOnly, async (req, res, next) => {
  try {
    const player = await Player.create(req.body);
    return ApiResponse.created(res, player);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/players/{id}:
 *   put:
 *     summary: Update a player (Admin only)
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Player'
 *     responses:
 *       200:
 *         description: Player updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Player not found
 */
router.put('/:id', adminOnly, async (req, res, next) => {
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!player) {
      return ApiResponse.notFound(res, 'Player not found');
    }
    return ApiResponse.success(res, player);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/players/{id}:
 *   delete:
 *     summary: Delete a player (Admin only)
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Player deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Player not found
 */
router.delete('/:id', adminOnly, async (req, res, next) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) {
      return ApiResponse.notFound(res, 'Player not found');
    }
    return ApiResponse.noContent(res);
  } catch (error) {
    next(error);
  }
});

export default router;

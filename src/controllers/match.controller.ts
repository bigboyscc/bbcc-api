import { Request, Response, NextFunction } from 'express';
import { MatchService } from '@/services/match.service';
import { logger } from '@/config/logger';

const matchService = new MatchService();

/**
 * @swagger
 * /api/v1/matches:
 *   post:
 *     summary: Create a new match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Match'
 *     responses:
 *       201:
 *         description: Match created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 */
export const createMatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const match = await matchService.createMatch(req.body);

    logger.info('Match created successfully', { matchId: match._id });

    res.status(201).json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/matches:
 *   get:
 *     summary: Get all matches
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, completed, cancelled]
 *       - in: query
 *         name: matchType
 *         schema:
 *           type: string
 *           enum: [practice, tournament]
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of matches
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
 *                     $ref: '#/components/schemas/Match'
 */
export const getMatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, matchType, dateFrom, dateTo } = req.query;

    const filters: any = {};
    if (status) filters.status = status;
    if (matchType) filters.matchType = matchType;
    if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
    if (dateTo) filters.dateTo = new Date(dateTo as string);

    const matches = await matchService.getMatches(filters);

    res.json({
      success: true,
      data: matches
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/matches/{id}:
 *   get:
 *     summary: Get match by ID
 *     tags: [Matches]
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
 *         description: Match details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *       404:
 *         description: Match not found
 */
export const getMatchById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const match = await matchService.getMatchById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MATCH_NOT_FOUND',
          message: 'Match not found'
        }
      });
    }

    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/matches/{id}:
 *   put:
 *     summary: Update match
 *     tags: [Matches]
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
 *             $ref: '#/components/schemas/Match'
 *     responses:
 *       200:
 *         description: Match updated successfully
 *       404:
 *         description: Match not found
 */
export const updateMatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const match = await matchService.updateMatch(req.params.id, req.body);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MATCH_NOT_FOUND',
          message: 'Match not found'
        }
      });
    }

    logger.info('Match updated successfully', { matchId: match._id });

    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/matches/{id}:
 *   delete:
 *     summary: Cancel match
 *     tags: [Matches]
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
 *         description: Match cancelled successfully
 *       404:
 *         description: Match not found
 */
export const cancelMatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const match = await matchService.cancelMatch(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MATCH_NOT_FOUND',
          message: 'Match not found'
        }
      });
    }

    logger.info('Match cancelled successfully', { matchId: match._id });

    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/matches/{id}/payments/{playerId}/toggle:
 *   post:
 *     summary: Toggle payment status for a player
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Player ID
 *     responses:
 *       200:
 *         description: Payment status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *       404:
 *         description: Match or player not found
 */
export const togglePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: matchId, playerId } = req.params;
    const match = await matchService.togglePayment(matchId, playerId);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MATCH_NOT_FOUND',
          message: 'Match not found'
        }
      });
    }

    logger.info('Payment status toggled', { matchId, playerId });

    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/matches/{id}/whatsapp-message:
 *   get:
 *     summary: Generate WhatsApp message for a match
 *     tags: [Matches]
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
 *         description: WhatsApp message generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *       404:
 *         description: Match not found
 */
export const generateWhatsAppMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await matchService.generateWhatsAppMessage(req.params.id);

    res.json({
      success: true,
      data: {
        message
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/matches/{id}/payments/mark-all-paid:
 *   post:
 *     summary: Mark all players as paid
 *     tags: [Matches]
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
 *         description: All players marked as paid
 *       404:
 *         description: Match not found
 */
export const markAllPaid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const match = await matchService.markAllPaid(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MATCH_NOT_FOUND',
          message: 'Match not found'
        }
      });
    }

    logger.info('All players marked as paid', { matchId: match._id });

    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};

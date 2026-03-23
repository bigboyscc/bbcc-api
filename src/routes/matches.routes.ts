import { Router } from 'express';
import { authenticate } from '@/middleware/auth.middleware';
import { adminOnly } from '@/middleware/authorize.middleware';
import * as matchController from '@/controllers/match.controller';

const router = Router();

// All match routes require authentication and admin access
router.use(authenticate);
router.use(adminOnly);

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Match management and payment tracking
 */

// CRUD operations
router.post('/', matchController.createMatch);
router.get('/', matchController.getMatches);
router.get('/:id', matchController.getMatchById);
router.put('/:id', matchController.updateMatch);
router.delete('/:id', matchController.cancelMatch);

// Payment operations
router.post('/:id/payments/:playerId/toggle', matchController.togglePayment);
router.post('/:id/payments/mark-all-paid', matchController.markAllPaid);

// WhatsApp message
router.get('/:id/whatsapp-message', matchController.generateWhatsAppMessage);

export default router;

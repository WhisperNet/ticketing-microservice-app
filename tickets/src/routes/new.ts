import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();
import { body } from 'express-validator';
import {
  requireAuth,
  requestValidationHandler,
} from '@whispernet-sust/ticket-common';
import { Ticket } from '../models/ticket';
router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('title can not be empty'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('price must be greater than 0'),
  ],
  requestValidationHandler,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = await Ticket.build({
      title,
      price,
      userId: req.currentUser.id,
    });
    res.status(201).send(ticket);
  }
);

export { router as newTicketRouter };

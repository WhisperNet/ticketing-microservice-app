import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();
import { body } from 'express-validator';
import {
  requireAuth,
  requestValidationHandler,
} from '@whispernet-sust/ticket-common';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';
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
    new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });
    res.status(201).send(ticket);
  }
);

export { router as newTicketRouter };

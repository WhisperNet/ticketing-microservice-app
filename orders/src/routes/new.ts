import {
  requireAuth,
  requestValidationHandler,
  NotFoundError,
  BadRequestError,
  OrderStatus,
} from '@whispernet-sust/ticket-common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';
const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 10 * 60;

router.post(
  '/api/orders/',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((atr: string) => mongoose.Types.ObjectId.isValid(atr))
      .withMessage('Missing valid ticket ID'),
  ],
  requestValidationHandler,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new NotFoundError();

    const isTicketReserved = await ticket.isReserved();
    if (isTicketReserved) throw new BadRequestError('Ticket is reserved');

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    const order = await Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt,
      ticket,
    });
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      userId: order.userId,
      status: order.status,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });
    res.status(201).send(order);
  }
);

export { router as newOrderRouter };

import {
  BadRequestError,
  NotAuthorizeError,
  NotFoundError,
  requestValidationHandler,
  requireAuth,
} from '@whispernet-sust/ticket-common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';
const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Titile can not be empty'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('price must be greater than 0'),
  ],
  requestValidationHandler,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const foundTicket = await Ticket.findById(req.params.id);
    if (!foundTicket) throw new NotFoundError();
    if (foundTicket.userId !== req.currentUser.id)
      throw new NotAuthorizeError();
    if (foundTicket.orderId)
      throw new BadRequestError("Cann't edit the ticket while it's booked");
    foundTicket.set({
      title,
      price,
    });
    await foundTicket.save();
    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: foundTicket.id,
      title: foundTicket.title,
      price: foundTicket.price,
      userId: foundTicket.userId,
      version: foundTicket.version,
    });
    res.status(200).send(foundTicket);
  }
);

export { router as updateTicketRouter };

import {
  NotAuthorizeError,
  NotFoundError,
  requestValidationHandler,
  requireAuth,
} from '@whispernet-sust/ticket-common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
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
    foundTicket.set({
      title,
      price,
    });
    await foundTicket.save();
    res.status(200).send(foundTicket);
  }
);

export { router as updateTicketRouter };

import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { NotFoundError } from '@whispernet-sust/ticket-common';
const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const foundTicket = await Ticket.findById(req.params.id);
  if (!foundTicket) throw new NotFoundError();
  res.status(200).send(foundTicket);
});

export { router as showTicketRouter };

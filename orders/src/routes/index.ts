import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import { requireAuth } from '@whispernet-sust/ticket-common';
const router = express.Router();

router.get('/api/orders/', requireAuth, async (req: Request, res: Response) => {
  const foundOrders = await Order.find({
    userId: req.currentUser!.id,
  }).populate('ticket');
  res.send(foundOrders);
});

export { router as indexOrderRouter };

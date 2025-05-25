import {
  BadRequestError,
  NotAuthorizeError,
  NotFoundError,
  OrderStatus,
  requestValidationHandler,
  requireAuth,
} from '@whispernet-sust/ticket-common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/payment',
  requireAuth,
  [
    body('orderId').not().isEmpty().withMessage('Invalid orderId'),
    body('token').not().isEmpty().withMessage('Invalid Token'),
  ],
  requestValidationHandler,
  async (req: Request, res: Response) => {
    const { orderId, token } = req.body;
    const foundOrder = await Order.findById(orderId);
    if (!foundOrder) throw new NotFoundError();
    if (foundOrder.userId !== req.currentUser.id) throw new NotAuthorizeError();
    if (foundOrder.status === OrderStatus.Cancelled)
      throw new BadRequestError('Can not pay for an expired order');
    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: foundOrder.price * 100,
      source: token,
    });
    const payment = await Payment.build({
      orderId: foundOrder.id,
      stripeId: charge.id,
    });
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });
    res.status(201).send({ id: payment.id });
  }
);

export { router as newPaymentRouter };

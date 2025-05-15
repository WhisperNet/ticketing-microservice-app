import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('returns 401 for unaturhorized order access', async () => {
  const ticket = await Ticket.build({
    title: 'Test tckt',
    price: 100,
  });
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .send({})
    .expect(401);
});

it('returns the order for aturhorized access', async () => {
  const ticket = await Ticket.build({
    title: 'Test tckt',
    price: 100,
  });
  const user = global.signin();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send({})
    .expect(200);
  expect(fetchedOrder.id).toEqual(order.id);
});

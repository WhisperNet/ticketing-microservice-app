import request from 'supertest';
import { app } from '../../app';
import { Ticket, TicketDoc } from '../../models/ticket';

const ticketData = {
  title: 'Test ticket',
  price: 100,
};

it('retruns all the orders for the user', async () => {
  const ticket1 = await Ticket.build(ticketData);
  const ticket2 = await Ticket.build(ticketData);
  const ticket3 = await Ticket.build(ticketData);

  const user1 = global.signin();
  const user2 = global.signin();

  const { body: order1 } = await request(app)
    .post('/api/orders')
    .set('Cookie', user1)
    .send({ ticketId: ticket1.id })
    .expect(201);
  const { body: order2 } = await request(app)
    .post('/api/orders')
    .set('Cookie', user1)
    .send({ ticketId: ticket2.id })
    .expect(201);
  await request(app)
    .post('/api/orders')
    .set('Cookie', user2)
    .send({ ticketId: ticket3.id })
    .expect(201);

  const { body: orders } = await request(app)
    .get('/api/orders')
    .set('Cookie', user1)
    .send({})
    .expect(200);

  expect(orders.length).toEqual(2);
  expect(orders[0].id).toEqual(order1.id);
  expect(orders[1].id).toEqual(order2.id);
  expect(orders[0].ticket.id).toEqual(ticket1.id);
  expect(orders[1].ticket.id).toEqual(ticket2.id);
});

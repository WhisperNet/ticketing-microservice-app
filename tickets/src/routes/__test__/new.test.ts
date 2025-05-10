import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
// Removed incomplete import statement

it('has a reachbale post route at /api/tickets', async () => {
  const res = await request(app).post('/api/tickets').send({});
  expect(res.status).not.toEqual(404);
});

it('returns 401 for unauthorized access', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns other status then 401 for authorized access', async () => {
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({});
  expect(res.status).not.toEqual(401);
});

it('returns 400 for invalid title or price', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 10,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'test',
      price: -10,
    })
    .expect(400);
});

it('creates an entry for valid authorized request', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);
  const title = 'test';
  const price = 10;

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual(title);
  expect(tickets[0].price).toEqual(price);
});

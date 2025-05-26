import Router from 'next/router';
import useRequest from '../../hooks/use-request';
const ViewTicekt = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) =>
      Router.push('/orders/[orderId]', `/orders/${order.id}`),
  });
  return (
    <>
      <h1>{ticket.title}</h1>
      <h3>{ticket.price}</h3>
      <button className="btn btn-primary" onClick={() => doRequest()}>
        Purchase
      </button>
      {errors}
    </>
  );
};
ViewTicekt.getInitialProps = async (context, currentUser, client) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return { ticket: data };
};
export default ViewTicekt;

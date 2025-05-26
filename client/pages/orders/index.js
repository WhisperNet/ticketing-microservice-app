const ShowOrder = ({ orders }) => {
  return (
    <ul>
      {orders.map((order) => {
        return (
          <li key={order.id}>
            {order.ticket.title} - {order.status} - {order.ticket.price}
          </li>
        );
      })}
    </ul>
  );
};

ShowOrder.getInitialProps = async (AmpContext, currentuser, client) => {
  const { data } = await client.get('/api/orders');
  return { orders: data };
};

export default ShowOrder;

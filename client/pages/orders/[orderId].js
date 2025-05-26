import { useEffect, useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';
import StripeCheckOut from 'react-stripe-checkout';
const ViewOrder = ({ order, currentUser }) => {
  const [timeleft, setTimeleft] = useState(0);

  const { doRequest, errors } = useRequest({
    url: '/api/payment',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  });
  useEffect(() => {
    const computeTime = () => {
      const time = new Date(order.expiresAt) - new Date();
      setTimeleft(Math.round(time / 1000));
    };
    computeTime();
    const timerId = setInterval(computeTime, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (timeleft < 0) {
    return <h1 className="text-danger">Order Expired</h1>;
  }
  return (
    <>
      <h1 className="text-warning">
        Please complete your payment in {timeleft} seconds
      </h1>
      <StripeCheckOut
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51RSZPALzm8wwEfGLnviyM3T9gmu5F94ONZwmgWz8TERaGkj6svJVpigtMJxb93jaUORFKJITGkuIQCely0SdBR2O00Kx8lpGQw"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </>
  );
};

ViewOrder.getInitialProps = async (context, currentUser, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default ViewOrder;

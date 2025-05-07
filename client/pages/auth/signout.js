import Router from 'next/router';
import useRequest from '../../hooks/use-request';
import { useEffect } from 'react';

export default () => {
  const { doRequest, errors } = useRequest({
    url: '/api/users/signout',
    method: 'post',
    onSuccess: () => Router.push('/'),
  });
  useEffect(() => {
    doRequest();
  }, []);
  return (
    <>
      <h1>Signing you out....</h1>
      {errors}
    </>
  );
};

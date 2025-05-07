import buildClient from '../api/build-client';
const LandingPage = ({ currentUser }) => {
  return currentUser ? (
    <h1>You're signind in</h1>
  ) : (
    <h1>You're not signed in</h1>
  );
};

LandingPage.getInitialProps = async (context) => {
  const cleint = buildClient(context);
  const { data } = await cleint.get('/api/users/currentuser');
  return data;
};

export default LandingPage;

import Link from 'next/link';

export default ({ currentUser }) => {
  const links = [
    !currentUser && { label: 'Sign up', href: '/auth/signup' },
    !currentUser && { label: 'Sign in', href: '/auth/signin' },
    currentUser && { label: 'Sign out', href: '/auth/signout' },
  ]
    .filter((itm) => itm)
    .map(({ label, href }) => {
      return (
        <li key={label} className="nav-item">
          <Link className="nav-link" href={href}>
            {label}
          </Link>
        </li>
      );
    });
  return (
    <nav className="navbar navbar-light bg-light">
      <Link className="navbar-brand" href="/">
        Ticketing.dev
      </Link>
      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">{links}</ul>
      </div>
    </nav>
  );
};

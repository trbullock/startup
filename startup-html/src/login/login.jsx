import React from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, signIn, signOut } from './authStorage';
import './login.css';

export function Login() {
  const [currentUser, setCurrentUser] = React.useState(getCurrentUser);
  const [error, setError] = React.useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const user = signIn(formData.get('username'), formData.get('password'));

    if (!user) {
      setError('Username or password is incorrect.');
      return;
    }

    setError('');
    setCurrentUser(user);
  }

  function handleSignOut() {
    signOut();
    setCurrentUser(null);
  }

  return (
    <main className="container page-main login-page">
      <section className="content-panel" aria-labelledby="login-heading">
        <h2 id="login-heading">Welcome back, angler</h2>
        <p>Sign in to explore local fishing spots and keep up with your crew.</p>

        {currentUser ? (
          <>
            <p>You are signed in as <strong>{currentUser.displayName}</strong>.</p>
            <button className="btn btn-secondary" type="button" onClick={handleSignOut}>Sign out</button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input className="form-control" id="username" name="username" type="text" autoComplete="username" required />

            <label htmlFor="password">Password</label>
            <input className="form-control" id="password" name="password" type="password" autoComplete="current-password" required />

            {error && <p role="alert">{error}</p>}
            <button className="btn btn-primary" type="submit">Sign in</button>
          </form>
        )}
        {!currentUser && <p><Link to="/account">Create an account</Link></p>}
      </section>

      <section className="content-panel" aria-labelledby="account-heading">
        <h2 id="account-heading">Current user</h2>
        <p>Signed in as: <strong id="username-display">{currentUser ? currentUser.displayName : 'Guest Angler'}</strong></p>
        <p>{currentUser ? `Username: ${currentUser.username}` : 'Sign in or create an account to get started.'}</p>
        <p>Demo only: account details are stored in this browser. Do not use a real password.</p>
      </section>
    </main>
  );
}
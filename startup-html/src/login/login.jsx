import React from 'react';
import { Link } from 'react-router-dom';
import { signIn, signOut } from './authStorage';
import './login.css';

export function Login({ currentUser, onAuthChange }) {
  const [error, setError] = React.useState('');
  const [weatherLocation, setWeatherLocation] = React.useState('Your area');

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const user = signIn(formData.get('username'), formData.get('password'));

    if (!user) {
      setError('Username or password is incorrect.');
      return;
    }

    setError('');
    onAuthChange(user);
  }

  function handleSignOut() {
    signOut();
    onAuthChange(null);
  }

  return (
    <main className="container page-main login-page">
      <section className="content-panel" aria-labelledby="login-heading">
        <h2 id="login-heading">Welcome back, angler</h2>
        <p>Sign in to explore local fishing spots and keep up with your crew.</p>

        {currentUser ? (
          <>
            <p>You are signed in as <strong>{currentUser.displayName}</strong>.</p>
            <section className="weather-placeholder" aria-labelledby="weather-heading">
              <h3 id="weather-heading">Local weather</h3>
              <label htmlFor="weather-location">Location</label>
              <input
                className="form-control"
                id="weather-location"
                type="text"
                value={weatherLocation}
                onChange={(event) => setWeatherLocation(event.target.value)}
                placeholder="Enter a city or ZIP code"
              />
              <p aria-live="polite">
                Weather for {weatherLocation || 'your area'} will appear here once the API is connected.
              </p>
            </section>
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
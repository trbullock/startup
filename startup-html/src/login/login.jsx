import React from 'react';
import { Link } from 'react-router-dom';
import { signIn, signOut } from './authStorage';
import './login.css';

export function Login({ currentUser, onAuthChange }) {
  const [error, setError] = React.useState('');
  const [weatherLocation, setWeatherLocation] = React.useState('');
  const [weather, setWeather] = React.useState(null);
  const [weatherError, setWeatherError] = React.useState('');
  const [weatherLoading, setWeatherLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      const user = await signIn(formData.get('email'), formData.get('password'));
      setError('');
      onAuthChange(user);
    } catch (submitError) {
      setError(submitError.status === 401
        ? 'Email or password is incorrect.'
        : 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    setSubmitting(true);
    try {
      await signOut();
      setError('');
      onAuthChange(null);
    } catch {
      setError('Unable to sign out. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleWeatherSubmit(event) {
    event.preventDefault();
    const location = weatherLocation.trim();
    if (!location) return;

    setWeatherLoading(true);
    setWeatherError('');
    try {
      const query = new URLSearchParams({ location });
      const response = await fetch(`/api/weather?${query}`, { credentials: 'include' });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('The weather service returned an unexpected response.');
      }

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.msg || 'Could not load the forecast.');
      }
      setWeather(result);
    } catch (weatherRequestError) {
      setWeather(null);
      setWeatherError(weatherRequestError.message || 'Could not load the forecast.');
    } finally {
      setWeatherLoading(false);
    }
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
              <form onSubmit={handleWeatherSubmit}>
                <label htmlFor="weather-location">City or ZIP code</label>
                <input
                  className="form-control"
                  id="weather-location"
                  type="text"
                  value={weatherLocation}
                  onChange={(event) => setWeatherLocation(event.target.value)}
                  placeholder="Enter a US city or ZIP code"
                  required
                />
                <button className="btn btn-primary" type="submit" disabled={weatherLoading}>
                  {weatherLoading ? 'Loading forecast...' : 'Get weather'}
                </button>
              </form>
              {weatherError && <p role="alert">{weatherError}</p>}
              {weather && (
                <div aria-live="polite">
                  <h4>Forecast for {weather.location}</h4>
                  {weather.periods.length > 0 ? (
                    <ul>
                      {weather.periods.map((period) => (
                        <li key={period.name}>
                          <strong>{period.name}:</strong>{' '}
                          {period.temperature}°{period.temperatureUnit}, {period.shortForecast}
                          {' '}{period.windSpeed} {period.windDirection} winds
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No forecast periods are currently available.</p>
                  )}
                </div>
              )}
            </section>
            {error && <p role="alert">{error}</p>}
            <button className="btn btn-secondary" type="button" onClick={handleSignOut} disabled={submitting}>
              {submitting ? 'Signing out...' : 'Sign out'}
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email address</label>
            <input className="form-control" id="email" name="email" type="email" autoComplete="email" required />

            <label htmlFor="password">Password</label>
            <input className="form-control" id="password" name="password" type="password" autoComplete="current-password" required />

            {error && <p role="alert">{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}
        {!currentUser && <p><Link to="/account">Create an account</Link></p>}
      </section>

      <section className="content-panel" aria-labelledby="account-heading">
        <h2 id="account-heading">Current user</h2>
        <p>Signed in as: <strong id="username-display">{currentUser ? currentUser.displayName : 'Guest Angler'}</strong></p>
        <p>{currentUser ? `Username: ${currentUser.username}` : 'Sign in or create an account to get started.'}</p>
        <p>Passwords are hashed by the service. Account data is currently held in service memory.</p>
      </section>
    </main>
  );
}
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createAccount } from '../login/authStorage';
import './account.css';

export function Account() {
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = formData.get('password');

    if (password !== formData.get('confirm-password')) {
      setError('Passwords do not match.');
      return;
    }

    try {
      createAccount({
        displayName: formData.get('display-name').trim(),
        email: formData.get('email').trim(),
        username: formData.get('username').trim(),
        password,
      });
      navigate('/login');
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <main className="container page-main account-page">
      <section className="content-panel" aria-labelledby="account-heading">
        <h2 id="account-heading">Create your Fish Tracker account</h2>
        <p>Join local anglers, save your favorite spots, and share your catches.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="display-name">Display name</label>
          <input className="form-control" id="display-name" name="display-name" type="text" autoComplete="name" required />

          <label htmlFor="email">Email address</label>
          <input className="form-control" id="email" name="email" type="email" autoComplete="email" required />

          <label htmlFor="new-username">Username</label>
          <input className="form-control" id="new-username" name="username" type="text" autoComplete="username" required />

          <label htmlFor="new-password">Password</label>
          <input className="form-control" id="new-password" name="password" type="password" autoComplete="new-password" required />

          <label htmlFor="confirm-password">Confirm password</label>
          <input className="form-control" id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required />

          {error && <p role="alert">{error}</p>}
          <button className="btn btn-primary" type="submit">Create account</button>
        </form>
      </section>

      <section className="content-panel" aria-labelledby="account-data-heading">
        <h2 id="account-data-heading">Account data</h2>
        {/*<!-- Database placeholder: registration details will be stored securely by the server. -->*/}
        <p>Your profile, saved spots, and catches will be stored with your account.</p>
      </section>
    </main>
  );
}
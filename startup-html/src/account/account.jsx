import React from 'react';
import './account.css';

export function Account() {
  return (
    <main className="container page-main account-page">
      <section className="content-panel" aria-labelledby="account-heading">
        <h2 id="account-heading">Create your Fish Tracker account</h2>
        <p>Join local anglers, save your favorite spots, and share your catches.</p>

        <form action="#" method="post">
          <label htmlFor="display-name">Display name</label>
          <input className="form-control" id="display-name" name="display-name" type="text" autocomplete="name" required />

          <label htmlFor="email">Email address</label>
          <input className="form-control" id="email" name="email" type="email" autocomplete="email" required />

          <label htmlFor="new-username">Username</label>
          <input className="form-control" id="new-username" name="username" type="text" autocomplete="username" required />

          <label htmlFor="new-password">Password</label>
          <input className="form-control" id="new-password" name="password" type="password" autocomplete="new-password" required />

          <label htmlFor="confirm-password">Confirm password</label>
          <input className="form-control" id="confirm-password" name="confirm-password" type="password" autocomplete="new-password" required />

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
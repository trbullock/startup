import React from 'react';
import './account.css';

export function Account() {
  return (
    <main className="container-fluid bg-secondary text-center">
      <section className="content-panel" aria-labelledby="account-heading">
        <h2 id="account-heading">Create your Fish Tracker account</h2>
        <p>Join local anglers, save your favorite spots, and share your catches.</p>

        <form action="#" method="post">
          <label for="display-name">Display name</label>
          <input className="form-control" id="display-name" name="display-name" type="text" autocomplete="name" required />

          <label for="email">Email address</label>
          <input className="form-control" id="email" name="email" type="email" autocomplete="email" required />

          <label for="new-username">Username</label>
          <input className="form-control" id="new-username" name="username" type="text" autocomplete="username" required />

          <label for="new-password">Password</label>
          <input className="form-control" id="new-password" name="password" type="password" autocomplete="new-password" required />

          <label for="confirm-password">Confirm password</label>
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
import React from 'react';
import './login.css';

export function Login() {
  return (
    <main className="container-fluid bg-secondary text-center">
      <section className="content-panel" aria-labelledby="login-heading">
        <h2 id="login-heading">Welcome back, angler</h2>
        <p>Sign in to explore local fishing spots and keep up with your crew.</p>

        <form action="#" method="post">
          <label for="username">Username</label>
          <input className="form-control" id="username" name="username" type="text" autocomplete="username" required />

          <label for="password">Password</label>
          <input className="form-control" id="password" name="password" type="password" autocomplete="current-password" required />

          <button className="btn btn-primary" type="submit">Sign in</button>
        </form>
        <p><a href="account.html">Create an account</a></p>
      </section>

      <section className="content-panel" aria-labelledby="account-heading">
        <h2 id="account-heading">Current user</h2>
        {/*<!-- Database placeholder: the server will replace this guest record after login. -->*/}
        <p>Signed in as: <strong id="username-display">Guest Angler</strong></p>
        <p>Recent catches and saved spots will appear here from the database.</p>
      </section>
    </main>
  );
}
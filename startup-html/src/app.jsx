import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
  return <div className="body bg-dark text-light">
    <header class="site-header">
      <a class="brand-mark" href="index.html" aria-label="Fish Tracker home">
        <img src="/logo.png" alt="Fish Tracker logo" width="96" />
      </a>
      <div class="brand-copy">
        <h1>Fish Tracker</h1>
        <p>Find the water. Share the story.</p>
      </div>
    </header>

    <nav class="site-nav" aria-label="Primary navigation">
      <a class="nav-link" href="login.html" aria-current="page">Sign in</a>
      <a class="nav-link" href="account.html">Create an account</a>
      <a class="nav-link" href="map.html">Fishing map</a>
      <a class="nav-link" href="chat.html">Community chat</a>
    </nav>

    <main>App Components go here</main>

    <footer class="site-footer">
      <p>Thomas Bullock</p>
      <p>GitHub: <a href="https://github.com/trbullock/startup.git" target="_blank" rel="noopener noreferrer">Click Here</a></p>
      <p>Fishing stories are better when shared.</p>
    </footer>

  </div>;
}
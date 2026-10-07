import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Chat } from './chat/chat';
import { Map } from './map/map';
import { Account } from './account/account';

export default function App() {
  return (
  <BrowserRouter>
    <div className="body bg-dark text-light">
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
        <NavLink className="nav-link" to="/login" aria-current="page">Sign in</NavLink>
        <NavLink className="nav-link" to="/account">Create an account</NavLink>
        <NavLink className="nav-link" to="/map">Fishing map</NavLink>
        <NavLink className="nav-link" to="/chat">Community chat</NavLink>
        </nav>

        <Routes>
            <Route path='/login' element={<Login />} exact />
            <Route path='/account' element={<Account />} />
            <Route path='/map' element={<Map />} />
            <Route path='/chat' element={<Chat />} />
            <Route path='*' element={<NotFound />} />
        </Routes>

        <footer class="site-footer">
        <p>Thomas Bullock</p>
        <p>GitHub: <a href="https://github.com/trbullock/startup.git" target="_blank" rel="noopener noreferrer">Click Here</a></p>
        <p>Fishing stories are better when shared.</p>
        </footer>

    </div>
  </BrowserRouter>
  );
}

function NotFound() {
  return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
}
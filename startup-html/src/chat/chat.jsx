import React from 'react';
import './chat.css';

export function Chat() {
  return (
    <main className="container page-main chat-page">
      <section className="content-panel" aria-labelledby="chat-heading">
        <h2 id="chat-heading">Live conversation</h2>
        <p>Join the conversation with other Fish Tracker members.</p>

        {/*<!-- WebSocket placeholder: realtime messages will be received and displayed in this area. -->*/}
        <div id="chat-messages" aria-live="polite">
          <p><strong>Live chat coming soon</strong></p>
          <p>WebSocket messages will appear here when realtime communication is connected.</p>
        </div>

        <form action="#" method="post">
          <label for="message">Message</label>
          <input className="form-control" id="message" name="message" type="text" placeholder="Share a fishing tip" disabled />
          <button className="btn btn-primary" type="submit" disabled>Send</button>
        </form>
      </section>

      <section className="content-panel" aria-labelledby="profile-heading">
        <h2 id="profile-heading">Chat profile</h2>
        {/*<!-- Database placeholder: the signed-in user's name will come from stored account data. -->*/}
        <p>Posting as: <strong id="chat-username">Guest Angler</strong></p>
        <p>Sign in to join the conversation.</p>
      </section>
    </main>
  );
}
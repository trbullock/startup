import React from 'react';
import { Link } from 'react-router-dom';
import './chat.css';

const MESSAGES_KEY = 'fishTrackerChatMessages';

function readMessages() {
  try {
    const savedMessages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    return Array.isArray(savedMessages) ? savedMessages : [];
  } catch {
    return [];
  }
}

export function Chat({ currentUser }) {
  const [messages, setMessages] = React.useState(readMessages);
  const [messageText, setMessageText] = React.useState('');
  const [error, setError] = React.useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const text = messageText.trim();

    if (!text || !currentUser) {
      return;
    }

    const newMessage = {
      id: `${Date.now()}-${messages.length}`,
      author: currentUser.displayName,
      text,
      sentAt: new Date().toISOString(),
    };
    const updatedMessages = [...messages, newMessage];

    try {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedMessages));
      setMessages(updatedMessages);
      setMessageText('');
      setError('');
    } catch {
      setError('Your message could not be saved in this browser.');
    }
  }

  return (
    <main className="container page-main chat-page">
      <section className="content-panel" aria-labelledby="chat-heading">
        <h2 id="chat-heading">Live conversation</h2>
        <p>Join the conversation with other Fish Tracker members.</p>

        <div id="chat-messages" aria-live="polite">
          {messages.length === 0 ? (
            <p>There are no messages yet. Start the conversation.</p>
          ) : (
            <ol className="chat-message-list">
              {messages.map((message) => (
                <li key={message.id}>
                  <p>
                    <strong>{message.author}</strong>{' '}
                    <time dateTime={message.sentAt}>
                      {new Date(message.sentAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </time>
                  </p>
                  <p>{message.text}</p>
                </li>
              ))}
            </ol>
          )}
        </div>

        {currentUser ? (
          <form onSubmit={handleSubmit}>
            <label htmlFor="message">Message</label>
            <input
              className="form-control"
              id="message"
              name="message"
              type="text"
              placeholder="Share a fishing tip"
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              required
            />
            {error && <p role="alert">{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={!messageText.trim()}>Send</button>
          </form>
        ) : (
          <p><Link to="/login">Sign in</Link> to send a message.</p>
        )}
      </section>

      <section className="content-panel" aria-labelledby="profile-heading">
        <h2 id="profile-heading">Chat profile</h2>
        <p>Posting as: <strong id="chat-username">{currentUser ? currentUser.displayName : 'Guest Angler'}</strong></p>
        <p>{currentUser ? 'Your messages are saved in this browser.' : 'Sign in to join the conversation.'}</p>
      </section>
    </main>
  );
}
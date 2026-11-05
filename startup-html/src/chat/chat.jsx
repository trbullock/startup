import React from 'react';
import { Link } from 'react-router-dom';
import './chat.css';

async function readJsonResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('The chat service returned an unexpected response. Check that the service is running.');
  }

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.msg || 'The chat request failed.');
  }
  return result;
}

export function Chat({ currentUser }) {
  const [messages, setMessages] = React.useState([]);
  const [messageText, setMessageText] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    let timeoutId;

    async function loadMessages() {
      try {
        const response = await fetch('/api/chat/messages', { credentials: 'include' });
        const result = await readJsonResponse(response);
        if (active) {
          setMessages((currentMessages) => {
            const messagesById = new Map(currentMessages.map((message) => [message.id, message]));
            result.forEach((message) => messagesById.set(message.id, message));
            return [...messagesById.values()].sort((first, second) => (
              first.sentAt.localeCompare(second.sentAt)
            ));
          });
          setError('');
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'Could not load chat messages.');
        }
      } finally {
        if (active) {
          setLoading(false);
          timeoutId = setTimeout(loadMessages, 5000);
        }
      }
    }

    loadMessages();
    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const text = messageText.trim();

    if (!text || !currentUser || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const newMessage = await readJsonResponse(response);
      setMessages((previousMessages) => [...previousMessages, newMessage]);
      setMessageText('');
      setError('');
    } catch (submitError) {
      setError(submitError.message || 'Your message could not be sent.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container page-main chat-page">
      <section className="content-panel" aria-labelledby="chat-heading">
        <h2 id="chat-heading">Live conversation</h2>
        <p>Join the conversation with other Fish Tracker members.</p>

        <div id="chat-messages" aria-live="polite">
          {loading ? (
            <p>Loading messages...</p>
          ) : messages.length === 0 ? (
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

        {error && <p role="alert">{error}</p>}

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
            <button className="btn btn-primary" type="submit" disabled={!messageText.trim() || submitting}>
              {submitting ? 'Sending...' : 'Send'}
            </button>
          </form>
        ) : (
          <p><Link to="/login">Sign in</Link> to send a message.</p>
        )}
      </section>

      <section className="content-panel" aria-labelledby="profile-heading">
        <h2 id="profile-heading">Chat profile</h2>
        <p>Posting as: <strong id="chat-username">{currentUser ? currentUser.displayName : 'Guest Angler'}</strong></p>
        <p>{currentUser ? 'Messages are shared with other signed-in members.' : 'Sign in to join the conversation.'}</p>
      </section>
    </main>
  );
}
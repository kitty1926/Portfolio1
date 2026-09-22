import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function InboxPanel() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMessages().then(setMessages).finally(() => setLoading(false));
  }, []);

  async function remove(id) {
    await api.deleteMessage(id);
    setMessages((prev) => prev.filter((m) => m.message_id !== id));
  }

  if (loading) return <div className="empty-note">Loading…</div>;

  return (
    <div>
      <div className="panel-head">
        <h2>Messages</h2>
        <p>Messages people send through your portfolio's contact form land here.</p>
      </div>
      {messages.length === 0 && <div className="empty-note">No messages yet.</div>}
      {messages.map((m) => (
        <div className="inbox-item" key={m.message_id}>
          <div className="meta">{m.sender_name} · {m.sender_email} · {new Date(m.sent_at).toLocaleString()}</div>
          <div className="subject">{m.subject || '(no subject)'}</div>
          <div className="body">{m.message_content}</div>
          <button className="remove-btn" style={{ marginTop: 6 }} onClick={() => remove(m.message_id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

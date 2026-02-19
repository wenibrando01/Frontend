import React, { useMemo, useRef, useState } from 'react';
import Card from '../ui/Card';
import { Bot, Send, Sparkles, User } from 'lucide-react';

function botReply(text) {
  const t = text.toLowerCase();
  if (t.includes('enroll') || t.includes('enrollment')) {
    return 'To enroll: select student → choose term → pick sections → validate prerequisites → confirm payment/clearance → submit. (Mock flow for now.)';
  }
  if (t.includes('requirements') || t.includes('prereq')) {
    return 'Prerequisites are checked per course and year level. In the final version, this will come from the Laravel API.';
  }
  if (t.includes('report') || t.includes('analytics')) {
    return 'Reports can include enrollment volume, drop/add counts, revenue estimates, and section utilization. Try opening the Reports page.';
  }
  if (t.includes('hello') || t.includes('hi')) {
    return 'Hi! Ask me about enrollment steps, prerequisites, or reports.';
  }
  return 'I can help with enrollment steps, prerequisites, and reports. What do you want to do today?';
}

export default function ChatbotCard() {
  const [messages, setMessages] = useState(() => [
    { id: 'm1', role: 'bot', text: 'Hello! I’m the Enrollment Assistant. Ask me anything about enrollment workflows.' },
  ]);
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);

  const hints = useMemo(
    () => ['How do I enroll a student?', 'What are prerequisite checks?', 'What reports are available?'],
    []
  );

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const userMsg = { id: `u-${Date.now()}`, role: 'user', text };
    const botMsg = { id: `b-${Date.now()}`, role: 'bot', text: botReply(text) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setDraft('');
    setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 0);
  };

  return (
    <Card
      title="Chatbot (Prototype)"
      description="Rule-based assistant placeholder for future AI integration."
      actions={
        <div className="chip">
          <Sparkles size={16} />
          <span>Mock</span>
        </div>
      }
    >
      <div className="chat">
        <div className="chat-list" ref={listRef}>
          {messages.map((m) => (
            <div key={m.id} className={`chat-row ${m.role}`}>
              <div className="chat-avatar" aria-hidden="true">
                {m.role === 'bot' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="chat-bubble">{m.text}</div>
            </div>
          ))}
        </div>

        <div className="chat-hints">
          {hints.map((h) => (
            <button key={h} type="button" className="hint" onClick={() => setDraft(h)}>
              {h}
            </button>
          ))}
        </div>

        <div className="chat-input">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about enrollment…"
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
          />
          <button type="button" className="primary" onClick={send} aria-label="Send">
            <Send size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
}


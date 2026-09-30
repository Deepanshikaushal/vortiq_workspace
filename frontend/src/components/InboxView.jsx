import React, { useState } from 'react';
import {
  Inbox,
  CheckCheck,
  Bell,
  MessageSquare,
  UserCheck,
  CheckCircle2,
  Clock,
  Trash2,
  Filter,
  ArrowRight
} from 'lucide-react';

const INITIAL_INBOX = [
  {
    id: 'inbox-1',
    title: 'Alex Rivera assigned a priority task to you',
    subtitle: 'Task: "Design and implement Redis websocket connection backplane"',
    type: 'ASSIGNMENT',
    time: '8m ago',
    isRead: false,
    actor: 'Alex Rivera',
    avatar: 'A'
  },
  {
    id: 'inbox-2',
    title: 'Sarah Chen mentioned you in #team-architecture',
    subtitle: '"@deepanshi could you review the PR for the JWT token rotation middleware?"',
    type: 'MENTION',
    time: '24m ago',
    isRead: false,
    actor: 'Sarah Chen',
    avatar: 'S'
  },
  {
    id: 'inbox-3',
    title: 'Marcus Vance marked "Core API Schema Validation" as COMPLETED',
    subtitle: 'All 48 test assertions passed in staging pipeline CI/CD.',
    type: 'COMPLETION',
    time: '1h ago',
    isRead: true,
    actor: 'Marcus Vance',
    avatar: 'M'
  },
  {
    id: 'inbox-4',
    title: 'Security Alert: New workspace access token generated',
    subtitle: 'Generated from IP 192.168.1.42 (Windows Dev Environment)',
    type: 'SYSTEM',
    time: '3h ago',
    isRead: true,
    actor: 'System Bot',
    avatar: '⚙'
  }
];

export default function InboxView({ onNavigateTask, onAddToast }) {
  const [items, setItems] = useState(INITIAL_INBOX);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'MENTIONS' | 'ASSIGNMENTS'

  const markAllRead = () => {
    setItems(items.map((i) => ({ ...i, isRead: true })));
    onAddToast?.('Marked all inbox items as read', 'success');
  };

  const toggleRead = (id) => {
    setItems(items.map((i) => (i.id === id ? { ...i, isRead: !i.isRead } : i)));
  };

  const deleteItem = (id, e) => {
    e.stopPropagation();
    setItems(items.filter((i) => i.id !== id));
    onAddToast?.('Notification dismissed', 'info');
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'UNREAD') return !item.isRead;
    if (filter === 'MENTIONS') return item.type === 'MENTION';
    if (filter === 'ASSIGNMENTS') return item.type === 'ASSIGNMENT';
    return true;
  });

  const unreadCount = items.filter((i) => !i.isRead).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Inbox Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.9rem 1.25rem',
        backgroundColor: '#111726',
        borderRadius: '8px',
        border: '1px solid #1f2b42'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '6px',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <Inbox size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#6366f1'
              }} />
            )}
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Workspace Inbox
            </h2>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>
              {unreadCount} unread notification{unreadCount === 1 ? '' : 's'} across your active workspace
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Segmented Filter */}
          <div style={{
            display: 'flex',
            backgroundColor: '#0e1422',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid #1f2b42'
          }}>
            {['ALL', 'UNREAD', 'MENTIONS', 'ASSIGNMENTS'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: filter === f ? '#6366f1' : 'transparent',
                  color: filter === f ? '#ffffff' : '#94a3b8',
                  textTransform: 'capitalize'
                }}
              >
                {f.toLowerCase()}
              </button>
            ))}
          </div>

          <button
            onClick={markAllRead}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#161f33',
              color: '#e2e8f0',
              border: '1px solid #222f47',
              borderRadius: '6px',
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <CheckCheck size={14} color="#818cf8" />
            <span>Mark all read</span>
          </button>
        </div>
      </div>

      {/* Inbox Items Feed */}
      <div style={{
        backgroundColor: '#111726',
        borderRadius: '8px',
        border: '1px solid #1f2b42',
        overflow: 'hidden'
      }}>
        {filteredItems.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            No notifications in this filter view.
          </div>
        ) : (
          filteredItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => toggleRead(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1.25rem',
                borderBottom: idx < filteredItems.length - 1 ? '1px solid #1c273c' : 'none',
                backgroundColor: item.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                cursor: 'pointer',
                transition: 'background-color 0.12s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: item.type === 'ASSIGNMENT' ? '#6366f1' : item.type === 'MENTION' ? '#38bdf8' : '#1e293b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.785rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {item.avatar}
                </div>

                <div>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: item.isRead ? 600 : 700,
                    color: item.isRead ? '#cbd5e1' : '#f8fafc'
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    marginTop: '2px'
                  }}>
                    {item.subtitle}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {item.time}
                </span>

                {!item.isRead && (
                  <div style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#6366f1'
                  }} />
                )}

                <button
                  onClick={(e) => deleteItem(item.id, e)}
                  title="Dismiss notification"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

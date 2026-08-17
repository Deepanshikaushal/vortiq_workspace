import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  MessageSquare,
  AlertTriangle,
  Flame,
  HelpCircle,
  Users,
  User,
  Trash2,
  Paperclip,
  CheckCircle2,
  Clock,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { fetchMessages, sendMessage, deleteMessage } from '../services/api';

const MESSAGE_TYPES = [
  { id: 'INCONVENIENCE', label: '⚠️ Inconvenience / Blocker', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  { id: 'URGENT', label: '🚨 Urgent Incident', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.18)' },
  { id: 'TASK_INQUIRY', label: '💡 Task Inquiry', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
  { id: 'GENERAL', label: '💬 General Message', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' }
];

export default function WorkspaceChatModal({
  isOpen,
  onClose,
  activeWorkspace,
  currentUser,
  tasks = [],
  workspaceMembers = [],
  initialTask = null,
  initialType = 'INCONVENIENCE'
}) {
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'INCONVENIENCE' | 'DIRECT'
  const [content, setContent] = useState('');
  const [messageType, setMessageType] = useState(initialType || 'INCONVENIENCE');
  const [selectedTaskId, setSelectedTaskId] = useState(initialTask ? initialTask.id : '');
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && activeWorkspace) {
      loadMessages();
    }
  }, [isOpen, activeWorkspace]);

  useEffect(() => {
    if (initialTask) {
      setSelectedTaskId(initialTask.id);
      setMessageType('INCONVENIENCE');
    }
  }, [initialTask]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const loadMessages = async () => {
    if (!activeWorkspace) return;
    try {
      const data = await fetchMessages(activeWorkspace.id);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || !activeWorkspace) return;
    setLoading(true);

    const linkedTask = tasks.find(t => String(t.id) === String(selectedTaskId));
    const recipient = workspaceMembers.find(m => String(m.userId) === String(selectedRecipientId));

    const payload = {
      workspaceId: activeWorkspace.id,
      senderId: currentUser?.id || 1,
      senderName: currentUser?.name || currentUser?.username || 'Team Member',
      senderEmail: currentUser?.email || 'member@vortiq.com',
      senderAvatar: currentUser?.avatarUrl || '',
      recipientId: selectedRecipientId ? Number(selectedRecipientId) : null,
      recipientName: recipient ? (recipient.name || recipient.username) : null,
      content: content.trim(),
      messageType,
      taskId: linkedTask ? linkedTask.id : null,
      taskTitle: linkedTask ? linkedTask.title : null
    };

    try {
      await sendMessage(payload);
      setContent('');
      if (!initialTask) setSelectedTaskId('');
      await loadMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMessages = messages.filter(m => {
    if (activeTab === 'INCONVENIENCE') {
      return m.messageType === 'INCONVENIENCE' || m.messageType === 'URGENT';
    }
    if (activeTab === 'DIRECT') {
      return m.recipientId != null;
    }
    return true;
  });

  const inconvenienceCount = messages.filter(m => m.messageType === 'INCONVENIENCE' || m.messageType === 'URGENT').length;

  return (
    <div className="modal-backdrop">
      <div className="modal-container" style={{ maxWidth: '720px', height: '88vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
        
        {/* Header */}
        <div className="modal-header" style={{ padding: '1rem 1.5rem', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f8fafc'
            }}>
              <MessageSquare size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 className="modal-title" style={{ fontSize: '1.15rem' }}>
                  Workspace Team & Inconvenience Channel
                </h2>
                <span style={{ fontSize: '0.725rem', fontWeight: 600, padding: '0.12rem 0.45rem', borderRadius: '4px', background: 'rgba(100, 116, 139, 0.2)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                  {activeWorkspace?.name || 'Workspace'}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Report inconveniences, notify teammates of blockers, and send instant messages
              </p>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Channel Navigation Filter Tabs */}
        <div style={{ padding: '0.65rem 1.5rem', display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            onClick={() => setActiveTab('ALL')}
          >
            <Users size={14} style={{ marginRight: '0.35rem' }} /> All Messages ({messages.length})
          </button>

          <button
            type="button"
            className={`btn ${activeTab === 'INCONVENIENCE' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', position: 'relative' }}
            onClick={() => setActiveTab('INCONVENIENCE')}
          >
            <AlertTriangle size={14} style={{ marginRight: '0.35rem', color: activeTab === 'INCONVENIENCE' ? '#fff' : '#f59e0b' }} />
            <span>Inconveniences & Blockers ({inconvenienceCount})</span>
          </button>

          <button
            type="button"
            className={`btn ${activeTab === 'DIRECT' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            onClick={() => setActiveTab('DIRECT')}
          >
            <User size={14} style={{ marginRight: '0.35rem' }} /> Direct Messages
          </button>
        </div>

        {/* Message Feed Canvas */}
        <div style={{ flex: 1, padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.15)' }}>
          {filteredMessages.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              <MessageSquare size={36} style={{ color: 'var(--primary-glow)', opacity: 0.5, marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.95rem', fontWeight: 700 }}>No messages in this channel yet.</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Report an inconvenience or send a message below to inform your team.
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isCurrentUser = currentUser && (msg.senderEmail === currentUser.email || msg.senderName === currentUser.name || msg.senderName === currentUser.username);
              const typeConfig = MESSAGE_TYPES.find(t => t.id === msg.messageType) || MESSAGE_TYPES[3];

              return (
                <div
                  key={msg.id}
                  className="glass-card animate-fade-in"
                  style={{
                    padding: '0.95rem 1.1rem',
                    borderLeft: `4px solid ${typeConfig.color}`,
                    background: msg.messageType === 'URGENT' ? 'rgba(239, 68, 68, 0.1)' : msg.messageType === 'INCONVENIENCE' ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      
                      {/* Avatar */}
                      {msg.senderAvatar ? (
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                        />
                      ) : (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #334155, #1e293b)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#f8fafc',
                          fontWeight: 'bold',
                          fontSize: '0.8rem'
                        }}>
                          {(msg.senderName || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {msg.senderName} {isCurrentUser && <span style={{ fontSize: '0.7rem', color: 'var(--cyan)' }}>(You)</span>}
                          </span>

                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: typeConfig.bg,
                            color: typeConfig.color,
                            border: `1px solid ${typeConfig.color}44`
                          }}>
                            {typeConfig.label}
                          </span>

                          {msg.recipientName && (
                            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                              👉 to <strong style={{ color: 'var(--text-main)' }}>{msg.recipientName}</strong>
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '1px' }}>
                          <Clock size={11} />
                          <span>{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(msg.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => handleDelete(msg.id)}
                      style={{ padding: '0.25rem', color: 'var(--text-dim)' }}
                      title="Delete message"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Message Content */}
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', margin: '0.5rem 0 0.4rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </p>

                  {/* Linked Task Chip */}
                  {msg.taskTitle && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.75rem',
                      color: '#ff859b',
                      marginTop: '0.35rem'
                    }}>
                      <LinkIcon size={11} />
                      <span>Linked Task: <strong>#{msg.taskId} {msg.taskTitle}</strong></span>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Composer Footer */}
        <form onSubmit={handleSend} style={{ padding: '1rem 1.5rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
          
          {/* Metadata Controls Bar: Type, Linked Task, Recipient */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
            <select
              className="form-select"
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', minWidth: '180px' }}
            >
              <option value="INCONVENIENCE">⚠️ Inconvenience / Blocker</option>
              <option value="URGENT">🚨 Urgent Incident</option>
              <option value="TASK_INQUIRY">💡 Task Inquiry</option>
              <option value="GENERAL">💬 General Message</option>
            </select>

            <select
              className="form-select"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', flex: '1 1 180px' }}
            >
              <option value="">No Linked Task (General)</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>
                  #{t.id} - {t.title} ({t.status})
                </option>
              ))}
            </select>

            <select
              className="form-select"
              value={selectedRecipientId}
              onChange={(e) => setSelectedRecipientId(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', minWidth: '150px' }}
            >
              <option value="">📢 All Members</option>
              {workspaceMembers.map(m => (
                <option key={m.id || m.userId} value={m.userId}>
                  👤 {m.name || m.username}
                </option>
              ))}
            </select>
          </div>

          {/* Text Input & Send Button */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              required
              className="form-input"
              placeholder={messageType === 'INCONVENIENCE' ? "Describe the inconvenience / blocker you are facing..." : "Type your message to team members..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ flex: 1, padding: '0.65rem 0.9rem', fontSize: '0.875rem' }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !content.trim()}
              style={{ padding: '0.65rem 1.25rem', gap: '0.4rem' }}
            >
              <Send size={15} />
              <span>Send</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

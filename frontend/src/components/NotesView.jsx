import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  Sparkles,
  Share2,
  Tag,
  Clock,
  Code,
  BookOpen
} from 'lucide-react';

const INITIAL_NOTES = [
  {
    id: 'note-1',
    title: 'Architecture Spec: Real-time Event Streaming Engine',
    category: 'Architecture',
    updatedAt: '12m ago',
    tags: ['Kafka', 'WebSockets', 'Backend'],
    content: `# Architecture Spec: Real-time Event Streaming Engine

## 1. Overview
The event streaming layer orchestrates all state sync across Flowvia active clients. It replaces polling with persistent bidirectional channels, ensuring sub-50ms latency for task status mutations and cursor positions.

## 2. Key Requirements
- **High Concurrency**: Support up to 50,000 concurrent connected sockets per node.
- **Failover & Reconnection**: Automatic backoff retry with message replay buffer (120s window).
- **Idempotency**: All mutation payloads carry a deterministic UUID to prevent duplicate writes.

\`\`\`json
{
  "event": "TASK_MUTATED",
  "taskId": 402,
  "delta": { "status": "IN_REVIEW", "assignee": "Alex Rivera" },
  "version": 4,
  "timestamp": 1711903490000
}
\`\`\`

## 3. Action Items
- [x] Benchmark socket connection pool in staging environment
- [x] Implement heartbeat ping-pong interval (15s)
- [ ] Implement Redis pub/sub backplane clustering
- [ ] Add client-side conflict resolution resolver`
  },
  {
    id: 'note-2',
    title: 'Sprint 24 Engineering Priorities & Release Scope',
    category: 'Planning',
    updatedAt: '1h ago',
    tags: ['Sprint', 'Q4', 'Roadmap'],
    content: `# Sprint 24 Engineering Priorities & Release Scope

## Focus Themes
1. **Performance & Interaction Polish**: Under-100ms UI transitions, keyboard shortcut accessibility.
2. **Command Palette Integration**: Fast global search across tasks, team members, and documents.
3. **Workspace RBAC Hardening**: Fine-grained role guards for workspace owners vs members.

## High Impact Deliverables
- **Core Platform**: Complete refactor of the dashboard layout to high-density charcoal theme.
- **Mobile Companion**: Offline cache support using IndexedDB sync.
- **Security**: Mandatory 2FA via authenticator TOTP.`
  },
  {
    id: 'note-3',
    title: 'Database Schema Optimization & Query Tuning',
    category: 'Database',
    updatedAt: 'Yesterday',
    tags: ['PostgreSQL', 'Indexes', 'Performance'],
    content: `# Database Schema Optimization & Query Tuning

## Query Bottlenecks Identified
The task list query was performing a full sequential scan when filtering by \`workspace_id\` and \`status\` simultaneously.

### Remediation
Created composite index:
\`\`\`sql
CREATE INDEX CONCURRENTLY idx_tasks_workspace_status_priority
ON tasks (workspace_id, status, priority, due_date DESC);
\`\`\`

**Result**: Execution latency dropped from **240ms** to **6.8ms** on a 500k-row table.`
  }
];

export default function NotesView({ onAddToast }) {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [activeNoteId, setActiveNoteId] = useState(INITIAL_NOTES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNote = () => {
    const newNote = {
      id: `note-${Date.now()}`,
      title: 'Untitled Document',
      category: 'General',
      updatedAt: 'Just now',
      tags: ['Draft'],
      content: `# Untitled Document\n\nStart writing notes, specifications, or meeting notes here...`
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    onAddToast?.('Created new note', 'success');
  };

  const handleUpdateTitle = (newTitle) => {
    setNotes(notes.map((n) => (n.id === activeNoteId ? { ...n, title: newTitle, updatedAt: 'Just now' } : n)));
  };

  const handleUpdateContent = (newContent) => {
    setNotes(notes.map((n) => (n.id === activeNoteId ? { ...n, content: newContent, updatedAt: 'Just now' } : n)));
  };

  const handleDeleteNote = (id, e) => {
    e.stopPropagation();
    if (notes.length <= 1) {
      onAddToast?.('Cannot delete the only remaining note', 'info');
      return;
    }
    const rem = notes.filter((n) => n.id !== id);
    setNotes(rem);
    if (activeNoteId === id) {
      setActiveNoteId(rem[0].id);
    }
    onAddToast?.('Note moved to trash', 'info');
  };

  const handleCopyNote = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(activeNote.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    onAddToast?.('Copied note content to clipboard', 'success');
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '290px 1fr',
      gap: '1rem',
      minHeight: '75vh',
      backgroundColor: '#111726',
      borderRadius: '8px',
      border: '1px solid #1f2b42',
      overflow: 'hidden'
    }}>
      {/* Left Notes Navigation List */}
      <div style={{
        borderRight: '1px solid #1f2b42',
        backgroundColor: '#0e1422',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        {/* Search & New Header */}
        <div style={{ padding: '0.85rem', borderBottom: '1px solid #1f2b42', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} color="#818cf8" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>
                Workspace Notes
              </span>
            </div>
            <button
              onClick={handleCreateNote}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                backgroundColor: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Plus size={13} />
              <span>New</span>
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#161f33',
            padding: '0.35rem 0.65rem',
            borderRadius: '6px',
            border: '1px solid #222f47'
          }}>
            <Search size={14} color="#64748b" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#e2e8f0',
                fontSize: '0.785rem',
                width: '100%'
              }}
            />
          </div>
        </div>

        {/* Notes Items List */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem' }}>
          {filteredNotes.map((note) => {
            const isActive = note.id === activeNoteId;
            return (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                  cursor: 'pointer',
                  marginBottom: '4px',
                  transition: 'background-color 0.1s ease',
                  position: 'relative'
                }}
              >
                <div style={{
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: isActive ? '#f8fafc' : '#cbd5e1',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  paddingRight: '1.5rem'
                }}>
                  {note.title}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: isActive ? '#a5b4fc' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '4px'
                }}>
                  <span>{note.category}</span>
                  <span>·</span>
                  <span>{note.updatedAt}</span>
                </div>

                <button
                  onClick={(e) => handleDeleteNote(note.id, e)}
                  title="Delete note"
                  style={{
                    position: 'absolute',
                    top: '0.65rem',
                    right: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                    opacity: 0.6
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Document Editor Canvas */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#111726'
      }}>
        {/* Editor Action Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid #1f2b42',
          backgroundColor: '#0e1422'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#818cf8',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              {activeNote?.category || 'Document'}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Synced {activeNote?.updatedAt}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleCopyNote}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#161f33',
                color: '#e2e8f0',
                border: '1px solid #222f47',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {isCopied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
              <span>{isCopied ? 'Copied' : 'Copy Markdown'}</span>
            </button>
          </div>
        </div>

        {/* Document Title Input */}
        <div style={{ padding: '1rem 1.5rem 0.5rem' }}>
          <input
            type="text"
            value={activeNote?.title || ''}
            onChange={(e) => handleUpdateTitle(e.target.value)}
            placeholder="Document title..."
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#f8fafc',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em'
            }}
          />
        </div>

        {/* Content Textarea / Markdown Body */}
        <div style={{ flex: 1, padding: '0 1.5rem 1.5rem', display: 'flex' }}>
          <textarea
            value={activeNote?.content || ''}
            onChange={(e) => handleUpdateContent(e.target.value)}
            placeholder="Write documentation in Markdown..."
            style={{
              width: '100%',
              height: '100%',
              minHeight: '450px',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#cbd5e1',
              fontSize: '0.9rem',
              lineHeight: 1.7,
              fontFamily: 'var(--font-mono)',
              resize: 'none',
              padding: '0.5rem 0'
            }}
          />
        </div>
      </div>
    </div>
  );
}

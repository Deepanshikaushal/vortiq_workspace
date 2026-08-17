import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  Flame,
  Send,
  Plus,
  Search,
  Sparkles,
  Lightbulb,
  HelpCircle,
  Coffee,
  Compass,
  CornerDownRight,
  Trash2,
  Clock,
  User,
  CheckCircle2,
  X
} from 'lucide-react';
import {
  fetchDiscussions,
  createDiscussion,
  upvoteDiscussion,
  addDiscussionReply,
  deleteDiscussion
} from '../services/api';

const CATEGORIES = [
  { id: 'ALL', label: 'All Topics', icon: MessageSquare, color: '#94a3b8' },
  { id: 'IDEA', label: '💡 Ideas & Proposals', icon: Lightbulb, color: '#38bdf8' },
  { id: 'OPINION', label: '🗣️ Opinions & Feedback', icon: MessageSquare, color: '#fbbf24' },
  { id: 'ROADMAP', label: '🚀 Roadmap & Strategy', icon: Compass, color: '#a855f7' },
  { id: 'QUESTION', label: '❓ Questions & Polls', icon: HelpCircle, color: '#34d399' },
  { id: 'CASUAL', label: '☕ Team Watercooler', icon: Coffee, color: '#ec4899' }
];

export default function TeamLounge({ activeWorkspace, currentUser, onAddToast }) {
  const [discussions, setDiscussions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Discussion Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('OPINION');

  // Expanded discussion reply states (map of discussionId -> reply input text)
  const [activeReplyBox, setActiveReplyBox] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (activeWorkspace) {
      loadDiscussions();
    }
  }, [activeWorkspace, selectedCategory]);

  const loadDiscussions = async () => {
    if (!activeWorkspace) return;
    try {
      setLoading(true);
      const data = await fetchDiscussions(activeWorkspace.id, selectedCategory);
      setDiscussions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !activeWorkspace) return;

    const payload = {
      workspaceId: activeWorkspace.id,
      authorId: currentUser?.id || 1,
      authorName: currentUser?.name || currentUser?.username || 'Team Member',
      authorEmail: currentUser?.email || 'member@vortiq.com',
      authorAvatar: currentUser?.avatarUrl || '',
      authorDepartment: currentUser?.department || 'Engineering & Development',
      title: title.trim(),
      content: content.trim(),
      category
    };

    try {
      await createDiscussion(payload);
      setTitle('');
      setContent('');
      setIsComposerOpen(false);
      if (onAddToast) onAddToast('Published your topic to the Team Lounge!', 'success');
      await loadDiscussions();
    } catch (err) {
      if (onAddToast) onAddToast('Failed to post discussion', 'danger');
    }
  };

  const handleUpvote = async (id) => {
    try {
      await upvoteDiscussion(id);
      setDiscussions(prev => prev.map(d => d.id === id ? { ...d, likesCount: (d.likesCount || 0) + 1 } : d));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (discussionId) => {
    if (!replyText.trim()) return;

    const payload = {
      authorId: currentUser?.id || 1,
      authorName: currentUser?.name || currentUser?.username || 'Team Member',
      authorEmail: currentUser?.email || 'member@vortiq.com',
      authorAvatar: currentUser?.avatarUrl || '',
      authorDepartment: currentUser?.department || 'Team Member',
      content: replyText.trim()
    };

    try {
      const created = await addDiscussionReply(discussionId, payload);
      setDiscussions(prev => prev.map(d => {
        if (d.id === discussionId) {
          return { ...d, replies: [...(d.replies || []), created] };
        }
        return d;
      }));
      setReplyText('');
      setActiveReplyBox(null);
      if (onAddToast) onAddToast('Replied to discussion', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this discussion topic?')) return;
    try {
      await deleteDiscussion(id);
      setDiscussions(prev => prev.filter(d => d.id !== id));
      if (onAddToast) onAddToast('Discussion deleted', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const safeDiscussions = Array.isArray(discussions) ? discussions : [];
  const filteredDiscussions = safeDiscussions.filter(d => {
    if (!d) return false;
    if (selectedCategory !== 'ALL' && d.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (d.title || '').toLowerCase().includes(q);
      const matchContent = (d.content || '').toLowerCase().includes(q);
      const matchAuthor = (d.authorName || '').toLowerCase().includes(q);
      return matchTitle || matchContent || matchAuthor;
    }
    return true;
  });

  return (
    <div style={{ width: '100%' }} className="animate-fade-in">
      
      {/* Top Banner & Hub Controls */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                Team Lounge & Opinion Hub
              </h2>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', margin: 0 }}>
                Share opinions, debate product proposals, brainstorm ideas, and converse with teammates
              </p>
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsComposerOpen(!isComposerOpen)}
          style={{ gap: '0.4rem', padding: '0.45rem 1rem', fontSize: '0.825rem' }}
        >
          {isComposerOpen ? <X size={15} /> : <Plus size={15} />}
          <span>{isComposerOpen ? 'Close Composer' : 'Share Opinion / Idea'}</span>
        </button>
      </div>

      {/* Opinion / Topic Composer Box */}
      {isComposerOpen && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} style={{ color: 'var(--text-muted)' }} />
              <span>Publish a Topic to Team Lounge</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Posting as: <strong>{currentUser?.name || currentUser?.username || 'Team Member'}</strong></span>
          </div>

          <form onSubmit={handleCreateDiscussion}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {CATEGORIES.filter(c => c.id !== 'ALL').map(cat => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: category === cat.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      background: category === cat.id ? 'var(--primary)' : 'var(--bg-tertiary)',
                      color: category === cat.id ? '#f8fafc' : 'var(--text-muted)'
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Topic Title *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Should we adopt GraphQL for mobile client API calls?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Details & Context *</label>
              <textarea
                required
                className="form-textarea"
                rows={4}
                placeholder="Share your thoughts, trade-offs, architecture context, or question for the team..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsComposerOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ gap: '0.4rem', padding: '0.55rem 1.25rem' }}>
                <Send size={15} />
                <span>Post Topic</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Pills & Search Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: isActive ? 'var(--primary)' : 'var(--bg-tertiary)',
                  color: isActive ? '#f8fafc' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={12} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Filter */}
        <div style={{ position: 'relative', minWidth: '220px', maxWidth: '340px', flex: '1 1 200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search discussions & opinions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '2rem', height: '34px', fontSize: '0.8rem' }}
          />
        </div>
      </div>

      {/* Discussion Topics Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredDiscussions.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={40} style={{ color: 'var(--text-dim)', opacity: 0.6, marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>No discussions found</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-dim)', maxWidth: '380px', margin: '0.4rem auto 1.25rem' }}>
              Be the first to share an opinion, propose a feature, or start a discussion for your team!
            </p>
            <button className="btn btn-primary" onClick={() => setIsComposerOpen(true)}>
              <Plus size={15} /> Share the First Topic
            </button>
          </div>
        ) : (
          filteredDiscussions.map((disc) => {
            const catConfig = CATEGORIES.find(c => c.id === disc.category) || CATEGORIES[2];
            const isReplying = activeReplyBox === disc.id;
            const repliesList = disc.replies || [];

            return (
              <div key={disc.id} className="glass-panel animate-fade-in" style={{ padding: '1.25rem', position: 'relative' }}>
                
                {/* Author Details & Category Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {disc.authorAvatar ? (
                      <img
                        src={disc.authorAvatar}
                        alt={disc.authorName}
                        style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                      />
                    ) : (
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #334155, #1e293b)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#f8fafc',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}>
                        {(disc.authorName || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.925rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {disc.authorName}
                        </span>
                        {disc.authorDepartment && (
                          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                            {disc.authorDepartment}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                        <Clock size={11} />
                        <span>{new Date(disc.createdAt || Date.now()).toLocaleDateString()} at {new Date(disc.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.725rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.65rem',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: catConfig.color,
                      border: `1px solid ${catConfig.color}35`
                    }}>
                      {catConfig.label}
                    </span>

                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => handleDelete(disc.id)}
                      style={{ padding: '0.25rem', color: 'var(--text-dim)' }}
                      title="Delete topic"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Topic Title & Body */}
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.65rem', lineHeight: 1.35 }}>
                  {disc.title}
                </h3>

                <p style={{ fontSize: '0.885rem', color: 'var(--text-main)', lineHeight: 1.6, margin: '0 0 1.25rem', whiteSpace: 'pre-wrap' }}>
                  {disc.content}
                </p>

                {/* Reactions & Thread Action Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                  
                  {/* Upvote Button */}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleUpvote(disc.id)}
                    style={{
                      padding: '0.35rem 0.85rem',
                      fontSize: '0.8rem',
                      gap: '0.4rem',
                      background: (disc.likesCount || 0) > 0 ? 'rgba(100, 116, 139, 0.2)' : 'var(--bg-tertiary)',
                      border: (disc.likesCount || 0) > 0 ? '1px solid #64748b' : '1px solid var(--border-color)',
                      color: (disc.likesCount || 0) > 0 ? '#f8fafc' : 'var(--text-muted)'
                    }}
                    title="Upvote / Agree with this opinion"
                  >
                    <Flame size={14} style={{ color: '#f59e0b' }} />
                    <span>Agree / Upvote ({disc.likesCount || 0})</span>
                  </button>

                  {/* Reply Button */}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setActiveReplyBox(isReplying ? null : disc.id);
                      setReplyText('');
                    }}
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', gap: '0.4rem' }}
                  >
                    <MessageSquare size={14} />
                    <span>{repliesList.length > 0 ? `Comments (${repliesList.length})` : 'Join Conversation / Reply'}</span>
                  </button>
                </div>

                {/* Thread Replies Section */}
                {(repliesList.length > 0 || isReplying) && (
                  <div style={{ marginTop: '1.25rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    
                    {/* Existing Comments */}
                    {repliesList.map((reply) => (
                      <div
                        key={reply.id}
                        className="glass-card animate-fade-in"
                        style={{ padding: '0.75rem 1rem', background: 'var(--bg-tertiary)', borderRadius: '10px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {reply.authorAvatar ? (
                              <img
                                src={reply.authorAvatar}
                                alt={reply.authorName}
                                style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #334155, #1e293b)',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#f8fafc',
                                fontSize: '0.65rem',
                                fontWeight: 700
                              }}>
                                {(reply.authorName || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-main)' }}>
                              {reply.authorName}
                            </span>
                            {reply.authorDepartment && (
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                                • {reply.authorDepartment}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                            {new Date(reply.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.825rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                          {reply.content}
                        </p>
                      </div>
                    ))}

                    {/* Inline Reply Composer */}
                    {isReplying && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                        <input
                          type="text"
                          autoFocus
                          className="form-input"
                          placeholder="Write your opinion or response..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply(disc.id);
                            }
                          }}
                          style={{ fontSize: '0.85rem', padding: '0.45rem 0.75rem', flex: 1 }}
                        />
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={!replyText.trim()}
                          onClick={() => handleSendReply(disc.id)}
                          style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', gap: '0.35rem' }}
                        >
                          <Send size={13} />
                          <span>Reply</span>
                        </button>
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

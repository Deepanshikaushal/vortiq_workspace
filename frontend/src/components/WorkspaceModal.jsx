import React, { useState, useEffect } from 'react';
import { X, Briefcase, UserPlus, Users, Trash2, Shield, AlertCircle, CheckCircle2, Crown, Plus, Check, FolderKanban } from 'lucide-react';
import {
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  fetchWorkspaceMembers,
  inviteWorkspaceMember,
  removeWorkspaceMember,
  changeWorkspaceMemberRole,
} from '../services/api';

const COLOR_PRESETS = [
  { name: 'Crimson Red', hex: '#e11d48' },
  { name: 'Quantum Indigo', hex: '#6366f1' },
  { name: 'Cyber Cyan', hex: '#06b6d4' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Amber Gold', hex: '#f59e0b' },
  { name: 'Neon Purple', hex: '#a855f7' },
  { name: 'Rose Pink', hex: '#f43f5e' }
];

export default function WorkspaceModal({
  isOpen,
  onClose,
  activeWorkspace,
  workspaces = [],
  onSelectWorkspace,
  onWorkspaceCreated,
  onWorkspaceUpdated,
  onWorkspaceDeleted,
}) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create' | 'settings' | 'members'
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorCode, setColorCode] = useState('#e11d48');

  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');

  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name || '');
      setDescription(activeWorkspace.description || '');
      setColorCode(activeWorkspace.colorCode || '#e11d48');
      if (isOpen) {
        loadMembers(activeWorkspace.id);
      }
    } else {
      setName('');
      setDescription('');
      setColorCode('#e11d48');
      setMembers([]);
      setActiveTab('create');
    }
  }, [activeWorkspace, isOpen]);

  const loadMembers = async (wsId) => {
    try {
      const data = await fetchWorkspaceMembers(wsId);
      setMembers(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const handleSaveWorkspace = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStatusMsg({ type: '', text: '' });
    setLoading(true);

    try {
      if (activeWorkspace && activeTab === 'settings') {
        const updated = await updateWorkspace(activeWorkspace.id, { name, description, colorCode });
        setLoading(false);
        setStatusMsg({ type: 'success', text: 'Workspace updated successfully!' });
        onWorkspaceUpdated(updated);
      } else {
        const created = await createWorkspace({ name, description, colorCode });
        setLoading(false);
        onWorkspaceCreated(created);
        setName('');
        setDescription('');
        onClose();
      }
    } catch (err) {
      setLoading(false);
      setStatusMsg({ type: 'error', text: err.message || 'Workspace operation failed' });
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!activeWorkspace) return;
    if (!window.confirm(`Are you sure you want to delete workspace "${activeWorkspace.name}"? This action cannot be undone.`)) return;

    setLoading(true);
    try {
      await deleteWorkspace(activeWorkspace.id);
      setLoading(false);
      onWorkspaceDeleted(activeWorkspace.id);
      onClose();
    } catch (err) {
      setLoading(false);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete workspace' });
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!activeWorkspace || !inviteEmail) return;
    setStatusMsg({ type: '', text: '' });
    setLoading(true);

    try {
      await inviteWorkspaceMember(activeWorkspace.id, inviteEmail, inviteRole);
      setLoading(false);
      setInviteEmail('');
      setStatusMsg({ type: 'success', text: `Invited ${inviteEmail} to workspace!` });
      loadMembers(activeWorkspace.id);
    } catch (err) {
      setLoading(false);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to invite member' });
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (!activeWorkspace) return;
    if (!window.confirm(`Remove ${memberName} from this workspace?`)) return;

    try {
      await removeWorkspaceMember(activeWorkspace.id, userId);
      setStatusMsg({ type: 'success', text: `Removed ${memberName} from workspace` });
      loadMembers(activeWorkspace.id);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to remove member' });
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!activeWorkspace) return;
    try {
      await changeWorkspaceMemberRole(activeWorkspace.id, userId, newRole);
      loadMembers(activeWorkspace.id);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to change member role' });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container" style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(225, 29, 72, 0.2)', borderRadius: '8px', color: '#ff859b' }}>
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="modal-title">
                {activeTab === 'create' ? 'Create New Workspace' : activeTab === 'list' ? 'Switch Workspaces' : activeWorkspace ? activeWorkspace.name : 'Workspace Hub'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Manage workspaces, project scopes, team members and roles
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{ padding: '0.85rem 1.5rem 0', display: 'flex', gap: '0.4rem', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'list' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem', whiteSpace: 'nowrap' }}
            onClick={() => { setActiveTab('list'); setStatusMsg({ type: '', text: '' }); }}
          >
            <FolderKanban size={14} style={{ marginRight: '0.3rem' }} /> Workspaces ({workspaces.length})
          </button>
          
          <button
            type="button"
            className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem', whiteSpace: 'nowrap' }}
            onClick={() => { setActiveTab('create'); setName(''); setDescription(''); setColorCode('#e11d48'); setStatusMsg({ type: '', text: '' }); }}
          >
            <Plus size={14} style={{ marginRight: '0.3rem' }} /> + New Workspace
          </button>

          {activeWorkspace && (
            <>
              <button
                type="button"
                className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem', whiteSpace: 'nowrap' }}
                onClick={() => { setActiveTab('settings'); setStatusMsg({ type: '', text: '' }); }}
              >
                Settings
              </button>
              <button
                type="button"
                className={`btn ${activeTab === 'members' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem', whiteSpace: 'nowrap' }}
                onClick={() => { setActiveTab('members'); setStatusMsg({ type: '', text: '' }); }}
              >
                <Users size={14} style={{ marginRight: '0.3rem' }} /> Team ({members.length})
              </button>
            </>
          )}
        </div>

        <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
          {statusMsg.text && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: statusMsg.type === 'success' ? '#10b981' : '#ef4444',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* TAB 1: ALL WORKSPACES LIST & SWITCHER */}
          {activeTab === 'list' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Select or switch active workspace:
                </span>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                  onClick={() => { setActiveTab('create'); setName(''); setDescription(''); }}
                >
                  <Plus size={14} /> Create Workspace
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '280px', overflowY: 'auto' }}>
                {workspaces.map((ws) => {
                  const isActive = activeWorkspace && activeWorkspace.id === ws.id;
                  return (
                    <div
                      key={ws.id}
                      onClick={() => {
                        if (onSelectWorkspace) onSelectWorkspace(ws);
                        onClose();
                      }}
                      style={{
                        padding: '0.85rem 1.1rem',
                        borderRadius: '10px',
                        background: isActive ? 'rgba(225, 29, 72, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        border: isActive ? '1.5px solid rgba(225, 29, 72, 0.6)' : '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: ws.colorCode || '#e11d48',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: '800',
                          fontSize: '1rem',
                          boxShadow: `0 0 12px ${ws.colorCode || '#e11d48'}66`
                        }}>
                          {(ws.name || 'W').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>{ws.name}</span>
                            {isActive && (
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(225, 29, 72, 0.3)', color: '#ff859b' }}>
                                ACTIVE
                              </span>
                            )}
                          </div>
                          {ws.description && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>
                              {ws.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                          {ws.currentUserRole || 'OWNER'}
                        </span>
                        {isActive ? (
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            <Check size={14} />
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectWorkspace) onSelectWorkspace(ws);
                              onClose();
                            }}
                          >
                            Switch
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MEMBERS MANAGEMENT */}
          {activeTab === 'members' && activeWorkspace && (
            <div>
              <form onSubmit={handleInvite} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="Invite user by email (e.g. sarah@vortiq.com)"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  style={{ flex: 1 }}
                />
                <select
                  className="form-select"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  style={{ width: '110px' }}
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                  <option value="VIEWER">Viewer</option>
                </select>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <UserPlus size={15} /> Invite
                </button>
              </form>

              <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {members.map((m) => (
                  <div
                    key={m.id || m.userId}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary-glow), #ec4899)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                      }}>
                        {(m.name || m.username || m.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{m.name || m.username}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.email}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {m.role === 'OWNER' ? (
                        <span style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                          <Crown size={14} /> OWNER
                        </span>
                      ) : (
                        <select
                          className="form-select"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                          value={m.role}
                          onChange={(e) => handleChangeRole(m.userId, e.target.value)}
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="MEMBER">Member</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                      )}

                      {m.role !== 'OWNER' && (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ padding: '0.25rem 0.5rem', color: '#ef4444' }}
                          onClick={() => handleRemoveMember(m.userId, m.name || m.username)}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3 & 4: CREATE / SETTINGS FORM */}
          {(activeTab === 'create' || activeTab === 'settings') && (
            <form onSubmit={handleSaveWorkspace} className="modal-form">
              <div className="form-group">
                <label className="form-label">Workspace Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Engineering Core Team, Marketing Sprint, Product Alpha"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Primary workspace for full-stack tasks, projects, and sprint tracking"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Workspace Badge Color</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.hex}
                      onClick={() => setColorCode(preset.hex)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        border: colorCode === preset.hex ? `2px solid ${preset.hex}` : '1px solid var(--border-color)',
                        background: colorCode === preset.hex ? `${preset.hex}33` : 'var(--bg-tertiary)',
                        color: 'var(--text-main)',
                        fontSize: '0.785rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: preset.hex }} />
                      {preset.name}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    className="form-input"
                    style={{ width: '48px', height: '38px', padding: '2px', cursor: 'pointer' }}
                    value={colorCode}
                    onChange={(e) => setColorCode(e.target.value)}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{colorCode}</span>
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '1.25rem', padding: 0, border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {activeWorkspace && activeTab === 'settings' ? (
                  <button type="button" className="btn btn-ghost" style={{ color: '#ef4444' }} onClick={handleDeleteWorkspace} disabled={loading}>
                    <Trash2 size={15} style={{ marginRight: '0.3rem' }} /> Delete Workspace
                  </button>
                ) : <div />}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {activeWorkspace && activeTab === 'settings' ? 'Update Workspace' : 'Create & Launch Workspace'}
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

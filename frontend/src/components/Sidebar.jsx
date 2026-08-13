import React from 'react';
import {
  Zap,
  Kanban,
  Table,
  Plus,
  ShieldCheck,
  ChevronDown,
  Briefcase,
  Users,
  Settings
} from 'lucide-react';

export default function Sidebar({
  activeView,
  setActiveView,
  projects,
  selectedProject,
  setSelectedProject,
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  onOpenWorkspaceModal,
  onOpenProfileModal,
  onOpenCreateModal,
  currentUser
}) {
  return (
    <aside className="sidebar-container">
      
      {/* Brand Header */}
      <div style={{ paddingBottom: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(6, 182, 212, 0.45)'
        }}>
          <Zap size={24} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: '900', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff, #38bdf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            VortiQ Studio
          </h1>
          <p style={{ fontSize: '0.685rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Workspace Collaboration
          </p>
        </div>
      </div>

      {/* Workspace Selector */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', paddingLeft: '0.2rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Workspace
          </span>
          <button
            onClick={onOpenWorkspaceModal}
            style={{ background: 'none', border: 'none', color: 'var(--primary-glow)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
          >
            + Manage
          </button>
        </div>

        <div className="glass-card" style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
            <Briefcase size={16} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
            <select
              value={activeWorkspace ? activeWorkspace.id : ''}
              onChange={(e) => {
                const wsId = Number(e.target.value);
                const ws = workspaces.find((w) => w.id === wsId);
                if (ws) onSelectWorkspace(ws);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: '700',
                outline: 'none',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id} style={{ background: '#0f1527', color: '#fff' }}>
                  {ws.name} ({ws.currentUserRole || 'MEMBER'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter by Project */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem', paddingLeft: '0.2rem' }}>
          Project Scope
        </div>
        <select
          className="form-select"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          style={{ width: '100%', fontSize: '0.85rem' }}
        >
          <option value="">All Workspace Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Primary Action Button */}
      <button className="btn btn-gradient" onClick={onOpenCreateModal} style={{ width: '100%', marginBottom: '1.5rem', padding: '0.75rem' }}>
        <Plus size={18} />
        <span>Create Task</span>
      </button>

      {/* Main Navigation Links */}
      <nav style={{ flex: 1 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', paddingLeft: '0.2rem' }}>
          Views & Tools
        </div>

        <div
          className={`sidebar-link ${activeView === 'kanban' ? 'active' : ''}`}
          onClick={() => setActiveView('kanban')}
        >
          <Kanban size={18} />
          <span>Kanban Board</span>
        </div>

        <div
          className={`sidebar-link ${activeView === 'table' ? 'active' : ''}`}
          onClick={() => setActiveView('table')}
        >
          <Table size={18} />
          <span>Task Matrix List</span>
        </div>

        <div className="sidebar-link" onClick={onOpenWorkspaceModal}>
          <Users size={18} />
          <span>Team Members</span>
        </div>

        <div className="sidebar-link" onClick={onOpenProfileModal}>
          <Settings size={18} />
          <span>Profile Settings</span>
        </div>
      </nav>

      {/* User Profile Footer */}
      {currentUser && (
        <div
          onClick={onOpenProfileModal}
          style={{
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #06b6d4, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: '800',
              fontSize: '0.85rem'
            }}>
              {(currentUser.name || currentUser.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.name || currentUser.username}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{currentUser.role || 'ROLE_USER'}</div>
            </div>
          </div>
          
          <ShieldCheck size={16} style={{ color: 'var(--cyan)' }} title="JWT Secured" />
        </div>
      )}

    </aside>
  );
}

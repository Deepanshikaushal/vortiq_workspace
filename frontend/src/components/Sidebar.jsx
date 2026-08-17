import React, { useState } from 'react';
import {
  Home,
  Kanban,
  Table,
  Plus,
  ShieldCheck,
  Briefcase,
  Users,
  Settings,
  X,
  Lock,
  Download,
  HelpCircle,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  Check,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import VortiqLogo from './VortiqLogo';

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
  onOpenAuthModal,
  onOpenCreateModal,
  onCreateProject,
  onOpenChatModal,
  inconvenienceCount = 0,
  currentUser,
  isMobileMenuOpen,
  onCloseMobileMenu,
  onGoHome,
  onExportCSV,
  onOpenShortcutsModal,
  isSidebarCollapsed,
  onToggleSidebarCollapse
}) {
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreateProjectSubmit = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    if (onCreateProject) {
      onCreateProject(newProjectName.trim());
    }
    setNewProjectName('');
    setIsAddingProject(false);
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      <div
        className={`sidebar-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={onCloseMobileMenu}
      />

      <aside className={`sidebar-container ${isMobileMenuOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        
        {/* Brand Header with Quantum VortiQ Logo & Mobile Close Button */}
        <div style={{ paddingBottom: '1.15rem', marginBottom: '1.15rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => { if (onGoHome) onGoHome(); onCloseMobileMenu(); }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'rgba(100, 116, 139, 0.15)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <VortiqLogo size={26} />
            </div>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                color: 'var(--text-main)',
                lineHeight: 1.2
              }}>
                VortiQ Studio
              </h1>
              <p style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Workspace Platform
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {/* Desktop Sidebar Collapse Button */}
            {onToggleSidebarCollapse && (
              <button
                className="btn btn-secondary btn-icon desktop-only"
                onClick={onToggleSidebarCollapse}
                style={{ padding: '0.35rem', borderRadius: '6px' }}
                title="Collapse sidebar (Full Screen)"
              >
                <ChevronLeft size={16} />
              </button>
            )}

            {/* Close button visible only on mobile drawer */}
            <button
              className="btn btn-ghost btn-icon mobile-only"
              onClick={onCloseMobileMenu}
              style={{ padding: '0.4rem' }}
              title="Close Drawer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Workspace Selector */}
        <div style={{ marginBottom: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', paddingLeft: '0.2rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Active Workspace
            </span>
            <button
              onClick={() => { onOpenWorkspaceModal(); onCloseMobileMenu(); }}
              style={{ background: 'none', border: 'none', color: '#ff859b', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <Plus size={12} /> New
            </button>
          </div>

          <div className="glass-card" style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: activeWorkspace?.colorCode || '#64748b', flexShrink: 0, boxShadow: `0 0 6px ${activeWorkspace?.colorCode || '#64748b'}` }} />
              <select
                value={activeWorkspace ? activeWorkspace.id : ''}
                onChange={(e) => {
                  const wsId = Number(e.target.value);
                  const ws = workspaces.find((w) => w.id === wsId);
                  if (ws) onSelectWorkspace(ws);
                  onCloseMobileMenu();
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
                  <option key={ws.id} value={ws.id} style={{ background: '#22070a', color: '#fff' }}>
                    {ws.name} ({ws.currentUserRole || 'MEMBER'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filter by Project Scope */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', paddingLeft: '0.2rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Project Scope
            </span>
            <button
              onClick={() => setIsAddingProject(!isAddingProject)}
              style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              title="Add new project"
            >
              <Plus size={12} /> Project
            </button>
          </div>

          {isAddingProject && (
            <form onSubmit={handleCreateProjectSubmit} style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', height: '32px' }}
                autoFocus
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.35rem 0.6rem', height: '32px' }}>
                <Check size={14} />
              </button>
            </form>
          )}

          <select
            className="form-select"
            value={selectedProject}
            onChange={(e) => { setSelectedProject(e.target.value); onCloseMobileMenu(); }}
            style={{ width: '100%', fontSize: '0.825rem', padding: '0.45rem 0.65rem' }}
          >
            <option value="">All Workspace Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Primary Action Button */}
        <button className="btn btn-gradient" onClick={() => { onOpenCreateModal(); onCloseMobileMenu(); }} style={{ width: '100%', marginBottom: '1.25rem', padding: '0.7rem', gap: '0.5rem' }}>
          <Plus size={18} />
          <span>Create Task</span>
        </button>

        {/* Main Navigation Options List */}
        <nav style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem', paddingLeft: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <SlidersHorizontal size={12} style={{ color: 'var(--primary-glow)' }} />
            <span>Workspace Views</span>
          </div>

          <div
            className={`sidebar-link ${activeView === 'kanban' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('kanban');
              onCloseMobileMenu();
            }}
          >
            <Kanban size={18} style={{ color: '#38bdf8' }} />
            <span>Kanban Board</span>
          </div>

          <div
            className={`sidebar-link ${activeView === 'table' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('table');
              onCloseMobileMenu();
            }}
          >
            <Table size={18} style={{ color: '#34d399' }} />
            <span>Task Matrix List</span>
          </div>

          <div
            className={`sidebar-link ${activeView === 'members' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('members');
              onCloseMobileMenu();
            }}
          >
            <Users size={18} style={{ color: '#818cf8' }} />
            <span>Members Directory</span>
          </div>

          <div
            className={`sidebar-link ${activeView === 'lounge' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('lounge');
              onCloseMobileMenu();
            }}
          >
            <MessageSquare size={18} style={{ color: '#ec4899' }} />
            <span>Opinions & Team Lounge</span>
          </div>

          {onOpenChatModal && (
            <div
              className="sidebar-link"
              onClick={() => {
                onOpenChatModal();
                onCloseMobileMenu();
              }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MessageSquare size={18} style={{ color: '#f59e0b' }} />
                <span>Team & Inconveniences</span>
              </div>
              {inconvenienceCount > 0 && (
                <span style={{
                  padding: '0.1rem 0.4rem',
                  borderRadius: '9999px',
                  background: '#f59e0b',
                  color: '#000',
                  fontSize: '0.68rem',
                  fontWeight: 900
                }}>
                  {inconvenienceCount}
                </span>
              )}
            </div>
          )}

          <div className="sidebar-link" onClick={() => { onOpenWorkspaceModal(); onCloseMobileMenu(); }}>
            <Users size={18} style={{ color: '#fbbf24' }} />
            <span>Manage Workspaces</span>
          </div>

          <div
            className="sidebar-link"
            onClick={() => {
              if (onGoHome) onGoHome();
              onCloseMobileMenu();
            }}
          >
            <Home size={18} style={{ color: '#f43f5e' }} />
            <span>Home Landing Page</span>
          </div>

          <div className="sidebar-link" onClick={() => { onOpenProfileModal(); onCloseMobileMenu(); }}>
            <Settings size={18} style={{ color: '#a855f7' }} />
            <span>Profile & Security</span>
          </div>

          {onOpenAuthModal && (
            <div className="sidebar-link" onClick={() => { onOpenAuthModal(); onCloseMobileMenu(); }}>
              <Lock size={18} style={{ color: '#ec4899' }} />
              <span>OTP Sign In / Auth</span>
            </div>
          )}

          {onExportCSV && (
            <div className="sidebar-link" onClick={() => { onExportCSV(); onCloseMobileMenu(); }}>
              <Download size={18} style={{ color: '#22c55e' }} />
              <span>Export CSV Report</span>
            </div>
          )}

          {onOpenShortcutsModal && (
            <div className="sidebar-link" onClick={() => { onOpenShortcutsModal(); onCloseMobileMenu(); }}>
              <HelpCircle size={18} style={{ color: '#38bdf8' }} />
              <span>Keyboard Shortcuts (?)</span>
            </div>
          )}

        </nav>

        {/* User Profile Footer */}
        {currentUser && (
          <div
            onClick={onOpenProfileModal}
            style={{
              paddingTop: '0.85rem',
              marginTop: '0.5rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name || currentUser.username}
                  style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #334155, #1e293b)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f8fafc',
                  fontWeight: '700',
                  fontSize: '0.85rem'
                }}>
                  {(currentUser.name || currentUser.username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.name || currentUser.username}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{currentUser.department || currentUser.role || 'Team Member'}</div>
              </div>
            </div>
            
            <ShieldCheck size={16} style={{ color: '#10b981' }} title="JWT Secured" />
          </div>
        )}

      </aside>
    </>
  );
}

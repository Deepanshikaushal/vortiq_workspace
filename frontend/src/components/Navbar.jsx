import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Moon,
  Sun,
  Kanban,
  Table,
  X,
  User,
  LogIn,
  LogOut,
  Settings,
  Briefcase,
  Menu,
  ChevronDown,
  Home,
  Users,
  Shield,
  Download,
  HelpCircle,
  SlidersHorizontal,
  Sparkles,
  Maximize2,
  Minimize2,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import ApiStatusBadge from './ApiStatusBadge';
import VortiqLogo from './VortiqLogo';

export default function Navbar({
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  theme,
  setTheme,
  isConnected,
  onCheckApi,
  currentUser,
  workspaces = [],
  activeWorkspace,
  onSelectWorkspace,
  onOpenWorkspaceModal,
  onOpenProfileModal,
  onOpenAuthModal,
  onOpenCreateModal,
  onOpenChatModal,
  onOpenAiModal,
  inconvenienceCount = 0,
  onLogout,
  onToggleMobileMenu,
  onGoHome,
  onExportCSV,
  onOpenShortcutsModal,
  isSidebarCollapsed,
  onToggleSidebarCollapse
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const userMenuRef = useRef(null);
  const optionsMenuRef = useRef(null);
  const workspaceMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setOptionsMenuOpen(false);
      }
      if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(event.target)) {
        setWorkspaceMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <header className="glass-panel" style={{ borderRadius: '0', borderLeft: 'none', borderRight: 'none', borderTop: 'none', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        
        {/* Left Side: Hamburger / Sidebar Toggle & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          
          {/* Mobile Menu Button */}
          <button
            className="btn btn-secondary btn-icon mobile-only"
            onClick={onToggleMobileMenu}
            title="Toggle Navigation Menu"
            style={{ padding: '0.45rem', minHeight: '38px', minWidth: '38px' }}
          >
            <Menu size={18} />
          </button>

          {/* Desktop Sidebar Toggle Button */}
          {onToggleSidebarCollapse && (
            <button
              className="btn btn-secondary btn-icon desktop-only"
              onClick={onToggleSidebarCollapse}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar (Full Width Mode)"}
              style={{ padding: '0.45rem', minHeight: '36px', minWidth: '36px' }}
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={17} style={{ color: '#ff859b' }} /> : <PanelLeftClose size={17} />}
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }} onClick={onGoHome} title="Go to Home Landing Page">
            <VortiqLogo size={22} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '1rem' }}>VortiQ</span>
          </div>

          {/* Workspace Quick Switcher Pill (Desktop) */}
          {activeWorkspace && (
            <div style={{ position: 'relative' }} ref={workspaceMenuRef} className="desktop-only">
              <button
                onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontSize: '0.825rem',
                  fontWeight: 600
                }}
                title="Switch or manage active workspace"
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: activeWorkspace.colorCode || '#64748b', boxShadow: `0 0 6px ${activeWorkspace.colorCode || '#64748b'}` }} />
                <span style={{ fontSize: '0.825rem', fontWeight: '700', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeWorkspace.name}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </button>

              {workspaceMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  width: '230px',
                  background: 'var(--bg-glass)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-card)',
                  padding: '0.5rem',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Switch Workspace
                  </div>
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        onSelectWorkspace(ws);
                        setWorkspaceMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '0.45rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        background: activeWorkspace?.id === ws.id ? 'var(--bg-tertiary)' : 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        fontSize: '0.8125rem',
                        fontWeight: activeWorkspace?.id === ws.id ? '700' : '500',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ws.colorCode || '#64748b' }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</span>
                      </div>
                    </button>
                  ))}

                  <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.35rem 0' }} />

                  <button
                    onClick={() => {
                      setWorkspaceMenuOpen(false);
                      if (onOpenWorkspaceModal) onOpenWorkspaceModal();
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem', justifyContent: 'center' }}
                  >
                    <Plus size={14} /> + New Workspace
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: Search Bar */}
        <div style={{ flex: '1 1 180px', minWidth: '150px', maxWidth: '420px', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search tasks (Ctrl+K)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.3rem', paddingRight: searchQuery ? '2.2rem' : '4.2rem', height: '36px', fontSize: '0.85rem' }}
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          ) : (
            <span className="desktop-only" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-dim)', background: 'var(--bg-secondary)', padding: '0.12rem 0.35rem', borderRadius: '4px', border: '1px solid var(--border-color)', pointerEvents: 'none' }}>
              Ctrl K
            </span>
          )}
        </div>

        {/* Right Tools: Fullscreen, Create, Views, Theme, User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'nowrap' }}>
          
          {/* Team Messaging & Inconvenience Channel Button */}
          {onOpenChatModal && (
            <button
              className="btn btn-secondary"
              onClick={() => onOpenChatModal()}
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.825rem',
                gap: '0.4rem',
                height: '36px',
                position: 'relative',
                border: inconvenienceCount > 0 ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid var(--border-color)',
                background: inconvenienceCount > 0 ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-secondary)'
              }}
              title="Open Team & Inconvenience Messages"
            >
              {inconvenienceCount > 0 ? (
                <AlertTriangle size={15} style={{ color: '#f59e0b' }} />
              ) : (
                <MessageSquare size={15} style={{ color: 'var(--primary-glow)' }} />
              )}
              <span className="desktop-only">{inconvenienceCount > 0 ? 'Issues & Chat' : 'Team Chat'}</span>
              {inconvenienceCount > 0 && (
                <span style={{
                  padding: '0.1rem 0.35rem',
                  borderRadius: '9999px',
                  background: '#f59e0b',
                  color: '#000',
                  fontSize: '0.65rem',
                  fontWeight: 900
                }}>
                  {inconvenienceCount}
                </span>
              )}
            </button>
          )}

          {/* VortiQ AI Copilot Button */}
          {onOpenAiModal && (
            <button
              className="btn btn-secondary"
              onClick={onOpenAiModal}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.825rem',
                gap: '0.35rem',
                height: '36px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-main)',
                fontWeight: 600
              }}
              title="Open VortiQ AI Copilot & Sprint Architect"
            >
              <Sparkles size={15} style={{ color: '#94a3b8' }} />
              <span className="desktop-only">AI Copilot</span>
            </button>
          )}
          
          {/* Quick Create Task Button */}
          {onOpenCreateModal && (
            <button
              className="btn btn-primary"
              onClick={onOpenCreateModal}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem', gap: '0.35rem', height: '36px' }}
              title="Create new task (N)"
            >
              <Plus size={15} />
              <span className="desktop-only">Task</span>
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="view-tabs" style={{ padding: '0.2rem' }}>
            <button
              className={`tab-btn ${activeView === 'kanban' ? 'active' : ''}`}
              onClick={() => setActiveView('kanban')}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              title="Kanban Board View (V)"
            >
              <Kanban size={15} />
              <span className="desktop-only">Kanban</span>
            </button>
            <button
              className={`tab-btn ${activeView === 'table' ? 'active' : ''}`}
              onClick={() => setActiveView('table')}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              title="Task Matrix Table (V)"
            >
              <Table size={15} />
              <span className="desktop-only">Matrix</span>
            </button>
            <button
              className={`tab-btn ${activeView === 'members' ? 'active' : ''}`}
              onClick={() => setActiveView('members')}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              title="Team Members Directory (V)"
            >
              <Users size={15} style={{ color: '#a5b4fc' }} />
              <span className="desktop-only">Members</span>
            </button>
            <button
              className={`tab-btn ${activeView === 'lounge' ? 'active' : ''}`}
              onClick={() => setActiveView('lounge')}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              title="Team Lounge & Opinions Hub (V)"
            >
              <MessageSquare size={15} style={{ color: '#fde68a' }} />
              <span className="desktop-only">Opinions</span>
            </button>
          </div>

          {/* Full Screen Toggle Button */}
          <button
            className="btn btn-secondary btn-icon desktop-only"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Mode"}
            style={{ padding: '0.45rem', minHeight: '36px', minWidth: '36px' }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* API Health Status */}
          <ApiStatusBadge isConnected={isConnected} onRetry={onCheckApi} />

          {/* Options Dropdown Menu */}
          <div style={{ position: 'relative' }} ref={optionsMenuRef}>
            <button
              onClick={() => setOptionsMenuOpen(!optionsMenuOpen)}
              className="btn btn-secondary"
              style={{
                padding: '0.4rem 0.65rem',
                fontSize: '0.8rem',
                gap: '0.3rem',
                height: '36px',
                border: '1px solid var(--border-color)',
                background: optionsMenuOpen ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'
              }}
              title="Application options"
            >
              <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
              <ChevronDown size={13} style={{ transform: optionsMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {optionsMenuOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '125%',
                width: 'min(260px, 88vw)',
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                padding: '0.55rem',
                zIndex: 100
              }}>
                <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.725rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border-color)', marginBottom: '0.35rem' }}>
                  Workspace Tools
                </div>

                <button
                  onClick={() => { setOptionsMenuOpen(false); if (onOpenChatModal) onOpenChatModal(); }}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem', padding: '0.5rem 0.75rem', gap: '0.6rem' }}
                >
                  <MessageSquare size={16} style={{ color: '#f59e0b' }} />
                  <span>Team & Blockers Chat</span>
                </button>

                <button
                  onClick={() => { setOptionsMenuOpen(false); onOpenWorkspaceModal(); }}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem', padding: '0.5rem 0.75rem', gap: '0.6rem' }}
                >
                  <Users size={16} style={{ color: '#10b981' }} />
                  <span>Workspace Collaboration</span>
                </button>

                <button
                  onClick={() => { setOptionsMenuOpen(false); onOpenProfileModal(); }}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem', padding: '0.5rem 0.75rem', gap: '0.6rem' }}
                >
                  <Settings size={16} style={{ color: '#f43f5e' }} />
                  <span>Profile & Security</span>
                </button>

                <button
                  onClick={() => { setOptionsMenuOpen(false); onExportCSV(); }}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem', padding: '0.5rem 0.75rem', gap: '0.6rem' }}
                >
                  <Download size={16} style={{ color: '#06b6d4' }} />
                  <span>Export Tasks CSV</span>
                </button>

                {onOpenShortcutsModal && (
                  <button
                    onClick={() => { setOptionsMenuOpen(false); onOpenShortcutsModal(); }}
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem', padding: '0.5rem 0.75rem', gap: '0.6rem' }}
                  >
                    <HelpCircle size={16} style={{ color: '#38bdf8' }} />
                    <span>Keyboard Shortcuts</span>
                  </button>
                )}

              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            className="btn btn-secondary btn-icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Light/Dark Mode (D)"
            style={{ padding: '0.45rem', minHeight: '36px', minWidth: '36px' }}
          >
            {theme === 'dark' ? <Sun size={17} style={{ color: '#fbbf24' }} /> : <Moon size={17} style={{ color: '#f43f5e' }} />}
          </button>

          {/* User Account / Profile Menu */}
          {currentUser ? (
            <div style={{ position: 'relative' }} ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.2rem 0.65rem 0.2rem 0.3rem',
                  borderRadius: '24px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-purple)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  height: '36px'
                }}
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name || currentUser.username}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #334155, #1e293b)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    color: '#f8fafc'
                  }}>
                    {(currentUser.name || currentUser.username || currentUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="desktop-only" style={{ fontSize: '0.825rem', fontWeight: 700, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.name || currentUser.username}
                </span>
              </button>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '120%',
                  width: '220px',
                  background: 'var(--bg-glass)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid var(--border-purple)',
                  borderRadius: '14px',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.5), 0 0 25px rgba(168, 85, 247, 0.25)',
                  padding: '0.55rem',
                  zIndex: 100
                }}>
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.35rem' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{currentUser.name || currentUser.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email}</div>
                  </div>

                  <button
                    onClick={() => { setUserMenuOpen(false); onOpenProfileModal(); }}
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                  >
                    <Settings size={15} /> Profile & Security
                  </button>

                  <button
                    onClick={() => { setUserMenuOpen(false); onOpenWorkspaceModal(); }}
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                  >
                    <Briefcase size={15} /> Workspaces & Team
                  </button>

                  <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.35rem 0' }} />

                  <button
                    onClick={() => { setUserMenuOpen(false); onLogout(); }}
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem', padding: '0.5rem 0.75rem', color: '#ff007f' }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-gradient" onClick={onOpenAuthModal} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', height: '36px' }}>
              <LogIn size={15} /> Sign In
            </button>
          )}

        </div>

      </div>
    </header>
  );
}

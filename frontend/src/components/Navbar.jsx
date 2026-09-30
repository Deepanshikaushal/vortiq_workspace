import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  Menu,
  ChevronRight,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Keyboard,
  Shield,
  FileText,
  Folder,
  CheckCircle2,
  Sparkles,
  Command,
  Activity
} from 'lucide-react';

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
  onOpenNotifications,
  unreadNotifsCount = 2,
  onLogout,
  onToggleMobileMenu,
  onOpenShortcutsModal,
  isSidebarCollapsed,
  onToggleSidebarCollapse,
  onOpenCommandPalette
}) {
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const createMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target)) {
        setCreateMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const viewTitles = {
    focus: "Today's Focus",
    'my-tasks': 'My Tasks',
    kanban: 'Tasks Board',
    table: 'Tasks Matrix',
    tasks: 'Tasks',
    calendar: 'Calendar & Roadmap',
    notes: 'Workspace Notes',
    files: 'Files & Vault',
    team: 'Team Directory',
    lounge: 'Team Lounge',
    analytics: 'Sprint & Velocity Analytics',
    automations: 'Automations & Rules',
    'backend-console': 'System Console',
    inbox: 'Inbox'
  };

  const currentViewTitle = viewTitles[activeView] || "Today's Focus";

  return (
    <header style={{
      height: '52px',
      backgroundColor: '#0c101a',
      borderBottom: '1px solid #1a2336',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.25rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      gap: '0.75rem'
    }}>
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
        {/* Mobile menu trigger */}
        <button
          className="mobile-only"
          onClick={onToggleMobileMenu}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb Hierarchy */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.785rem',
          color: '#64748b',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          <span
            onClick={() => setActiveView?.('focus')}
            style={{
              color: '#94a3b8',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'color 0.12s'
            }}
          >
            {activeWorkspace?.name || 'Flowvia Studio'}
          </span>
          <ChevronRight size={12} color="#475569" style={{ flexShrink: 0 }} />
          <span style={{ color: '#f1f5f9', fontWeight: 700 }}>
            {currentViewTitle}
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar (Triggers Command Palette) */}
      <div
        onClick={onOpenCommandPalette}
        style={{
          flex: '0 1 420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#111726',
          border: '1px solid #1f2b42',
          borderRadius: '6px',
          padding: '0.35rem 0.75rem',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        className="nav-search-trigger"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
          <Search size={14} color="#64748b" />
          <span style={{
            fontSize: '0.785rem',
            color: '#64748b',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            Search tasks, docs, commands...
          </span>
        </div>

        <kbd style={{
          fontSize: '0.65rem',
          color: '#94a3b8',
          backgroundColor: '#161f33',
          border: '1px solid #24324f',
          padding: '1px 5px',
          borderRadius: '3px',
          fontFamily: 'var(--font-mono)'
        }}>
          ⌘K
        </kbd>
      </div>

      {/* Right: Workspace Status, Quick Create, Notifications, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        
        {/* Workspace Live Status Indicator */}
        <div
          className="desktop-only"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#111726',
            border: '1px solid #1f2b42',
            padding: '0.25rem 0.6rem',
            borderRadius: '12px'
          }}
          title={isConnected ? 'Connected to Flowvia Sync Engine' : 'Sync Engine Offline'}
        >
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#10b981' : '#f59e0b',
            boxShadow: isConnected ? '0 0 8px rgba(16, 185, 129, 0.6)' : 'none'
          }} />
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>
            {isConnected ? 'All systems nominal' : 'Connecting...'}
          </span>
        </div>

        {/* Quick Create Button with Popover */}
        <div style={{ position: 'relative' }} ref={createMenuRef}>
          <button
            onClick={() => setCreateMenuOpen(!createMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '5px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.12s ease'
            }}
          >
            <Plus size={13} />
            <span>New</span>
            <ChevronDown size={11} />
          </button>

          {createMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '6px',
              zIndex: 100,
              backgroundColor: '#111726',
              borderRadius: '6px',
              border: '1px solid #1f2b42',
              boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
              padding: '4px',
              minWidth: '150px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <button
                onClick={() => {
                  setCreateMenuOpen(false);
                  onOpenCreateModal?.();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0.6rem',
                  background: 'none',
                  border: 'none',
                  color: '#f8fafc',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <CheckCircle2 size={13} color="#818cf8" />
                  <span>New Task</span>
                </div>
                <kbd style={{ fontSize: '0.62rem', color: '#64748b' }}>N</kbd>
              </button>

              <button
                onClick={() => {
                  setCreateMenuOpen(false);
                  onOpenWorkspaceModal?.();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0.6rem',
                  background: 'none',
                  border: 'none',
                  color: '#cbd5e1',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Folder size={13} color="#38bdf8" />
                  <span>New Project</span>
                </div>
                <kbd style={{ fontSize: '0.62rem', color: '#64748b' }}>P</kbd>
              </button>

              <button
                onClick={() => {
                  setCreateMenuOpen(false);
                  setActiveView?.('notes');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.4rem 0.6rem',
                  background: 'none',
                  border: 'none',
                  color: '#cbd5e1',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  textAlign: 'left',
                  gap: '0.45rem'
                }}
              >
                <FileText size={13} color="#a855f7" />
                <span>Create Note</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <button
          onClick={onOpenNotifications}
          style={{
            position: 'relative',
            background: 'transparent',
            border: '1px solid #1f2b42',
            borderRadius: '6px',
            backgroundColor: '#111726',
            color: '#94a3b8',
            padding: '0.4rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Notifications"
        >
          <Bell size={15} />
          {unreadNotifsCount > 0 && (
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
        </button>

        {/* Theme Toggle (Dark/Light) */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            background: 'transparent',
            border: '1px solid #1f2b42',
            borderRadius: '6px',
            backgroundColor: '#111726',
            color: '#94a3b8',
            padding: '0.4rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode (D)`}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* User Profile Popover */}
        <div style={{ position: 'relative' }} ref={profileMenuRef}>
          <div
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {(currentUser?.name || 'D')[0].toUpperCase()}
            </div>
          </div>

          {profileMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '6px',
              zIndex: 100,
              backgroundColor: '#111726',
              borderRadius: '6px',
              border: '1px solid #1f2b42',
              boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
              padding: '4px',
              minWidth: '180px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <div style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid #1c273c' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>
                  {currentUser?.name || 'Deepanshi Kaushal'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  {currentUser?.email || 'deepanshi@vortiq.com'}
                </div>
              </div>

              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  onOpenProfileModal?.();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 0.65rem',
                  background: 'none',
                  border: 'none',
                  color: '#cbd5e1',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  textAlign: 'left'
                }}
              >
                <Settings size={13} />
                <span>Profile & Preferences</span>
              </button>

              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  onOpenShortcutsModal?.();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 0.65rem',
                  background: 'none',
                  border: 'none',
                  color: '#cbd5e1',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  textAlign: 'left'
                }}
              >
                <Keyboard size={13} />
                <span>Keyboard Shortcuts (?)</span>
              </button>

              <div style={{ borderTop: '1px solid #1c273c', marginTop: '2px', paddingTop: '2px' }}>
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onLogout?.();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.45rem 0.65rem',
                    background: 'none',
                    border: 'none',
                    color: '#f87171',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  <LogOut size={13} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

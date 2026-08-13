import React, { useState, useRef, useEffect } from 'react';
import { Search, Moon, Sun, Kanban, Table, X, Bell, User, LogIn, LogOut, Settings, Briefcase } from 'lucide-react';
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
  activeWorkspace,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenWorkspaceModal,
  onLogout
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="glass-panel" style={{ borderRadius: '0', borderLeft: 'none', borderRight: 'none', borderTop: 'none', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ padding: '0.85rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
        
        {/* Search Input Bar */}
        <div style={{ flex: '1', maxWidth: '440px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search tasks, specs, assignees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: searchQuery ? '2.3rem' : '4.5rem', height: '42px' }}
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          ) : (
            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.685rem', fontWeight: '700', color: 'var(--text-dim)', background: 'var(--bg-secondary)', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', pointerEvents: 'none' }}>
              Ctrl K
            </span>
          )}
        </div>

        {/* Header Right Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          
          {activeWorkspace && (
            <div
              onClick={onOpenWorkspaceModal}
              style={{
                cursor: 'pointer',
                padding: '0.35rem 0.85rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(99, 102, 241, 0.15))',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                color: 'var(--cyan)',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)'
              }}
              title="Click to manage workspace"
            >
              <VortiqLogo size={18} />
              <span>{activeWorkspace.name}</span>
            </div>
          )}

          <ApiStatusBadge isConnected={isConnected} onRetry={onCheckApi} />

          {/* View Mode Toggle */}
          <div className="view-tabs">
            <button
              className={`tab-btn ${activeView === 'kanban' ? 'active' : ''}`}
              onClick={() => setActiveView('kanban')}
            >
              <Kanban size={16} />
              <span>Kanban</span>
            </button>
            <button
              className={`tab-btn ${activeView === 'table' ? 'active' : ''}`}
              onClick={() => setActiveView('table')}
            >
              <Table size={16} />
              <span>Matrix</span>
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            className="btn btn-secondary btn-icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Light/Dark Mode"
          >
            {theme === 'dark' ? <Sun size={18} style={{ color: '#fbbf24' }} /> : <Moon size={18} style={{ color: '#06b6d4' }} />}
          </button>

          {/* User Account / Profile Menu */}
          {currentUser ? (
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '24px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-purple)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(168, 85, 247, 0.2)'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00f2fe, #ff007f)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  color: '#fff'
                }}>
                  {(currentUser.name || currentUser.username || currentUser.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
            <button className="btn btn-gradient" onClick={onOpenAuthModal} style={{ padding: '0.45rem 1.1rem', fontSize: '0.88rem' }}>
              <LogIn size={15} /> Sign In
            </button>
          )}

        </div>

      </div>
    </header>
  );
}

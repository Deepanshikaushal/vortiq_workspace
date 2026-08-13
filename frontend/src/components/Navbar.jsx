import React from 'react';
import { Search, Moon, Sun, Kanban, Table, X, Sparkles, Bell } from 'lucide-react';
import ApiStatusBadge from './ApiStatusBadge';

export default function Navbar({
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  theme,
  setTheme,
  isConnected,
  onCheckApi,
  taskCount
}) {
  return (
    <header className="glass-panel" style={{ borderRadius: '0', borderLeft: 'none', borderRight: 'none', borderTop: 'none', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ padding: '0.85rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
        
        {/* Search Input Bar */}
        <div style={{ flex: '1', maxWidth: '460px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search tasks, code specs, assignees..."
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

          {/* Notifications Bell */}
          <button className="btn btn-secondary btn-icon" title="Notifications">
            <Bell size={18} />
          </button>

          {/* Theme Toggle Button */}
          <button
            className="btn btn-secondary btn-icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Light/Dark Mode"
          >
            {theme === 'dark' ? <Sun size={18} style={{ color: '#fbbf24' }} /> : <Moon size={18} style={{ color: '#06b6d4' }} />}
          </button>

        </div>

      </div>
    </header>
  );
}

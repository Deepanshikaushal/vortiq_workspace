import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  CheckCircle2,
  Calendar,
  FileText,
  Folder,
  Users,
  BarChart2,
  Cpu,
  Sparkles,
  Settings,
  Plus,
  Play,
  ArrowRight,
  X,
  Clock,
  Layers,
  Inbox
} from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  tasks = [],
  projects = [],
  onNavigate,
  onOpenCreateTask,
  onOpenCreateProject,
  onStartFocus,
  onOpenProfile,
  onToggleTheme,
  onOpenFlowIntelligence
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const defaultActions = [
    {
      id: 'act-flow-intel',
      title: 'Flow Intelligence & Attention Drawer',
      subtitle: 'Open real-time workspace friction analysis and Smart Brief',
      category: 'Intelligence',
      icon: Sparkles,
      shortcut: 'I',
      action: () => { onClose(); onOpenFlowIntelligence?.(); }
    },
    {
      id: 'act-new-task',
      title: 'Create New Task',
      subtitle: 'Open task composer modal',
      category: 'Actions',
      icon: Plus,
      shortcut: 'N',
      action: () => { onClose(); onOpenCreateTask?.(); }
    },
    {
      id: 'act-new-project',
      title: 'Create New Project',
      subtitle: 'Add project to workspace',
      category: 'Actions',
      icon: Folder,
      shortcut: 'P',
      action: () => { onClose(); onOpenCreateProject?.(); }
    },
    {
      id: 'act-focus',
      title: 'Start Focus Session',
      subtitle: 'Launch 25-minute Pomodoro timer',
      category: 'Actions',
      icon: Play,
      shortcut: 'F',
      action: () => { onClose(); onStartFocus?.(); }
    },
    {
      id: 'act-theme',
      title: 'Toggle Color Theme',
      subtitle: 'Switch between dark and light workspace',
      category: 'Actions',
      icon: Sparkles,
      shortcut: 'D',
      action: () => { onClose(); onToggleTheme?.(); }
    },
    {
      id: 'nav-focus',
      title: 'Command Center',
      subtitle: 'Priority intelligence & workspace flight deck',
      category: 'Navigation',
      icon: CheckCircle2,
      action: () => { onClose(); onNavigate?.('focus'); }
    },
    {
      id: 'nav-inbox',
      title: 'Inbox',
      subtitle: 'Notifications and mentions',
      category: 'Navigation',
      icon: Inbox,
      action: () => { onClose(); onNavigate?.('inbox'); }
    },
    {
      id: 'nav-my-tasks',
      title: 'My Tasks',
      subtitle: 'Tasks assigned to your user account',
      category: 'Navigation',
      icon: Layers,
      action: () => { onClose(); onNavigate?.('my-tasks'); }
    },
    {
      id: 'nav-kanban',
      title: 'Tasks Kanban Board',
      subtitle: 'Interactive sprint columns view',
      category: 'Navigation',
      icon: Layers,
      action: () => { onClose(); onNavigate?.('kanban'); }
    },
    {
      id: 'nav-table',
      title: 'Tasks Table Matrix',
      subtitle: 'Tabular spreadsheet view with inline editing',
      category: 'Navigation',
      icon: Layers,
      action: () => { onClose(); onNavigate?.('table'); }
    },
    {
      id: 'nav-calendar',
      title: 'Calendar & Deadlines',
      subtitle: 'Workspace agenda and deadline tracking',
      category: 'Navigation',
      icon: Calendar,
      action: () => { onClose(); onNavigate?.('calendar'); }
    },
    {
      id: 'nav-notes',
      title: 'Workspace Notes & Docs',
      subtitle: 'Scratchpad and documentation repository',
      category: 'Navigation',
      icon: FileText,
      action: () => { onClose(); onNavigate?.('notes'); }
    },
    {
      id: 'nav-files',
      title: 'Files & Vault',
      subtitle: 'Workspace document storage & specs',
      category: 'Navigation',
      icon: Folder,
      action: () => { onClose(); onNavigate?.('files'); }
    },
    {
      id: 'nav-team',
      title: 'Team Directory & Lounge',
      subtitle: 'Collaborators and active communication',
      category: 'Navigation',
      icon: Users,
      action: () => { onClose(); onNavigate?.('team'); }
    },
    {
      id: 'nav-analytics',
      title: 'Productivity & Sprint Analytics',
      subtitle: 'Velocity metrics and AI workload insights',
      category: 'Navigation',
      icon: BarChart2,
      action: () => { onClose(); onNavigate?.('analytics'); }
    },
    {
      id: 'nav-automations',
      title: 'Automations & Rules',
      subtitle: 'Workflow triggers and webhook rules',
      category: 'Navigation',
      icon: Cpu,
      action: () => { onClose(); onNavigate?.('automations'); }
    },
    {
      id: 'nav-settings',
      title: 'Settings & Preferences',
      subtitle: 'User profile and workspace configuration',
      category: 'Navigation',
      icon: Settings,
      action: () => { onClose(); onOpenProfile?.(); }
    }
  ];

  // Dynamic items based on tasks and projects
  const taskItems = tasks.map((t) => ({
    id: `task-${t.id}`,
    title: t.title,
    subtitle: `${t.status.replace('_', ' ')} · ${t.priority} · ${t.category || 'Engineering'}`,
    category: 'Tasks',
    icon: CheckCircle2,
    badge: t.priority,
    action: () => {
      onClose();
      onNavigate?.('kanban');
    }
  }));

  const projectItems = projects.map((p) => ({
    id: `proj-${p.id}`,
    title: p.name,
    subtitle: p.description || 'Workspace Project',
    category: 'Projects',
    icon: Folder,
    action: () => {
      onClose();
      onNavigate?.('projects');
    }
  }));

  const allItems = [...defaultActions, ...taskItems, ...projectItems];

  const filteredItems = query.trim() === ''
    ? defaultActions.slice(0, 8)
    : allItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="cmd-palette-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(8, 12, 20, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        paddingLeft: '1rem',
        paddingRight: '1rem'
      }}
    >
      <div
        className="cmd-palette-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: '#0e1422',
          border: '1px solid #1f2b42',
          borderRadius: '6px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.75)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'cmdPaletteAppear 0.12s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Search Input Box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.9rem 1.15rem',
          borderBottom: '1px solid #1c273c',
          backgroundColor: '#0e1422'
        }}>
          <Search size={18} color="#6366f1" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, search tasks, projects, or switch views..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f1f5f9',
              fontSize: '0.925rem',
              fontFamily: 'inherit',
              lineHeight: 1.4
            }}
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
            >
              <X size={16} />
            </button>
          ) : (
            <kbd style={{
              fontSize: '0.7rem',
              color: '#64748b',
              backgroundColor: '#172033',
              border: '1px solid #23314d',
              padding: '2px 6px',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)'
            }}>ESC</kbd>
          )}
        </div>

        {/* Results List */}
        <div style={{
          maxHeight: '380px',
          overflowY: 'auto',
          padding: '0.5rem'
        }}>
          {filteredItems.length === 0 ? (
            <div style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '0.875rem'
            }}>
              No matching commands or tasks found for "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon || CheckCircle2;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    border: isSelected ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.1s ease',
                    marginBottom: '2px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '5px',
                      backgroundColor: isSelected ? '#6366f1' : '#182236',
                      color: isSelected ? '#ffffff' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}>
                      <Icon size={15} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: isSelected ? '#f8fafc' : '#e2e8f0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.title}
                      </div>
                      <div style={{
                        fontSize: '0.72rem',
                        color: isSelected ? '#a5b4fc' : '#64748b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: '#64748b',
                      backgroundColor: '#131b2c',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid #1c273c'
                    }}>
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd style={{
                        fontSize: '0.68rem',
                        color: '#94a3b8',
                        backgroundColor: '#182236',
                        border: '1px solid #24324f',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {item.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <ArrowRight size={14} color="#818cf8" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.6rem 1rem',
          borderTop: '1px solid #1c273c',
          backgroundColor: '#0c121e',
          fontSize: '0.72rem',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span><kbd style={{ backgroundColor: '#182236', padding: '1px 4px', borderRadius: '3px' }}>↑</kbd> <kbd style={{ backgroundColor: '#182236', padding: '1px 4px', borderRadius: '3px' }}>↓</kbd> navigate</span>
            <span><kbd style={{ backgroundColor: '#182236', padding: '1px 4px', borderRadius: '3px' }}>↵</kbd> select</span>
          </div>
          <div>
            <span>Flowvia Workspace Command</span>
          </div>
        </div>
      </div>
    </div>
  );
}

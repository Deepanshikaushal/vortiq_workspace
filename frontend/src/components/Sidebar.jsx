import React, { useState } from 'react';
import {
  Inbox,
  CheckSquare,
  Folder,
  Layers,
  Calendar,
  FileText,
  Paperclip,
  Users,
  BarChart2,
  Cpu,
  Sparkles,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Keyboard,
  LogOut,
  User,
  Shield,
  Check,
  Zap,
  LayoutGrid
} from 'lucide-react';
import FlowviaLogo from './FlowviaLogo';

export default function Sidebar({
  activeView,
  setActiveView,
  projects = [],
  selectedProject,
  setSelectedProject,
  workspaces = [],
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
  onToggleSidebarCollapse,
  taskCount = 0,
  myTaskCount = 0,
  onOpenAiModal,
  onOpenFlowIntelligence
}) {
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
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

  const navItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, badge: '4', badgeColor: '#6366f1' },
    { id: 'focus', label: 'Command Center', icon: Zap, highlight: false },
    { id: 'my-tasks', label: 'My Tasks', icon: CheckSquare, badge: myTaskCount > 0 ? String(myTaskCount) : null },
    { id: 'tasks', label: 'Tasks', icon: Layers, badge: taskCount > 0 ? String(taskCount) : null },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'files', label: 'Files', icon: Paperclip },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'automations', label: 'Automations', icon: Cpu },
    { id: 'flow-intelligence', label: 'Flow Intelligence', icon: Sparkles, highlight: true }
  ];

  const handleNavClick = (id) => {
    if (id === 'flow-intelligence' || id === 'ai-assistant') {
      if (onOpenFlowIntelligence) onOpenFlowIntelligence();
      else if (onOpenAiModal) onOpenAiModal();
      else setActiveView('ai-analytics');
    } else {
      setActiveView(id);
    }
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div
        className={`sidebar-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={onCloseMobileMenu}
      />

      <aside
        className={`flowvia-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}
        style={{
          width: isSidebarCollapsed ? '64px' : '240px',
          minWidth: isSidebarCollapsed ? '64px' : '240px',
          backgroundColor: '#0c101a',
          borderRight: '1px solid #1a2336',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 90,
          transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          userSelect: 'none',
          overflow: 'hidden'
        }}
      >
        {/* Top Header: Flowvia Logo & Workspace Switcher */}
        <div style={{
          padding: isSidebarCollapsed ? '0.75rem 0.5rem' : '0.85rem 0.85rem',
          borderBottom: '1px solid #1a2336',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}>
          {/* Logo & Brand Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
            gap: '0.5rem'
          }}>
            <div
              onClick={() => handleNavClick('focus')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer'
              }}
            >
              <FlowviaLogo size={24} />
              {!isSidebarCollapsed && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: '#f8fafc',
                    fontFamily: 'var(--font-display)'
                  }}>
                    Flowvia
                  </span>
                  <span style={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#818cf8',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    border: '1px solid rgba(99, 102, 241, 0.3)'
                  }}>
                    PRO
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            {!isSidebarCollapsed && onToggleSidebarCollapse && (
              <button
                onClick={onToggleSidebarCollapse}
                className="desktop-only"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px'
                }}
                title="Collapse sidebar (Ctrl+B)"
              >
                <PanelLeftClose size={15} />
              </button>
            )}
          </div>

          {/* Workspace Switcher */}
          {!isSidebarCollapsed ? (
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0.55rem',
                  backgroundColor: '#111726',
                  borderRadius: '6px',
                  border: '1px solid #1f2b42',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '2px',
                    backgroundColor: activeWorkspace?.colorCode || '#6366f1',
                    flexShrink: 0
                  }} />
                  <span style={{
                    fontSize: '0.785rem',
                    fontWeight: 600,
                    color: '#e2e8f0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {activeWorkspace?.name || 'Flowvia Studio'}
                  </span>
                </div>
                <ChevronDown size={13} color="#64748b" style={{ flexShrink: 0 }} />
              </div>

              {/* Workspace Switcher Popover */}
              {isWorkspaceMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  zIndex: 100,
                  backgroundColor: '#111726',
                  borderRadius: '6px',
                  border: '1px solid #1f2b42',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                  padding: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  <div style={{
                    padding: '0.35rem 0.55rem',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#64748b'
                  }}>
                    Workspaces
                  </div>
                  {workspaces.map((ws) => (
                    <div
                      key={ws.id}
                      onClick={() => {
                        onSelectWorkspace?.(ws);
                        setIsWorkspaceMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.4rem 0.55rem',
                        borderRadius: '4px',
                        backgroundColor: ws.id === activeWorkspace?.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        color: ws.id === activeWorkspace?.id ? '#f8fafc' : '#cbd5e1'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: ws.colorCode || '#6366f1' }} />
                        <span>{ws.name}</span>
                      </div>
                      {ws.id === activeWorkspace?.id && <Check size={12} color="#818cf8" />}
                    </div>
                  ))}

                  <div style={{ borderTop: '1px solid #1c273c', marginTop: '2px', paddingTop: '2px' }}>
                    <button
                      onClick={() => {
                        onOpenWorkspaceModal?.();
                        setIsWorkspaceMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.4rem 0.55rem',
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        color: '#818cf8',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Plus size={12} />
                      <span>Create Workspace</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                onClick={onToggleSidebarCollapse}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '5px',
                  backgroundColor: '#111726',
                  border: '1px solid #1f2b42',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#94a3b8'
                }}
                title="Expand sidebar"
              >
                <PanelLeftOpen size={14} />
              </div>
            </div>
          )}
        </div>

        {/* Middle Navigation Items List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: isSidebarCollapsed ? '0.5rem 0.4rem' : '0.5rem 0.65rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                  padding: isSidebarCollapsed ? '0.55rem 0' : '0.45rem 0.65rem',
                  borderRadius: '5px',
                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                  color: isActive ? '#f8fafc' : item.highlight ? '#818cf8' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  position: 'relative'
                }}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                  <Icon size={15} color={isActive ? '#818cf8' : item.highlight ? '#818cf8' : 'currentColor'} style={{ flexShrink: 0 }} />
                  {!isSidebarCollapsed && (
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 700 : 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.label}
                    </span>
                  )}
                </div>

                {!isSidebarCollapsed && item.badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    backgroundColor: item.badgeColor ? `${item.badgeColor}22` : '#161f33',
                    color: item.badgeColor || '#94a3b8',
                    border: `1px solid ${item.badgeColor ? `${item.badgeColor}44` : '#222f47'}`
                  }}>
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}

          {/* Collapsible Projects Section */}
          {!isSidebarCollapsed && (
            <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px solid #161f33' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.35rem 0.65rem',
                cursor: 'pointer'
              }}>
                <div
                  onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}
                >
                  {isProjectsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Projects
                  </span>
                </div>

                <button
                  onClick={() => setIsAddingProject(!isAddingProject)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Add project"
                >
                  <Plus size={13} />
                </button>
              </div>

              {isAddingProject && (
                <form onSubmit={handleCreateProjectSubmit} style={{ padding: '0.25rem 0.65rem', display: 'flex', gap: '4px' }}>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project name..."
                    autoFocus
                    style={{
                      width: '100%',
                      backgroundColor: '#111726',
                      border: '1px solid #1f2b42',
                      borderRadius: '4px',
                      color: '#f8fafc',
                      padding: '2px 6px',
                      fontSize: '0.72rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#6366f1',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff',
                      padding: '2px 6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Check size={11} />
                  </button>
                </form>
              )}

              {isProjectsExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', paddingLeft: '0.35rem' }}>
                  {projects.map((proj) => {
                    const isSelected = String(selectedProject) === String(proj.id);
                    return (
                      <div
                        key={proj.id}
                        onClick={() => {
                          setSelectedProject(proj.id);
                          setActiveView('project');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '4px',
                          backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                          color: isSelected ? '#f8fafc' : '#94a3b8',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          transition: 'all 0.12s ease'
                        }}
                      >
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: proj.colorCode || '#6366f1'
                        }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {proj.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Section: Settings, Shortcuts & User Profile */}
        <div style={{
          padding: isSidebarCollapsed ? '0.65rem 0.4rem' : '0.65rem 0.75rem',
          borderTop: '1px solid #1a2336',
          backgroundColor: '#0a0e17',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          {/* Settings Trigger */}
          <div
            onClick={() => onOpenProfileModal?.()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              gap: '0.65rem',
              padding: '0.4rem 0.55rem',
              borderRadius: '5px',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.785rem'
            }}
            title="Settings & Preferences"
          >
            <Settings size={15} style={{ flexShrink: 0 }} />
            {!isSidebarCollapsed && <span>Settings</span>}
          </div>

          {/* User Profile Tile */}
          <div
            onClick={() => onOpenProfileModal?.()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
              padding: '0.45rem 0.55rem',
              borderRadius: '6px',
              backgroundColor: '#111726',
              border: '1px solid #1f2b42',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#6366f1',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: 700,
                flexShrink: 0
              }}>
                {(currentUser?.name || 'D')[0].toUpperCase()}
              </div>

              {!isSidebarCollapsed && (
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#f8fafc',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {currentUser?.name || 'Deepanshi Kaushal'}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                    {currentUser?.role ? currentUser.role.replace('ROLE_', '') : 'Lead'}
                  </div>
                </div>
              )}
            </div>

            {!isSidebarCollapsed && (
              <span style={{
                fontSize: '0.62rem',
                color: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                padding: '1px 4px',
                borderRadius: '3px'
              }}>
                Online
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

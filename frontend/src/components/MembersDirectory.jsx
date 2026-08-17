import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Building,
  Shield,
  Crown,
  CheckCircle2,
  Plus,
  MessageSquare,
  Copy,
  Check,
  Sparkles,
  Layers,
  Calendar,
  ExternalLink,
  UserCheck,
  UserPlus,
  LayoutGrid,
  ListFilter,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';
import { fetchAllUsers, inviteWorkspaceMember } from '../services/api';

const DEPARTMENTS = [
  'ALL',
  'Engineering & Development',
  'Product & Strategy',
  'UI/UX & Design',
  'Cloud Infrastructure & DevOps',
  'QA & Test Automation',
  'Cybersecurity & Compliance',
  'Data Science & Analytics',
  'Operations & Management'
];

const DEPARTMENT_COLORS = {
  'Engineering & Development': { bg: 'rgba(100, 116, 139, 0.15)', text: '#cbd5e1', border: 'rgba(148, 163, 184, 0.25)' },
  'Product & Strategy': { bg: 'rgba(99, 102, 241, 0.12)', text: '#a5b4fc', border: 'rgba(99, 102, 241, 0.25)' },
  'UI/UX & Design': { bg: 'rgba(168, 85, 247, 0.12)', text: '#d8b4fe', border: 'rgba(168, 85, 247, 0.25)' },
  'Cloud Infrastructure & DevOps': { bg: 'rgba(245, 158, 11, 0.12)', text: '#fde68a', border: 'rgba(245, 158, 11, 0.25)' },
  'QA & Test Automation': { bg: 'rgba(16, 185, 129, 0.12)', text: '#86efac', border: 'rgba(16, 185, 129, 0.25)' },
  'Cybersecurity & Compliance': { bg: 'rgba(56, 189, 248, 0.12)', text: '#7dd3fc', border: 'rgba(56, 189, 248, 0.25)' },
  'Data Science & Analytics': { bg: 'rgba(14, 165, 233, 0.12)', text: '#7dd3fc', border: 'rgba(14, 165, 233, 0.25)' },
  'Operations & Management': { bg: 'rgba(148, 163, 184, 0.12)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.25)' }
};

export default function MembersDirectory({
  activeWorkspace,
  tasks = [],
  currentUser,
  onOpenCreateTaskWithAssignee,
  onOpenChatWithMember,
  addToast
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [copiedId, setCopiedId] = useState(null);

  // Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviteDept, setInviteDept] = useState(DEPARTMENTS[1]);
  const [isInviting, setIsInviting] = useState(false);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('Failed to load members:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleCopyContact = (member) => {
    const contactInfo = `Name: ${member.name || member.username}\nEmail: ${member.email}\nPhone: ${member.phone || 'N/A'}\nDepartment: ${member.department || 'General'}`;
    navigator.clipboard.writeText(contactInfo);
    setCopiedId(member.id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast?.(`Copied ${member.name || member.username}'s contact card!`, 'info');
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      await inviteWorkspaceMember(activeWorkspace?.id || 1, inviteEmail.trim(), inviteRole);
      addToast?.(`Invitation dispatched to ${inviteEmail}!`, 'success');
      setIsInviteModalOpen(false);
      setInviteEmail('');
      await loadMembers();
    } catch (err) {
      addToast?.('Failed to send invitation', 'danger');
    } finally {
      setIsInviting(false);
    }
  };

  // Compute task statistics for each user
  const userTaskStats = useMemo(() => {
    const statsMap = {};
    tasks.forEach(task => {
      const assigneeName = (task.assignee || '').toLowerCase().trim();
      if (!assigneeName) return;

      if (!statsMap[assigneeName]) {
        statsMap[assigneeName] = { total: 0, completed: 0, inProgress: 0 };
      }
      statsMap[assigneeName].total += 1;
      if (task.status === 'COMPLETED') statsMap[assigneeName].completed += 1;
      if (task.status === 'IN_PROGRESS') statsMap[assigneeName].inProgress += 1;
    });
    return statsMap;
  }, [tasks]);

  // Filtered members list
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q)) ||
        (u.bio && u.bio.toLowerCase().includes(q));

      const matchesDept = selectedDepartment === 'ALL' || u.department === selectedDepartment;
      const matchesRole = selectedRole === 'ALL' ||
        u.role === selectedRole ||
        (selectedRole === 'OWNER' && (u.role === 'ROLE_OWNER' || u.role === 'OWNER')) ||
        (selectedRole === 'ADMIN' && (u.role === 'ROLE_ADMIN' || u.role === 'ADMIN')) ||
        (selectedRole === 'MEMBER' && (u.role === 'ROLE_MEMBER' || u.role === 'MEMBER' || u.role === 'ROLE_USER'));

      return matchesSearch && matchesDept && matchesRole;
    });
  }, [users, searchQuery, selectedDepartment, selectedRole]);

  // Metrics
  const onlineCount = useMemo(() => {
    return users.filter(u => u.status === 'ONLINE' || !u.status).length;
  }, [users]);

  const totalAssignedTasks = useMemo(() => {
    return tasks.filter(t => t.assignee).length;
  }, [tasks]);

  return (
    <div className="members-directory-wrapper" style={{ padding: '0.5rem 0', animation: 'fadeIn 0.25s ease' }}>
      
      {/* Top Banner & Highlights */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '14px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(100, 116, 139, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-main)'
              }}
            >
              <Users size={18} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              Team Members & Registered Directory
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, maxWidth: '650px' }}>
            View all authenticated members who have joined **{activeWorkspace?.name || 'TaskPulse Studio'}**, view department profiles, contact details, and assign tasks.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={loadMembers}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', gap: '0.35rem' }}
            title="Refresh member list"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin-slow' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.825rem', gap: '0.4rem' }}
          >
            <UserPlus size={15} />
            <span>Invite New Member</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}
      >
        <div className="glass-card" style={{ padding: '0.9rem 1rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.55rem', borderRadius: '8px', background: 'rgba(100, 116, 139, 0.2)', color: 'var(--text-main)' }}>
            <Users size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {users.length}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: 600 }}>
              Registered Members
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '0.9rem 1rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.55rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#86efac' }}>
            <UserCheck size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#86efac', lineHeight: 1.1 }}>
              {onlineCount}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: 600 }}>
              Active Now
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '0.9rem 1rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.55rem', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc' }}>
            <Building size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {new Set(users.map(u => u.department).filter(Boolean)).size || 6}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: 600 }}>
              Departments & Units
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '0.9rem 1rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.55rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#fde68a' }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fde68a', lineHeight: 1.1 }}>
              {totalAssignedTasks}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: 600 }}>
              Assigned Tasks
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '0.9rem 1.15rem',
          border: '1px solid var(--border-color)',
          marginBottom: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '450px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name, @username, email, phone, or unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ paddingLeft: '2.4rem', fontSize: '0.825rem' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Role & View Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              className="select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.65rem' }}
            >
              <option value="ALL">All Roles</option>
              <option value="OWNER">Workspace Owners</option>
              <option value="ADMIN">Admins & Managers</option>
              <option value="MEMBER">Standard Members</option>
            </select>

            <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: '0.2rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setViewMode('grid')}
                className="btn-icon"
                style={{
                  width: '30px',
                  height: '30px',
                  padding: 0,
                  background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'grid' ? '#ffffff' : 'var(--text-muted)',
                  borderRadius: '4px'
                }}
                title="Grid Cards View"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className="btn-icon"
                style={{
                  width: '30px',
                  height: '30px',
                  padding: 0,
                  background: viewMode === 'table' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'table' ? '#ffffff' : 'var(--text-muted)',
                  borderRadius: '4px'
                }}
                title="Table Directory View"
              >
                <ListFilter size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Department Pills Bar */}
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.2rem' }} className="custom-scrollbar">
          {DEPARTMENTS.map(dept => {
            const isActive = selectedDepartment === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  border: isActive ? `1px solid var(--primary)` : '1px solid var(--border-color)',
                  background: isActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {dept === 'ALL' ? '🏢 All Units' : dept}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Members Grid or Table View */}
      {loading && users.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <RefreshCw size={24} className="animate-spin-slow" style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.2rem' }}>Loading Workspace Directory...</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Fetching registered team members and roles</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(100, 116, 139, 0.15)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <Users size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>No Members Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto 1rem' }}>
            No registered members match your search criteria or department filter.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedDepartment('ALL'); setSelectedRole('ALL'); }}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* GRID CARDS VIEW */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '1.15rem'
          }}
        >
          {filteredUsers.map(member => {
            const isOwner = member.role === 'ROLE_OWNER' || member.role === 'OWNER' || member.id === 1;
            const isAdmin = member.role === 'ROLE_ADMIN' || member.role === 'ADMIN';
            const deptStyle = DEPARTMENT_COLORS[member.department] || { bg: 'rgba(100, 116, 139, 0.15)', text: '#cbd5e1', border: 'rgba(148, 163, 184, 0.25)' };
            const memberNameKey = (member.name || member.username || '').toLowerCase().trim();
            const mStats = userTaskStats[memberNameKey] || { total: 0, completed: 0, inProgress: 0 };
            const isCurrent = currentUser && (currentUser.id === member.id || currentUser.email === member.email);

            return (
              <div
                key={member.id}
                className="glass-card"
                style={{
                  padding: '1.15rem',
                  borderRadius: '12px',
                  border: isCurrent ? '1px solid rgba(148, 163, 184, 0.4)' : '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  position: 'relative',
                  transition: 'transform 0.2s'
                }}
              >
                {/* Header with Avatar, Name, Role */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                      src={member.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140&auto=format&fit=crop&q=80'}
                      alt={member.name || member.username}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '1px',
                        right: '1px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: member.status === 'OFFLINE' ? '#64748b' : '#10b981',
                        border: '2px solid var(--bg-card)'
                      }}
                      title={member.status === 'OFFLINE' ? 'Offline' : 'Online / Active'}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {member.name || member.username}
                      </h4>
                      
                      {/* Role Badge */}
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          padding: '0.12rem 0.4rem',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          background: 'rgba(255, 255, 255, 0.06)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        {isOwner ? <Crown size={10} /> : <Shield size={10} />}
                        <span>{isOwner ? 'OWNER' : isAdmin ? 'ADMIN' : 'MEMBER'}</span>
                      </span>
                    </div>

                    <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                      @{member.username || member.email?.split('@')[0]}
                      {isCurrent && <span style={{ color: 'var(--text-main)', marginLeft: '0.35rem' }}>(You)</span>}
                    </div>

                    {/* Department Tag */}
                    <div style={{ marginTop: '0.3rem' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          padding: '0.12rem 0.45rem',
                          borderRadius: '4px',
                          background: deptStyle.bg,
                          color: deptStyle.text,
                          border: `1px solid ${deptStyle.border}`,
                          display: 'inline-block'
                        }}
                      >
                        {member.department || 'Engineering & Development'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', lineHeight: 1.45, minHeight: '36px' }}>
                  {member.bio || `Workspace contributor specialized in ${member.department || 'core feature delivery'}.`}
                </div>

                {/* Contact Info */}
                <div style={{ padding: '0.55rem 0.7rem', background: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Mail size={12} color="var(--text-muted)" />
                      <span>{member.email}</span>
                    </div>
                    <button
                      onClick={() => handleCopyContact(member)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.1rem' }}
                      title="Copy full contact"
                    >
                      {copiedId === member.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    </button>
                  </div>

                  {member.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      <Phone size={12} color="var(--text-muted)" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>

                {/* Task Stats Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-color)', paddingTop: '0.55rem' }}>
                  <span>Tasks: <strong>{mStats.total}</strong></span>
                  <span>Done: <strong style={{ color: '#86efac' }}>{mStats.completed}</strong></span>
                  <span>Active: <strong>{mStats.inProgress}</strong></span>
                </div>

                {/* Actions Row */}
                <div style={{ display: 'flex', gap: '0.45rem', marginTop: 'auto' }}>
                  {onOpenChatWithMember && (
                    <button
                      onClick={() => onOpenChatWithMember(member)}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.725rem', gap: '0.3rem', justifyContent: 'center' }}
                      title="Send message"
                    >
                      <MessageSquare size={12} />
                      <span>Chat</span>
                    </button>
                  )}

                  {onOpenCreateTaskWithAssignee && (
                    <button
                      onClick={() => onOpenCreateTaskWithAssignee(member.name || member.username)}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.725rem', gap: '0.3rem', justifyContent: 'center' }}
                    >
                      <Plus size={12} />
                      <span>Assign</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        
        /* TABLE LIST DIRECTORY VIEW */
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Member</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Department / Unit</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Email & Phone</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Tasks Velocity</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(member => {
                  const isOwner = member.role === 'ROLE_OWNER' || member.role === 'OWNER' || member.id === 1;
                  const isAdmin = member.role === 'ROLE_ADMIN' || member.role === 'ADMIN';
                  const deptStyle = DEPARTMENT_COLORS[member.department] || { bg: 'rgba(100, 116, 139, 0.15)', text: '#cbd5e1', border: 'rgba(148, 163, 184, 0.25)' };
                  const memberNameKey = (member.name || member.username || '').toLowerCase().trim();
                  const mStats = userTaskStats[memberNameKey] || { total: 0, completed: 0, inProgress: 0 };

                  return (
                    <tr key={member.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <img
                            src={member.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140&auto=format&fit=crop&q=80'}
                            alt=""
                            style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{member.name || member.username}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>@{member.username || member.email?.split('@')[0]}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.12rem 0.4rem',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          {isOwner ? 'OWNER' : isAdmin ? 'ADMIN' : 'MEMBER'}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '0.12rem 0.45rem',
                            borderRadius: '4px',
                            background: deptStyle.bg,
                            color: deptStyle.text,
                            border: `1px solid ${deptStyle.border}`
                          }}
                        >
                          {member.department || 'Engineering & Development'}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ color: 'var(--text-main)', fontSize: '0.785rem' }}>{member.email}</div>
                        {member.phone && <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{member.phone}</div>}
                      </td>

                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ color: '#86efac', fontWeight: 600 }}>{mStats.completed} done</span>
                        <span style={{ color: 'var(--text-dim)', margin: '0 0.3rem' }}>/</span>
                        <span>{mStats.total} total</span>
                      </td>

                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleCopyContact(member)}
                            className="btn btn-secondary"
                            style={{ padding: '0.25rem 0.45rem', fontSize: '0.7rem' }}
                            title="Copy Contact"
                          >
                            <Copy size={12} />
                          </button>
                          {onOpenCreateTaskWithAssignee && (
                            <button
                              onClick={() => onOpenCreateTaskWithAssignee(member.name || member.username)}
                              className="btn btn-primary"
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.7rem', gap: '0.2rem' }}
                            >
                              <Plus size={12} />
                              <span>Assign</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'rgba(100, 116, 139, 0.2)', color: 'var(--text-main)' }}>
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ fontSize: '1.1rem' }}>Invite New Team Member</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Add members to **{activeWorkspace?.name || 'Workspace'}**
                  </p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsInviteModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} style={{ padding: '1.15rem' }}>
              <div className="form-group" style={{ marginBottom: '0.9rem' }}>
                <label className="form-label">Official Email ID *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="colleague@vortiq.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    style={{ paddingLeft: '2.4rem' }}
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '0.9rem' }}>
                <label className="form-label">Department / Unit</label>
                <select
                  className="form-select"
                  value={inviteDept}
                  onChange={(e) => setInviteDept(e.target.value)}
                >
                  {DEPARTMENTS.filter(d => d !== 'ALL').map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Workspace Access Role</label>
                <select
                  className="form-select"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="MEMBER">Member (Can edit tasks, participate in lounges)</option>
                  <option value="ADMIN">Admin (Can manage members & projects)</option>
                  <option value="VIEWER">Viewer (Read-only access)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  disabled={isInviting || !inviteEmail.trim()}
                >
                  {isInviting ? 'Sending Invite...' : 'Send Workspace Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

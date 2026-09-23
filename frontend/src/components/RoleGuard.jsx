import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, UserCheck, KeyRound } from 'lucide-react';

export default function RoleGuard({
  currentUser,
  allowedRoles = ['ROLE_ADMIN', 'ROLE_OWNER'],
  moduleName = 'This Module',
  onBackToAssigned,
  children
}) {
  const userRole = (currentUser?.role || 'ROLE_MEMBER').toUpperCase();
  const hasAccess = allowedRoles.some(role => userRole.includes(role.replace('ROLE_', '')));

  if (hasAccess) {
    return children;
  }

  return (
    <div style={{
      maxWidth: '750px',
      margin: '3rem auto',
      padding: '2.5rem 2rem',
      background: 'rgba(15, 23, 42, 0.75)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '20px',
      backdropFilter: 'blur(24px)',
      textAlign: 'center',
      boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6), 0 0 35px rgba(239, 68, 68, 0.15)'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem',
        color: '#ef4444'
      }}>
        <ShieldAlert size={36} />
      </div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        background: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        color: '#f87171',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        marginBottom: '1rem'
      }}>
        <Lock size={12} /> Restricted Access Level
      </div>

      <h2 style={{
        fontSize: '1.65rem',
        fontWeight: 800,
        color: '#f8fafc',
        marginBottom: '0.65rem',
        letterSpacing: '-0.02em'
      }}>
        Access Restricted: {moduleName}
      </h2>

      <p style={{
        color: 'var(--text-muted)',
        fontSize: '0.925rem',
        lineHeight: 1.6,
        maxWidth: '540px',
        margin: '0 auto 1.75rem'
      }}>
        You are currently signed in as <strong>{currentUser?.name || currentUser?.username || 'Standard User'}</strong> with role <span style={{ color: '#10b981', fontWeight: 700 }}>{userRole.replace('ROLE_', '')}</span>.
        This section is reserved exclusively for organizational administrators or workspace owners.
      </p>

      <div style={{
        padding: '1rem 1.25rem',
        background: 'rgba(30, 41, 59, 0.6)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '480px',
        margin: '0 auto 2rem',
        fontSize: '0.825rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <UserCheck size={18} style={{ color: '#38bdf8' }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: '#e2e8f0' }}>Your Permission Scope</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned tasks, team collaboration, document vault</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontWeight: 700 }}>
          <KeyRound size={15} />
          <span>Admin Required</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={onBackToAssigned}
          className="btn btn-primary"
          style={{ padding: '0.65rem 1.4rem', fontSize: '0.88rem', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} /> Return to My Assigned Workload
        </button>
      </div>
    </div>
  );
}

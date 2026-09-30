import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  GitPullRequest,
  Bell,
  Sliders,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

const INITIAL_AUTOMATIONS = [
  {
    id: 'auto-1',
    name: 'Auto-Assign Urgent Tasks to Team Lead',
    description: 'When any task priority is marked as URGENT, automatically reassign to Tech Lead and dispatch SMS/webhook notification.',
    trigger: 'Task Priority Updated -> URGENT',
    action: 'Assign to Deepanshi Kaushal & Send Alert',
    isActive: true,
    executionsCount: 38,
    lastRun: '14m ago',
    category: 'Routing'
  },
  {
    id: 'auto-2',
    name: 'Sync GitHub Pull Request Merge to COMPLETED',
    description: 'When a Pull Request linked to task ID is merged into main branch, transition task status to COMPLETED.',
    trigger: 'GitHub Webhook: PR Merged',
    action: 'Status -> COMPLETED & Archive Sprint Item',
    isActive: true,
    executionsCount: 142,
    lastRun: '2h ago',
    category: 'DevOps'
  },
  {
    id: 'auto-3',
    name: 'Stale Task SLA Escalation',
    description: 'If a task remains IN_PROGRESS for more than 48 hours without any commit or comment, generate an Inconvenience flag.',
    trigger: 'Time in Status > 48 Hours',
    action: 'Add Tag #Blocked & Notify Workspace Lounge',
    isActive: false,
    executionsCount: 19,
    lastRun: 'Yesterday',
    category: 'Quality'
  },
  {
    id: 'auto-4',
    name: 'Sprint Burndown Notification Broadcast',
    description: 'Post daily morning velocity summary and remaining high-priority backlog count to Slack/Discord webhook.',
    trigger: 'Cron: Daily at 09:00 AM UTC',
    action: 'Post Sprint Metrics Summary',
    isActive: true,
    executionsCount: 84,
    lastRun: 'Today 9:00 AM',
    category: 'Reporting'
  }
];

export default function AutomationsView({ onAddToast }) {
  const [automations, setAutomations] = useState(INITIAL_AUTOMATIONS);
  const [filterCategory, setFilterCategory] = useState('ALL');

  const toggleAutomation = (id) => {
    setAutomations(automations.map((a) => {
      if (a.id === id) {
        const nextState = !a.isActive;
        onAddToast?.(`Automation "${a.name}" ${nextState ? 'enabled' : 'paused'}`, nextState ? 'success' : 'info');
        return { ...a, isActive: nextState };
      }
      return a;
    }));
  };

  const handleCreateNew = () => {
    const newRule = {
      id: `auto-${Date.now()}`,
      name: 'Custom Task Status Webhook Rule',
      description: 'Trigger an external webhook payload when tasks transition status.',
      trigger: 'Task Status Change',
      action: 'POST to https://api.flowvia.internal/hooks',
      isActive: true,
      executionsCount: 0,
      lastRun: 'Never',
      category: 'Integration'
    };
    setAutomations([newRule, ...automations]);
    onAddToast?.('Created new automation rule', 'success');
  };

  const filtered = filterCategory === 'ALL'
    ? automations
    : automations.filter((a) => a.category === filterCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.9rem 1.25rem',
        backgroundColor: '#111726',
        borderRadius: '8px',
        border: '1px solid #1f2b42'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '6px',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Cpu size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Automations & Webhooks
            </h2>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>
              Trigger automated task status transitions, lead routing, and CI/CD webhooks
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              backgroundColor: '#0e1422',
              color: '#e2e8f0',
              border: '1px solid #1f2b42',
              borderRadius: '6px',
              padding: '0.4rem 0.75rem',
              fontSize: '0.785rem',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Categories</option>
            <option value="Routing">Routing</option>
            <option value="DevOps">DevOps</option>
            <option value="Quality">Quality</option>
            <option value="Reporting">Reporting</option>
          </select>

          <button
            onClick={handleCreateNew}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.785rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={14} />
            <span>New Automation</span>
          </button>
        </div>
      </div>

      {/* Rules Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map((rule) => (
          <div
            key={rule.id}
            style={{
              backgroundColor: '#111726',
              borderRadius: '8px',
              border: '1px solid #1f2b42',
              padding: '1.15rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
              transition: 'border-color 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', maxWidth: '700px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: rule.isActive ? 'rgba(99, 102, 241, 0.15)' : '#161f33',
                color: rule.isActive ? '#818cf8' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                <Cpu size={16} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                    {rule.name}
                  </h3>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#64748b',
                    backgroundColor: '#0c121e',
                    border: '1px solid #1c273c',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}>
                    {rule.category}
                  </span>
                </div>

                <p style={{ fontSize: '0.785rem', color: '#94a3b8', margin: '4px 0 8px', lineHeight: 1.4 }}>
                  {rule.description}
                </p>

                {/* Workflow Trigger -> Action pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.72rem' }}>
                  <div style={{
                    backgroundColor: '#161f33',
                    border: '1px solid #222f47',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    color: '#cbd5e1'
                  }}>
                    IF: <span style={{ color: '#818cf8', fontWeight: 600 }}>{rule.trigger}</span>
                  </div>
                  <ArrowRight size={12} color="#64748b" />
                  <div style={{
                    backgroundColor: '#161f33',
                    border: '1px solid #222f47',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    color: '#cbd5e1'
                  }}>
                    THEN: <span style={{ color: '#38bdf8', fontWeight: 600 }}>{rule.action}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Execution stats & Toggle switch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>
                  {rule.executionsCount} runs
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Last run: {rule.lastRun}
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => toggleAutomation(rule.id)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  backgroundColor: rule.isActive ? '#6366f1' : '#1e293b',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '2px',
                  transition: 'background-color 0.2s ease',
                  flexShrink: 0
                }}
                title={rule.isActive ? 'Click to Pause' : 'Click to Enable'}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  transform: rule.isActive ? 'translateX(20px)' : 'translateX(0)',
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

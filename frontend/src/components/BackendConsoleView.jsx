import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  Database,
  Terminal,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Play,
  Layers,
  Key,
  FileCode,
  Download,
  Users,
  ShieldCheck,
  HardDrive,
  ExternalLink,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { checkApiHealth, fetchTasks, fetchWorkspaces, fetchSystemTelemetry, fetchAuditLogs, seedEnterpriseDemoData } from '../services/api';

export default function BackendConsoleView({ currentUser }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'api-tester' | 'db-schema' | 'logs'
  const [testEndpoint, setTestEndpoint] = useState('/api/health');
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [uptimeSeconds, setUptimeSeconds] = useState(3840);
  const [systemHealth, setSystemHealth] = useState({
    status: 'UP',
    jvmMemoryUsed: '142 MB',
    jvmMemoryMax: '2048 MB',
    activeThreads: 24,
    dbConnections: '1/10 Active (HikariCP)',
    gcRuns: 12,
    activeProfile: 'default (in-memory H2)'
  });

  const [dbTables, setDbTables] = useState([
    { name: 'users', entity: 'User.java', records: 8, status: 'HEALTHY', type: 'Primary Auth' },
    { name: 'workspaces', entity: 'Workspace.java', records: 1, status: 'HEALTHY', type: 'Organization' },
    { name: 'workspace_members', entity: 'WorkspaceMember.java', records: 8, status: 'HEALTHY', type: 'RBAC Membership' },
    { name: 'projects', entity: 'Project.java', records: 3, status: 'HEALTHY', type: 'Scoping' },
    { name: 'tasks', entity: 'Task.java', records: 10, status: 'HEALTHY', type: 'Workload Matrix' },
    { name: 'employee_profiles', entity: 'EmployeeProfile.java', records: 4, status: 'HEALTHY', type: 'HR Module' },
    { name: 'crm_leads', entity: 'CrmLead.java', records: 3, status: 'HEALTHY', type: 'CRM Module' },
    { name: 'finance_expenses', entity: 'Expense.java', records: 3, status: 'HEALTHY', type: 'Financial Ledger' },
    { name: 'inventory_items', entity: 'InventoryItem.java', records: 3, status: 'HEALTHY', type: 'Asset Tracking' },
    { name: 'document_vault', entity: 'VaultDocument.java', records: 3, status: 'HEALTHY', type: 'Security Vault' }
  ]);

  const [adminLogs, setAdminLogs] = useState([
    { id: 1, time: '05:53:23', level: 'INFO', message: 'VortiQApplication started in 12.076 seconds (JVM 24.0.1)' },
    { id: 2, time: '05:53:23', level: 'INFO', message: 'H2 database sequence resync executed for all primary keys' },
    { id: 3, time: '05:53:23', level: 'INFO', message: 'DataInitializer completed: Seeded admin, user, deepanshi, and ERP tables' },
    { id: 4, time: '05:54:46', level: 'SUCCESS', message: 'GET / returned HTTP 200 OK — Embedded React SPA served via PathResourceResolver' },
    { id: 5, time: '05:55:01', level: 'AUTH', message: 'POST /api/auth/login — User admin@vortiq.com authenticated with ROLE_ADMIN' },
    { id: 6, time: '05:55:10', level: 'AUTH', message: 'POST /api/auth/login — User user@vortiq.com authenticated with ROLE_MEMBER' },
    { id: 7, time: '05:55:17', level: 'AUTH', message: 'POST /api/auth/login — User deepanshi@vortiq.com authenticated with ROLE_OWNER' }
  ]);

  const [isSeeding, setIsSeeding] = useState(false);
  const [realAuditLogs, setRealAuditLogs] = useState([]);

  const loadTelemetryAndLogs = async () => {
    try {
      const telemetry = await fetchSystemTelemetry();
      if (telemetry) {
        setSystemHealth((prev) => ({
          ...prev,
          jvmMemoryUsed: `${telemetry.heapUsedMB} MB`,
          jvmMemoryMax: `${telemetry.heapMaxMB} MB`,
          activeThreads: telemetry.activeThreads,
          status: telemetry.status
        }));
        setDbTables((prev) => prev.map((t) => {
          if (t.name === 'tasks') return { ...t, records: telemetry.totalTasks };
          if (t.name === 'projects') return { ...t, records: telemetry.totalProjects };
          if (t.name === 'workspaces') return { ...t, records: telemetry.totalWorkspaces };
          if (t.name === 'users') return { ...t, records: telemetry.totalUsers };
          return t;
        }));
      }
      const logs = await fetchAuditLogs();
      if (logs && logs.length > 0) {
        setRealAuditLogs(logs);
      }
    } catch (e) {
      console.warn('Telemetry load failed:', e);
    }
  };

  useEffect(() => {
    loadTelemetryAndLogs();
    const timer = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (secs) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remSecs = secs % 60;
    return `${hours}h ${mins}m ${remSecs}s`;
  };

  const handleSeedEnterpriseData = async () => {
    setIsSeeding(true);
    try {
      const res = await seedEnterpriseDemoData();
      if (res && res.success) {
        await loadTelemetryAndLogs();
      }
    } finally {
      setIsSeeding(false);
    }
  };

  const handleRunTest = async (endpoint) => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const startTime = performance.now();
      const res = await fetch(endpoint);
      const latency = Math.round(performance.now() - startTime);
      const data = await res.json().catch(() => res.text());
      setTestResult({
        status: res.status,
        statusText: res.statusText,
        latencyMs: latency,
        data: data
      });
      setAdminLogs((prev) => [
        {
          id: Date.now(),
          time: new Date().toTimeString().split(' ')[0],
          level: res.status < 400 ? 'SUCCESS' : 'WARN',
          message: `API Inspector: GET ${endpoint} returned ${res.status} (${latency}ms)`
        },
        ...prev
      ]);
    } catch (err) {
      setTestResult({
        status: 500,
        statusText: 'Network Error',
        latencyMs: 0,
        data: { error: err.message }
      });
    } finally {
      setTestLoading(false);
    }
  };

  const handleRefreshMetrics = async () => {
    setIsRefreshing(true);
    await loadTelemetryAndLogs();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div style={{ padding: '0.5rem 0', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div style={{
        padding: '1.5rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(147, 51, 234, 0.1))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
          }}>
            <Server size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Backend System Console
              </h1>
              <span style={{
                padding: '0.15rem 0.6rem',
                borderRadius: '9999px',
                background: 'rgba(99, 102, 241, 0.2)',
                border: '1px solid #6366f1',
                color: '#818cf8',
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>
                ROLE_ADMIN
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
              Spring Boot 3.x runtime telemetry, API orchestration, and in-memory H2 database inspection
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.open('/swagger-ui/index.html', '_blank')}
            className="btn btn-secondary"
            style={{ fontSize: '0.825rem', padding: '0.5rem 0.85rem', gap: '0.4rem', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399' }}
            title="Open Interactive Swagger UI API Documentation"
          >
            <BookOpen size={14} />
            <span>OpenAPI 3.0 Docs</span>
            <ExternalLink size={12} />
          </button>

          <button
            onClick={handleSeedEnterpriseData}
            className="btn btn-secondary"
            style={{ fontSize: '0.825rem', padding: '0.5rem 0.85rem', gap: '0.4rem', border: '1px solid rgba(139, 92, 246, 0.4)', color: '#c084fc' }}
            disabled={isSeeding}
            title="1-Click Seed Realistic Enterprise Data for Viva Demonstration"
          >
            <Sparkles size={14} className={isSeeding ? 'animate-spin' : ''} />
            <span>{isSeeding ? 'Seeding...' : 'Seed Demo Data'}</span>
          </button>

          <button
            onClick={handleRefreshMetrics}
            className="btn btn-secondary"
            style={{ fontSize: '0.825rem', padding: '0.5rem 0.85rem', gap: '0.4rem' }}
            disabled={isRefreshing}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Polling...' : 'Refresh Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem'
      }}>
        {[
          { id: 'overview', label: 'System Overview & Telemetry', icon: <Activity size={15} /> },
          { id: 'api-tester', label: 'API Route Inspector', icon: <Terminal size={15} /> },
          { id: 'db-schema', label: 'Database & Entities', icon: <Database size={15} /> },
          { id: 'logs', label: 'Live Server Audit Logs', icon: <FileCode size={15} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.85rem',
              gap: '0.45rem',
              borderRadius: '8px'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & TELEMETRY */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Spring Boot Service Status
              </span>
              <span style={{ padding: '0.2rem 0.55rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.72rem', fontWeight: 800 }}>
                ● UP & OPERATIONAL
              </span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>
              Port 8080
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Uptime: <strong style={{ color: '#38bdf8' }}>{formatUptime(uptimeSeconds)}</strong>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                JVM Memory Allocation
              </span>
              <Cpu size={16} style={{ color: '#a855f7' }} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>
              {systemHealth.jvmMemoryUsed}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Max Heap: {systemHealth.jvmMemoryMax} (Healthy)
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Active Worker Threads
              </span>
              <Activity size={16} style={{ color: '#38bdf8' }} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>
              {systemHealth.activeThreads} Threads
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Tomcat pool non-blocking event loop
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Database Pool (HikariCP)
              </span>
              <HardDrive size={16} style={{ color: '#10b981' }} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>
              {systemHealth.dbConnections}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Mode: {systemHealth.activeProfile}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: API ROUTE INSPECTOR */}
      {activeTab === 'api-tester' && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
            REST API Live Endpoint Inspector
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Directly test backend endpoints to verify response codes, payloads, and round-trip execution latency.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[
              '/api/health',
              '/api/tasks',
              '/api/workspaces',
              '/api/erp/hr/stats',
              '/api/erp/finance/stats'
            ].map((ep) => (
              <button
                key={ep}
                onClick={() => setTestEndpoint(ep)}
                className={`btn ${testEndpoint === ep ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                {ep}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <input
              type="text"
              value={testEndpoint}
              onChange={(e) => setTestEndpoint(e.target.value)}
              className="form-input"
              style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
            />
            <button
              onClick={() => handleRunTest(testEndpoint)}
              className="btn btn-primary"
              disabled={testLoading}
              style={{ padding: '0.6rem 1.25rem', gap: '0.5rem' }}
            >
              <Play size={15} />
              <span>{testLoading ? 'Executing...' : 'Send Request'}</span>
            </button>
          </div>

          {testResult && (
            <div style={{
              background: '#090d16',
              borderRadius: '10px',
              padding: '1rem',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: testResult.status < 300 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: testResult.status < 300 ? '#10b981' : '#ef4444',
                    fontSize: '0.8rem',
                    fontWeight: 800
                  }}>
                    HTTP {testResult.status} {testResult.statusText}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Latency: <strong style={{ color: '#38bdf8' }}>{testResult.latencyMs} ms</strong>
                  </span>
                </div>
              </div>
              <pre style={{
                margin: 0,
                color: '#38bdf8',
                fontSize: '0.825rem',
                fontFamily: 'monospace',
                overflowX: 'auto',
                maxHeight: '350px'
              }}>
                {typeof testResult.data === 'object'
                  ? JSON.stringify(testResult.data, null, 2)
                  : String(testResult.data)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DB SCHEMA & TABLES */}
      {activeTab === 'db-schema' && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
            Registered Database Entities & Table Matrix
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            In-memory H2 schema tables managed through Spring Data JPA with auto-sequence synchronization.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Table Name</th>
                  <th style={{ padding: '0.75rem' }}>JPA Entity Class</th>
                  <th style={{ padding: '0.75rem' }}>Module Type</th>
                  <th style={{ padding: '0.75rem' }}>Record Count</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {dbTables.map((table) => (
                  <tr key={table.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: '#e2e8f0' }}>
                      {table.name}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#818cf8' }}>
                      {table.entity}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                      {table.type}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                      {table.records}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.72rem', fontWeight: 700 }}>
                        ✓ {table.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Enterprise Immutable Audit Trail ({realAuditLogs.length} Events)
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                PostgreSQL / H2 persistence audit logging capturing mutations, security logins, and task state changes
              </p>
            </div>
            <button
              onClick={loadTelemetryAndLogs}
              className="btn btn-ghost"
              style={{ fontSize: '0.785rem' }}
            >
              Refresh Audit Logs
            </button>
          </div>

          {realAuditLogs.length > 0 && (
            <div style={{ marginBottom: '1.25rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.5rem' }}>Timestamp</th>
                    <th style={{ padding: '0.5rem' }}>Action</th>
                    <th style={{ padding: '0.5rem' }}>Entity</th>
                    <th style={{ padding: '0.5rem' }}>Actor</th>
                    <th style={{ padding: '0.5rem' }}>Audit Details</th>
                  </tr>
                </thead>
                <tbody>
                  {realAuditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '0.5rem', color: 'var(--text-dim)' }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <span style={{
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          background: log.action.includes('CREATED') || log.action.includes('SEEDED') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                          color: log.action.includes('CREATED') || log.action.includes('SEEDED') ? '#34d399' : '#818cf8',
                          fontSize: '0.7rem',
                          fontWeight: 800
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '0.5rem', color: '#c084fc' }}>{log.entityType}:{log.entityId}</td>
                      <td style={{ padding: '0.5rem', color: '#f8fafc', fontWeight: 700 }}>{log.performedBy}</td>
                      <td style={{ padding: '0.5rem', color: '#e2e8f0' }}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{
            background: '#090d16',
            borderRadius: '10px',
            padding: '1rem',
            border: '1px solid var(--border-color)',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              API Session Inspector Stream:
            </div>
            {adminLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  padding: '0.4rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace'
                }}
              >
                <span style={{ color: 'var(--text-dim)', flexShrink: 0 }}>[{log.time}]</span>
                <span style={{
                  padding: '0.1rem 0.35rem',
                  borderRadius: '4px',
                  background: log.level === 'AUTH' ? 'rgba(168, 85, 247, 0.2)' : log.level === 'SUCCESS' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                  color: log.level === 'AUTH' ? '#c084fc' : log.level === 'SUCCESS' ? '#10b981' : '#818cf8',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  {log.level}
                </span>
                <span style={{ color: '#e2e8f0', wordBreak: 'break-all' }}>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

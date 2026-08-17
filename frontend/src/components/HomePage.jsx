import React from 'react';
import {
  Sparkles,
  Kanban,
  ShieldCheck,
  Users,
  Zap,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Clock,
  Layout,
  Table,
  ChevronRight,
  Globe
} from 'lucide-react';
import VortiqLogo from './VortiqLogo';

export default function HomePage({ onOpenAuth, onOpenSignUp, onEnterApp, currentUser }) {
  return (
    <div className="home-page-wrapper" style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-main)', overflowX: 'hidden' }}>
      
      {/* Top Header Navigation Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(20px)',
        backgroundColor: 'var(--bg-glass)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }} onClick={onEnterApp}>
          <VortiqLogo size={28} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, background: 'linear-gradient(135deg, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              TaskPulse <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary-glow)', WebkitTextFillColor: 'initial', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(225, 29, 72, 0.15)', border: '1px solid rgba(225, 29, 72, 0.3)' }}>VortiQ</span>
            </div>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }} className="desktop-only">
          <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, transition: 'color 0.2s' }}>Features</a>
          <a href="#ai-bot" style={{ color: '#ff6b87', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles size={13} />
            <span>AI Bot</span>
          </a>
          <a href="#security" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, transition: 'color 0.2s' }}>OTP Security</a>
          <a href="#workspaces" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, transition: 'color 0.2s' }}>Workspaces</a>
          <a href="#analytics" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, transition: 'color 0.2s' }}>Analytics</a>
        </nav>

        {/* Right CTA Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {currentUser ? (
            <button className="btn btn-primary" onClick={onEnterApp} style={{ gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <span>Workspace</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => onOpenAuth('login')} style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}>
                Sign In
              </button>
              <button className="btn btn-gradient" onClick={() => onOpenSignUp()} style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem', gap: '0.35rem' }}>
                <Sparkles size={14} />
                <span>Get Started</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '5rem 1.5rem 4rem',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        {/* Glowing Background Orbs */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(225, 29, 72, 0.2) 0%, rgba(99, 102, 241, 0.1) 50%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            background: 'rgba(225, 29, 72, 0.12)',
            border: '1px solid rgba(225, 29, 72, 0.3)',
            color: '#ff6b87',
            fontSize: '0.8125rem',
            fontWeight: 700,
            marginBottom: '1.75rem'
          }}>
            <ShieldCheck size={16} />
            <span>New: OTP-Verified Account Registration & Cloud/Local Sync</span>
          </div>

          {/* Hero Heading */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-1px',
            marginBottom: '1.25rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Master Your Projects with <br />
            <span style={{
              background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 50%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Speed, Clarity & Security
            </span>
          </h1>

          <p style={{
            fontSize: '1.125rem',
            color: 'var(--text-muted)',
            maxWidth: '680px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6
          }}>
            TaskPulse combines high-performance Kanban boards, team workspace management, OTP sign-up verification, and instant offline/cloud persistence.
          </p>

          {/* CTA Group */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-gradient" onClick={() => (currentUser ? onEnterApp() : onOpenSignUp())} style={{ padding: '0.85rem 2rem', fontSize: '1rem', gap: '0.6rem', boxShadow: '0 8px 30px rgba(225, 29, 72, 0.4)' }}>
              <Sparkles size={18} />
              <span>{currentUser ? 'Go to Main Dashboard' : 'Create Free Account (OTP Sign Up)'}</span>
            </button>
            <button className="btn btn-secondary" onClick={onEnterApp} style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', gap: '0.5rem' }}>
              <Kanban size={18} />
              <span>Try Live Dashboard</span>
            </button>
          </div>
        </div>

        {/* Live Interactive Preview Card */}
        <div style={{ marginTop: '4rem', position: 'relative', zIndex: 1 }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>taskpulse.vortiq.app/kanban-board</span>
              </div>
              <span className="badge badge-high" style={{ fontSize: '0.725rem' }}>Live Demo Preview</span>
            </div>

            {/* Kanban Column Mock preview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', textAlign: 'left' }}>
              
              {/* Column 1: TODO */}
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: '10px', padding: '0.85rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>TO DO</span>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>2</span>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.5rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>Integrate OTP Email Dispatch</div>
                  <span className="badge badge-urgent" style={{ fontSize: '0.65rem' }}>URGENT</span>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>Setup Landing Page UI</div>
                  <span className="badge badge-medium" style={{ fontSize: '0.65rem' }}>MEDIUM</span>
                </div>
              </div>

              {/* Column 2: IN PROGRESS */}
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: '10px', padding: '0.85rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8' }}>IN PROGRESS</span>
                  <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>1</span>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>Glassmorphic Kanban Drag & Drop</div>
                  <span className="badge badge-high" style={{ fontSize: '0.65rem' }}>HIGH</span>
                </div>
              </div>

              {/* Column 3: COMPLETED */}
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: '10px', padding: '0.85rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981' }}>COMPLETED</span>
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>2</span>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.5rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>Spring Boot H2 Persistence</div>
                  <span className="badge badge-low" style={{ fontSize: '0.65rem' }}>COMPLETED</span>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>LocalStorage Offline Caching</div>
                  <span className="badge badge-low" style={{ fontSize: '0.65rem' }}>COMPLETED</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Options & Features Grid Section */}
      <section id="features" style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Built for High-Velocity Teams & Creators
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Everything you need to plan, track, and ship tasks with complete confidence.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {/* Feature 0: Omnipresent VortiQ AI Bot */}
          <div id="ai-bot" className="glass-panel" style={{ padding: '1.75rem', borderRadius: '14px', border: '1px solid rgba(225, 29, 72, 0.4)', background: 'linear-gradient(135deg, rgba(42, 9, 14, 0.8), rgba(99, 102, 241, 0.1))', transition: 'transform 0.2s', cursor: 'default' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'linear-gradient(135deg, #e11d48, #6366f1)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', boxShadow: '0 4px 15px rgba(225, 29, 72, 0.4)' }}>
              <Sparkles size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span>VortiQ AI Copilot & Bot</span>
              <span className="badge badge-urgent" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>NEW</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Embedded AI assistant with voice input, Google Gemini integration, 1-click Kanban task creation, sprint velocity audits, and four specialized personas.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-high" style={{ fontSize: '0.725rem' }}>Voice Speech</span>
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', fontSize: '0.725rem' }}>Gemini 1.5</span>
              <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '0.725rem' }}>1-Click Tasks</span>
            </div>
          </div>

          {/* Option 1: Kanban & Table Views */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '14px', border: '1px solid var(--border-color)', transition: 'transform 0.2s', cursor: 'default' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(225, 29, 72, 0.15)', color: '#ff6b87', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Kanban size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Kanban & Table Views</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Switch seamlessly between visual Kanban boards and detailed tabular grids with real-time status stage updates.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '0.725rem' }}>Drag & Drop</span>
              <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '0.725rem' }}>Priority Tags</span>
            </div>
          </div>

          {/* Option 2: OTP Verified Authentication */}
          <div id="security" className="glass-panel" style={{ padding: '1.75rem', borderRadius: '14px', border: '1px solid var(--border-color)', transition: 'transform 0.2s', cursor: 'default' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Lock size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>OTP Sign-Up Verification</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Two-step registration flow featuring 6-digit One-Time Password (OTP) verification before granting workspace access.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '0.725rem' }}>6-Digit OTP</span>
              <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '0.725rem' }}>Secure Auth</span>
            </div>
          </div>

          {/* Option 3: Workspace Collaboration */}
          <div id="workspaces" className="glass-panel" style={{ padding: '1.75rem', borderRadius: '14px', border: '1px solid var(--border-color)', transition: 'transform 0.2s', cursor: 'default' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Users size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Workspace Collaboration</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Organize tasks by workspaces and projects. Manage team invitations and user access roles (Owner, Admin, Member).
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '0.725rem' }}>Multi-Workspace</span>
              <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '0.725rem' }}>Role Access</span>
            </div>
          </div>

          {/* Option 4: Hybrid Local & Cloud Persistence */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '14px', border: '1px solid var(--border-color)', transition: 'transform 0.2s', cursor: 'default' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Zap size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Offline & Cloud Persistence</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              All task updates, profile changes, and workspaces auto-save to browser `localStorage` and sync with Spring Boot backend APIs.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '0.725rem' }}>Auto-Save</span>
              <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '0.725rem' }}>Offline First</span>
            </div>
          </div>

          {/* Option 5: Analytics & Reporting */}
          <div id="analytics" className="glass-panel" style={{ padding: '1.75rem', borderRadius: '14px', border: '1px solid var(--border-color)', transition: 'transform 0.2s', cursor: 'default' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <BarChart3 size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Analytics & CSV Export</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Get real-time productivity statistics, track completion rates, and export task reports instantly to CSV spreadsheets.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '0.725rem' }}>Real-Time Stats</span>
              <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '0.725rem' }}>CSV Export</span>
            </div>
          </div>

          {/* Option 6: Keyboard Shortcuts & Quick Search */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '14px', border: '1px solid var(--border-color)', transition: 'transform 0.2s', cursor: 'default' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Clock size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Fast Keyboard Shortcuts</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Boost workflow efficiency with quick keyboard shortcuts (Ctrl+K search, 'N' for new task, 'V' to toggle Kanban/Table view).
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '0.725rem' }}>Ctrl + K</span>
              <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '0.725rem' }}>Hotkeys</span>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem 2rem', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.15), rgba(99, 102, 241, 0.15))', border: '1px solid rgba(225, 29, 72, 0.3)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>
            Ready to Organize Your Tasks?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '540px', margin: '0 auto 2rem' }}>
            Join TaskPulse today and experience seamless project management with OTP registration and instant data saving.
          </p>
          <button className="btn btn-gradient" onClick={() => (currentUser ? onEnterApp() : onOpenSignUp())} style={{ padding: '0.85rem 2.25rem', fontSize: '1rem', gap: '0.6rem' }}>
            <Sparkles size={18} />
            <span>{currentUser ? 'Open Workspace Dashboard' : 'Sign Up with OTP Verification'}</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <VortiqLogo size={20} />
          <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>TaskPulse VortiQ Studio</span>
        </div>
        <p>© 2026 VortiQ Studio. All user data auto-saved to LocalStorage and Spring Boot REST backend.</p>
      </footer>

    </div>
  );
}

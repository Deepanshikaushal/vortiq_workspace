import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K', desc: 'Focus Global Search Bar' },
    { key: 'N', desc: 'Open Create Task Dialog' },
    { key: 'V', desc: 'Toggle View (Kanban / Matrix)' },
    { key: 'D', desc: 'Toggle Dark / Light Theme' },
    { key: '?', desc: 'Show Keyboard Shortcuts' },
    { key: 'Esc', desc: 'Close Modal / Drawer' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      zIndex: 150,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem', position: 'relative' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(225, 29, 72, 0.25)', border: '1px solid var(--border-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff859b' }}>
              <Keyboard size={20} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: '800' }}>
                Keyboard Shortcuts
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Speed up your workflow with hotkeys
              </p>
            </div>
          </div>

          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)'
              }}
            >
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>
                {sc.desc}
              </span>
              <kbd style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-glow)',
                color: '#ff859b',
                boxShadow: '0 2px 5px rgba(0,0,0,0.4)'
              }}>
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Press <kbd style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Esc</kbd> anytime to dismiss overlays.
        </div>

      </div>
    </div>
  );
}

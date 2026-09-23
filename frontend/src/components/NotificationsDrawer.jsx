import React, { useState, useEffect } from 'react';
import { Bell, Check, X, AlertCircle, CheckCircle2, Info, ArrowRight } from 'lucide-react';

const API_BASE = '/api/notifications';

export default function NotificationsDrawer({ isOpen, onClose, currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}?userId=1`).then(r => r.json());
      setNotifications(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await fetch(`${API_BASE}/${id}/read`, { method: 'PATCH' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API_BASE}/mark-all-read?userId=1`, { method: 'POST' });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-white/10 shadow-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-purple-400" />
                <h2 className="text-lg font-bold text-white">Notifications</h2>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleMarkAllRead}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                >
                  Mark all as read
                </button>
                <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {notifications.map((n) => (
                <div 
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    n.isRead 
                      ? 'bg-slate-800/30 border-white/5 opacity-75' 
                      : 'bg-slate-800/70 border-purple-500/30 shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-sm text-white">{n.title}</div>
                    {!n.isRead && (
                      <button 
                        onClick={() => handleMarkAsRead(n.id)}
                        className="text-xs text-purple-400 hover:text-purple-300"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{n.message}</p>
                  <div className="text-[10px] text-slate-500 mt-2 font-mono">
                    {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No notifications yet. You're all caught up!
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-all"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}

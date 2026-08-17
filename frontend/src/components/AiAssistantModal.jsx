import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, X, Send, Plus, CheckCircle2, Zap, BarChart3, 
  MessageSquare, Lightbulb, ArrowRight, Loader2, Copy, Check
} from 'lucide-react';
import { askAiCopilot, generateAiTasks } from '../services/api';

const QUICK_PROMPTS = [
  "⚡ Generate tasks for Stripe payment integration",
  "📊 Analyze workspace health & velocity",
  "🔍 Identify potential project bottlenecks",
  "🎨 Plan UI redesign for dark mode glassmorphism",
  "🛡️ Security checklist for JWT authentication"
];

export default function AiAssistantModal({
  isOpen,
  onClose,
  activeWorkspace,
  activeProject,
  tasks = [],
  onAddTasksBatch,
  addToast
}) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'generator' | 'insights'
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `👋 Hi! I am **VortiQ AI Copilot**.\n\nI can **auto-generate tasks**, review your **sprint velocity**, enhance requirements with acceptance criteria, or answer technical architecture questions for **${activeWorkspace?.name || 'your workspace'}**.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        "⚡ Generate sprint tasks for Next Feature",
        "📊 Analyze current workspace health",
        "💡 Suggest priority adjustments"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Generator Tab State
  const [generatorPrompt, setGeneratorPrompt] = useState('');
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [addedBatch, setAddedBatch] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await askAiCopilot({
        message: text.trim(),
        workspaceName: activeWorkspace?.name,
        workspaceId: activeWorkspace?.id,
        projectId: activeProject?.id,
        taskCount: tasks.length,
        recentTasks: tasks.slice(0, 10)
      });

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: response.suggestions || [],
        generatedTasks: response.generatedTasks || null,
        insights: response.insights || null
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "I'm ready to help! Try asking me to generate tasks for your next sprint feature or check project health metrics.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTasksTab = async (e) => {
    e.preventDefault();
    if (!generatorPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setAddedBatch(false);

    try {
      const result = await generateAiTasks(
        generatorPrompt.trim(),
        activeProject?.id || 1,
        activeWorkspace?.id || 1
      );
      setGeneratedTasks(result || []);
      if (addToast) addToast(`✨ AI generated ${result.length} structured work items!`, 'success');
    } catch (err) {
      if (addToast) addToast('Failed to generate tasks. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddAllGenerated = () => {
    if (!generatedTasks.length || !onAddTasksBatch) return;
    onAddTasksBatch(generatedTasks);
    setAddedBatch(true);
    if (addToast) addToast(`🚀 Added ${generatedTasks.length} AI-generated tasks to Kanban Board!`, 'success');
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(12px)',
      zIndex: 150,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div 
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '780px',
          height: '85vh',
          maxHeight: '760px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: '#334155',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#f8fafc'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: '700' }}>
                  VortiQ AI Copilot
                </h2>
                <span style={{
                  fontSize: '0.65rem',
                  padding: '0.12rem 0.45rem',
                  borderRadius: '9999px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#86efac',
                  fontWeight: '600',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}>
                  ACTIVE • 24/7
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Intelligent workspace copilot & sprint architect
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '0.2rem', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setActiveTab('chat')}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'chat' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'chat' ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                💬 Copilot Chat
              </button>
              <button
                onClick={() => setActiveTab('generator')}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'generator' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'generator' ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                ⚡ Task Generator
              </button>
            </div>

            <button className="btn btn-secondary btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab 1: Copilot Chat */}
        {activeTab === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            {/* Messages Scroll Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    padding: '0.85rem 1.05rem',
                    borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: m.sender === 'user' 
                      ? 'linear-gradient(135deg, #334155, #1e293b)'
                      : 'var(--bg-card)',
                    color: m.sender === 'user' ? '#f8fafc' : 'var(--text-main)',
                    border: m.sender === 'user' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                    position: 'relative'
                  }}>
                    {m.text}

                    {/* If message generated tasks, render 1-click add card */}
                    {m.generatedTasks && m.generatedTasks.length > 0 && (
                      <div style={{
                        marginTop: '0.85rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                          ✨ Generated Work Items ({m.generatedTasks.length}):
                        </div>
                        {m.generatedTasks.map((gt, idx) => (
                          <div key={idx} style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span>📌 {gt.title}</span>
                            <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--bg-tertiary)' }}>
                              {gt.priority}
                            </span>
                          </div>
                        ))}
                        <button
                          className="btn btn-primary"
                          style={{ marginTop: '0.4rem', width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}
                          onClick={() => {
                            if (onAddTasksBatch) {
                              onAddTasksBatch(m.generatedTasks);
                              if (addToast) addToast(`🚀 Added ${m.generatedTasks.length} tasks to Kanban board!`, 'success');
                            }
                          }}
                        >
                          <Zap size={14} /> Add All {m.generatedTasks.length} Tasks to Kanban Board
                        </button>
                      </div>
                    )}
                  </div>

                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem', padding: '0 0.25rem' }}>
                    {m.sender === 'user' ? 'You' : 'VortiQ AI'} • {m.time}
                  </span>

                  {/* Suggestion Chips */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                      {m.suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(s)}
                          style={{
                            padding: '0.25rem 0.65rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            borderRadius: '9999px',
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Lightbulb size={12} color="var(--accent-amber)" />
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Loader2 size={16} className="animate-spin" color="var(--primary)" />
                  <span>VortiQ AI is reasoning and generating response...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Bar */}
            <div style={{
              padding: '0.5rem 1.25rem',
              overflowX: 'auto',
              display: 'flex',
              gap: '0.5rem',
              borderTop: '1px solid var(--border-color)',
              background: 'rgba(15, 23, 42, 0.4)'
            }}>
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.725rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div style={{
              padding: '1rem 1.25rem',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center'
            }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, padding: '0.75rem 1rem' }}
                placeholder="Ask VortiQ AI or type 'Generate tasks for...'"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                <span>Send</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Structured Task Generator */}
        {activeTab === 'generator' && (
          <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.35rem' }}>
                ⚡ Auto-Generate Sprint Work Items
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Describe a milestone, feature, or bug fix. AI will break it down into modular tasks with acceptance criteria and suggested priorities.
              </p>
            </div>

            <form onSubmit={handleGenerateTasksTab} style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, padding: '0.75rem 1rem' }}
                placeholder="e.g. Build User Profile management with avatar upload & password reset"
                value={generatorPrompt}
                onChange={(e) => setGeneratorPrompt(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isGenerating || !generatorPrompt.trim()}
                style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                <span>Generate</span>
              </button>
            </form>

            {/* Generated Items Preview */}
            {generatedTasks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                    Generated Tasks ({generatedTasks.length})
                  </span>
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}
                    onClick={handleAddAllGenerated}
                    disabled={addedBatch}
                  >
                    {addedBatch ? <CheckCircle2 size={16} /> : <Zap size={16} />}
                    {addedBatch ? 'Added to Board!' : '⚡ Add All to Kanban Board'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                  {generatedTasks.map((t, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: t.priority === 'URGENT' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                          color: t.priority === 'URGENT' ? '#ef4444' : '#3b82f6'
                        }}>
                          {t.priority}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {t.category}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '0.9rem', fontWeight: '700', lineHeight: '1.3' }}>
                        {t.title}
                      </h4>

                      <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                        {t.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

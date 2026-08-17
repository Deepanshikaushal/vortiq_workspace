import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Bot,
  X,
  Minus,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Trash2,
  Copy,
  Check,
  Plus,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  HelpCircle,
  Code2,
  Key,
  Layers,
  CheckCircle2,
  Maximize2,
  RefreshCw,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import {
  askAiCopilot,
  getStoredGeminiApiKey,
  saveStoredGeminiApiKey
} from '../services/api';

const STORAGE_CHAT_KEY = 'vortiq_ai_bot_conversation';
const STORAGE_SOUND_KEY = 'vortiq_ai_bot_sound';
const STORAGE_VOICE_KEY = 'vortiq_ai_bot_voice';

const PERSONAS = [
  {
    id: 'sprint-architect',
    name: 'Sprint Architect',
    icon: Zap,
    color: '#e11d48',
    description: 'Sprint breakdown, user stories & task planning'
  },
  {
    id: 'code-auditor',
    name: 'Code & Security',
    icon: Shield,
    color: '#6366f1',
    description: 'Architecture review, security audits & JPA logic'
  },
  {
    id: 'velocity-analyst',
    name: 'Velocity Analyst',
    icon: BarChart3,
    color: '#10b981',
    description: 'Sprint health, velocity metrics & bottleneck audit'
  },
  {
    id: 'site-guide',
    name: 'Platform Guide',
    icon: HelpCircle,
    color: '#f59e0b',
    description: 'TaskPulse navigation, shortcuts & feature help'
  }
];

// Web Audio API Synthesizer for lightweight futuristic chimes
function playChime(type = 'receive') {
  try {
    const isSoundEnabled = localStorage.getItem(STORAGE_SOUND_KEY) !== 'false';
    if (!isSoundEnabled) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'receive') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'action') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {
    // Ignore audio context block
  }
}

export default function AiBotWidget({
  activeWorkspace,
  activeProject,
  tasks = [],
  currentUser,
  pageView = 'home',
  onAddTask,
  onAddTasksBatch,
  onSetStatusFilter,
  onSetPriorityFilter,
  onSetSearchQuery,
  onSetTheme,
  onNavigateView,
  onEnterApp,
  addToast
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activePersona, setActivePersona] = useState(PERSONAS[0]);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHAT_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'initial-welcome',
        sender: 'ai',
        text: `👋 Greetings! I am **VortiQ AI Bot**, your enterprise workspace co-pilot.\n\nI can **auto-create tasks**, analyze **sprint velocity**, review **system architecture**, or guide you through the platform.\n\n*Try asking me:* \`"Create task: Setup Redis Cache"\` or \`"Analyze workspace health"\`!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          '⚡ Generate sprint tasks for Next Feature',
          '📊 Analyze workspace velocity',
          '🛡️ Security audit for JWT Auth',
          '🎨 Switch workspace theme'
        ],
        modelUsed: 'VortiQ Neural Copilot 2.0'
      }
    ];
  });

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(getStoredGeminiApiKey());
  const [isSoundOn, setIsSoundOn] = useState(() => localStorage.getItem(STORAGE_SOUND_KEY) !== 'false');
  const [isTtsOn, setIsTtsOn] = useState(() => localStorage.getItem(STORAGE_VOICE_KEY) === 'true');
  const [copiedId, setCopiedId] = useState(null);
  const [addedTasksMap, setAddedTasksMap] = useState({});

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Sync messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages.slice(-40)));
    } catch (e) {}
  }, [messages]);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Initialize Web Speech API Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputVal(prev => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      addToast?.('Voice recognition is not supported in this browser.', 'info');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        playChime('action');
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const speakText = (text) => {
    if (!isTtsOn || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*_#`\[\]]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean.slice(0, 280));
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  const handleSendMessage = async (customPrompt) => {
    const text = customPrompt || inputVal;
    if (!text || !text.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputVal('');
    setIsLoading(true);
    playChime('send');

    try {
      const response = await askAiCopilot({
        message: text.trim(),
        workspaceName: activeWorkspace?.name || 'VortiQ Workspace',
        workspaceId: activeWorkspace?.id,
        projectId: activeProject?.id,
        taskCount: tasks.length,
        recentTasks: tasks.slice(0, 8),
        persona: activePersona.id
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: response.suggestions || [],
        generatedTasks: response.generatedTasks || null,
        insights: response.insights || null,
        modelUsed: response.modelUsed || 'VortiQ Neural Copilot 2.0',
        action: response.action || null
      };

      setMessages(prev => [...prev, aiMessage]);
      playChime(response.action ? 'action' : 'receive');
      speakText(response.response);

      // Execute autonomous UI actions
      if (response.action) {
        handleExecuteBotAction(response.action);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `⚠️ Neural Copilot could not reach remote AI server. Using local heuristic rules.\n\nTry asking: *"Generate tasks for payment system"* or *"Create task: Fix login validation"*!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'Fallback Engine'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteBotAction = (action) => {
    if (!action) return;
    switch (action.type) {
      case 'CREATE_TASK':
        if (onAddTask && action.task) {
          onAddTask(action.task);
          addToast?.(`AI Bot created task: "${action.task.title}"`, 'success');
        }
        break;
      case 'SET_PRIORITY_FILTER':
        if (onSetPriorityFilter) {
          onSetPriorityFilter(action.priority);
          addToast?.(`Filter applied: ${action.priority} Priority`, 'info');
        }
        break;
      case 'CLEAR_FILTERS':
        if (onSetPriorityFilter) onSetPriorityFilter('');
        if (onSetStatusFilter) onSetStatusFilter('');
        if (onSetSearchQuery) onSetSearchQuery('');
        addToast?.('All filters cleared', 'info');
        break;
      case 'TOGGLE_THEME':
        if (onSetTheme) {
          onSetTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
          addToast?.('Theme toggled by AI Bot', 'info');
        }
        break;
      case 'SET_VIEW':
        if (pageView === 'home' && onEnterApp) {
          onEnterApp();
        }
        if (onNavigateView) {
          onNavigateView(action.view);
          addToast?.(`Navigated to ${action.view.toUpperCase()} view`, 'info');
        }
        break;
      default:
        break;
    }
  };

  const handleAddSingleGeneratedTask = (task, taskIdx, msgId) => {
    const key = `${msgId}_${taskIdx}`;
    if (addedTasksMap[key]) return;

    if (onAddTask) {
      onAddTask(task);
      setAddedTasksMap(prev => ({ ...prev, [key]: true }));
      playChime('action');
      addToast?.(`Task "${task.title}" added to Kanban board!`, 'success');
    }
  };

  const handleAddAllGeneratedTasks = (taskList, msgId) => {
    if (!taskList || !taskList.length) return;
    if (onAddTasksBatch) {
      onAddTasksBatch(taskList);
    } else if (onAddTask) {
      taskList.forEach(t => onAddTask(t));
    }
    const updated = { ...addedTasksMap };
    taskList.forEach((_, idx) => {
      updated[`${msgId}_${idx}`] = true;
    });
    setAddedTasksMap(updated);
    playChime('action');
    addToast?.(`Batch created ${taskList.length} tasks on Kanban board!`, 'success');
  };

  const handleCopyCode = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast?.('Copied to clipboard', 'info');
  };

  const handleClearHistory = () => {
    const initial = [
      {
        id: 'initial-welcome',
        sender: 'ai',
        text: `👋 Chat cleared! How can I assist your team and workspace today?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          '⚡ Generate tasks for OAuth2',
          '📊 Analyze workspace velocity',
          '🛡️ Security audit for API endpoints'
        ],
        modelUsed: 'VortiQ Neural Copilot 2.0'
      }
    ];
    setMessages(initial);
    try {
      localStorage.removeItem(STORAGE_CHAT_KEY);
    } catch (e) {}
    addToast?.('Conversation history reset', 'info');
  };

  const handleSaveApiKey = () => {
    saveStoredGeminiApiKey(geminiApiKey);
    setShowSettings(false);
    addToast?.(geminiApiKey ? 'Google Gemini API Key saved!' : 'Gemini Key removed, using local engine.', 'success');
  };

  const quickContextPrompts = useMemo(() => {
    if (pageView === 'home') {
      return [
        '⚡ What is VortiQ Studio?',
        '🛡️ How does OTP verification work?',
        '🚀 Explain the Java Spring Boot + React tech stack',
        '💡 Show me the key platform features'
      ];
    }
    return [
      '⚡ Create task: Implement Stripe webhooks',
      '📊 Analyze workspace velocity & health',
      '🔍 Filter URGENT priority tasks',
      '🎨 Switch dark/light theme',
      '☕ Open Team Lounge'
    ];
  }, [pageView]);

  return (
    <>
      {/* Floating Trigger Pill / Circle Button */}
      {!isOpen && (
        <div
          className="ai-bot-floating-trigger"
          style={{
            position: 'fixed',
            bottom: '1.75rem',
            right: '1.75rem',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              playChime('action');
            }}
            className="ai-bot-launcher-btn"
            title="Open VortiQ AI Assistant"
            style={{
              height: '52px',
              padding: '0 1.25rem',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #e11d48 0%, #be123c 50%, #6366f1 100%)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              boxShadow: '0 10px 30px rgba(225, 29, 72, 0.45), 0 0 20px rgba(99, 102, 241, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.9rem',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Sparkles size={20} className="animate-spin-slow" />
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981'
                }}
              />
            </div>
            <span>VortiQ AI Bot</span>
            <span
              style={{
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                letterSpacing: '0.5px'
              }}
            >
              Online
            </span>
          </button>
        </div>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div
          className={`ai-bot-window ${isMinimized ? 'minimized' : ''}`}
          style={{
            position: 'fixed',
            bottom: isMinimized ? '1.75rem' : '1.5rem',
            right: '1.5rem',
            width: isMinimized ? '320px' : '440px',
            maxWidth: 'calc(100vw - 2rem)',
            height: isMinimized ? '60px' : '620px',
            maxHeight: 'calc(100vh - 3rem)',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(225, 29, 72, 0.4)',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(225, 29, 72, 0.25)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s ease'
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: '0.85rem 1.15rem',
              background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.15), rgba(99, 102, 241, 0.15))',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              cursor: isMinimized ? 'pointer' : 'default'
            }}
            onClick={() => {
              if (isMinimized) setIsMinimized(false);
            }}
          >
            {/* Left Bot Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #e11d48, #6366f1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 15px rgba(225, 29, 72, 0.4)',
                  position: 'relative'
                }}
              >
                <Bot size={20} />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '2px solid var(--bg-primary)'
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.925rem', color: 'var(--text-main)' }}>
                    VortiQ AI Bot
                  </span>
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      color: activePersona.color,
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      border: `1px solid ${activePersona.color}40`
                    }}
                  >
                    {activePersona.name}
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {activeWorkspace?.name || 'TaskPulse Studio'} • Neural Engine
                </div>
              </div>
            </div>

            {/* Right Window Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={(e) => e.stopPropagation()}>
              <button
                className="btn-icon"
                onClick={() => setShowSettings(prev => !prev)}
                title="AI Settings & Gemini API Key"
                style={{
                  width: '30px',
                  height: '30px',
                  padding: 0,
                  color: showSettings ? 'var(--primary)' : 'var(--text-muted)',
                  background: showSettings ? 'rgba(225, 29, 72, 0.15)' : 'transparent'
                }}
              >
                <Settings size={15} />
              </button>

              <button
                className="btn-icon"
                onClick={() => setIsMinimized(prev => !prev)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                style={{ width: '30px', height: '30px', padding: 0, color: 'var(--text-muted)' }}
              >
                {isMinimized ? <Maximize2 size={15} /> : <Minus size={15} />}
              </button>

              <button
                className="btn-icon"
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                title="Close AI Bot"
                style={{ width: '30px', height: '30px', padding: 0, color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Persona Selector Tabs */}
              <div
                style={{
                  padding: '0.5rem 0.85rem',
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  gap: '0.35rem',
                  overflowX: 'auto'
                }}
                className="custom-scrollbar"
              >
                {PERSONAS.map(p => {
                  const Icon = p.icon;
                  const isActive = activePersona.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActivePersona(p);
                        playChime('send');
                      }}
                      style={{
                        padding: '0.3rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        border: isActive ? `1px solid ${p.color}` : '1px solid transparent',
                        background: isActive ? `${p.color}25` : 'transparent',
                        color: isActive ? '#ffffff' : 'var(--text-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease'
                      }}
                      title={p.description}
                    >
                      <Icon size={12} color={isActive ? p.color : 'currentColor'} />
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Settings Dropdown Drawer */}
              {showSettings && (
                <div
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-card)',
                    borderBottom: '1px solid var(--border-color)',
                    animation: 'fadeIn 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Key size={15} color="var(--primary)" />
                      <span>Google Gemini API Configuration</span>
                    </div>
                    <button
                      onClick={handleClearHistory}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', color: '#ef4444', gap: '0.25rem' }}
                      title="Clear chat history"
                    >
                      <Trash2 size={12} />
                      <span>Clear Chat</span>
                    </button>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.65rem', lineHeight: 1.4 }}>
                    Enter an optional Google Gemini API Key for 100% live Generative AI responses. Leave blank to use VortiQ built-in Neural heuristics engine.
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      className="input"
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveApiKey}
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    >
                      Save Key
                    </button>
                  </div>

                  {/* Audio & Speech Toggles */}
                  <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isSoundOn}
                        onChange={(e) => {
                          setIsSoundOn(e.target.checked);
                          localStorage.setItem(STORAGE_SOUND_KEY, e.target.checked);
                        }}
                      />
                      <span>Sound Effects 🔊</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isTtsOn}
                        onChange={(e) => {
                          setIsTtsOn(e.target.checked);
                          localStorage.setItem(STORAGE_VOICE_KEY, e.target.checked);
                        }}
                      />
                      <span>Voice Speech Output 🗣️</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Chat Message Stream */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
                className="custom-scrollbar"
              >
                {messages.map((msg) => {
                  const isAi = msg.sender === 'ai';
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isAi ? 'flex-start' : 'flex-end',
                        gap: '0.35rem'
                      }}
                    >
                      {/* Sender Info & Timestamp */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          fontSize: '0.7rem',
                          color: 'var(--text-dim)'
                        }}
                      >
                        {isAi && <Sparkles size={11} color="var(--primary)" />}
                        <span style={{ fontWeight: 700 }}>{isAi ? 'VortiQ AI' : currentUser?.name || 'You'}</span>
                        <span>•</span>
                        <span>{msg.time}</span>
                        {msg.modelUsed && (
                          <span
                            style={{
                              fontSize: '0.625rem',
                              padding: '0.05rem 0.35rem',
                              background: 'rgba(255, 255, 255, 0.06)',
                              borderRadius: '4px'
                            }}
                          >
                            {msg.modelUsed}
                          </span>
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div
                        style={{
                          maxWidth: '92%',
                          padding: '0.75rem 1rem',
                          borderRadius: isAi ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                          background: isAi
                            ? 'linear-gradient(135deg, rgba(42, 9, 14, 0.95), rgba(20, 5, 7, 0.95))'
                            : 'linear-gradient(135deg, #e11d48, #be123c)',
                          color: '#ffffff',
                          border: isAi ? '1px solid rgba(225, 29, 72, 0.25)' : '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: isAi ? '0 4px 15px rgba(0, 0, 0, 0.4)' : '0 4px 15px rgba(225, 29, 72, 0.3)',
                          fontSize: '0.85rem',
                          lineHeight: 1.55,
                          wordBreak: 'break-word',
                          position: 'relative'
                        }}
                      >
                        <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>

                        {/* Copy Message Button */}
                        <button
                          onClick={() => handleCopyCode(msg.text, msg.id)}
                          style={{
                            position: 'absolute',
                            top: '0.4rem',
                            right: '0.4rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                            padding: '0.2rem',
                            borderRadius: '4px'
                          }}
                          title="Copy message"
                        >
                          {copiedId === msg.id ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                        </button>

                        {/* Interactive Generated Task Cards */}
                        {msg.generatedTasks && msg.generatedTasks.length > 0 && (
                          <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                color: 'var(--primary)',
                                paddingBottom: '0.35rem',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                              }}
                            >
                              <span>📋 Generated Work Items ({msg.generatedTasks.length})</span>
                              <button
                                onClick={() => handleAddAllGeneratedTasks(msg.generatedTasks, msg.id)}
                                className="btn btn-primary"
                                style={{
                                  padding: '0.25rem 0.55rem',
                                  fontSize: '0.7rem',
                                  gap: '0.25rem',
                                  borderRadius: '6px'
                                }}
                              >
                                <Plus size={12} />
                                <span>Add All to Board</span>
                              </button>
                            </div>

                            {msg.generatedTasks.map((t, tIdx) => {
                              const isAdded = addedTasksMap[`${msg.id}_${tIdx}`];
                              return (
                                <div
                                  key={tIdx}
                                  style={{
                                    background: 'rgba(0, 0, 0, 0.4)',
                                    borderRadius: '8px',
                                    padding: '0.65rem',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.35rem'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#ffffff' }}>
                                      {t.title}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: '0.65rem',
                                        padding: '0.1rem 0.35rem',
                                        borderRadius: '4px',
                                        background: t.priority === 'URGENT' ? '#ef444430' : '#f59e0b30',
                                        color: t.priority === 'URGENT' ? '#ef4444' : '#f59e0b',
                                        fontWeight: 800
                                      }}
                                    >
                                      {t.priority}
                                    </span>
                                  </div>

                                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                                    {t.description?.split('\n')[0]}
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                                      📂 {t.category || 'General'}
                                    </span>
                                    <button
                                      disabled={isAdded}
                                      onClick={() => handleAddSingleGeneratedTask(t, tIdx, msg.id)}
                                      style={{
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        background: isAdded ? '#10b98125' : 'rgba(225, 29, 72, 0.25)',
                                        border: isAdded ? '1px solid #10b981' : '1px solid rgba(225, 29, 72, 0.5)',
                                        color: isAdded ? '#10b981' : '#ff6b87',
                                        cursor: isAdded ? 'default' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                      }}
                                    >
                                      {isAdded ? <CheckCircle2 size={12} /> : <Plus size={12} />}
                                      <span>{isAdded ? 'Added' : 'Add to Kanban'}</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Bot Suggestions / Quick Replies */}
                      {isAi && msg.suggestions && msg.suggestions.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.35rem',
                            marginTop: '0.25rem',
                            maxWidth: '92%'
                          }}
                        >
                          {msg.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(sug)}
                              style={{
                                padding: '0.25rem 0.6rem',
                                borderRadius: '9999px',
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(225, 29, 72, 0.3)',
                                color: 'var(--text-main)',
                                fontSize: '0.725rem',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              <span>{sug}</span>
                              <ArrowRight size={10} color="var(--primary)" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {isLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
                    <div
                      style={{
                        padding: '0.6rem 0.9rem',
                        borderRadius: '4px 16px 16px 16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <Sparkles size={14} className="animate-spin-slow" color="var(--primary)" />
                      <span>Synthesizing neural response...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Bar */}
              <div
                style={{
                  padding: '0.4rem 0.85rem',
                  background: 'rgba(0, 0, 0, 0.35)',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  gap: '0.4rem',
                  overflowX: 'auto'
                }}
                className="custom-scrollbar"
              >
                {quickContextPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p)}
                    style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: 'var(--text-dim)',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Input & Voice Controls */}
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-secondary)',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder={
                      isListening
                        ? 'Listening... Speak your command or query'
                        : `Ask ${activePersona.name} or type "create task: title"...`
                    }
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="input"
                    style={{
                      paddingRight: '2.5rem',
                      fontSize: '0.85rem',
                      borderRadius: '10px',
                      borderColor: isListening ? '#10b981' : undefined
                    }}
                  />

                  {/* Speech to text toggle */}
                  <button
                    onClick={toggleListening}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      background: isListening ? '#10b98130' : 'transparent',
                      border: 'none',
                      color: isListening ? '#10b981' : 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={isListening ? 'Stop listening' : 'Speak to AI Bot'}
                  >
                    {isListening ? <Mic size={16} className="animate-pulse" /> : <MicOff size={16} />}
                  </button>
                </div>

                <button
                  disabled={!inputVal.trim() || isLoading}
                  onClick={() => handleSendMessage()}
                  className="btn btn-primary"
                  style={{
                    height: '40px',
                    width: '42px',
                    padding: 0,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

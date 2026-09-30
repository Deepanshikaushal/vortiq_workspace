import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  GitFork,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Play,
  Layers,
  Sparkles,
  Flag,
  User,
  Calendar,
  X,
  Compass,
  Check,
  Link as LinkIcon,
  ShieldAlert,
  ChevronRight,
  Sliders,
  Eye,
  Info
} from 'lucide-react';
import { playClickSound } from '../utils/audioEffects';

// Milestone definitions for projects
const DEFAULT_MILESTONES = [
  {
    id: 'ms-1',
    title: 'M1: Architecture & Backend API Cutover',
    projectId: 1,
    targetDate: '2026-09-30',
    status: 'COMPLETED',
    description: 'H2 auto-schema, JWT authentication handshake, and REST controllers operational.',
    requiredTaskIds: [2, 3]
  },
  {
    id: 'ms-2',
    title: 'M2: Core UI Components & Real-Time Filter Hub',
    projectId: 1,
    targetDate: '2026-10-04',
    status: 'AT_RISK',
    description: 'Design token rollout, slide-over task panel, and debounced fuzzy search integration.',
    requiredTaskIds: [1, 4]
  },
  {
    id: 'ms-3',
    title: 'M3: Production Release v1.0 & Multi-stage CI/CD',
    projectId: 3,
    targetDate: '2026-10-08',
    status: 'UPCOMING',
    description: 'Docker containerization, Render auto-deploy webhook, and Cypress E2E sign-off.',
    requiredTaskIds: [5, 8, 9, 10]
  }
];

export default function FlowMapView({
  tasks = [],
  projects = [],
  workspaceMembers = [],
  currentUser,
  activeWorkspace,
  onOpenTaskDetail,
  onUpdateTask,
  onStatusChange,
  onCreateTask,
  onAddToast
}) {
  // Canvas viewport & transform state
  const [pan, setPan] = useState({ x: 40, y: 50 });
  const [zoom, setZoom] = useState(0.9);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Filtering & View Mode State
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBottleneckMode, setIsBottleneckMode] = useState(false);
  const [highlightBlockedOnly, setHighlightBlockedOnly] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Dragging Node State
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Interactive Connection Creation State
  const [connectingSourceId, setConnectingSourceId] = useState(null);
  const [connectionMousePos, setConnectionMousePos] = useState({ x: 0, y: 0 });

  // Node Positions (stored by taskId or milestoneId)
  const [nodePositions, setNodePositions] = useState({});

  // Quick Connect Modal State
  const [quickConnectNode, setQuickConnectNode] = useState(null);

  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // Filter tasks based on selected filters
  const visibleTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedProjectId && String(t.projectId) !== String(selectedProjectId)) return false;
      if (selectedAssignee && t.assignee !== selectedAssignee) return false;
      if (selectedStatus && t.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = t.title && t.title.toLowerCase().includes(q);
        const matchKey = `task-${t.id}`.toLowerCase().includes(q);
        if (!matchTitle && !matchKey) return false;
      }
      return true;
    });
  }, [tasks, selectedProjectId, selectedAssignee, selectedStatus, searchQuery]);

  // Relevant milestones
  const visibleMilestones = useMemo(() => {
    return DEFAULT_MILESTONES.filter((m) => {
      if (selectedProjectId && String(m.projectId) !== String(selectedProjectId)) return false;
      return true;
    });
  }, [selectedProjectId]);

  // ----------------------------------------------------
  // Graph Topology & Dependency Analysis
  // ----------------------------------------------------
  const graphData = useMemo(() => {
    const taskMap = new Map();
    tasks.forEach((t) => taskMap.set(t.id, t));

    // outgoingEdges: fromId (prerequisite) -> [toId (dependent)]
    const outgoing = new Map();
    // incomingEdges: toId (dependent) -> [fromId (prerequisite)]
    const incoming = new Map();

    tasks.forEach((t) => {
      outgoing.set(t.id, []);
      incoming.set(t.id, []);
    });

    tasks.forEach((t) => {
      if (Array.isArray(t.dependencies)) {
        t.dependencies.forEach((dep) => {
          const prereqId = dep.taskId;
          if (taskMap.has(prereqId)) {
            // prereqId -> t.id
            if (!outgoing.has(prereqId)) outgoing.set(prereqId, []);
            outgoing.get(prereqId).push({ targetId: t.id, type: dep.type || 'BLOCKED_BY' });

            if (!incoming.has(t.id)) incoming.set(t.id, []);
            incoming.get(t.id).push({ sourceId: prereqId, type: dep.type || 'BLOCKED_BY' });
          }
        });
      }
    });

    // Determine which tasks are blocked
    const blockedTaskIds = new Set();
    tasks.forEach((t) => {
      if (t.status === 'COMPLETED') return;
      const inDeps = incoming.get(t.id) || [];
      const hasUnfinishedPrereq = inDeps.some((d) => {
        const prereq = taskMap.get(d.sourceId);
        return prereq && prereq.status !== 'COMPLETED';
      });
      if (hasUnfinishedPrereq) {
        blockedTaskIds.add(t.id);
      }
    });

    // Identify Bottlenecks:
    // A task is a bottleneck if it is NOT completed and blocks multiple downstream tasks.
    const bottleneckScores = new Map();
    tasks.forEach((t) => {
      if (t.status === 'COMPLETED') return;
      const outDeps = outgoing.get(t.id) || [];
      const blockedDownstream = outDeps.filter((d) => {
        const target = taskMap.get(d.targetId);
        return target && target.status !== 'COMPLETED';
      });
      if (blockedDownstream.length > 0) {
        bottleneckScores.set(t.id, blockedDownstream.length);
      }
    });

    // Find top bottlenecks (sorted by blocked count)
    const sortedBottlenecks = Array.from(bottleneckScores.entries())
      .map(([id, count]) => ({ task: taskMap.get(id), count }))
      .sort((a, b) => b.count - a.count);

    // Critical Path Calculation:
    // Longest chain of uncompleted dependent tasks
    const findLongestChain = (taskId, visited = new Set()) => {
      if (visited.has(taskId)) return [];
      visited.add(taskId);
      const outDeps = outgoing.get(taskId) || [];
      let longestSub = [];
      outDeps.forEach((d) => {
        const chain = findLongestChain(d.targetId, new Set(visited));
        if (chain.length > longestSub.length) {
          longestSub = chain;
        }
      });
      return [taskId, ...longestSub];
    };

    let criticalPath = [];
    tasks.forEach((t) => {
      if (t.status !== 'COMPLETED') {
        const chain = findLongestChain(t.id);
        if (chain.length > criticalPath.length) {
          criticalPath = chain;
        }
      }
    });

    const criticalPathSet = new Set(criticalPath);

    return {
      taskMap,
      outgoing,
      incoming,
      blockedTaskIds,
      bottleneckScores,
      sortedBottlenecks,
      criticalPathSet
    };
  }, [tasks]);

  // ----------------------------------------------------
  // Automatic Topological DAG Layout Algorithm
  // ----------------------------------------------------
  const computeAutoLayout = useCallback(() => {
    const { taskMap, incoming } = graphData;
    const depths = new Map();

    const getDepth = (id, visited = new Set()) => {
      if (visited.has(id)) return 0;
      if (depths.has(id)) return depths.get(id);
      visited.add(id);

      const inDeps = incoming.get(id) || [];
      if (inDeps.length === 0) {
        depths.set(id, 0);
        return 0;
      }
      let maxPrereqDepth = 0;
      inDeps.forEach((d) => {
        const dDepth = getDepth(d.sourceId, new Set(visited));
        if (dDepth + 1 > maxPrereqDepth) {
          maxPrereqDepth = dDepth + 1;
        }
      });
      depths.set(id, maxPrereqDepth);
      return maxPrereqDepth;
    };

    tasks.forEach((t) => getDepth(t.id));

    // Group tasks by depth rank
    const layers = [];
    tasks.forEach((t) => {
      const d = depths.get(t.id) || 0;
      if (!layers[d]) layers[d] = [];
      layers[d].push(t);
    });

    const positions = {};
    const colWidth = 310;
    const rowHeight = 135;
    const startX = 60;
    const startY = 80;

    layers.forEach((layerTasks, colIndex) => {
      const x = startX + colIndex * colWidth;
      const totalH = layerTasks.length * rowHeight;
      const layerStartY = Math.max(startY, startY + (4 - layerTasks.length) * 40);

      layerTasks.forEach((task, rowIndex) => {
        const y = layerStartY + rowIndex * rowHeight;
        positions[`task-${task.id}`] = { x, y };
      });
    });

    // Position Milestones on the rightmost tier
    const maxCol = layers.length || 3;
    const milestoneX = startX + maxCol * colWidth + 40;
    visibleMilestones.forEach((m, idx) => {
      positions[`ms-${m.id}`] = {
        x: milestoneX,
        y: startY + idx * 160 + 20
      };
    });

    setNodePositions(positions);
    onAddToast?.('Auto-arranged Flow Map in topological sequence', 'info');
  }, [tasks, visibleMilestones, graphData, onAddToast]);

  // Initial auto-layout on load if positions are empty
  useEffect(() => {
    if (Object.keys(nodePositions).length === 0 && tasks.length > 0) {
      computeAutoLayout();
    }
  }, [tasks, nodePositions, computeAutoLayout]);

  // Keyboard Shortcuts (B: Bottleneck, 0: Reset Zoom, +: Zoom In, -: Zoom Out, A: Auto-arrange)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        playClickSound();
        setIsBottleneckMode((prev) => !prev);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom((z) => Math.min(1.8, z + 0.15));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoom((z) => Math.max(0.4, z - 0.15));
      } else if (e.key === '0') {
        e.preventDefault();
        setZoom(1.0);
        setPan({ x: 40, y: 50 });
      } else if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        playClickSound();
        computeAutoLayout();
      } else if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setConnectingSourceId(null);
        setQuickConnectNode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [computeAutoLayout]);

  // ----------------------------------------------------
  // Canvas Panning (Mouse Drag on Canvas)
  // ----------------------------------------------------
  const handleCanvasMouseDown = (e) => {
    // Only pan if clicking canvas background, not on a node or button
    if (e.target.closest('.flow-node-card') || e.target.closest('.flow-control-btn') || e.target.closest('.flow-port')) {
      return;
    }
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleCanvasMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    } else if (draggingNodeId) {
      // Calculate coordinates relative to canvas zoom and pan
      const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
      const rawX = (e.clientX - rect.left - pan.x) / zoom;
      const rawY = (e.clientY - rect.top - pan.y) / zoom;

      setNodePositions((prev) => ({
        ...prev,
        [draggingNodeId]: {
          x: Math.round(rawX - dragOffset.x),
          y: Math.round(rawY - dragOffset.y)
        }
      }));
    } else if (connectingSourceId) {
      // Track mouse position for dynamic connection line
      const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
      const rawX = (e.clientX - rect.left - pan.x) / zoom;
      const rawY = (e.clientY - rect.top - pan.y) / zoom;
      setConnectionMousePos({ x: rawX, y: rawY });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    if (connectingSourceId) {
      setConnectingSourceId(null);
    }
  };

  // Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prevZoom) => {
      const nextZoom = Math.min(Math.max(prevZoom * zoomFactor, 0.4), 1.8);
      return Math.round(nextZoom * 100) / 100;
    });
  };

  // ----------------------------------------------------
  // Node Dragging
  // ----------------------------------------------------
  const handleNodeMouseDown = (e, nodeKey) => {
    e.stopPropagation();
    if (e.target.closest('.flow-port') || e.target.closest('.node-action-btn')) return;

    playClickSound();
    setDraggingNodeId(nodeKey);
    setSelectedNodeId(nodeKey);

    const pos = nodePositions[nodeKey] || { x: 100, y: 100 };
    const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    const rawX = (e.clientX - rect.left - pan.x) / zoom;
    const rawY = (e.clientY - rect.top - pan.y) / zoom;

    setDragOffset({
      x: rawX - pos.x,
      y: rawY - pos.y
    });
  };

  // ----------------------------------------------------
  // Interactive Connection Creation
  // ----------------------------------------------------
  const handleStartConnection = (e, sourceTaskId) => {
    e.stopPropagation();
    playClickSound();
    setConnectingSourceId(sourceTaskId);
    const pos = nodePositions[`task-${sourceTaskId}`] || { x: 100, y: 100 };
    // Start wire at right port of source
    setConnectionMousePos({ x: pos.x + 240, y: pos.y + 46 });
  };

  const handleEndConnection = (e, targetTaskId) => {
    e.stopPropagation();
    if (!connectingSourceId || connectingSourceId === targetTaskId) {
      setConnectingSourceId(null);
      return;
    }

    const sourceTask = graphData.taskMap.get(connectingSourceId);
    const targetTask = graphData.taskMap.get(targetTaskId);

    if (sourceTask && targetTask) {
      const existingDeps = Array.isArray(targetTask.dependencies) ? targetTask.dependencies : [];
      const alreadyLinked = existingDeps.some((d) => d.taskId === sourceTask.id);

      if (alreadyLinked) {
        onAddToast?.(`Dependency between TASK-${sourceTask.id} and TASK-${targetTask.id} already exists`, 'info');
      } else {
        const newDep = {
          id: `dep-${Date.now()}`,
          taskId: sourceTask.id,
          taskTitle: sourceTask.title,
          type: 'BLOCKED_BY'
        };
        const updatedDeps = [...existingDeps, newDep];
        onUpdateTask?.(targetTask.id, { dependencies: updatedDeps });
        onAddToast?.(`Linked: TASK-${targetTask.id} is now blocked by TASK-${sourceTask.id}`, 'success');
        playClickSound();
      }
    }
    setConnectingSourceId(null);
  };

  // ----------------------------------------------------
  // Connection Line Calculator (Smooth Cubic Bezier)
  // ----------------------------------------------------
  const renderedConnections = useMemo(() => {
    const list = [];
    const nodeWidth = 240;
    const nodeHeight = 92;

    visibleTasks.forEach((task) => {
      const targetPos = nodePositions[`task-${task.id}`];
      if (!targetPos) return;

      if (Array.isArray(task.dependencies)) {
        task.dependencies.forEach((dep) => {
          const sourceTask = graphData.taskMap.get(dep.taskId);
          if (!sourceTask) return;

          const sourcePos = nodePositions[`task-${sourceTask.id}`];
          if (!sourcePos) return;

          // Source Port: Right center of source node
          const x1 = sourcePos.x + nodeWidth;
          const y1 = sourcePos.y + nodeHeight / 2;

          // Target Port: Left center of target node
          const x2 = targetPos.x;
          const y2 = targetPos.y + nodeHeight / 2;

          const dx = Math.abs(x2 - x1);
          const controlOffset = Math.max(dx * 0.5, 50);

          const pathD = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;

          const isPrereqCompleted = sourceTask.status === 'COMPLETED';
          const isTargetBlocked = task.status !== 'COMPLETED' && !isPrereqCompleted;
          const isCritical = graphData.criticalPathSet.has(sourceTask.id) && graphData.criticalPathSet.has(task.id);
          const isFocused =
            selectedNodeId === `task-${sourceTask.id}` || selectedNodeId === `task-${task.id}`;

          let strokeColor = '#3b4b68';
          let strokeWidth = 1.75;
          let markerId = 'arrow-normal';
          let isAnimated = true;

          if (isTargetBlocked) {
            strokeColor = '#ef4444';
            strokeWidth = 2.25;
            markerId = 'arrow-blocked';
          } else if (isPrereqCompleted) {
            strokeColor = '#10b981';
            strokeWidth = 1.5;
            markerId = 'arrow-completed';
            isAnimated = false;
          } else if (isCritical) {
            strokeColor = '#f59e0b';
            strokeWidth = 2.25;
            markerId = 'arrow-critical';
          }

          if (isFocused) {
            strokeColor = '#818cf8';
            strokeWidth = 3;
            markerId = 'arrow-focused';
          }

          list.push({
            id: `edge-${sourceTask.id}->${task.id}`,
            sourceId: sourceTask.id,
            targetId: task.id,
            sourceTitle: sourceTask.title,
            targetTitle: task.title,
            pathD,
            strokeColor,
            strokeWidth,
            markerId,
            isAnimated,
            isTargetBlocked,
            isCritical
          });
        });
      }
    });

    // Milestone Connections
    visibleMilestones.forEach((milestone) => {
      const msPos = nodePositions[`ms-${milestone.id}`];
      if (!msPos) return;

      milestone.requiredTaskIds.forEach((reqId) => {
        const reqTask = graphData.taskMap.get(reqId);
        if (!reqTask) return;

        const reqPos = nodePositions[`task-${reqTask.id}`];
        if (!reqPos) return;

        const x1 = reqPos.x + nodeWidth;
        const y1 = reqPos.y + nodeHeight / 2;
        const x2 = msPos.x;
        const y2 = msPos.y + 45;

        const dx = Math.abs(x2 - x1);
        const controlOffset = Math.max(dx * 0.5, 50);
        const pathD = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;

        const isTaskDone = reqTask.status === 'COMPLETED';

        list.push({
          id: `edge-ms-${reqTask.id}->${milestone.id}`,
          sourceId: reqTask.id,
          targetId: milestone.id,
          sourceTitle: reqTask.title,
          targetTitle: milestone.title,
          pathD,
          strokeColor: isTaskDone ? '#10b981' : '#6366f1',
          strokeWidth: 2,
          markerId: isTaskDone ? 'arrow-completed' : 'arrow-normal',
          isAnimated: !isTaskDone,
          isMilestone: true
        });
      });
    });

    return list;
  }, [visibleTasks, visibleMilestones, nodePositions, graphData, selectedNodeId]);

  // Center & Fit View to all nodes
  const handleFitToView = () => {
    playClickSound();
    const positions = Object.values(nodePositions);
    if (positions.length === 0) return;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    positions.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const graphWidth = maxX - minX + 320;
    const graphHeight = maxY - minY + 200;

    const containerWidth = containerRef.current?.clientWidth || 1000;
    const containerHeight = containerRef.current?.clientHeight || 650;

    const scaleX = containerWidth / graphWidth;
    const scaleY = containerHeight / graphHeight;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY) * 0.9, 0.45), 1.2);

    const newPanX = (containerWidth - graphWidth * newZoom) / 2 - minX * newZoom;
    const newPanY = (containerHeight - graphHeight * newZoom) / 2 - minY * newZoom;

    setZoom(Math.round(newZoom * 100) / 100);
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  };

  // Status Color Mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return '#10b981';
      case 'IN_PROGRESS':
        return '#6366f1';
      case 'IN_REVIEW':
        return '#f59e0b';
      case 'TODO':
      default:
        return '#64748b';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 72px)',
        backgroundColor: '#090d16',
        borderRadius: '6px',
        border: '1px solid #1a2336',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none'
      }}
    >
      {/* ---------------------------------------------------- */}
      {/* TOP WORKSPACE CONTROLS TOOLBAR (8px Spacing System) */}
      {/* ---------------------------------------------------- */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          backgroundColor: '#0e1422',
          borderBottom: '1px solid #1a2336',
          zIndex: 20,
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        {/* Left: Brand Identity & View Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '5px',
              backgroundColor: '#18223a',
              border: '1px solid #263552',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}
          >
            <GitFork size={15} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                Flow Map
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '3px',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99, 102, 241, 0.3)'
                }}
              >
                DAG Workflow Engine
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Work movement, dependency graph, and bottleneck telemetry
            </span>
          </div>
        </div>

        {/* Center: Filters & View Modes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Project Filter */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: '0.72rem',
              backgroundColor: '#0c101a',
              color: '#cbd5e1',
              border: '1px solid #1f2b42',
              borderRadius: '4px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Assignee Filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: '0.72rem',
              backgroundColor: '#0c101a',
              color: '#cbd5e1',
              border: '1px solid #1f2b42',
              borderRadius: '4px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Assignees</option>
            {workspaceMembers.map((m) => (
              <option key={m.id || m.username} value={m.name || m.username}>
                {m.name || m.username}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: '0.72rem',
              backgroundColor: '#0c101a',
              color: '#cbd5e1',
              border: '1px solid #1f2b42',
              borderRadius: '4px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Search Input */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={12} color="#64748b" style={{ position: 'absolute', left: '7px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search node or task..."
              style={{
                padding: '4px 8px 4px 22px',
                fontSize: '0.72rem',
                backgroundColor: '#0c101a',
                color: '#f8fafc',
                border: '1px solid #1f2b42',
                borderRadius: '4px',
                outline: 'none',
                width: '130px'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Right: Signature Actions: Bottleneck Mode, Auto-Layout, Help */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Bottleneck Analysis Toggle */}
          <button
            onClick={() => {
              playClickSound();
              setIsBottleneckMode(!isBottleneckMode);
              if (!isBottleneckMode) {
                onAddToast?.('Bottleneck Analysis Mode Active', 'warning');
              }
            }}
            className="flow-control-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '28px',
              padding: '0 10px',
              fontSize: '0.72rem',
              fontWeight: 600,
              borderRadius: '4px',
              border: isBottleneckMode ? '1px solid #ef4444' : '1px solid #1f2b42',
              backgroundColor: isBottleneckMode ? 'rgba(239, 68, 68, 0.15)' : '#0c101a',
              color: isBottleneckMode ? '#fca5a5' : '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Identify blockers, dependency choke points, and critical path (Hotkey: B)"
          >
            <ShieldAlert size={13} color={isBottleneckMode ? '#ef4444' : '#94a3b8'} />
            <span>Bottlenecks</span>
            {graphData.sortedBottlenecks.length > 0 && (
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: '3px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff'
                }}
              >
                {graphData.sortedBottlenecks.length}
              </span>
            )}
            <kbd style={{ fontSize: '0.6rem', opacity: 0.6 }}>B</kbd>
          </button>

          {/* Auto-Arrange Layout Button */}
          <button
            onClick={computeAutoLayout}
            className="flow-control-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              height: '28px',
              padding: '0 9px',
              fontSize: '0.72rem',
              fontWeight: 500,
              borderRadius: '4px',
              border: '1px solid #1f2b42',
              backgroundColor: '#0c101a',
              color: '#cbd5e1',
              cursor: 'pointer'
            }}
            title="Auto-arrange tasks in clean topological stages (Hotkey: A)"
          >
            <RefreshCw size={12} />
            <span>Auto-Layout</span>
            <kbd style={{ fontSize: '0.6rem', opacity: 0.6 }}>A</kbd>
          </button>

          {/* Fit to View */}
          <button
            onClick={handleFitToView}
            className="flow-control-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              height: '28px',
              padding: '0 8px',
              fontSize: '0.72rem',
              fontWeight: 500,
              borderRadius: '4px',
              border: '1px solid #1f2b42',
              backgroundColor: '#0c101a',
              color: '#cbd5e1',
              cursor: 'pointer'
            }}
            title="Fit entire flow graph in viewport"
          >
            <Maximize2 size={12} />
            <span>Fit</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* BOTTLENECK INTELLIGENCE ALERT BANNER (If Active) */}
      {/* ---------------------------------------------------- */}
      {isBottleneckMode && (
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#f8fafc',
            zIndex: 15
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={14} color="#ef4444" />
            <span>
              <strong>Bottleneck Telemetry:</strong>{' '}
              {graphData.sortedBottlenecks.length > 0 ? (
                <>
                  <span style={{ color: '#fca5a5' }}>
                    TASK-{graphData.sortedBottlenecks[0].task.id} (
                    {graphData.sortedBottlenecks[0].task.title})
                  </span>{' '}
                  is blocking <strong>{graphData.sortedBottlenecks[0].count}</strong> downstream
                  deliverables. Resolving this unlocks sequence progression.
                </>
              ) : (
                <span>No severe bottlenecks detected. All workflows moving cleanly.</span>
              )}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              Critical Path Length: <strong>{graphData.criticalPathSet.size} deliverables</strong>
            </span>
            <button
              onClick={() => setIsBottleneckMode(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.7rem'
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MAIN INFINITE CANVAS AREA */}
      {/* ---------------------------------------------------- */}
      <div
        ref={containerRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onWheel={handleWheel}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : 'grab',
          backgroundColor: '#090d16',
          backgroundImage:
            'radial-gradient(circle, #1a2336 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        {/* Transformable Canvas Layer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isPanning || draggingNodeId ? 'none' : 'transform 0.08s ease-out'
          }}
        >
          {/* 1. SVG LAYER: Directed Connection Edges */}
          <svg
            ref={svgRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '5000px',
              height: '5000px',
              pointerEvents: 'none',
              overflow: 'visible'
            }}
          >
            <defs>
              {/* Normal Arrowhead */}
              <marker
                id="arrow-normal"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#4f5e7a" />
              </marker>

              {/* Blocked Arrowhead */}
              <marker
                id="arrow-blocked"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
              </marker>

              {/* Completed Arrowhead */}
              <marker
                id="arrow-completed"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
              </marker>

              {/* Critical Arrowhead */}
              <marker
                id="arrow-critical"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
              </marker>

              {/* Focused Arrowhead */}
              <marker
                id="arrow-focused"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#818cf8" />
              </marker>
            </defs>

            {/* Render all calculated connection paths */}
            {renderedConnections.map((edge) => (
              <g key={edge.id}>
                {/* Background thicker stroke for contrast */}
                <path
                  d={edge.pathD}
                  fill="none"
                  stroke="#090d16"
                  strokeWidth={edge.strokeWidth + 3}
                  strokeLinecap="round"
                />

                {/* Main animated directional stroke */}
                <path
                  d={edge.pathD}
                  fill="none"
                  stroke={edge.strokeColor}
                  strokeWidth={edge.strokeWidth}
                  strokeDasharray={edge.isAnimated ? '6 6' : 'none'}
                  style={{
                    animation: edge.isAnimated ? 'flowDash 1.2s linear infinite' : 'none'
                  }}
                  markerEnd={`url(#${edge.markerId})`}
                  opacity={
                    isBottleneckMode && !edge.isCritical && !edge.isTargetBlocked
                      ? 0.25
                      : 0.85
                  }
                />
              </g>
            ))}

            {/* Live Wire while user is dragging connection to another node */}
            {connectingSourceId && (
              <g>
                {(() => {
                  const sourcePos = nodePositions[`task-${connectingSourceId}`] || { x: 0, y: 0 };
                  const x1 = sourcePos.x + 240;
                  const y1 = sourcePos.y + 46;
                  const x2 = connectionMousePos.x;
                  const y2 = connectionMousePos.y;
                  const dx = Math.abs(x2 - x1);
                  const pathD = `M ${x1} ${y1} C ${x1 + dx * 0.5} ${y1}, ${x2 - dx * 0.5} ${y2}, ${x2} ${y2}`;
                  return (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="2.5"
                      strokeDasharray="5 5"
                      style={{ animation: 'flowDash 0.8s linear infinite' }}
                    />
                  );
                })()}
              </g>
            )}
          </svg>

          {/* 2. HTML LAYER: Draggable Task Nodes */}
          {visibleTasks.map((task) => {
            const nodeKey = `task-${task.id}`;
            const pos = nodePositions[nodeKey] || { x: 100, y: 100 };
            const isSelected = selectedNodeId === nodeKey;
            const isBlocked = graphData.blockedTaskIds.has(task.id);
            const isBottleneck = graphData.bottleneckScores.has(task.id);
            const isCritical = graphData.criticalPathSet.has(task.id);
            const blockedDownstreamCount = graphData.bottleneckScores.get(task.id) || 0;

            const isDimmed =
              isBottleneckMode && !isBottleneck && !isBlocked && !isCritical;

            const taskProject = projects.find((p) => p.id === task.projectId);

            return (
              <div
                key={task.id}
                className="flow-node-card"
                onMouseDown={(e) => handleNodeMouseDown(e, nodeKey)}
                onDoubleClick={() => onOpenTaskDetail?.(task)}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: '240px',
                  backgroundColor: '#0e1422',
                  border: isSelected
                    ? '1px solid #818cf8'
                    : isBlocked
                    ? '1px solid #ef4444'
                    : isBottleneck
                    ? '1px solid #f59e0b'
                    : '1px solid #1a2336',
                  borderRadius: '5px',
                  boxShadow: isSelected
                    ? '0 4px 16px rgba(99, 102, 241, 0.25)'
                    : '0 2px 6px rgba(0, 0, 0, 0.45)',
                  opacity: isDimmed ? 0.35 : 1.0,
                  transition: draggingNodeId === nodeKey ? 'none' : 'border-color 0.15s, opacity 0.15s',
                  zIndex: isSelected ? 15 : isBottleneck || isBlocked ? 10 : 5,
                  cursor: draggingNodeId === nodeKey ? 'grabbing' : 'grab'
                }}
              >
                {/* Left Port (Input: Target Anchor for Prerequisite Connections) */}
                <div
                  className="flow-port flow-port-in"
                  onMouseUp={(e) => handleEndConnection(e, task.id)}
                  style={{
                    position: 'absolute',
                    left: '-7px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#131b2e',
                    border: '2px solid #3b4b68',
                    cursor: 'crosshair',
                    zIndex: 20
                  }}
                  title="Drop connection here to make this task dependent on predecessor"
                />

                {/* Right Port (Output: Source Anchor to Drag Dependency) */}
                <div
                  className="flow-port flow-port-out"
                  onMouseDown={(e) => handleStartConnection(e, task.id)}
                  style={{
                    position: 'absolute',
                    right: '-7px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#131b2e',
                    border: '2px solid #6366f1',
                    cursor: 'crosshair',
                    zIndex: 20
                  }}
                  title="Drag from this port to another task to create a dependency link"
                />

                {/* Node Header: Key, Status Dot, Blocker Flag */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderBottom: '1px solid #141c2c',
                    backgroundColor: '#0c101a',
                    borderTopLeftRadius: '4px',
                    borderTopRightRadius: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(task.status)
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: '#94a3b8'
                      }}
                    >
                      TASK-{task.id}
                    </span>
                  </div>

                  {/* Status Indicator Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isBlocked && (
                      <span
                        style={{
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          padding: '1px 4px',
                          borderRadius: '2px',
                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.4)'
                        }}
                      >
                        BLOCKED
                      </span>
                    )}

                    {isBottleneck && (
                      <span
                        style={{
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          padding: '1px 4px',
                          borderRadius: '2px',
                          backgroundColor: 'rgba(245, 158, 11, 0.2)',
                          color: '#fbbf24',
                          border: '1px solid rgba(245, 158, 11, 0.4)'
                        }}
                        title={`Blocking ${blockedDownstreamCount} downstream tasks`}
                      >
                        ⚡ CHOKE ({blockedDownstreamCount})
                      </span>
                    )}

                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        padding: '1px 5px',
                        borderRadius: '2px',
                        backgroundColor: '#18223a',
                        color: '#cbd5e1'
                      }}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>

                {/* Node Body: Title & Meta */}
                <div style={{ padding: '8px 10px' }}>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#f1f5f9',
                      lineHeight: 1.35,
                      maxHeight: '34px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      marginBottom: '6px'
                    }}
                  >
                    {task.title}
                  </div>

                  {/* Footer Row: Assignee, Due Date, Dependencies Count */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.68rem',
                      color: '#64748b'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={11} color="#94a3b8" />
                      <span style={{ color: '#cbd5e1', maxWidth: '75px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.assignee ? task.assignee.split(' ')[0] : 'Unassigned'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {task.dueDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={10} />
                          <span>{task.dueDate.slice(5)}</span>
                        </div>
                      )}

                      {/* Detail Open Action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playClickSound();
                          onOpenTaskDetail?.(task);
                        }}
                        className="node-action-btn"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#818cf8',
                          cursor: 'pointer',
                          padding: '1px 3px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Open full task panel"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 3. HTML LAYER: Distinct Milestone Nodes */}
          {visibleMilestones.map((milestone) => {
            const nodeKey = `ms-${milestone.id}`;
            const pos = nodePositions[nodeKey] || { x: 900, y: 150 };
            const isCompleted = milestone.status === 'COMPLETED';
            const isAtRisk = milestone.status === 'AT_RISK';

            return (
              <div
                key={milestone.id}
                className="flow-node-card flow-milestone-card"
                onMouseDown={(e) => handleNodeMouseDown(e, nodeKey)}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: '260px',
                  backgroundColor: '#111726',
                  border: isCompleted
                    ? '1px solid #10b981'
                    : isAtRisk
                    ? '1px solid #f59e0b'
                    : '1px solid #3b4b68',
                  borderRadius: '6px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.55)',
                  padding: '10px 12px',
                  zIndex: 8,
                  cursor: draggingNodeId === nodeKey ? 'grabbing' : 'grab'
                }}
              >
                {/* Left Input Port */}
                <div
                  className="flow-port flow-port-in"
                  style={{
                    position: 'absolute',
                    left: '-7px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#111726',
                    border: '2px solid #818cf8',
                    cursor: 'crosshair',
                    zIndex: 20
                  }}
                  title="Milestone deliverable input port"
                />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flag size={13} color={isCompleted ? '#10b981' : '#818cf8'} />
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: isCompleted ? '#34d399' : '#a5b4fc'
                      }}
                    >
                      Project Milestone
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '3px',
                      backgroundColor: isCompleted
                        ? 'rgba(16, 185, 129, 0.15)'
                        : isAtRisk
                        ? 'rgba(245, 158, 11, 0.15)'
                        : '#18223a',
                      color: isCompleted ? '#34d399' : isAtRisk ? '#fbbf24' : '#cbd5e1'
                    }}
                  >
                    {milestone.status}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#f8fafc',
                    lineHeight: 1.3,
                    marginBottom: '6px'
                  }}
                >
                  {milestone.title}
                </div>

                <div
                  style={{
                    fontSize: '0.68rem',
                    color: '#94a3b8',
                    lineHeight: 1.35,
                    marginBottom: '8px'
                  }}
                >
                  {milestone.description}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.68rem',
                    color: '#64748b',
                    borderTop: '1px solid #1a2336',
                    paddingTop: '6px'
                  }}
                >
                  <span>Due: {milestone.targetDate}</span>
                  <span style={{ color: '#818cf8', fontWeight: 600 }}>
                    {milestone.requiredTaskIds.length} dependencies
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ---------------------------------------------------- */}
        {/* FLOATING HUD CONTROLS (BOTTOM-RIGHT) */}
        {/* ---------------------------------------------------- */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#0e1422',
            border: '1px solid #1f2b42',
            borderRadius: '5px',
            padding: '4px 6px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
            zIndex: 30
          }}
        >
          {/* Zoom Out */}
          <button
            onClick={() => {
              playClickSound();
              setZoom((z) => Math.max(0.4, Math.round((z - 0.1) * 10) / 10));
            }}
            className="flow-control-btn"
            style={{
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0c101a',
              border: '1px solid #1a2336',
              borderRadius: '4px',
              color: '#cbd5e1',
              cursor: 'pointer'
            }}
            title="Zoom Out (-)"
          >
            -
          </button>

          {/* Zoom Indicator */}
          <span
            onClick={() => {
              playClickSound();
              setZoom(1.0);
            }}
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: '#94a3b8',
              padding: '0 6px',
              cursor: 'pointer'
            }}
            title="Reset Zoom to 100% (0)"
          >
            {Math.round(zoom * 100)}%
          </span>

          {/* Zoom In */}
          <button
            onClick={() => {
              playClickSound();
              setZoom((z) => Math.min(1.8, Math.round((z + 0.1) * 10) / 10));
            }}
            className="flow-control-btn"
            style={{
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0c101a',
              border: '1px solid #1a2336',
              borderRadius: '4px',
              color: '#cbd5e1',
              cursor: 'pointer'
            }}
            title="Zoom In (+)"
          >
            +
          </button>

          <div style={{ width: '1px', height: '16px', backgroundColor: '#1f2b42', margin: '0 2px' }} />

          {/* Fit Screen */}
          <button
            onClick={handleFitToView}
            className="flow-control-btn"
            style={{
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0c101a',
              border: '1px solid #1a2336',
              borderRadius: '4px',
              color: '#cbd5e1',
              cursor: 'pointer'
            }}
            title="Fit to view"
          >
            <Maximize2 size={11} />
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* FLOATING LEGEND HUD (BOTTOM-LEFT) */}
        {/* ---------------------------------------------------- */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#0e1422',
            border: '1px solid #1f2b42',
            borderRadius: '5px',
            padding: '6px 12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
            fontSize: '0.68rem',
            color: '#94a3b8',
            zIndex: 30
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '12px', height: '2px', backgroundColor: '#10b981', display: 'inline-block' }} />
            <span>Unblocked / Done</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '12px', height: '2px', backgroundColor: '#ef4444', display: 'inline-block' }} />
            <span>Blocked Path</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '12px', height: '2px', backgroundColor: '#6366f1', display: 'inline-block' }} />
            <span>Active Flow</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '12px', height: '2px', backgroundColor: '#f59e0b', display: 'inline-block' }} />
            <span>Critical Path</span>
          </div>

          <span style={{ color: '#475569' }}>|</span>
          <span style={{ color: '#64748b' }}>Drag ports to connect • Drag nodes to reposition</span>
        </div>
      </div>
    </div>
  );
}

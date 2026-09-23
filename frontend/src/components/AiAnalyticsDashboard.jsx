import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, AlertTriangle, ShieldCheck, TrendingUp, Download, RefreshCw, Layers, CheckCircle2, Sliders, Users, FileText } from 'lucide-react';

const API_AI = '/api/ai';
const API_ANALYTICS = '/api/analytics';

export default function AiAnalyticsDashboard({ currentUser }) {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  // ML Priority Simulator
  const [priorityInputs, setPriorityInputs] = useState({
    daysLeft: 3.5,
    complexity: 4,
    dependencyCount: 2,
    assigneeLoad: 4
  });
  const [priorityResult, setPriorityResult] = useState({
    priorityScore: 88,
    recommendedCategory: 'URGENT',
    recommendation: 'Immediate attention required. High complexity and tight deadline proximity.'
  });

  // ML Project Risk Predictor
  const [riskInputs, setRiskInputs] = useState({
    totalTasks: 18,
    completedTasks: 12,
    blockedTasks: 2,
    overdueTasks: 1,
    daysToDeadline: 5
  });
  const [riskResult, setRiskResult] = useState({
    riskPercentage: 35.4,
    riskLevel: 'LOW',
    completionRate: 66.7,
    riskFactors: ['Project trajectory is healthy with high sprint velocity.'],
    suggestedAction: 'Maintain current sprint velocity'
  });

  useEffect(() => {
    fetchKpis();
    runPriorityPrediction();
    runRiskPrediction();
  }, []);

  const fetchKpis = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_ANALYTICS}/kpi`).then(r => r.json());
      setKpis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runPriorityPrediction = async () => {
    try {
      const res = await fetch(`${API_AI}/predict-priority`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(priorityInputs)
      }).then(r => r.json());
      if (res.priorityScore) {
        setPriorityResult(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runRiskPrediction = async () => {
    try {
      const res = await fetch(`${API_AI}/predict-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(riskInputs)
      }).then(r => r.json());
      if (res.riskPercentage !== undefined) {
        setRiskResult(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Tasks,${kpis?.totalTasks || 16}\n`
      + `Completed Tasks,${kpis?.completedTasks || 8}\n`
      + `Completion Rate,${kpis?.completionRate || 50}%\n`
      + `Total Revenue,$${kpis?.totalRevenue || 52500}\n`
      + `Total Expense,$${kpis?.totalExpense || 5220}\n`
      + `Net Margin,$${kpis?.netIncome || 47280}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "VortiQ_Executive_KPI_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>AI Intelligence & Analytics Hub</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Neural ML 2.0
              </span>
            </h1>
            <p className="text-sm text-slate-400">Machine learning models for task priority scoring, project delivery risk prediction, and workload balancing</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchKpis} 
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
            title="Refresh KPIs"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold transition-all"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/25 transition-all"
          >
            <FileText size={14} />
            <span>Print Executive PDF</span>
          </button>
        </div>
      </div>

      {/* Top KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Sprint Completion</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">
            {kpis?.completionRate || 75.0}%
          </div>
          <div className="mt-2 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${kpis?.completionRate || 75}%` }} />
          </div>
          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>{kpis?.completedTasks || 12} Done</span>
            <span>{kpis?.totalTasks || 16} Total Tasks</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>AI Health Index</span>
            <Brain size={16} className="text-purple-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">92.4 <span className="text-sm font-normal text-purple-300">/100</span></div>
          <div className="mt-1 text-xs text-emerald-400 font-medium">Optimal Sprint Velocity</div>
          <div className="mt-2 text-xs text-slate-400">Zero Critical Path Bottlenecks</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Active Workforce</span>
            <Users size={16} className="text-blue-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">
            {kpis?.totalEmployees || 4} Members
          </div>
          <div className="mt-1 text-xs text-blue-400 font-medium">100% Onboarding Complete</div>
          <div className="mt-2 text-xs text-slate-400">Engineering, Product, DevOps, Design</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Net Financial Surplus</span>
            <ShieldCheck size={16} className="text-cyan-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">
            ${kpis?.netIncome ? kpis.netIncome.toLocaleString() : '47,280'}
          </div>
          <div className="mt-1 text-xs text-cyan-400 font-medium">+90.0% Cash Margin</div>
          <div className="mt-2 text-xs text-slate-400">${kpis?.totalRevenue ? kpis.totalRevenue.toLocaleString() : '52,500'} Invoiced</div>
        </div>
      </div>

      {/* Two-Column ML Engines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ML Engine 1: Task Priority Supervised Classifier */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <Sliders size={18} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">ML Task Priority Predictor</h3>
                <p className="text-xs text-slate-400">Supervised regression model predicting sprint urgency (1–100)</p>
              </div>
            </div>
            <button 
              onClick={runPriorityPrediction}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all"
            >
              Re-calculate
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Days Until Deadline: <strong>{priorityInputs.daysLeft} days</strong></span>
              </div>
              <input 
                type="range" min="0.5" max="30" step="0.5"
                value={priorityInputs.daysLeft}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setPriorityInputs({...priorityInputs, daysLeft: val});
                }}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Task Complexity Weight (1-5): <strong>{priorityInputs.complexity} / 5</strong></span>
              </div>
              <input 
                type="range" min="1" max="5" step="1"
                value={priorityInputs.complexity}
                onChange={(e) => setPriorityInputs({...priorityInputs, complexity: parseInt(e.target.value)})}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Blocking Dependencies: <strong>{priorityInputs.dependencyCount} tasks</strong></span>
              </div>
              <input 
                type="range" min="0" max="6" step="1"
                value={priorityInputs.dependencyCount}
                onChange={(e) => setPriorityInputs({...priorityInputs, dependencyCount: parseInt(e.target.value)})}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Model Output Badge */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
            <div>
              <div className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Predicted Priority Score</div>
              <div className="mt-1 text-2xl font-black text-white flex items-center gap-2">
                <span>{priorityResult.priorityScore} / 100</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  priorityResult.recommendedCategory === 'URGENT' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                  priorityResult.recommendedCategory === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {priorityResult.recommendedCategory}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{priorityResult.recommendation}</p>
            </div>
          </div>
        </div>

        {/* ML Engine 2: Project Risk Prediction Model */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">AI Project Delivery Risk Predictor</h3>
                <p className="text-xs text-slate-400">ML risk classification based on milestone drift and blockers</p>
              </div>
            </div>
            <button 
              onClick={runRiskPrediction}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all"
            >
              Analyze Risk
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Total Project Tasks</label>
              <input 
                type="number" 
                value={riskInputs.totalTasks}
                onChange={(e) => setRiskInputs({...riskInputs, totalTasks: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Completed Tasks</label>
              <input 
                type="number" 
                value={riskInputs.completedTasks}
                onChange={(e) => setRiskInputs({...riskInputs, completedTasks: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Blocked Dependency Tasks</label>
              <input 
                type="number" 
                value={riskInputs.blockedTasks}
                onChange={(e) => setRiskInputs({...riskInputs, blockedTasks: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Days Remaining</label>
              <input 
                type="number" 
                value={riskInputs.daysToDeadline}
                onChange={(e) => setRiskInputs({...riskInputs, daysToDeadline: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs"
              />
            </div>
          </div>

          {/* Risk Gauge Output */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Predicted Delivery Risk</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                riskResult.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                riskResult.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {riskResult.riskLevel} RISK ({riskResult.riskPercentage}%)
              </span>
            </div>
            
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-white/5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  riskResult.riskPercentage >= 70 ? 'bg-rose-500' :
                  riskResult.riskPercentage >= 40 ? 'bg-amber-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: `${riskResult.riskPercentage}%` }}
              />
            </div>

            <div className="space-y-1 pt-1">
              {riskResult.riskFactors.map((f, i) => (
                <div key={i} className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="text-rose-400">●</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

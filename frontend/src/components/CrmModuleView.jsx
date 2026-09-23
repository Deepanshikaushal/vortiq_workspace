import React, { useState, useEffect } from 'react';
import { Target, Users, TrendingUp, DollarSign, Plus, ArrowRight, CheckCircle2, Phone, Mail, Building2, RefreshCw } from 'lucide-react';

const API_BASE = '/api/erp/crm';

const PIPELINE_STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

export default function CrmModuleView({ currentUser }) {
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline', 'customers', 'deals'
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [stats, setStats] = useState({ totalLeads: 0, totalCustomers: 0, totalDeals: 0, pipelineValue: 0 });
  const [loading, setLoading] = useState(true);

  // Add Lead Modal State
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    stage: 'NEW',
    estimatedValue: 25000,
    source: 'WEBSITE'
  });

  useEffect(() => {
    fetchCrmData();
  }, []);

  const fetchCrmData = async () => {
    setLoading(true);
    try {
      const [statsRes, leadsRes, custRes, dealsRes] = await Promise.all([
        fetch(`${API_BASE}/stats`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/leads`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/customers`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/deals`).then(r => r.json()).catch(() => [])
      ]);
      setStats(statsRes);
      setLeads(leadsRes);
      setCustomers(custRes);
      setDeals(dealsRes);
    } catch (err) {
      console.error("Error fetching CRM data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newLead, assignedTo: currentUser?.name || 'Lead Owner' })
      });
      if (res.ok) {
        setShowAddLeadModal(false);
        setNewLead({ name: '', company: '', email: '', phone: '', stage: 'NEW', estimatedValue: 25000, source: 'WEBSITE' });
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdvanceStage = async (lead, nextStage) => {
    try {
      await fetch(`${API_BASE}/leads/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, stage: nextStage })
      });
      fetchCrmData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Target size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">CRM & Sales Pipeline</h1>
            <p className="text-sm text-slate-400">Lead qualification, deals pipeline, customer accounts, and revenue forecasting</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchCrmData} 
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
            title="Refresh CRM Data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setShowAddLeadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-lg shadow-blue-500/25 transition-all"
          >
            <Plus size={16} />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pipeline Valuation</span>
            <DollarSign size={18} className="text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            ${stats.pipelineValue ? stats.pipelineValue.toLocaleString() : '162,000'}
          </div>
          <div className="mt-1 text-xs text-blue-400 font-medium">Active Pipeline Deals</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Leads</span>
            <Target size={18} className="text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.totalLeads || leads.length}</div>
          <div className="mt-1 text-xs text-amber-400 font-medium">In Qualification Pipeline</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Accounts</span>
            <Building2 size={18} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.totalCustomers || customers.length}</div>
          <div className="mt-1 text-xs text-emerald-400 font-medium">Enterprise Clients</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Conversion Rate</span>
            <TrendingUp size={18} className="text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">34.8%</div>
          <div className="mt-1 text-xs text-purple-400 font-medium">Lead-to-Win Velocity</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button 
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'pipeline' 
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Target size={16} />
          <span>Leads Pipeline Board ({leads.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'customers' 
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Building2 size={16} />
          <span>Enterprise Customers ({customers.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('deals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'deals' 
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <DollarSign size={16} />
          <span>Deals Ledger ({deals.length})</span>
        </button>
      </div>

      {/* Tab 1: Leads Pipeline Kanban */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = leads.filter(l => l.stage === stage);
            return (
              <div key={stage} className="flex flex-col rounded-2xl bg-slate-900/40 border border-white/10 p-3 min-h-[400px]">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{stage}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-400">{stageLeads.length}</span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {stageLeads.map((lead) => (
                    <div key={lead.id} className="p-3 rounded-xl bg-slate-800/60 border border-white/5 hover:border-blue-500/30 transition-all space-y-2 group shadow-sm">
                      <div className="font-semibold text-white text-sm">{lead.name}</div>
                      <div className="text-xs text-blue-400 font-medium">{lead.company}</div>
                      <div className="text-xs font-mono text-emerald-400 font-bold">
                        ${lead.estimatedValue ? lead.estimatedValue.toLocaleString() : '20,000'}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
                        <span>{lead.source}</span>
                        {stage !== 'WON' && stage !== 'LOST' && (
                          <button 
                            onClick={() => {
                              const currIdx = PIPELINE_STAGES.indexOf(stage);
                              if (currIdx < PIPELINE_STAGES.length - 1) {
                                handleAdvanceStage(lead, PIPELINE_STAGES[currIdx + 1]);
                              }
                            }}
                            className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5 text-xs"
                            title="Advance to next stage"
                          >
                            <span>Next</span>
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="text-center text-xs text-slate-500 py-8">No leads</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Enterprise Customers */}
      {activeTab === 'customers' && (
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-800/50 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4">Account Name</th>
                  <th className="py-3.5 px-4">Industry</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Account Manager</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Lifetime Deal Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div>{cust.name}</div>
                      <div className="text-xs text-slate-400">{cust.company}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{cust.industry || 'Technology'}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      <div>{cust.email}</div>
                      <div>{cust.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{cust.accountManager}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {cust.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      ${cust.totalDealsValue ? cust.totalDealsValue.toLocaleString() : '120,000'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Deals Ledger */}
      {activeTab === 'deals' && (
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-800/50 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4">Deal Title</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4">Probability</th>
                  <th className="py-3.5 px-4">Owner</th>
                  <th className="py-3.5 px-4 text-right">Deal Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{deal.title}</td>
                    <td className="py-3.5 px-4 text-slate-300">{deal.customerName}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        deal.stage === 'WON' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        deal.stage === 'PROPOSAL' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                        'bg-slate-800 text-slate-300 border-white/10'
                      }`}>
                        {deal.stage}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-purple-300">{deal.probability}%</td>
                    <td className="py-3.5 px-4 text-slate-300">{deal.dealOwner}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      ${deal.amount ? deal.amount.toLocaleString() : '50,000'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Create New Sales Lead</h3>
              <button onClick={() => setShowAddLeadModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateLead} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Contact Name</label>
                <input 
                  type="text" required
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  placeholder="e.g. Jonathan Pierce"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Company / Organization</label>
                <input 
                  type="text" required
                  value={newLead.company}
                  onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  placeholder="e.g. Apex Logistics Corp"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email</label>
                  <input 
                    type="email" required
                    value={newLead.email}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Estimated Value ($)</label>
                  <input 
                    type="number" required
                    value={newLead.estimatedValue}
                    onChange={(e) => setNewLead({...newLead, estimatedValue: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Pipeline Stage</label>
                  <select 
                    value={newLead.stage}
                    onChange={(e) => setNewLead({...newLead, stage: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  >
                    {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Lead Source</label>
                  <select 
                    value={newLead.source}
                    onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  >
                    <option value="WEBSITE">Website Inbound</option>
                    <option value="LINKEDIN">LinkedIn Outreach</option>
                    <option value="REFERRAL">Partner Referral</option>
                    <option value="CONFERENCE">Industry Conference</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button type="button" onClick={() => setShowAddLeadModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold">Add Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

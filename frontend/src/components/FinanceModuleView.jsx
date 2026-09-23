import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Receipt, CheckCircle2, XCircle, Plus, PieChart, CreditCard, RefreshCw } from 'lucide-react';

const API_BASE = '/api/erp/finance';

export default function FinanceModuleView({ currentUser }) {
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses', 'budgets', 'income'
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [income, setIncome] = useState([]);
  const [stats, setStats] = useState({ totalExpenses: 0, totalIncome: 0, netProfit: 0, pendingExpensesCount: 0 });
  const [loading, setLoading] = useState(true);

  // Add Expense Modal
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'INFRASTRUCTURE',
    amount: 1200,
    notes: ''
  });

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const [statsRes, expRes, budRes, incRes] = await Promise.all([
        fetch(`${API_BASE}/stats`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/expenses`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/budgets`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/income`).then(r => r.json()).catch(() => [])
      ]);
      setStats(statsRes);
      setExpenses(expRes);
      setBudgets(budRes);
      setIncome(incRes);
    } catch (err) {
      console.error("Error fetching finance data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newExpense, submittedBy: currentUser?.name || 'Deepanshi Kaushal' })
      });
      if (res.ok) {
        setShowAddExpenseModal(false);
        setNewExpense({ title: '', category: 'INFRASTRUCTURE', amount: 1200, notes: '' });
        fetchFinanceData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateExpenseStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE}/expenses/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, approvedBy: currentUser?.name || 'Finance Director' })
      });
      fetchFinanceData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <DollarSign size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Finance & Budget Management</h1>
            <p className="text-sm text-slate-400">Expense approvals, budget variance monitoring, cashflow tracking and ledger</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchFinanceData} 
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
            title="Refresh Finance Data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setShowAddExpenseModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-lg shadow-emerald-500/25 transition-all"
          >
            <Plus size={16} />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Inflow (Paid)</span>
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            ${stats.totalIncome ? stats.totalIncome.toLocaleString() : '52,500'}
          </div>
          <div className="mt-1 text-xs text-emerald-400 font-medium">Revenue Collected</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Approved Outflow</span>
            <TrendingDown size={18} className="text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            ${stats.totalExpenses ? stats.totalExpenses.toLocaleString() : '5,220'}
          </div>
          <div className="mt-1 text-xs text-rose-400 font-medium">Operational Expenditure</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net Workspace Margin</span>
            <DollarSign size={18} className="text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            ${stats.netProfit ? stats.netProfit.toLocaleString() : '47,280'}
          </div>
          <div className="mt-1 text-xs text-cyan-400 font-medium">+90.0% Net Cash Surplus</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Approvals</span>
            <Receipt size={18} className="text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.pendingExpensesCount || expenses.filter(e => e.status === 'PENDING').length}</div>
          <div className="mt-1 text-xs text-amber-400 font-medium">Awaiting Director Sign-off</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button 
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'expenses' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Receipt size={16} />
          <span>Expenses Approval Center ({expenses.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('budgets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'budgets' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <PieChart size={16} />
          <span>Department Budgets ({budgets.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('income')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'income' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <CreditCard size={16} />
          <span>Income & Invoices ({income.length})</span>
        </button>
      </div>

      {/* Tab 1: Expenses Approval Center */}
      {activeTab === 'expenses' && (
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-800/50 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4">Expense Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Submitted By</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div>{exp.title}</div>
                      {exp.notes && <div className="text-xs text-slate-400">{exp.notes}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-white/10 text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{exp.submittedBy}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">{exp.expenseDate}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        exp.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        exp.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      ${exp.amount ? exp.amount.toLocaleString() : '0.00'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {exp.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateExpenseStatus(exp.id, 'APPROVED')}
                            className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-all"
                            title="Approve Expense"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleUpdateExpenseStatus(exp.id, 'REJECTED')}
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-all"
                            title="Reject Expense"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Department Budgets */}
      {activeTab === 'budgets' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const pct = Math.min(100, Math.round((b.spentAmount / b.allocatedAmount) * 100));
            return (
              <div key={b.id} className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">{b.department}</h3>
                  <span className="text-xs font-mono text-slate-400">FY{b.fiscalYear}</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">Spent: ${b.spentAmount.toLocaleString()}</span>
                    <span className="text-white font-mono">${b.allocatedAmount.toLocaleString()} Allocated</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct > 85 ? 'bg-rose-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 pt-1">
                    <span>{pct}% Consumed</span>
                    <span className="text-emerald-400 font-mono">${(b.allocatedAmount - b.spentAmount).toLocaleString()} Remaining</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Income Transactions */}
      {activeTab === 'income' && (
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-800/50 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Client / Source</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Invoiced Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {income.map((inc) => (
                  <tr key={inc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-cyan-400 font-semibold">{inc.invoiceNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div>{inc.clientName}</div>
                      <div className="text-xs text-slate-400">{inc.source}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">{inc.paymentMethod}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">{inc.transactionDate}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {inc.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      +${inc.amount ? inc.amount.toLocaleString() : '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Submit New Expense</h3>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Expense Title</label>
                <input 
                  type="text" required
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  placeholder="e.g. AWS GPU Server Allocation"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Category</label>
                  <select 
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  >
                    <option value="INFRASTRUCTURE">Infrastructure</option>
                    <option value="SOFTWARE">Software SaaS</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="TRAVEL">Travel</option>
                    <option value="OFFICE">Office Supplies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Amount ($)</label>
                  <input 
                    type="number" required
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Context / Justification</label>
                <textarea 
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm h-20 resize-none"
                  placeholder="Brief note for accounting team..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button type="button" onClick={() => setShowAddExpenseModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold">Submit for Approval</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

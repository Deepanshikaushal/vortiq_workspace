import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, Plus, CheckCircle2, XCircle, AlertCircle, RefreshCw, Briefcase, Mail, Phone, DollarSign } from 'lucide-react';

const API_BASE = '/api/erp/hr';

export default function HrModuleView({ currentUser }) {
  const [activeTab, setActiveTab] = useState('employees'); // 'employees', 'leaves', 'attendance'
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ totalEmployees: 0, activeEmployees: 0, pendingLeaves: 0, todayPresent: 0 });
  const [loading, setLoading] = useState(true);

  // New Employee Modal State
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmp, setNewEmp] = useState({
    employeeCode: '',
    fullName: '',
    email: '',
    department: 'Engineering',
    position: '',
    salary: 95000,
    phone: ''
  });

  // Apply Leave Modal State
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    employeeName: currentUser?.name || 'Deepanshi Kaushal',
    employeeId: currentUser?.id || 1,
    leaveType: 'ANNUAL',
    startDate: '',
    endDate: '',
    daysCount: 1,
    reason: ''
  });

  useEffect(() => {
    fetchHrData();
  }, []);

  const fetchHrData = async () => {
    setLoading(true);
    try {
      const [statsRes, empRes, leaveRes, attRes] = await Promise.all([
        fetch(`${API_BASE}/stats`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/employees`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/leaves`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/attendance`).then(r => r.json()).catch(() => [])
      ]);
      setStats(statsRes);
      setEmployees(empRes);
      setLeaves(leaveRes);
      setAttendance(attRes);
    } catch (err) {
      console.error("Error fetching HR data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      const code = newEmp.employeeCode || `EMP-${Math.floor(100 + Math.random() * 900)}`;
      const res = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEmp, employeeCode: code, status: 'ACTIVE' })
      });
      if (res.ok) {
        setShowAddEmpModal(false);
        setNewEmp({ employeeCode: '', fullName: '', email: '', department: 'Engineering', position: '', salary: 95000, phone: '' });
        fetchHrData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeave)
      });
      if (res.ok) {
        setShowApplyLeaveModal(false);
        setNewLeave({ employeeName: currentUser?.name || 'Deepanshi Kaushal', employeeId: 1, leaveType: 'ANNUAL', startDate: '', endDate: '', daysCount: 1, reason: '' });
        fetchHrData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLeaveStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE}/leaves/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewedBy: currentUser?.name || 'HR Admin' })
      });
      fetchHrData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">HR & Talent Management</h1>
              <p className="text-sm text-slate-400">Employee directory, leave approvals, attendance records, and workforce analytics</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchHrData} 
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
            title="Refresh HR Data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setShowAddEmpModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm shadow-lg shadow-purple-500/25 transition-all"
          >
            <Plus size={16} />
            <span>Add Employee</span>
          </button>
          <button 
            onClick={() => setShowApplyLeaveModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 font-medium text-sm transition-all"
          >
            <Calendar size={16} />
            <span>Request Leave</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Workforce</span>
            <Users size={18} className="text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.totalEmployees || employees.length}</div>
          <div className="mt-1 text-xs text-emerald-400 font-medium flex items-center gap-1">
            <span>●</span> {stats.activeEmployees || employees.length} Active Profiles
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Leaves</span>
            <Calendar size={18} className="text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.pendingLeaves || leaves.filter(l => l.status === 'PENDING').length}</div>
          <div className="mt-1 text-xs text-amber-400 font-medium">Requires Manager Approval</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Today's Presence</span>
            <Clock size={18} className="text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">96.4%</div>
          <div className="mt-1 text-xs text-cyan-400 font-medium">{employees.length} Logged In Today</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Departments</span>
            <Briefcase size={18} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">4 Active</div>
          <div className="mt-1 text-xs text-slate-400">Engineering, Product, DevOps, Design</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button 
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'employees' 
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Users size={16} />
          <span>Employees Directory ({employees.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'leaves' 
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Calendar size={16} />
          <span>Leave Requests ({leaves.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'attendance' 
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Clock size={16} />
          <span>Daily Attendance Log</span>
        </button>
      </div>

      {/* Tab 1: Employee Directory */}
      {activeTab === 'employees' && (
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-800/50 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Position</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Compensation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-purple-400">{emp.employeeCode}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{emp.fullName}</div>
                      <div className="text-xs text-slate-400">{emp.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-white/10 text-slate-300">
                        {emp.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{emp.position}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">{emp.phone || '+1 (555) 019-2000'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        emp.status === 'ACTIVE' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-emerald-400">
                      ${emp.salary ? emp.salary.toLocaleString() : '110,000'}/yr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Leave Requests */}
      {activeTab === 'leaves' && (
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-800/50 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Days</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{leave.employeeName}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      {leave.startDate} → {leave.endDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-200">{leave.daysCount} days</td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">{leave.reason}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        leave.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        leave.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {leave.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateLeaveStatus(leave.id, 'APPROVED')}
                            className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-all"
                            title="Approve"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleUpdateLeaveStatus(leave.id, 'REJECTED')}
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-all"
                            title="Reject"
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

      {/* Tab 3: Attendance Log */}
      {activeTab === 'attendance' && (
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Daily Clock-In & Verification Log</h3>
            <span className="text-xs text-emerald-400 font-medium">● Real-Time Presence Monitor</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <div key={emp.id} className="p-4 rounded-xl bg-slate-800/40 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{emp.fullName}</div>
                  <div className="text-xs text-slate-400">{emp.position}</div>
                  <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                    <Clock size={12} /> Check-in: 09:00 AM
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  PRESENT
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Add New Employee Profile</h3>
              <button onClick={() => setShowAddEmpModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateEmployee} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" required
                  value={newEmp.fullName}
                  onChange={(e) => setNewEmp({...newEmp, fullName: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                  placeholder="e.g. Liam Vance"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                <input 
                  type="email" required
                  value={newEmp.email}
                  onChange={(e) => setNewEmp({...newEmp, email: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                  placeholder="liam@vortiq.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Department</label>
                  <select 
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({...newEmp, department: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Design">Design</option>
                    <option value="QA">QA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Position</label>
                  <input 
                    type="text" required
                    value={newEmp.position}
                    onChange={(e) => setNewEmp({...newEmp, position: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                    placeholder="Full Stack Dev"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Annual Salary ($)</label>
                <input 
                  type="number" required
                  value={newEmp.salary}
                  onChange={(e) => setNewEmp({...newEmp, salary: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button type="button" onClick={() => setShowAddEmpModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Leave Modal */}
      {showApplyLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Submit Leave Request</h3>
              <button onClick={() => setShowApplyLeaveModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleApplyLeave} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Leave Type</label>
                <select 
                  value={newLeave.leaveType}
                  onChange={(e) => setNewLeave({...newLeave, leaveType: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="ANNUAL">Annual Paid Leave</option>
                  <option value="SICK">Medical / Sick Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="MATERNITY">Maternity / Paternity</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Start Date</label>
                  <input 
                    type="date" required
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">End Date</label>
                  <input 
                    type="date" required
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Reason / Notes</label>
                <textarea 
                  required
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 h-20 resize-none"
                  placeholder="Please state the context for this leave..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button type="button" onClick={() => setShowApplyLeaveModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

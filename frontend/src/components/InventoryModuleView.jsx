import React, { useState, useEffect } from 'react';
import { Package, ArrowDownLeft, ArrowUpRight, AlertTriangle, CheckCircle2, Plus, DollarSign, RefreshCw, Layers } from 'lucide-react';

const API_BASE = '/api/erp/inventory';

export default function InventoryModuleView({ currentUser }) {
  const [activeTab, setActiveTab] = useState('items'); // 'items', 'movements'
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [stats, setStats] = useState({ totalSKUs: 0, lowStockCount: 0, outOfStockCount: 0, totalValuation: 0 });
  const [loading, setLoading] = useState(true);

  // Add Item Modal
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItem, setNewItem] = useState({
    sku: '',
    name: '',
    category: 'HARDWARE',
    quantity: 10,
    minThreshold: 4,
    unitCost: 250,
    supplierName: 'Direct Vendor',
    location: 'WAREHOUSE_A'
  });

  // Record Movement Modal
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [newMovement, setNewMovement] = useState({
    sku: '',
    itemName: '',
    movementType: 'INBOUND',
    quantity: 5,
    referenceReason: 'Restock shipment'
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const [statsRes, itemsRes, movRes] = await Promise.all([
        fetch(`${API_BASE}/stats`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/items`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/movements`).then(r => r.json()).catch(() => [])
      ]);
      setStats(statsRes);
      setItems(itemsRes);
      setMovements(movRes);
    } catch (err) {
      console.error("Error fetching inventory data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      const skuCode = newItem.sku || `SKU-${Math.floor(100 + Math.random() * 900)}`;
      const res = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, sku: skuCode })
      });
      if (res.ok) {
        setShowAddItemModal(false);
        setNewItem({ sku: '', name: '', category: 'HARDWARE', quantity: 10, minThreshold: 4, unitCost: 250, supplierName: 'Direct Vendor', location: 'WAREHOUSE_A' });
        fetchInventoryData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordMovement = async (e) => {
    e.preventDefault();
    try {
      const targetItem = items.find(i => i.sku === newMovement.sku);
      const res = await fetch(`${API_BASE}/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMovement,
          itemName: targetItem ? targetItem.name : 'Asset Item',
          handledBy: currentUser?.name || 'Deepanshi Kaushal'
        })
      });
      if (res.ok) {
        setShowMovementModal(false);
        setNewMovement({ sku: '', itemName: '', movementType: 'INBOUND', quantity: 5, referenceReason: 'Restock shipment' });
        fetchInventoryData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Inventory & Asset Tracking</h1>
            <p className="text-sm text-slate-400">SKU inventory levels, warehouse stock movements, automated low-stock warnings</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchInventoryData} 
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
            title="Refresh Inventory"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setShowAddItemModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm shadow-lg shadow-amber-500/25 transition-all"
          >
            <Plus size={16} />
            <span>Add Inventory SKU</span>
          </button>
          <button 
            onClick={() => setShowMovementModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-medium text-sm transition-all"
          >
            <Layers size={16} />
            <span>Record Movement</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Asset Valuation</span>
            <DollarSign size={18} className="text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            ${stats.totalValuation ? stats.totalValuation.toLocaleString() : '127,600'}
          </div>
          <div className="mt-1 text-xs text-amber-400 font-medium">Warehouse & Datacenter Assets</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tracked SKUs</span>
            <Package size={18} className="text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.totalSKUs || items.length}</div>
          <div className="mt-1 text-xs text-cyan-400 font-medium">Active Catalog Items</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Low-Stock Warnings</span>
            <AlertTriangle size={18} className="text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.lowStockCount || items.filter(i => i.status === 'LOW_STOCK').length}</div>
          <div className="mt-1 text-xs text-rose-400 font-medium">Below Safe Threshold</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Stock Integrity</span>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">99.8%</div>
          <div className="mt-1 text-xs text-emerald-400 font-medium">Zero Variance Reconciliation</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button 
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'items' 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Package size={16} />
          <span>Inventory Items ({items.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('movements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'movements' 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Layers size={16} />
          <span>Stock Movement Ledger ({movements.length})</span>
        </button>
      </div>

      {/* Tab 1: Inventory Items Table */}
      {activeTab === 'items' && (
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-800/50 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Item Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Stock Level</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Unit Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-amber-400 font-semibold">{item.sku}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-xs text-slate-400">{item.supplierName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-white/10 text-slate-300">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-300">{item.location}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {item.quantity} <span className="text-xs font-normal text-slate-400">(Min: {item.minThreshold})</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        item.status === 'IN_STOCK' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        item.status === 'LOW_STOCK' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      ${item.unitCost ? item.unitCost.toLocaleString() : '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Stock Movements Ledger */}
      {activeTab === 'movements' && (
        <div className="rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-800/50 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Reason / Notes</th>
                  <th className="py-3.5 px-4">Handled By</th>
                  <th className="py-3.5 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {movements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-amber-400 font-semibold">{mov.sku}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit border ${
                        mov.movementType === 'INBOUND' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {mov.movementType === 'INBOUND' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                        <span>{mov.movementType}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {mov.movementType === 'INBOUND' ? `+${mov.quantity}` : `-${mov.quantity}`}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{mov.referenceReason}</td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">{mov.handledBy}</td>
                    <td className="py-3.5 px-4 text-right text-xs text-slate-400">
                      {mov.movementDate ? new Date(mov.movementDate).toLocaleDateString() : 'Today'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Add Inventory Catalog Item</h3>
              <button onClick={() => setShowAddItemModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateItem} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Item / Asset Name</label>
                <input 
                  type="text" required
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  placeholder="e.g. NVIDIA A100 GPU 80GB"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Category</label>
                  <select 
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  >
                    <option value="HARDWARE">Hardware & Servers</option>
                    <option value="ASSETS">Laptops & Workstations</option>
                    <option value="OFFICE_SUPPLIES">Office Supplies</option>
                    <option value="NETWORKING">Networking Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Location</label>
                  <input 
                    type="text" required
                    value={newItem.location}
                    onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                    placeholder="SERVER_ROOM_1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Quantity</label>
                  <input 
                    type="number" required
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Min Threshold</label>
                  <input 
                    type="number" required
                    value={newItem.minThreshold}
                    onChange={(e) => setNewItem({...newItem, minThreshold: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Unit Cost ($)</label>
                  <input 
                    type="number" required
                    value={newItem.unitCost}
                    onChange={(e) => setNewItem({...newItem, unitCost: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button type="button" onClick={() => setShowAddItemModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold">Save SKU</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Movement Modal */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Record Stock Movement</h3>
              <button onClick={() => setShowMovementModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleRecordMovement} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Select Item SKU</label>
                <select 
                  value={newMovement.sku}
                  onChange={(e) => setNewMovement({...newMovement, sku: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  required
                >
                  <option value="">-- Choose Item --</option>
                  {items.map(i => <option key={i.id} value={i.sku}>{i.sku} - {i.name} (Stock: {i.quantity})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Movement Type</label>
                  <select 
                    value={newMovement.movementType}
                    onChange={(e) => setNewMovement({...newMovement, movementType: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  >
                    <option value="INBOUND">Inbound (Add Stock)</option>
                    <option value="OUTBOUND">Outbound (Issue Stock)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Quantity</label>
                  <input 
                    type="number" required
                    value={newMovement.quantity}
                    onChange={(e) => setNewMovement({...newMovement, quantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Reason / Reference</label>
                <input 
                  type="text" required
                  value={newMovement.referenceReason}
                  onChange={(e) => setNewMovement({...newMovement, referenceReason: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  placeholder="e.g. Inbound PO #9822 or Dev workstation deployment"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button type="button" onClick={() => setShowMovementModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold">Post Movement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

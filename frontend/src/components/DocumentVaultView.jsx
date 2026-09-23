import React, { useState, useEffect } from 'react';
import { FileText, Folder, Upload, Download, Trash2, Eye, Plus, RefreshCw, FileCode, CheckCircle2 } from 'lucide-react';

const API_BASE = '/api/erp/documents';

const CATEGORIES = ['ALL', 'ARCHITECTURE', 'CONTRACT', 'SPECIFICATION', 'REPORT', 'DESIGN'];

export default function DocumentVaultView({ currentUser }) {
  const [documents, setDocuments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stats, setStats] = useState({ totalFiles: 0, categoriesCount: 0 });
  const [loading, setLoading] = useState(true);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDoc, setNewDoc] = useState({
    fileName: '',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    category: 'SPECIFICATION',
    version: 'v1.0',
    fileUrl: '/docs/spec_v1.pdf'
  });

  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const url = selectedCategory === 'ALL' 
        ? API_BASE 
        : `${API_BASE}?category=${selectedCategory}`;
      
      const [statsRes, docsRes] = await Promise.all([
        fetch(`${API_BASE}/stats`).then(r => r.json()).catch(() => ({})),
        fetch(url).then(r => r.json()).catch(() => [])
      ]);
      setStats(statsRes);
      setDocuments(docsRes);
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDoc,
          uploadedBy: currentUser?.name || 'Deepanshi Kaushal',
          projectId: 1
        })
      });
      if (res.ok) {
        setShowUploadModal(false);
        setNewDoc({ fileName: '', fileType: 'PDF', fileSize: '2.4 MB', category: 'SPECIFICATION', version: 'v1.0', fileUrl: '/docs/spec_v1.pdf' });
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document from the vault?")) return;
    try {
      await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Folder size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Document Vault</h1>
            <p className="text-sm text-slate-400">Secure project artifacts, technical specifications, MSAs, and versioned deliverables</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDocuments} 
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
            title="Refresh Documents"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/25 transition-all"
          >
            <Upload size={16} />
            <span>Upload Artifact</span>
          </button>
        </div>
      </div>

      {/* Categories Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wider transition-all ${
              selectedCategory === cat
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Documents Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl hover:border-cyan-500/30 transition-all space-y-4 group shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {doc.fileName}
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{doc.fileSize}</span>
                    <span>•</span>
                    <span className="font-mono text-cyan-400">{doc.version}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-white/5">
              <span className="px-2.5 py-1 rounded-full font-medium bg-slate-800 border border-white/10 text-slate-300">
                {doc.category}
              </span>
              <span className="text-slate-400">By {doc.uploadedBy}</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <a
                href={`#`}
                onClick={(e) => { e.preventDefault(); alert(`Simulated secure download for ${doc.fileName}`); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium border border-white/10 transition-all"
              >
                <Download size={14} />
                <span>Download</span>
              </a>
              <button
                onClick={() => handleDelete(doc.id)}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                title="Delete document"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 text-sm">
            No documents found in category "{selectedCategory}". Click "Upload Artifact" to add one!
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Upload Document Artifact</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Document / File Name</label>
                <input 
                  type="text" required
                  value={newDoc.fileName}
                  onChange={(e) => setNewDoc({...newDoc, fileName: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  placeholder="e.g. System_Design_Architecture_v2.pdf"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Category</label>
                  <select 
                    value={newDoc.category}
                    onChange={(e) => setNewDoc({...newDoc, category: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  >
                    <option value="ARCHITECTURE">Architecture</option>
                    <option value="SPECIFICATION">Technical Spec</option>
                    <option value="CONTRACT">Contract & Legal</option>
                    <option value="REPORT">Report & Analytics</option>
                    <option value="DESIGN">Design Asset</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Version Tag</label>
                  <input 
                    type="text" required
                    value={newDoc.version}
                    onChange={(e) => setNewDoc({...newDoc, version: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                    placeholder="v2.1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Format Type</label>
                  <select 
                    value={newDoc.fileType}
                    onChange={(e) => setNewDoc({...newDoc, fileType: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="DOCX">Word DOCX</option>
                    <option value="XLSX">Excel Spreadsheet</option>
                    <option value="ZIP">Archive (ZIP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">File Size</label>
                  <input 
                    type="text" required
                    value={newDoc.fileSize}
                    onChange={(e) => setNewDoc({...newDoc, fileSize: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold">Store in Vault</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

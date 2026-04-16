import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus, Save, Trash2, Edit2, Check, X, Search, Settings, Shirt, Zap, Calendar, BarChart, User,
  Package, DollarSign, Hotel, LogOut, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';

// API Config
const API_URL = 'https://subratha.onrender.com/api';

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const colorMap = {
    pending: { bg: 'rgba(243,156,18,.15)', color: '#f39c12', border: '#f39c12' },
    picked: { bg: 'rgba(41,128,185,.15)', color: '#3498db', border: '#2980b9' },
    processing: { bg: 'rgba(155,89,182,.15)', color: '#9b59b6', border: '#8e44ad' },
    delivered: { bg: 'rgba(39,174,96,.15)', color: '#2ecc71', border: '#27ae60' },
  };
  const s = colorMap[status] || colorMap.pending;
  return (
    <span style={{
      padding: '0.3rem 0.75rem', borderRadius: 100, fontSize: '0.75rem',
      fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
      display: 'inline-block', background: s.bg, color: s.color,
      border: `1px solid ${s.border}`
    }}>
      {status}
    </span>
  );
}

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 3000 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
        <button className="modal-close" onClick={onClose}><X /></button>
        <h3 style={{ marginBottom: '1.5rem', color: '#5b3e84' }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ─── TABS ───────────────────────────────────────────────────────────────────────

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/orders/all`, { withCredentials: true });
      setOrders(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/orders/${id}`, { status: newStatus }, { withCredentials: true });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
    } catch (err) { alert('Failed to update status'); }
  };

  const filtered = orders.filter(o => {
    const customerName = o.user?.name || 'Unknown';
    const matchSearch = customerName.toLowerCase().includes(search.toLowerCase()) || o._id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status.toLowerCase() === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>Loading orders...</div>;

  return (
    <div>
      <div className="adm-toolbar">
        <div className="adm-search-wrap">
          <Search size={16} />
          <input className="adm-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." />
        </div>
        <select className="adm-select" value={filterStatus} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          {['pending', 'picked', 'processing', 'delivered'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="adm-icon-btn" onClick={fetchOrders}><Check size={16} /></button>
      </div>

      <div className="b2b-table-container">
        <table className="b2b-table">
          <thead>
            <tr>
              <th>ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o._id}>
                <td style={{ fontSize: '0.75rem', opacity: 0.6 }}>{o._id.substring(0, 8)}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{o.user?.name || 'Guest'}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{o.user?.email}</div>
                </td>
                <td>{o.items?.length || 0}</td>
                <td style={{ fontWeight: 700 }}>₹{o.totalAmount}</td>
                <td>
                  {editing === o._id ? (
                    <select className="adm-select" style={{ padding: '0.2rem' }} value={o.status} onChange={e => updateStatus(o._id, e.target.value)}>
                      {['pending', 'picked', 'processing', 'delivered'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : <StatusBadge status={o.status.toLowerCase()} />}
                </td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="adm-icon-btn" onClick={() => setEditing(editing === o._id ? null : o._id)}>
                    {editing === o._id ? <Check size={16} /> : <Edit2 size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PricingTab() {
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [expandedSvc, setExpandedSvc] = useState(null);

  // Modals state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  // Forms
  const [svcForm, setSvcForm] = useState({ name: '', unit: 'per kg', type: 'Global', basePrice: 0 });
  const [prodForm, setProdForm] = useState({ name: '', price: '', serviceName: '' });
  const [editingSvcId, setEditingSvcId] = useState(null);

  const fetchData = async () => {
    try {
      const [sRes, pRes] = await Promise.all([
        axios.get(`${API_URL}/services`),
        axios.get(`${API_URL}/products`)
      ]);
      setServices(sRes.data);
      setProducts(pRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const saveService = async () => {
    try {
      if (editingSvcId) await axios.put(`${API_URL}/services/${editingSvcId}`, svcForm, { withCredentials: true });
      else await axios.post(`${API_URL}/services`, svcForm, { withCredentials: true });
      setShowServiceModal(false);
      setEditingSvcId(null);
      fetchData();
    } catch (err) { alert('Error saving service'); }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await axios.delete(`${API_URL}/services/${id}`, { withCredentials: true });
      fetchData();
    } catch (err) { alert('Error deleting service'); }
  };

  const saveProduct = async () => {
    try {
      const existing = products.find(p => p.name.toLowerCase() === prodForm.name.toLowerCase());
      const serviceObj = { name: prodForm.serviceName, price: parseFloat(prodForm.price) };

      if (existing) {
        const updatedServices = [...existing.services.filter(s => s.name !== prodForm.serviceName), serviceObj];
        await axios.put(`${API_URL}/products/${existing._id}`, { services: updatedServices }, { withCredentials: true });
      } else {
        await axios.post(`${API_URL}/products`, {
          name: prodForm.name,
          category: 'General',
          services: [serviceObj]
        }, { withCredentials: true });
      }
      setShowProductModal(false);
      setProdForm({ name: '', price: '', serviceName: '' });
      fetchData();
    } catch (err) { alert('Error saving product'); }
  };

  const deleteProductPrice = async (pId, sName) => {
    if (!window.confirm('Remove this product price?')) return;
    try {
      const prod = products.find(p => p._id === pId);
      const filtered = prod.services.filter(s => s.name !== sName);
      if (filtered.length === 0) await axios.delete(`${API_URL}/products/${pId}`, { withCredentials: true });
      else await axios.put(`${API_URL}/products/${pId}`, { services: filtered }, { withCredentials: true });
      fetchData();
    } catch (err) { alert('Error removing price'); }
  };

  // Group products by service for the UI
  const getProductsForService = (serviceName) => {
    return products.filter(p => p.services.some(s => s.name === serviceName)).map(p => ({
      _id: p._id,
      name: p.name,
      price: p.services.find(s => s.name === serviceName).price
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#5b3e84' }}>Service & Pricing Hierarchy</h3>
        <button className="btn btn-primary" onClick={() => { setEditingSvcId(null); setSvcForm({ name: '', unit: 'per kg', type: 'Global', basePrice: '' }); setShowServiceModal(true); }}>
          <Plus size={18} style={{ marginRight: '8px' }} /> New Service
        </button>
      </div>

      {services.map(svc => {
        const isExp = expandedSvc === svc._id;
        const svcProducts = getProductsForService(svc.name);

        return (
          <div key={svc._id} className={`b2b-card hierarchy-card ${isExp ? 'expanded' : ''}`} style={{
            background: '#fff',
            padding: '0',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            border: isExp ? '2px solid #5b3e84' : '1px solid rgba(0,0,0,0.05)',
            boxShadow: isExp ? '0 10px 30px rgba(91, 62, 132, 0.1)' : '0 2px 10px rgba(0,0,0,0.02)'
          }}>
            {/* Header */}
            <div style={{
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: svc.type === 'Product-based' ? 'pointer' : 'default',
              background: isExp ? 'rgba(91, 62, 132, 0.02)' : 'transparent'
            }} onClick={() => svc.type === 'Product-based' && setExpandedSvc(isExp ? null : svc._id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: svc.type === 'Global' ? '#e1f5fe' : '#f3e5f5',
                  color: svc.type === 'Global' ? '#0288d1' : '#7b1fa2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {svc.type === 'Global' ? <Settings size={20} /> : <Package size={20} />}
                </div>
                <div>
                  <h4 style={{ margin: 0, color: '#5b3e84', fontSize: '1.1rem' }}>{svc.name}</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#b6a3ce', fontWeight: 600 }}>{svc.unit.toUpperCase()}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>•</span>
                    <span style={{ fontSize: '0.75rem', color: svc.type === 'Global' ? '#0288d1' : '#7b1fa2' }}>{svc.type}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {svc.type === 'Global' && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: '#b6a3ce', textTransform: 'uppercase' }}>Base Price</div>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#5b3e84' }}>₹{svc.basePrice}</div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="adm-icon-btn" onClick={(e) => { e.stopPropagation(); setEditingSvcId(svc._id); setSvcForm(svc); setShowServiceModal(true); }}><Edit2 size={16} /></button>
                  <button className="adm-icon-btn danger" onClick={(e) => { e.stopPropagation(); deleteService(svc._id); }}><Trash2 size={16} /></button>
                  {svc.type === 'Product-based' && (
                    <div style={{ marginLeft: '1rem', color: '#b6a3ce' }}>
                      {isExp ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Nested Products */}
            {isExp && (
              <div style={{
                padding: '0 1.5rem 1.5rem 1.5rem',
                borderTop: '1px dashed rgba(91, 62, 132, 0.1)',
                background: '#faf9fc',
                animation: 'slideDown 0.3s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.2rem 0' }}>
                  <h5 style={{ margin: 0, color: '#b6a3ce', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mapped Products</h5>
                  <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => { setProdForm({ name: '', price: '', serviceName: svc.name }); setShowProductModal(true); }}>
                    <Plus size={14} /> Add Product
                  </button>
                </div>

                {svcProducts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#b6a3ce', background: '#fff', borderRadius: '8px', border: '1px dashed rgba(91, 62, 132, 0.2)' }}>
                    No products mapped to this service yet.
                  </div>
                ) : (
                  <table className="b2b-table" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <thead>
                      <tr><th>Product Name</th><th>Price (per pc)</th><th style={{ textAlign: 'right' }}>Action</th></tr>
                    </thead>
                    <tbody>
                      {svcProducts.map(p => (
                        <tr key={p._id}>
                          <td><strong>{p.name}</strong></td>
                          <td style={{ fontWeight: 700, color: '#5b3e84' }}>₹{p.price}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="adm-icon-btn" onClick={() => { setProdForm({ name: p.name, price: p.price, serviceName: svc.name }); setShowProductModal(true); }}><Edit2 size={14} /></button>
                            <button className="adm-icon-btn danger" onClick={() => deleteProductPrice(p._id, svc.name)} style={{ marginLeft: '8px' }}><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* SERVICE MODAL */}
      <Modal isOpen={showServiceModal} onClose={() => setShowServiceModal(false)} title={editingSvcId ? "Edit Service" : "Register Service"}>
        <div className="auth-form" style={{ gap: '1rem' }}>
          <div className="input-group">
            <label className="form-label">Service Name</label>
            <input className="input-field" value={svcForm.name} onChange={e => setSvcForm({ ...svcForm, name: e.target.value })} placeholder="e.g. Wash & Fold" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="form-label">Unit</label>
              <select className="input-field" value={svcForm.unit} onChange={e => setSvcForm({ ...svcForm, unit: e.target.value })}>
                <option value="per kg">per kg</option>
                <option value="per piece">per piece</option>
              </select>
            </div>
            <div className="input-group">
              <label className="form-label">Type</label>
              <select className="input-field" value={svcForm.type} onChange={e => setSvcForm({ ...svcForm, type: e.target.value })}>
                <option value="Global">Global Service</option>
                <option value="Product-based">Product-based</option>
              </select>
            </div>
          </div>
          {svcForm.type === 'Global' && (
            <div className="input-group">
              <label className="form-label">Base Price (per kg)</label>
              <input type="number" className="input-field" value={svcForm.basePrice} onChange={e => setSvcForm({ ...svcForm, basePrice: e.target.value })} />
            </div>
          )}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={saveService}>Commit Service</button>
        </div>
      </Modal>

      {/* PRODUCT MODAL */}
      <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)} title={`Mapping Product to ${prodForm.serviceName}`}>
        <div className="auth-form" style={{ gap: '1rem' }}>
          <div className="input-group">
            <label className="form-label">Product Name</label>
            <input className="input-field" value={prodForm.name} onChange={e => setProdForm({ ...prodForm, name: e.target.value })} placeholder="e.g. Silk Saree" />
          </div>
          <div className="input-group">
            <label className="form-label">Price per Piece (₹)</label>
            <input type="number" className="input-field" value={prodForm.price} onChange={e => setProdForm({ ...prodForm, price: e.target.value })} placeholder="0.00" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={saveProduct}>Save Mapping</button>
        </div>
      </Modal>
    </div>
  );
}

function SubscriptionsTab() {
  const [subs, setSubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ userId: '', plan: 'Wash & Fold', startDate: '', endDate: '', limitKg: 25, usedKg: 0 });

  const fetchData = async () => {
    try {
      const [sRes, uRes] = await Promise.all([
        axios.get(`${API_URL}/subscriptions`, { withCredentials: true }),
        axios.get(`${API_URL}/subscriptions/users`, { withCredentials: true })
      ]);
      setSubs(sRes.data);
      setUsers(uRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const saveSub = async () => {
    if (!form.userId || !form.startDate || !form.endDate) return alert('Fill all fields');
    try {
      await axios.post(`${API_URL}/subscriptions`, form, { withCredentials: true });
      setShowModal(false);
      fetchData();
    } catch (err) { alert('Error assigning subscription'); }
  };

  const deleteSub = async (id) => {
    if (!window.confirm('Delete this subscription?')) return;
    try {
      await axios.delete(`${API_URL}/subscriptions/${id}`, { withCredentials: true });
      fetchData();
    } catch (err) { alert('Error deleting'); }
  };

  const resetUsage = async (id) => {
    try {
      await axios.patch(`${API_URL}/subscriptions/${id}/reset`, {}, { withCredentials: true });
      fetchData();
    } catch (err) { alert('Error resetting'); }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>Loading...</div>;

  return (
    <div>
      <div className="adm-toolbar">
         <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => {
           setForm({ userId: '', plan: 'Wash & Fold', startDate: '', endDate: '', limitKg: 25, usedKg: 0 });
           setShowModal(true);
         }}>
           <Plus size={16} /> Assign Subscription
         </button>
         <div style={{ flex: 1 }}></div>
         <button className="adm-icon-btn" onClick={fetchData}><RefreshCw size={16} /></button>
      </div>

      <div className="b2b-table-container">
        <table className="b2b-table">
          <thead>
            <tr>
              <th>User</th><th>Plan</th><th>Usage (Kg)</th><th>Progress</th><th>Expiry</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(subs || []).map(s => {
              const progress = Math.min(100, (s.usedKg / s.limitKg) * 100);
              return (
                <tr key={s._id}>
                  <td style={{ fontWeight: 600 }}>
                    {s.userId?.name || 'Unknown'} <br/>
                    <small style={{ opacity: 0.5, fontWeight: 400 }}>{s.userId?.email}</small>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#5b3e84' }}>{s.plan}</div>
                    <small style={{ opacity: 0.5 }}>{s.serviceType}</small>
                  </td>
                  <td style={{ fontWeight: 700 }}>{s.usedKg} / {s.limitKg}</td>
                  <td style={{ width: '150px' }}>
                    <div style={{ width: '100%', background: 'rgba(0,0,0,0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: progress > 100 ? '#f39c12' : '#5b3e84', transition: 'width 0.3s' }}></div>
                    </div>
                  </td>
                  <td>{new Date(s.endDate).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 800,
                      background: s.status === 'Active' ? 'rgba(39,174,96,0.1)' : 'rgba(231,76,60,0.1)',
                      color: s.status === 'Active' ? '#27ae60' : '#e74c3c'
                    }}>{s.status.toUpperCase()}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="adm-icon-btn" title="Reset Usage" onClick={() => resetUsage(s._id)}><RefreshCw size={14} /></button>
                      <button className="adm-icon-btn text-danger" onClick={() => deleteSub(s._id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Assign New Subscription">
        <div className="auth-form" style={{ gap: '1rem' }}>
          <div className="input-group">
            <label className="form-label">Select User</label>
            <select className="input-field" value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}>
              <option value="">-- Select User --</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="form-label">Plan Type</label>
            <select className="input-field" value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}>
              <option value="Wash & Fold">Wash & Fold (₹1999)</option>
              <option value="Wash & Iron">Wash & Iron (₹2499)</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="form-label">Start Date</label>
              <input type="date" className="input-field" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="input-group">
              <label className="form-label">End Date</label>
              <input type="date" className="input-field" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div className="input-group">
            <label className="form-label">Monthly Limit (KG)</label>
            <input type="number" className="input-field" value={form.limitKg} onChange={e => setForm({ ...form, limitKg: e.target.value })} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={saveSub}>Create Subscription</button>
        </div>
      </Modal>
    </div>
  );
}

function HotelsTab() {
  return (
    <div className="b2b-card" style={{ textAlign: 'center', padding: '5rem', background: '#fff' }}>
      <Hotel size={48} style={{ color: '#b6a3ce', marginBottom: '1.5rem' }} />
      <h3 style={{ color: '#5b3e84' }}>Partner Hotel Portal</h3>
      <p style={{ color: '#b6a3ce', maxWidth: '400px', margin: '0.5rem auto 2rem' }}>Configure specialized bulk pricing and dedicated inventory for your B2B hotel partners.</p>
      <button className="btn btn-primary" disabled style={{ opacity: 0.5 }}>Launch Hotel Manager</button>
    </div>
  );
}

// ─── MAIN ADMIN DASHBOARD ───────────────────────────────────────────────────────
const TABS = [
  { id: 'orders', label: 'Orders Desk', Icon: Package },
  { id: 'pricing', label: 'Pricing Engine', Icon: Settings },
  { id: 'subscriptions', label: 'Subscriptions', Icon: Zap },
  { id: 'hotels', label: 'B2B Hub', Icon: Hotel },
];

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="b2b-dashboard fade-in">
      <aside className="b2b-sidebar">
        <div className="b2b-brand">Subratha <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>ADMIN</span></div>
        <nav className="b2b-nav">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} className={`b2b-nav-item ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
              <Icon size={20} /> {label}
            </button>
          ))}
        </nav>
        <div className="b2b-sidebar-footer">
          <button className="b2b-nav-item text-danger" onClick={onLogout}>
            <LogOut size={20} /> Terminate Session
          </button>
        </div>
      </aside>

      <main className="b2b-main" style={{ background: '#f8f7fa' }}>
        <header className="b2b-header" style={{ padding: '1.5rem 3rem' }}>
          <h2 style={{ fontSize: '1.75rem', color: '#5b3e84' }}>{TABS.find(t => t.id === activeTab)?.label}</h2>
          <div className="b2b-user-badge">Admin Priority Access</div>
        </header>

        <div className="b2b-content fade-in" key={activeTab} style={{ padding: '0 3rem 3rem' }}>
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'pricing' && <PricingTab />}
          {activeTab === 'subscriptions' && <SubscriptionsTab />}
          {activeTab === 'hotels' && <HotelsTab />}
        </div>
      </main>
    </div>
  );
}

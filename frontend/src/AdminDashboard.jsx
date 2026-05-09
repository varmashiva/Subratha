import React, { useState, useEffect } from 'react';
import axios from './apiConfig';
import {
  Plus, Save, Trash2, Edit2, Check, X, Search, Settings, Shirt, Zap, Calendar, BarChart, User,
  Package, DollarSign, Hotel, LogOut, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';

// API Config
const API_URL = '/api';

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const colorMap = {
    pending: { bg: 'rgba(243,156,18,.15)', color: '#f39c12', border: '#f39c12' },
    pending_weight: { bg: 'rgba(155,89,182,.15)', color: '#9b59b6', border: '#8e44ad' },
    picked: { bg: 'rgba(41,128,185,.15)', color: '#3498db', border: '#2980b9' },
    confirmed: { bg: 'rgba(41,128,185,.15)', color: '#3498db', border: '#2980b9' },
    processing: { bg: 'rgba(155,89,182,.15)', color: '#9b59b6', border: '#8e44ad' },
    delivered: { bg: 'rgba(39,174,96,.15)', color: '#2ecc71', border: '#27ae60' },
    cancelled: { bg: 'rgba(239,68,68,.15)', color: '#e74c3c', border: '#c0392b' },
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

function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '1rem', color: '#5b3e84', fontWeight: 600 }}>
      <div className="spinner spinner-lg"></div>
      <p>{message}</p>
    </div>
  );
}

function ActionOverlay({ message = 'Processing...' }) {
  return (
    <div className="loading-overlay" style={{ background: 'rgba(255, 255, 255, 0.4)', zIndex: 4000 }}>
      <div className="spinner spinner-lg"></div>
      <p>{message}</p>
    </div>
  );
}

// ─── TABS ───────────────────────────────────────────────────────────────────────

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tempWeights, setTempWeights] = useState({});
  const [services, setServices] = useState([]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/orders/all`, { withCredentials: true });
      setOrders(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchServices = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/services`);
      setServices(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { 
    fetchOrders(); 
    fetchServices();
  }, []);

  const updateStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      await axios.patch(`${API_URL}/orders/${id}`, { status: newStatus }, { withCredentials: true });
      fetchOrders();
      setEditing(null);
    } catch (err) { alert('Failed to update status'); } finally { setActionLoading(false); }
  };

  const updateItems = async (id) => {
    setActionLoading(true);
    try {
      const updatedItems = tempWeights[id] || [];
      await axios.patch(`${API_URL}/orders/${id}`, { items: updatedItems }, { withCredentials: true });
      fetchOrders();
      setExpanded(null);
      setTempWeights(prev => ({ ...prev, [id]: undefined }));
    } catch (err) { alert('Error updating order items'); } finally { setActionLoading(false); }
  };

  const handleQuantityChange = (orderId, itemId, newQty) => {
    setTempWeights(prev => {
      const currentOrder = orders.find(o => o._id === orderId);
      if (!currentOrder) return prev;
      const items = prev[orderId] || currentOrder.items.map(i => ({ ...i, weight: i.weight || 0 }));
      const updatedItems = items.map(i => i._id === itemId ? { ...i, quantity: parseFloat(newQty) || 0 } : i);
      return { ...prev, [orderId]: updatedItems };
    });
  };

  const handlePriceChange = (orderId, itemId, newPrice) => {
    setTempWeights(prev => {
      const currentOrder = orders.find(o => o._id === orderId);
      if (!currentOrder) return prev;
      const items = prev[orderId] || currentOrder.items.map(i => ({ ...i, weight: i.weight || 0 }));
      const updatedItems = items.map(i => i._id === itemId ? { ...i, price: parseFloat(newPrice) || 0 } : i);
      return { ...prev, [orderId]: updatedItems };
    });
  };

  const handleWeightUpdate = (orderId, itemId, newWeight) => {
    setTempWeights(prev => {
      const currentOrder = orders.find(o => o._id === orderId);
      if (!currentOrder) return prev;
      const items = prev[orderId] || currentOrder.items.map(i => ({ ...i, weight: i.weight || 0 }));
      const updatedItems = items.map(i => i._id === itemId ? { ...i, weight: parseFloat(newWeight) || 0 } : i);
      return { ...prev, [orderId]: updatedItems };
    });
  };

  const handleGroupWeightUpdate = (orderId, serviceName, newWeight) => {
    setTempWeights(prev => {
      const currentOrder = orders.find(o => o._id === orderId);
      if (!currentOrder) return prev;
      const items = prev[orderId] || currentOrder.items.map(i => ({ ...i, weight: i.weight || 0 }));
      const serviceItems = items.filter(i => i.service === serviceName);
      const updatedItems = items.map(i => {
        if (i.service === serviceName) {
          if (i._id === serviceItems[0]._id) return { ...i, weight: parseFloat(newWeight) || 0 };
          return { ...i, weight: 0 };
        }
        return i;
      });
      return { ...prev, [orderId]: updatedItems };
    });
  };

  const handleGroupPriceUpdate = (orderId, serviceName, newPrice) => {
    setTempWeights(prev => {
      const currentOrder = orders.find(o => o._id === orderId);
      if (!currentOrder) return prev;
      const items = prev[orderId] || currentOrder.items.map(i => ({ ...i, weight: i.weight || 0 }));
      const serviceItems = items.filter(i => i.service === serviceName);
      const updatedItems = items.map(i => {
        if (i.service === serviceName) {
          if (i._id === serviceItems[0]._id) return { ...i, price: parseFloat(newPrice) || 0 };
          return { ...i, price: 0 };
        }
        return i;
      });
      return { ...prev, [orderId]: updatedItems };
    });
  };

  const filtered = orders.filter(o => {
    const customerName = o.user?.name || 'Unknown';
    const matchSearch = customerName.toLowerCase().includes(search.toLowerCase()) || o._id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status.toLowerCase() === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  if (loading) return <LoadingSpinner message="Retrieving orders..." />;

  return (
    <div>
      {actionLoading && <ActionOverlay />}
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
            {filtered.map(o => {
              const isExp = expanded === o._id;
              const isEdit = editing === o._id;
              
              return (
                <React.Fragment key={o._id}>
                  <tr 
                    onClick={() => setExpanded(isExp ? null : o._id)}
                    style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                    className={isExp ? 'active-row' : ''}
                  >
                    <td style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>#{o._id.substring(0, 8).toUpperCase()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700 }}>{o.user?.name || 'Guest'}</span>
                        {o.subscriptionApplied && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                            background: 'linear-gradient(135deg, #7c3aed, #5b3e84)',
                            color: '#fff', fontSize: '0.6rem', fontWeight: 800,
                            padding: '0.2rem 0.5rem', borderRadius: '100px',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                            boxShadow: '0 2px 8px rgba(91,62,132,0.35)',
                          }}>
                            ⚡ SUB
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{o.user?.email}</div>
                    </td>
                    <td>{o.items?.length || 0} items</td>
                    <td style={{ fontWeight: 900 }}>
                      {(() => {
                        if (!tempWeights[o._id]) return `₹${(o.totalAmount || 0).toLocaleString()}`;
                        
                        const currentItems = tempWeights[o._id] || o.items || [];
                        const liveTotal = currentItems.reduce((acc, item) => {
                          const svc = services.find(s => s.name === item.service);
                          const rate = item.price || (svc?.type === 'Global' ? svc.basePrice : 0);
                          return acc + (item.weight > 0 ? (item.weight * rate) : (item.quantity * rate));
                        }, 0);
                        return `₹${liveTotal.toLocaleString()}`;
                      })()}
                    </td>
                    <td>
                      {isEdit ? (
                        <select 
                          className="adm-select" 
                          style={{ padding: '0.3rem', fontSize: '0.75rem' }} 
                          value={o.status} 
                          onClick={e => e.stopPropagation()}
                          onChange={e => updateStatus(o._id, e.target.value)}
                        >
                          {['Pending', 'pending_weight', 'Picked', 'Processing', 'Out for Delivery', 'Completed', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : <StatusBadge status={(o.status || 'pending').toLowerCase()} />}
                    </td>
                    <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td>
                      <button 
                        className="adm-icon-btn" 
                        onClick={(e) => { e.stopPropagation(); setEditing(isEdit ? null : o._id); }}
                      >
                        {isEdit ? <Check size={16} /> : <Edit2 size={16} />}
                      </button>
                    </td>
                  </tr>
                  
                  {isExp && (
                    <tr>
                      <td colSpan="7" style={{ padding: 0, border: 'none' }}>
                        <div className="fade-in" style={{ 
                          background: 'rgba(91,62,132,0.02)', 
                          padding: '2rem', 
                          borderBottom: '2px solid rgba(91,62,132,0.1)',
                          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)'
                        }}>
                          {/* Order Meta Info */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                            <div>
                              <div style={{ color: '#b6a3ce', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Pickup Address</div>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#5b3e84' }}>{o.address}</div>
                            </div>
                            <div>
                              <div style={{ color: '#b6a3ce', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Contact Number</div>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#5b3e84' }}>{o.contactNumber}</div>
                            </div>
                            <div>
                              <div style={{ color: '#b6a3ce', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Scheduled Slot</div>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#5b3e84' }}>{o.pickupTime}</div>
                            </div>
                          </div>

                          {/* Items Table */}
                          <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(91,62,132,0.1)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ background: 'rgba(91,62,132,0.05)', color: '#b6a3ce', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800 }}>
                                  <th style={{ padding: '1rem', textAlign: 'left' }}>Item Detail</th>
                                  <th style={{ padding: '1rem', textAlign: 'center' }}>QTY</th>
                                  <th style={{ padding: '1rem', textAlign: 'center' }}>WT</th>
                                  <th style={{ padding: '1rem', textAlign: 'right' }}>Rate</th>
                                  <th style={{ padding: '1rem', textAlign: 'right' }}>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const itemsByService = (o.items || []).reduce((acc, item) => {
                                    if (!acc[item.service]) acc[item.service] = [];
                                    acc[item.service].push(item);
                                    return acc;
                                  }, {});

                                  return Object.entries(itemsByService).map(([serviceName, serviceItems]) => {
                                    const svcInfo = services.find(s => s.name === serviceName);
                                    const isGlobalSvc = svcInfo?.type === 'Global';
                                    
                                    const currentOrderItems = tempWeights[o._id] || o.items.map(i => ({ _id: i._id, quantity: i.quantity, weight: i.weight || 0, price: i.price, service: i.service }));
                                    
                                    // For Global services, we use the first item as the representative for group weight/price
                                    const firstItem = serviceItems[0];
                                    const groupEditingItem = currentOrderItems.find(i => i._id === firstItem._id);
                                    
                                    const isServiceSubApplied = firstItem?.subscriptionApplied;
                                    const groupPrice = (groupEditingItem?.price ?? svcInfo?.basePrice ?? 0);
                                    const totalWeight = groupEditingItem?.weight || 0;
                                    const subKgDeducted = (isServiceSubApplied && isGlobalSvc) ? (o.subscriptionKgDeducted || 0) : 0;
                                    const overageKg = Math.max(0, totalWeight - subKgDeducted);
                                    const isFullyCovered = isServiceSubApplied && isGlobalSvc && overageKg === 0 && totalWeight > 0;
                                    const serviceTotal = isGlobalSvc
                                      ? (isServiceSubApplied ? overageKg * groupPrice : totalWeight * groupPrice)
                                      : serviceItems.reduce((acc, item) => {
                                          const editingItem = currentOrderItems.find(i => i._id === item._id);
                                          return acc + ((editingItem?.weight > 0) ? (editingItem.weight * (editingItem.price || 0)) : ((editingItem?.quantity || 0) * (editingItem?.price || 0)));
                                        }, 0);

                                    return (
                                      <React.Fragment key={serviceName}>
                                        <tr style={{ background: isGlobalSvc ? 'rgba(91,62,132,0.08)' : 'rgba(91,62,132,0.04)' }}>
                                          <td colSpan={isGlobalSvc ? 2 : 4} style={{ padding: '1rem 1.25rem', borderBottom: '2px solid rgba(91,62,132,0.1)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                                              <div style={{ width: '4px', height: '18px', background: 'var(--color-primary)', borderRadius: '10px' }}></div>
                                              <span style={{ fontWeight: 900, color: '#5b3e84', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                                                {serviceName}
                                              </span>
                                              {isServiceSubApplied && isGlobalSvc && (
                                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#7c3aed', background: '#7c3aed15', border: '1px solid #7c3aed33', padding: '0.15rem 0.5rem', borderRadius: '100px' }}>
                                                  ⚡ {subKgDeducted}kg free by subscription
                                                </span>
                                              )}
                                            </div>
                                          </td>
                                          {isGlobalSvc ? (
                                            <>
                                              <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                                                  <input 
                                                    type="number" 
                                                    className="adm-input" 
                                                    style={{ 
                                                      width: '85px', textAlign: 'center', padding: '0.5rem',
                                                      borderRadius: '10px', border: '2px solid var(--color-primary)',
                                                      background: '#fff', fontWeight: 900, transition: 'all 0.2s',
                                                      boxShadow: '0 2px 8px rgba(91,62,132,0.1)'
                                                    }} 
                                                    value={groupEditingItem?.weight ?? ''} 
                                                    onChange={e => handleGroupWeightUpdate(o._id, serviceName, e.target.value)}
                                                  />
                                                  <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 800 }}>KG</span>
                                                </div>
                                                {isServiceSubApplied && totalWeight > 0 && (
                                                  <div style={{ marginTop: '0.3rem', fontSize: '0.62rem', fontWeight: 700, color: isFullyCovered ? '#16a34a' : '#f59e0b', textAlign: 'center' }}>
                                                    {isFullyCovered
                                                      ? `✓ All ${totalWeight}kg covered`
                                                      : `${subKgDeducted}kg free · ${overageKg}kg chargeable`}
                                                  </div>
                                                )}
                                              </td>
                                              <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                {isFullyCovered ? (
                                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#16a34a15', padding: '0.4rem 0.85rem', borderRadius: '100px', border: '1.5px solid #16a34a33' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a' }}>✓ Free</span>
                                                  </div>
                                                ) : (
                                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                      <span style={{ fontSize: '0.9rem', color: '#5b3e84', fontWeight: 800 }}>₹</span>
                                                      <input 
                                                        type="number" 
                                                        className="adm-input" 
                                                        style={{ 
                                                          width: '75px', textAlign: 'right', padding: '0.5rem', fontSize: '0.9rem',
                                                          borderRadius: '10px', border: '1.5px solid rgba(91,62,132,0.1)',
                                                          background: '#fff', fontWeight: 700
                                                        }} 
                                                        value={groupEditingItem?.price ?? svcInfo?.basePrice ?? ''} 
                                                        onChange={e => handleGroupPriceUpdate(o._id, serviceName, e.target.value)}
                                                      />
                                                      <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>/kg</span>
                                                    </div>
                                                  </div>
                                                )}
                                              </td>
                                              <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 900, color: isFullyCovered ? '#16a34a' : '#5b3e84', fontSize: '1.2rem' }}>
                                                {isFullyCovered ? '₹0' : `₹${serviceTotal.toLocaleString()}`}
                                              </td>
                                            </>
                                          ) : (
                                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 900, color: '#5b3e84', fontSize: '1.2rem' }}>
                                              ₹{serviceTotal.toLocaleString()}
                                            </td>
                                          )}
                                        </tr>
                                        {serviceItems.map(item => {
                                          const editingItem = currentOrderItems.find(i => i._id === item._id);
                                          const isKG = item.unit === 'kg';
                                          
                                          const itemTotal = (editingItem?.weight > 0) 
                                            ? (editingItem.weight * (editingItem.price || 0))
                                            : ((editingItem?.quantity || 0) * (editingItem?.price || 0));

                                          return (
                                            <tr key={item._id} style={{ borderTop: '1px solid rgba(91,62,132,0.05)', transition: 'background 0.2s' }}>
                                              <td style={{ padding: '1.25rem 1rem', fontWeight: 700, color: '#5b3e84', fontSize: '1rem' }}>{item.product}</td>
                                              <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                                                  <input 
                                                    type="number" 
                                                    className="adm-input" 
                                                    style={{ 
                                                      width: '65px', textAlign: 'center', padding: '0.5rem',
                                                      borderRadius: '10px', border: '1.5px solid rgba(91,62,132,0.1)',
                                                      background: isKG ? 'rgba(91,62,132,0.02)' : '#fff',
                                                      fontWeight: 700, transition: 'all 0.2s'
                                                    }} 
                                                    value={editingItem?.quantity ?? ''} 
                                                    onChange={e => handleQuantityChange(o._id, item._id, e.target.value)}
                                                  />
                                                  <span style={{ fontSize: '0.75rem', color: '#b6a3ce', fontWeight: 800, textTransform: 'uppercase' }}>pcs</span>
                                                </div>
                                              </td>
                                              {!isGlobalSvc && (
                                                <>
                                                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    {isKG ? (
                                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                                                        <input 
                                                          type="number" 
                                                          className="adm-input" 
                                                          style={{ 
                                                            width: '75px', textAlign: 'center', padding: '0.5rem',
                                                            borderRadius: '10px', border: '2px solid var(--color-primary)',
                                                            background: '#fff', fontWeight: 700, transition: 'all 0.2s'
                                                          }} 
                                                          value={editingItem?.weight ?? ''} 
                                                          onChange={e => handleWeightUpdate(o._id, item._id, e.target.value)}
                                                        />
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 800, textTransform: 'uppercase' }}>KG</span>
                                                      </div>
                                                    ) : (
                                                      <span style={{ color: '#b6a3ce', fontWeight: 700 }}>—</span>
                                                    )}
                                                  </td>
                                                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#b6a3ce' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                      <span style={{ fontSize: '0.9rem', color: '#5b3e84', fontWeight: 800 }}>₹</span>
                                                      <input 
                                                        type="number" 
                                                        className="adm-input" 
                                                        style={{ 
                                                          width: '65px', textAlign: 'right', padding: '0.5rem', fontSize: '0.9rem',
                                                          borderRadius: '10px', border: '1.5px solid rgba(91,62,132,0.1)',
                                                          background: '#fff', fontWeight: 700
                                                        }} 
                                                        value={editingItem?.price ?? ''} 
                                                        onChange={e => handlePriceChange(o._id, item._id, e.target.value)}
                                                      />
                                                      <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>/{item.unit}</span>
                                                    </div>
                                                  </td>
                                                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 900, color: '#5b3e84', fontSize: '1.1rem' }}>
                                                    ₹{itemTotal.toLocaleString()}
                                                  </td>
                                                </>
                                              )}
                                              {isGlobalSvc && <td colSpan="3"></td>}
                                            </tr>
                                          );
                                        })}
                                      </React.Fragment>
                                    );
                                  });
                                })()}
                              </tbody>
                            </table>
                          </div>

                          {/* Action Footer */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                            {tempWeights[o._id] && (
                              <button 
                                className="btn btn-primary" 
                                style={{ background: '#10b981', border: 'none', padding: '0.6rem 1.5rem' }}
                                onClick={() => updateItems(o._id)}
                              >
                                <Save size={18} style={{ marginRight: '8px' }} /> Save Changes
                              </button>
                            )}
                            <button className="btn btn-secondary" onClick={() => setExpanded(null)}>Close Details</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PricingTab() {
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const saveService = async () => {
    setActionLoading(true);
    try {
      if (editingSvcId) await axios.put(`${API_URL}/services/${editingSvcId}`, svcForm, { withCredentials: true });
      else await axios.post(`${API_URL}/services`, svcForm, { withCredentials: true });
      setShowServiceModal(false);
      setEditingSvcId(null);
      fetchData();
    } catch (err) { alert('Error saving service'); } finally { setActionLoading(false); }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/services/${id}`, { withCredentials: true });
      fetchData();
    } catch (err) { alert('Error deleting service'); } finally { setActionLoading(false); }
  };

  const saveProduct = async () => {
    setActionLoading(true);
    try {
      const existing = products.find(p => p.name.trim().toLowerCase() === prodForm.name.trim().toLowerCase());
      const parsedPrice = parseFloat(prodForm.price);
      const serviceObj = { name: prodForm.serviceName, price: isNaN(parsedPrice) ? 0 : parsedPrice };

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
    } catch (err) {
      alert('Error saving product: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally { setActionLoading(false); }
  };

  const deleteProductPrice = async (pId, sName) => {
    if (!window.confirm('Remove this product price?')) return;
    setActionLoading(true);
    try {
      const prod = products.find(p => p._id === pId);
      const filtered = prod.services.filter(s => s.name !== sName);
      if (filtered.length === 0) await axios.delete(`${API_URL}/products/${pId}`, { withCredentials: true });
      else await axios.put(`${API_URL}/products/${pId}`, { services: filtered }, { withCredentials: true });
      fetchData();
    } catch (err) { alert('Error removing price'); } finally { setActionLoading(false); }
  };

  // Group products by service for the UI
  const getProductsForService = (serviceName) => {
    return products.filter(p => p.services.some(s => s.name === serviceName)).map(p => ({
      _id: p._id,
      name: p.name,
      price: p.services.find(s => s.name === serviceName).price
    }));
  };

  if (loading) return <LoadingSpinner message="Building pricing engine..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {actionLoading && <ActionOverlay />}
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
              cursor: 'pointer',
              background: isExp ? 'rgba(91, 62, 132, 0.02)' : 'transparent'
            }} onClick={() => setExpandedSvc(isExp ? null : svc._id)}>
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
                  <div style={{ marginLeft: '1rem', color: '#b6a3ce' }}>
                    {isExp ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
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
                      <tr><th>Product Name</th><th>{svc.type === 'Global' ? 'Price' : 'Price (per pc)'}</th><th style={{ textAlign: 'right' }}>Action</th></tr>
                    </thead>
                    <tbody>
                      {svcProducts.map(p => (
                        <tr key={p._id}>
                          <td><strong>{p.name}</strong></td>
                          <td style={{ fontWeight: 700, color: '#5b3e84' }}>
                            {p.price > 0 ? `₹${p.price}` : <span style={{opacity: 0.5}}>- (Included in Global Weight)</span>}
                          </td>
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
              <select 
                className="input-field" 
                value={svcForm.unit} 
                onChange={e => {
                  const newUnit = e.target.value;
                  const newType = newUnit === 'per kg' ? 'Global' : 'Product-based';
                  setSvcForm({ ...svcForm, unit: newUnit, type: newType });
                }}
              >
                <option value="per kg">per kg</option>
                <option value="per piece">per piece</option>
              </select>
            </div>
            <div className="input-group">
              <label className="form-label">Type</label>
              <select className="input-field" value={svcForm.type} onChange={e => setSvcForm({ ...svcForm, type: e.target.value })}>
                {svcForm.unit === 'per kg' ? (
                  <option value="Global">Global Service</option>
                ) : (
                  <option value="Product-based">Product-based</option>
                )}
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
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ userId: '', plan: 'Wash & Fold', startDate: '', endDate: '', totalLimit: 25, used: 0 });

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
    setActionLoading(true);
    try {
      await axios.post(`${API_URL}/subscriptions`, form, { withCredentials: true });
      setShowModal(false);
      fetchData();
    } catch (err) { 
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert('Error assigning subscription: ' + msg); 
    } finally { setActionLoading(false); }
  };

  const deleteSub = async (id) => {
    if (!window.confirm('Delete this subscription?')) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/subscriptions/${id}`, { withCredentials: true });
      fetchData();
    } catch (err) { alert('Error deleting'); } finally { setActionLoading(false); }
  };

  const resetUsage = async (id) => {
    setActionLoading(true);
    try {
      await axios.patch(`${API_URL}/subscriptions/${id}/reset`, {}, { withCredentials: true });
      fetchData();
    } catch (err) { alert('Error resetting'); } finally { setActionLoading(false); }
  };

  if (loading) return <LoadingSpinner message="Fetching subscriptions..." />;

  return (
    <div>
      {actionLoading && <ActionOverlay />}
      <div className="adm-toolbar">
         <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => {
           setForm({ userId: '', plan: 'Wash & Fold', startDate: '', endDate: '', totalLimit: 25, used: 0 });
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
            {(subs || []).map(s => (
              <tr key={s._id}>
                <td style={{ fontWeight: 600 }}>
                  {s.userId?.name || 'Unknown'} <br/>
                  <small style={{ opacity: 0.5, fontWeight: 400 }}>{s.userId?.email}</small>
                </td>
                <td>
                  <div style={{ fontWeight: 700, color: '#5b3e84' }}>{s.plan}</div>
                  <small style={{ opacity: 0.5 }}>{s.service}</small>
                </td>
                <td style={{ fontWeight: 700 }}>{s.used} / {s.totalLimit}</td>
                <td style={{ width: '150px' }}>
                  <div style={{ width: '100%', background: 'rgba(0,0,0,0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (s.used / s.totalLimit) * 100)}%`, height: '100%', background: (s.used / s.totalLimit) * 100 > 100 ? '#f39c12' : '#5b3e84', transition: 'width 0.3s' }}></div>
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
            ))}
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
            <input type="number" className="input-field" value={form.totalLimit} onChange={e => setForm({ ...form, totalLimit: e.target.value })} />
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

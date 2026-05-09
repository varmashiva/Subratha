import React, { useState, useEffect } from 'react';
import axios from './apiConfig';
import { ArrowLeft, LogOut, Package, Clock, MapPin, CheckCircle, XCircle, Truck, RefreshCw, Zap } from 'lucide-react';

const API_URL = '/api';

function getStatusStyle(status) {
  const s = (status || '').toLowerCase();
  const map = {
    pending:           { bg: 'rgba(243,156,18,0.12)',   color: '#d97706', border: 'rgba(243,156,18,0.3)',   icon: <Clock size={14} /> },
    pending_weight:    { bg: 'rgba(155,89,182,0.12)',   color: '#8b5cf6', border: 'rgba(155,89,182,0.3)',   icon: <Zap size={14} /> },
    confirmed:         { bg: 'rgba(41,128,185,0.12)',   color: '#2980b9', border: 'rgba(41,128,185,0.3)',   icon: <CheckCircle size={14} /> },
    processing:        { bg: 'rgba(155,89,182,0.12)',   color: '#8b5cf6', border: 'rgba(155,89,182,0.3)',   icon: <RefreshCw size={14} /> },
    picked:            { bg: 'rgba(41,128,185,0.12)',   color: '#2980b9', border: 'rgba(41,128,185,0.3)',   icon: <Package size={14} /> },
    'out for delivery':{ bg: 'rgba(234,179,8,0.12)',    color: '#ca8a04', border: 'rgba(234,179,8,0.3)',    icon: <Truck size={14} /> },
    completed:         { bg: 'rgba(39,174,96,0.12)',    color: '#16a34a', border: 'rgba(39,174,96,0.3)',    icon: <CheckCircle size={14} /> },
    delivered:         { bg: 'rgba(39,174,96,0.12)',    color: '#16a34a', border: 'rgba(39,174,96,0.3)',    icon: <CheckCircle size={14} /> },
    cancelled:         { bg: 'rgba(239,68,68,0.12)',    color: '#dc2626', border: 'rgba(239,68,68,0.3)',    icon: <XCircle size={14} /> },
  };
  return map[s] || map.pending;
}

export default function ProfilePage({ user, onBack, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingSub, setLoadingSub] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/services`);
        setServices(data);
      } catch (err) { console.error(err); }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchActiveSub = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/subscriptions/my`, { withCredentials: true });
        setSubscriptions(data.subscriptions || []);
      } catch (err) {
        console.error('Error fetching subscription:', err);
      } finally {
        setLoadingSub(false);
      }
    };
    fetchActiveSub();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/orders/my`, { withCredentials: true });
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => !['completed', 'delivered', 'cancelled'].includes((o.status || '').toLowerCase())).length;
  const totalPaid = orders
    .filter(o => ['completed', 'delivered'].includes((o.status || '').toLowerCase()))
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fdfbff 0%, #f3effb 100%)',
      fontFamily: 'inherit',
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(91,62,132,0.1)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            background: 'rgba(91,62,132,0.05)', border: 'none', cursor: 'pointer',
            color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem',
            padding: '0.6rem 1.2rem', borderRadius: '100px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,62,132,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,62,132,0.05)'}
        >
          <ArrowLeft size={18} /> Home
        </button>

        <img 
          src="/images/subrathalogo.png" 
          alt="Subratha" 
          style={{ height: '52px', width: 'auto', display: 'block' }} 
        />

        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'none', border: '1px solid rgba(239,68,68,0.2)',
            color: '#dc2626', cursor: 'pointer', fontWeight: 700,
            fontSize: '0.85rem', padding: '0.6rem 1.2rem', borderRadius: '100px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem 1.5rem 6rem' }}>
        
        {/* Profile Section */}
        <div style={{
          background: 'linear-gradient(135deg, #5b3e84 0%, #3e2b5a 100%)',
          borderRadius: '28px',
          padding: '3rem',
          marginBottom: '2.5rem',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(91,62,132,0.35)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Circle */}
          <div style={{
            position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}></div>

          <div style={{
            width: '110px', height: '110px', borderRadius: '32px',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
            border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            position: 'relative', zIndex: 1
          }}>
            {user?.picture
              ? <img src={user.picture} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '3rem', fontWeight: 900 }}>{user?.name?.charAt(0) || 'U'}</span>}
          </div>

          <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff' }}>
              {user?.name || 'Guest User'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem', opacity: 0.85 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }}></div>
              <span style={{ fontSize: '1rem', fontWeight: 500 }}>{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}>
          {[
            {
              label: 'Total Orders',
              value: totalOrders,
              icon: <Package size={22} />,
              theme: '#5b3e84'
            },
            {
              label: 'Active Orders',
              value: activeOrders,
              icon: <RefreshCw size={22} />,
              theme: '#f59e0b'
            }
          ].map((stat, i) => (
            <div key={i} style={{
              background: '#fff',
              borderRadius: '24px',
              padding: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              boxShadow: '0 10px 20px rgba(91,62,132,0.04)',
              border: '1px solid rgba(91,62,132,0.08)',
              transition: 'transform 0.2s',
              cursor: 'default'
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '16px',
                background: `${stat.theme}15`, color: stat.theme,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#9488a0', fontWeight: 700, marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subscriptions Grid */}
        {subscriptions.length > 0 && (
          <div style={{ marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} fill="white" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                Active Subscriptions
              </h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              {subscriptions.map((sub, idx) => (
                <div key={sub._id || idx} style={{
                  background: '#fff',
                  borderRadius: '24px',
                  padding: '2.5rem',
                  boxShadow: '0 15px 35px rgba(91,62,132,0.06)',
                  border: '1px solid rgba(91,62,132,0.1)',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>
                          {sub.plan}
                        </h3>
                        <span style={{ background: '#4ade8020', color: '#16a34a', padding: '0.3rem 0.75rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 800 }}>ACTIVE</span>
                      </div>
                      <p style={{ margin: '0.4rem 0 0', color: '#9488a0', fontWeight: 600, fontSize: '0.95rem' }}>
                        Premium laundry coverage for {sub.service}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text)' }}>₹{sub.price}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9488a0', fontWeight: 700, textTransform: 'uppercase' }}>Per Month</div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(91,62,132,0.03)', borderRadius: '18px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: '0.9rem' }}>Usage Progress</span>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 900, fontSize: '0.9rem' }}>{sub.used} / {sub.totalLimit} KG</span>
                    </div>
                    <div style={{ width: '100%', height: '12px', background: 'rgba(91,62,132,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, (sub.used / sub.totalLimit) * 100)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #5b3e84, #7c5cb5)',
                        borderRadius: '100px',
                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#9488a0', fontSize: '0.85rem', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} />
                      Valid until {new Date(sub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 800 }}>View Plan Details →</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order History */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(91,62,132,0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={18} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
              Recent Orders
            </h2>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '6rem 0', textAlign: 'center' }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 1.5rem' }}></div>
            <p style={{ color: '#b6a3ce', fontWeight: 700 }}>Fetching your order timeline...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: '28px', padding: '5rem 2rem',
            textAlign: 'center', border: '1.5px dashed rgba(91,62,132,0.15)',
          }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(91,62,132,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#b6a3ce' }}>
              <Package size={40} strokeWidth={1.5} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--color-primary)', fontWeight: 900, fontSize: '1.5rem' }}>No Orders Found</h3>
            <p style={{ margin: 0, color: '#9488a0', fontWeight: 500 }}>Your laundry journey starts here. Place your first order today!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map((order, idx) => {
              const st = getStatusStyle(order.status);
              const isExpanded = expandedOrder === order._id;
              const date = new Date(order.createdAt);
              const isCompleted = ['completed', 'delivered'].includes((order.status || '').toLowerCase());
              const isPendingWeight = order.status === 'pending_weight';

              return (
                <div key={order._id} style={{
                  background: '#fff', 
                  borderRadius: '24px',
                  boxShadow: isExpanded ? '0 20px 40px rgba(91,62,132,0.1)' : '0 4px 15px rgba(0,0,0,0.02)',
                  border: isExpanded ? '2px solid var(--color-primary)' : '1.5px solid rgba(91,62,132,0.08)',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isExpanded ? 'translateY(-2px)' : 'none'
                }}>
                  <div
                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                    style={{
                      padding: '1.75rem 2rem',
                      display: 'flex', alignItems: 'center', gap: '1.5rem',
                      cursor: 'pointer',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '18px',
                      background: isExpanded ? 'var(--color-primary)' : 'rgba(91,62,132,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isExpanded ? '#fff' : 'var(--color-primary)', flexShrink: 0,
                      transition: 'all 0.2s'
                    }}>
                      <Package size={24} />
                    </div>

                    <div style={{ flex: 1, minWidth: '160px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 900, color: 'var(--color-text)', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                          #{order._id.substring(0, 8).toUpperCase()}
                        </span>
                        <span style={{
                          padding: '0.25rem 0.8rem', borderRadius: '100px',
                          fontSize: '0.65rem', fontWeight: 800,
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                          background: st.bg, color: st.color,
                          border: `1px solid ${st.border}`,
                        }}>
                          {order.status === 'pending_weight' ? 'Weight Pending' : (order.status || 'Pending')}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#9488a0', fontWeight: 600 }}>
                        Ordered on {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        &nbsp;· {order.items?.length || 0} items
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', textAlign: 'right' }}>
                      <div>
                        <div style={{ 
                          fontWeight: 900, 
                          fontSize: '1.4rem', 
                          color: isPendingWeight ? '#8b5cf6' : (isCompleted ? '#16a34a' : 'var(--color-text)'),
                          letterSpacing: '-0.03em'
                        }}>
                          {isPendingWeight ? 'TBD' : `₹${(order.totalAmount || 0).toLocaleString('en-IN')}`}
                        </div>
                        {!isPendingWeight && (
                          <div style={{ 
                            fontSize: '0.65rem', 
                            color: isCompleted ? '#16a34a' : '#f59e0b', 
                            fontWeight: 800, 
                            textTransform: 'uppercase',
                            marginTop: '0.2rem'
                          }}>
                            {isCompleted ? 'Payment Success' : 'Payment Pending'}
                          </div>
                        )}
                      </div>
                      <div style={{ 
                        color: 'var(--color-primary)', 
                        transform: `rotate(${isExpanded ? 180 : 0}deg)`, 
                        transition: 'transform 0.3s' 
                      }}>
                        <Zap size={20} />
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="fade-in" style={{
                      borderTop: '1.5px solid rgba(91,62,132,0.08)',
                      padding: '2rem',
                      background: 'linear-gradient(to bottom, rgba(91,62,132,0.02), #fff)',
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                        <div>
                          <div style={{ color: '#9488a0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <MapPin size={14} /> Pickup Destination
                          </div>
                          <div style={{ color: 'var(--color-text)', fontSize: '1rem', lineHeight: 1.6, fontWeight: 600 }}>{order.address}</div>
                        </div>
                        <div>
                          <div style={{ color: '#9488a0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Clock size={14} /> Scheduled Pickup
                          </div>
                          <div style={{ color: 'var(--color-text)', fontSize: '1rem', fontWeight: 600 }}>{order.pickupTime}</div>
                        </div>
                        {order.contactNumber && (
                           <div>
                           <div style={{ color: '#9488a0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                             <RefreshCw size={14} /> Contact
                           </div>
                           <div style={{ color: 'var(--color-text)', fontSize: '1rem', fontWeight: 600 }}>{order.contactNumber}</div>
                         </div>
                        )}
                      </div>

                      <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid rgba(91,62,132,0.08)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: 'rgba(91,62,132,0.02)' }}>
                               <th style={{ padding: '1rem 1.25rem', textAlign: 'left', color: '#9488a0', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.1em' }}>Item Detail</th>
                              <th style={{ padding: '1rem', textAlign: 'center', color: '#9488a0', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.1em' }}>QTY</th>
                              <th style={{ padding: '1rem', textAlign: 'center', color: '#9488a0', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.1em' }}>WT</th>
                              <th style={{ padding: '1rem', textAlign: 'right', color: '#9488a0', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.1em' }}>Rate</th>
                              <th style={{ padding: '1rem 1.25rem', textAlign: 'right', color: '#9488a0', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.1em' }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const itemsByService = (order.items || []).reduce((acc, item) => {
                                if (!acc[item.service]) acc[item.service] = [];
                                acc[item.service].push(item);
                                return acc;
                              }, {});

                              const rows = Object.entries(itemsByService).map(([serviceName, serviceItems]) => {
                                const svcInfo = services.find(s => s.name === serviceName);
                                const isGlobalSvc = svcInfo?.type === 'Global';

                                const firstItem = serviceItems[0];
                                const globalRate = firstItem?.price || svcInfo?.basePrice || 0;
                                const globalWeight = firstItem?.weight || 0;

                                const serviceTotal = serviceItems.reduce((acc, item) => acc + (item.total || 0), 0);

                                return (
                                  <React.Fragment key={serviceName}>
                                    <tr style={{ background: isGlobalSvc ? 'rgba(91,62,132,0.08)' : 'rgba(91,62,132,0.04)', borderBottom: '1.5px solid rgba(91,62,132,0.08)' }}>
                                      <td colSpan={isGlobalSvc ? 2 : 4} style={{ padding: '0.85rem 1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                          <div style={{ width: '3px', height: '14px', background: 'var(--color-primary)', borderRadius: '10px' }}></div>
                                          <span style={{ fontWeight: 900, color: '#5b3e84', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            {serviceName}
                                          </span>
                                        </div>
                                      </td>

                                      {isGlobalSvc ? (
                                        <>
                                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(91,62,132,0.08)', padding: '0.3rem 0.75rem', borderRadius: '100px' }}>
                                              <span style={{ fontWeight: 900, color: 'var(--color-primary)', fontSize: '0.85rem' }}>{globalWeight}</span>
                                              <span style={{ fontSize: '0.65rem', color: '#9488a0', fontWeight: 800 }}>KG</span>
                                            </div>
                                          </td>
                                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: '#9488a0', fontSize: '0.85rem' }}>
                                            ₹{globalRate}<span style={{ fontSize: '0.7rem' }}>/kg</span>
                                          </td>
                                          <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: 900, color: '#5b3e84', fontSize: '1rem' }}>
                                            ₹{serviceTotal.toLocaleString()}
                                          </td>
                                        </>
                                      ) : (
                                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: 900, color: '#5b3e84', fontSize: '1rem' }}>
                                          ₹{serviceTotal.toLocaleString()}
                                        </td>
                                      )}
                                    </tr>

                                    {serviceItems.map((item, i) => {
                                      const rate = item.price || 0;
                                      const itemTotal = item.total || 0;

                                      return (
                                        <tr key={i} style={{ borderBottom: i === serviceItems.length - 1 ? 'none' : '1px solid rgba(91,62,132,0.05)' }}>
                                          <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text)', fontWeight: 700, fontSize: '0.95rem' }}>{item.product}</td>
                                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(91,62,132,0.05)', padding: '0.3rem 0.75rem', borderRadius: '100px' }}>
                                              <span style={{ fontWeight: 900, color: 'var(--color-primary)', fontSize: '0.85rem' }}>{item.quantity}</span>
                                              <span style={{ fontSize: '0.65rem', color: '#9488a0', fontWeight: 800, textTransform: 'uppercase' }}>PCS</span>
                                            </div>
                                          </td>
                                          <td style={{ padding: '1rem', textAlign: 'center', color: '#9488a0', fontSize: '0.85rem', fontWeight: 600 }}>
                                            {isGlobalSvc ? <span style={{ color: '#b6a3ce' }}>—</span> : (item.weight > 0 ? `${item.weight} kg` : '—')}
                                          </td>
                                          <td style={{ padding: '1rem', textAlign: 'right', color: '#9488a0', fontSize: '0.85rem', fontWeight: 600 }}>
                                            {isGlobalSvc ? '—' : (rate > 0 ? `₹${rate}/pcs` : '—')}
                                          </td>
                                          <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 900, color: isGlobalSvc ? '#b6a3ce' : 'var(--color-text)', fontSize: '1rem' }}>
                                            {isGlobalSvc ? '—' : `₹${itemTotal.toLocaleString()}`}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </React.Fragment>
                                );
                              });

                              return rows;
                            })()}
                          </tbody>
                          <tfoot>
                            <tr style={{ background: 'linear-gradient(to right, rgba(91,62,132,0.05), rgba(91,62,132,0.1))' }}>
                              <td colSpan={4} style={{ padding: '1.5rem 1.25rem', textAlign: 'right', fontWeight: 800, color: 'var(--color-text)', fontSize: '1rem' }}>Final Order Value</td>
                              <td style={{ padding: '1.5rem 1.25rem', textAlign: 'right', fontWeight: 900, fontSize: '1.4rem', color: isPendingWeight ? '#8b5cf6' : (isCompleted ? '#16a34a' : 'var(--color-primary)'), letterSpacing: '-0.02em' }}>
                                {isPendingWeight ? 'TBD' : (() => {
                                  return `₹${(order.totalAmount || 0).toLocaleString('en-IN')}`;
                                })()}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { border: 3px solid rgba(91,62,132,0.1); border-top: 3px solid var(--color-primary); border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; }
        .spinner-lg { width: 40px; height: 40px; border-width: 4px; }
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

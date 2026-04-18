import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  const [activeSub, setActiveSub] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);

  useEffect(() => {
    const fetchActiveSub = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/subscriptions/my`, { withCredentials: true });
        setActiveSub(data.subscription);
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
        const { data } = await axios.get(`${API_URL}/orders/my-orders`, { withCredentials: true });
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
      background: 'linear-gradient(135deg, #f8f7fa 0%, #ede9f5 100%)',
      fontFamily: 'var(--font-primary, Inter, sans-serif)',
    }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid rgba(91,62,132,0.1)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 20px rgba(91,62,132,0.06)',
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#5b3e84', fontWeight: 600, fontSize: '0.95rem',
            padding: '0.5rem 1rem', borderRadius: '8px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,62,132,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <ArrowLeft size={20} /> Back to Home
        </button>

        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#5b3e84', letterSpacing: '-0.02em' }}>
          Subratha
        </span>

        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#dc2626', cursor: 'pointer', fontWeight: 600,
            fontSize: '0.85rem', padding: '0.5rem 1rem', borderRadius: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        {/* Profile Card */}
        <div style={{
          background: 'linear-gradient(135deg, #5b3e84 0%, #7c5cb5 100%)',
          borderRadius: '20px',
          padding: '2.5rem',
          marginBottom: '2rem',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          boxShadow: '0 20px 60px rgba(91,62,132,0.25)',
          flexWrap: 'wrap',
        }}>
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', fontWeight: 800, color: '#fff',
            overflow: 'hidden', flexShrink: 0,
            border: '3px solid rgba(255,255,255,0.3)',
          }}>
            {user?.picture
              ? <img src={user.picture} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {user?.name || 'User'}
            </h1>
            <p style={{ margin: '0.3rem 0 0', opacity: 0.75, fontSize: '0.95rem' }}>{user?.email}</p>
          </div>
        </div>

        {/* Subscription Section */}
        {activeSub && (
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            border: '2px solid rgba(91,62,132,0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ color: '#9488a0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Subscription</div>
                <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#5b3e84' }}>{activeSub.plan}</h2>
              </div>
              <div style={{
                background: 'rgba(22,163,74,0.1)', color: '#16a34a', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700
              }}>
                ACTIVE
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#1a1a2e', fontWeight: 600 }}>Usage: {activeSub.usedKg}kg / {activeSub.limitKg}kg</span>
                <span style={{ color: '#9488a0' }}>{Math.round((activeSub.usedKg / activeSub.limitKg) * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(91,62,132,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (activeSub.usedKg / activeSub.limitKg) * 100)}%`,
                  height: '100%',
                  background: activeSub.usedKg > activeSub.limitKg ? '#d97706' : '#5b3e84',
                  borderRadius: '100px',
                  transition: 'width 0.5s ease-out'
                }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: '#9488a0', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Service</div>
                <div style={{ fontSize: '0.9rem', color: '#1a1a2e', fontWeight: 600 }}>{activeSub.serviceType}</div>
              </div>
              <div>
                <div style={{ color: '#9488a0', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Valid Till</div>
                <div style={{ fontSize: '0.9rem', color: '#1a1a2e', fontWeight: 600 }}>
                  {new Date(activeSub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div>
                <div style={{ color: '#9488a0', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Plan Price</div>
                <div style={{ fontSize: '0.9rem', color: '#1a1a2e', fontWeight: 600 }}>₹{activeSub.price}/mo</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}>
          {[
            {
              label: 'Total Orders',
              value: totalOrders,
              icon: <Package size={24} />,
              color: '#5b3e84',
              bg: 'rgba(91,62,132,0.08)',
            },
            {
              label: 'Active Orders',
              value: activeOrders,
              icon: <RefreshCw size={24} />,
              color: '#d97706',
              bg: 'rgba(243,156,18,0.08)',
            },
          ].map((stat, i) => (
            <div key={i} style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(91,62,132,0.06)',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: stat.bg, color: stat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#9488a0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Orders Section */}
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1a1a2e' }}>
            Order History
          </h2>
          {totalPaid > 0 && (
            <div style={{
              background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)',
              color: '#16a34a', borderRadius: '10px', padding: '0.4rem 1rem',
              fontSize: '0.85rem', fontWeight: 700,
            }}>
              ₹{totalPaid.toLocaleString('en-IN')} paid to delivery
            </div>
          )}
        </div>

        {loading ? (
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '4rem',
            textAlign: 'center', color: '#5b3e84', fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
          }}>
            <div className="spinner spinner-lg"></div>
            <p style={{ margin: 0 }}>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '4rem',
            textAlign: 'center', color: '#9488a0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}>
            <Package size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <h3 style={{ margin: '0 0 0.5rem', color: '#5b3e84' }}>No Orders Yet</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Your order history will appear here once you place your first order.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map((order, idx) => {
              const st = getStatusStyle(order.status);
              const isExpanded = expandedOrder === order._id;
              const date = new Date(order.createdAt);
              const isCompleted = ['completed', 'delivered'].includes((order.status || '').toLowerCase());
              const isPendingWeight = order.status === 'pending_weight';

              return (
                <div key={order._id} style={{
                  background: '#fff', borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  border: isExpanded ? '2px solid rgba(91,62,132,0.3)' : '1px solid rgba(91,62,132,0.08)',
                  overflow: 'hidden',
                  transition: 'all 0.25s ease',
                }}>
                  {/* Order Header */}
                  <div
                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      cursor: 'pointer',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: 'rgba(91,62,132,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#5b3e84', flexShrink: 0,
                    }}>
                      <Package size={20} />
                    </div>

                    <div style={{ flex: 1, minWidth: '120px' }}>
                      <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem' }}>
                        Order #{order._id.substring(0, 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#9488a0', marginTop: '0.2rem' }}>
                        {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        &nbsp;· {order.items?.length || 0} item(s)
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: isPendingWeight ? '#8b5cf6' : (isCompleted ? '#16a34a' : '#1a1a2e') }}>
                          {isPendingWeight ? 'Weight pending' : `₹${(order.totalAmount || 0).toLocaleString('en-IN')}`}
                        </div>
                        {isCompleted && (
                          <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>PAID</div>
                        )}
                        {isPendingWeight && (
                          <div style={{ fontSize: '0.65rem', color: '#8b5cf6', fontWeight: 600 }}>TBD AFTER PICKUP</div>
                        )}
                      </div>

                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.3rem 0.8rem', borderRadius: '100px',
                        fontSize: '0.75rem', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                        background: st.bg, color: st.color,
                        border: `1px solid ${st.border}`,
                      }}>
                        {st.icon} {order.status === 'pending_weight' ? 'Weight Pending' : (order.status || 'Pending')}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div style={{
                      borderTop: '1px solid rgba(91,62,132,0.08)',
                      padding: '1.25rem 1.5rem',
                      background: 'rgba(91,62,132,0.02)',
                    }}>
                      {isPendingWeight && (
                        <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#8b5cf6' }}>
                          <Zap size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                          <strong>Note:</strong> Final weight and price will be updated by our concierge after verification at pickup.
                        </div>
                      )}
                      {/* Address & Time */}
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '180px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9488a0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                            <MapPin size={12} /> Pickup Address
                          </div>
                          <div style={{ color: '#1a1a2e', fontSize: '0.9rem', lineHeight: 1.5 }}>{order.address}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: '140px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9488a0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                            <Clock size={12} /> Pickup Time
                          </div>
                          <div style={{ color: '#1a1a2e', fontSize: '0.9rem' }}>{order.pickupTime}</div>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(91,62,132,0.1)' }}>
                              {['Item', 'Service', 'Qty', 'Price', 'Total'].map(h => (
                                <th key={h} style={{
                                  padding: '0.6rem 0.75rem', textAlign: h === 'Item' || h === 'Service' ? 'left' : 'right',
                                  color: '#9488a0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem',
                                  whiteSpace: 'nowrap',
                                }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(order.items || []).map((item, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid rgba(91,62,132,0.05)' }}>
                                <td style={{ padding: '0.75rem', color: '#1a1a2e', fontWeight: 600 }}>{item.product}</td>
                                <td style={{ padding: '0.75rem', color: '#5b3e84' }}>{item.service}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#1a1a2e' }}>
                                   {item.unit === 'kg' && (item.quantity === 0 || item.quantity === null) ? 'Pending' : `${item.quantity} ${item.unit || 'pcs'}`}
                                </td>
                                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#9488a0' }}>₹{item.price}{item.unit === 'kg' ? '/kg' : '/pc'}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#5b3e84' }}>
                                   {item.unit === 'kg' && (item.quantity === 0 || item.quantity === null) ? '—' : `₹${item.total}`}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={4} style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#1a1a2e', fontSize: '0.9rem' }}>
                                Total Amount
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: isPendingWeight ? '#8b5cf6' : (isCompleted ? '#16a34a' : '#5b3e84') }}>
                                {isPendingWeight ? 'TBD' : `₹${(order.totalAmount || 0).toLocaleString('en-IN')}`}
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 600px) {
          .profile-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

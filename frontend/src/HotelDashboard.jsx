import React, { useState } from 'react';
import { Home, PlusSquare, Calendar as CalendarIcon, FileText, Settings, LogOut, Printer, CreditCard, Plus, Minus } from 'lucide-react';

const HOTEL_ITEMS = [
  { id: '1', name: 'Premium Bed Sheet', price: 45 },
  { id: '2', name: 'Bath Towel', price: 25 },
  { id: '3', name: 'Hand Towel', price: 15 },
  { id: '4', name: 'Pillow Cover', price: 10 },
  { id: '5', name: 'Duvet Cover', price: 60 },
  { id: '6', name: 'Bathrobe', price: 50 },
];

const MOCK_ORDERS = [
  { id: 'ORD-8921', date: '2026-04-03', items: 124, total: 3450, status: 'Delivered' },
  { id: 'ORD-8922', date: '2026-04-04', items: 86, total: 2150, status: 'Processing' },
  { id: 'ORD-8923', date: '2026-04-05', items: 150, total: 4200, status: 'Scheduled' },
];

export default function HotelDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('new-order');
  const [orderItems, setOrderItems] = useState({});

  const updateQuantity = (id, delta) => {
    setOrderItems(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const calculateTotal = () => {
    return HOTEL_ITEMS.reduce((sum, item) => sum + (item.price * (orderItems[item.id] || 0)), 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePayment = () => {
    alert('Redirecting to Razorpay Secure Gateway for ₹9,800 payment...');
  };

  const handlePlaceOrder = () => {
    if (calculateTotal() === 0) return alert('Please add items to your order.');
    alert('B2B Order successfully placed! Confirmation sent to hotel management.');
    setOrderItems({});
    setActiveTab('orders');
  };

  return (
    <div className="b2b-dashboard fade-in">
      {/* Sidebar */}
      <aside className="b2b-sidebar">
        <div className="b2b-brand">
          Subratha <span>B2B</span>
        </div>
        
        <nav className="b2b-nav">
          <button className={`b2b-nav-item ${activeTab === 'new-order' ? 'active' : ''}`} onClick={() => setActiveTab('new-order')}>
            <PlusSquare size={20} />
            Place Order
          </button>
          <button className={`b2b-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <CalendarIcon size={20} />
            Orders & Calendar
          </button>
          <button className={`b2b-nav-item ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => setActiveTab('billing')}>
            <FileText size={20} />
            Monthly Billing
          </button>
        </nav>

        <div className="b2b-sidebar-footer">
          <button className="b2b-nav-item text-danger" onClick={onLogout}>
            <LogOut size={20} />
            Logout Portal
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="b2b-main">
        <header className="b2b-header">
          <h2>
            {activeTab === 'new-order' && 'New Hospitality Order'}
            {activeTab === 'orders' && 'Order Management'}
            {activeTab === 'billing' && 'Billing & Invoices'}
          </h2>
          <div className="b2b-user-badge">
            Taj Premium (Bangalore)
          </div>
        </header>

        <div className="b2b-content fade-in" key={activeTab}>
          {/* TAB 1: New Order */}
          {activeTab === 'new-order' && (
            <div className="b2b-grid-2">
              <div className="b2b-card">
                <h3>Select Inventory Items</h3>
                <div className="b2b-items-list">
                  {HOTEL_ITEMS.map((item) => (
                    <div key={item.id} className="b2b-item-row">
                      <div className="b2b-item-details">
                        <h4>{item.name}</h4>
                        <p>₹{item.price} / piece</p>
                      </div>
                      <div className="b2b-qty-controls">
                        <button onClick={() => updateQuantity(item.id, -1)}><Minus size={16} /></button>
                        <span>{orderItems[item.id] || 0}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}><Plus size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="b2b-card b2b-summary-card">
                <h3>Order Summary</h3>
                <div className="b2b-summary-list">
                  {HOTEL_ITEMS.filter(i => orderItems[i.id] > 0).map(item => (
                    <div key={item.id} className="summary-row">
                      <span>{item.name} x {orderItems[item.id]}</span>
                      <span>₹{item.price * orderItems[item.id]}</span>
                    </div>
                  ))}
                  {calculateTotal() === 0 && (
                    <p style={{ color: 'var(--color-secondary)', textAlign: 'center', margin: '2rem 0' }}>No items selected</p>
                  )}
                </div>
                
                <div className="b2b-summary-total">
                  <span>Estimated Total</span>
                  <span className="total-amount">₹{calculateTotal()}</span>
                </div>
                
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '1rem' }}
                  onClick={handlePlaceOrder}
                >
                  Place B2B Order
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Orders & Calendar */}
          {activeTab === 'orders' && (
            <div className="b2b-card">
              <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3>Recent Dispatches & Calendar</h3>
                <div className="flex-row">
                  <span className="status-badge processing">Processing</span>
                  <span className="status-badge delivered">Delivered</span>
                </div>
              </div>

              <div className="b2b-table-container">
                <table className="b2b-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Pickup Date</th>
                      <th>Total Items</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ORDERS.map(order => (
                      <tr key={order.id}>
                        <td><strong>{order.id}</strong></td>
                        <td>{order.date}</td>
                        <td>{order.items} pcs</td>
                        <td>₹{order.total}</td>
                        <td>
                          <span className={`status-badge ${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Billing */}
          {activeTab === 'billing' && (
            <div className="b2b-grid-2">
              <div className="b2b-card">
                <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <h3>Billing Cycle: April 2026</h3>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem' }} onClick={handlePrint}>
                    <Printer size={16} style={{ marginRight: '0.5rem' }} /> Print Invoice
                  </button>
                </div>
                
                <div className="b2b-table-container">
                  <table className="b2b-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Cycle</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Total Services Rendered</td>
                        <td>01 Apr - 30 Apr</td>
                        <td style={{ textAlign: 'right' }}>₹9,800</td>
                      </tr>
                      <tr>
                        <td>Corporate Discount (10%)</td>
                        <td>-</td>
                        <td style={{ textAlign: 'right', color: '#ff6b6b' }}>-₹980</td>
                      </tr>
                      <tr style={{ borderTop: '2px solid var(--color-border)' }}>
                        <td><strong>Total Payable</strong></td>
                        <td></td>
                        <td style={{ textAlign: 'right' }}><strong>₹8,820</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="b2b-payment-box mt-lg">
                  <div>
                    <h4>Outstanding Balance</h4>
                    <p className="total-amount" style={{ margin: 0 }}>₹8,820.00</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary)' }}>Due immediately to avoid penalty.</p>
                  </div>
                  <button className="razorpay-btn" onClick={handlePayment}>
                    <CreditCard size={18} />
                    Pay via Razorpay
                  </button>
                </div>
              </div>
              
              <div className="b2b-card">
                <h3>Contract Details</h3>
                <div style={{ marginTop: '1.5rem' }}>
                  <p><strong>Hotel Partner:</strong> Taj Premium</p>
                  <p><strong>Contract Tier:</strong> Enterprise Clean</p>
                  <p><strong>SLA:</strong> 12 Hour Turnaround</p>
                  <p><strong>Account Manager:</strong> hello@subratha.com</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

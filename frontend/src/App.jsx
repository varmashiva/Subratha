import React, { useState } from 'react';
import { X, LogIn, Mail, Waves, Shirt, Wind, Sparkles, Hotel, Zap, Tag, ShieldCheck, Award, Phone, MapPin, CheckCircle, Clock } from 'lucide-react';
import './index.css';
import HotelDashboard from './HotelDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [isHotelPortal, setIsHotelPortal] = useState(false);
  
  // Order Flow State
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderStep, setOrderStep] = useState(1);
  const [orderDetails, setOrderDetails] = useState({ service: '', address: '', time: '' });

  const handleAction = (signupToggle = false) => {
    if (!isAuthenticated) {
      setIsSignup(signupToggle);
      setShowAuthModal(true);
    } else {
      setIsOrdering(true);
      setOrderStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAuth = (e) => {
    e.preventDefault();
    setIsAuthenticated(true);
    setShowAuthModal(false);
    
    // Fast and frictionless redirect to order flow
    setTimeout(() => {
      setIsOrdering(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  if (isHotelPortal) {
    return <HotelDashboard onLogout={() => setIsHotelPortal(false)} />;
  }

  return (
    <>
      <header className="container">
        <nav className="navbar fade-in">
          <a href="/" className="navbar-brand">Subratha</a>
          <div className="flex-row">
            {!isAuthenticated ? (
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}
                onClick={() => handleAction(false)}
              >
                Sign In
              </button>
            ) : (
              <div 
                className="flex-row" 
                style={{ color: 'var(--color-primary)', fontWeight: '600' }}
              >
                Hi, Shiva
              </div>
            )}
          </div>
        </nav>
      </header>

      {!isOrdering ? (
        <>
          <main className="container hero-wrapper fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="hero-glass">
              <div className="hero-icon-container fade-in" style={{ animationDelay: '0.4s' }}>
                 <img src="/hero-icon.png" alt="Subratha Premium" className="hero-icon" />
              </div>
              
              <div className="hero-content">
                <h1 className="fade-in" style={{ animationDelay: '0.5s' }}>
                  Premium Laundry Pickup &amp; Delivery
                </h1>
                <p className="hero-subtext fade-in" style={{ animationDelay: '0.6s' }}>
                  Fast, hygienic, and reliable laundry service at your doorstep.
                </p>
                
                <div className="hero-actions fade-in" style={{ animationDelay: '0.7s' }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleAction(true)}
                  >
                    Schedule Pickup
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      const el = document.getElementById('services');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    View Services
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* Services Section */}
          <section id="services" className="container section fade-in" style={{ animationDelay: '0.9s' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
              <h2 style={{ marginBottom: '1rem' }}>Meticulous Care Services</h2>
              <p style={{ margin: '0 auto' }}>Specialized treatments for every garment in your wardrobe.</p>
            </div>

            <div className="services-grid">
              {[
                { title: "Wash & Dry", desc: "Everyday essentials cleaned and dried to perfection.", icon: <Waves size={32} /> },
                { title: "Wash & Iron", desc: "Crisp, clean, and perfectly pressed everyday wear.", icon: <Shirt size={32} /> },
                { title: "Wash & Steam Iron", desc: "Delicate steam treatment for your finest professional attire.", icon: <Wind size={32} /> },
                { title: "Dry Clean", desc: "Specialized non-toxic care for your premium fabrics.", icon: <Sparkles size={32} /> },
                { title: "OPL (Hotels)", desc: "Industrial grade laundry solutions for the hospitality sector.", icon: <Hotel size={32} /> }
              ].map((service, index) => (
                <div key={index} className="service-card fade-in" style={{ animationDelay: `${(index * 0.1) + 1.0}s` }}>
                  <div className="service-icon-wrapper">{service.icon}</div>
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-description">{service.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex-center">
              <button className="btn btn-primary" onClick={() => handleAction(false)}>
                Book a Service
              </button>
            </div>
          </section>

          {/* Why Subratha Section */}
          <section className="container section">
            <div className="fade-in" style={{ animationDelay: '1.4s' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>Why Subratha?</h2>
              <p>The gold standard in modern laundry & garment care.</p>
            </div>

            <div className="benefits-grid">
              {[
                { title: "Fast Delivery", desc: "24-hour turnaround for standard orders and same-day express options.", icon: <Zap size={28} /> },
                { title: "Affordable Pricing", desc: "Transparent, competitive rates without compromising on premium quality.", icon: <Tag size={28} /> },
                { title: "Professional Handling", desc: "Every garment is inspected by experts and treated with specialized care.", icon: <ShieldCheck size={28} /> },
                { title: "Trusted by Hotels", desc: "Proven reliability serving elite hospitality chains and boutiques.", icon: <Award size={28} /> }
              ].map((benefit, index) => (
                <div key={index} className="benefit-item fade-in" style={{ animationDelay: `${(index * 0.1) + 1.6}s` }}>
                  <div className="benefit-icon-container">{benefit.icon}</div>
                  <h3 className="benefit-title">{benefit.title}</h3>
                  <p className="benefit-description">{benefit.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex-center fade-in" style={{ marginTop: 'var(--space-lg)', animationDelay: '2s' }}>
              <button className="btn btn-primary" onClick={() => handleAction(true)}>
                Get Started
              </button>
            </div>
          </section>

          {/* Contact Section */}
          <section className="container section">
            <div className="fade-in" style={{ animationDelay: '2.4s' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>Get in Touch</h2>
              <p>Ready for the Subratha experience? Book your pickup now.</p>
            </div>

            <div className="contact-grid">
              <div className="contact-info fade-in" style={{ animationDelay: '2.6s' }}>
                <div className="info-item">
                  <div className="info-icon"><Phone size={24} /></div>
                  <div className="info-text">
                    <h4>Phone</h4><p>+91 98765 43210</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><Mail size={24} /></div>
                  <div className="info-text">
                    <h4>Email</h4><p>concierge@subratha.com</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><MapPin size={24} /></div>
                  <div className="info-text">
                    <h4>Location</h4><p>Premium Laundry Lab, Indiranagar, Bangalore</p>
                  </div>
                </div>
              </div>

              <div className="contact-form-container fade-in" style={{ animationDelay: '2.8s' }}>
                <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert('Pickup request received. Our concierge will contact you shortly.'); }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" placeholder="e.g. Shiva Varma" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="tel" className="form-input" placeholder="e.g. +91 99999 88888" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pickup Address</label>
                    <textarea className="form-input" style={{ minHeight: '100px', resize: 'vertical' }} placeholder="Street, Building, Flat No." required></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Book Pickup</button>
                </form>
              </div>
            </div>
          </section>
        </>
      ) : (
        <main className="container order-container fade-in">
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>Schedule Premium Service</h2>
          
          <div className="stepper-container">
            <div className="stepper-line"></div>
            <div className="stepper-progress" style={{ width: `${((orderStep - 1) / 3) * 100}%` }}></div>
            {['Service', 'Address', 'Time', 'Review'].map((label, i) => {
              const stepNum = i + 1;
              const isCompleted = orderStep > stepNum;
              const isActive = orderStep === stepNum;
              return (
                <div key={label} className={`step-item ${isCompleted ? 'completed' : isActive ? 'active' : ''}`}>
                  <div className="step-circle">{isCompleted ? <CheckCircle size={20} /> : stepNum}</div>
                  <div className="step-label">{label}</div>
                </div>
              );
            })}
          </div>

          <div className="order-step-content" key={orderStep}>
            {orderStep === 1 && (
              <div className="fade-in">
                <h3>Select a Service</h3>
                <div className="options-grid">
                  {['Wash & Dry', 'Wash & Iron', 'Dry Clean'].map(s => (
                     <div key={s} className={`option-card ${orderDetails.service === s ? 'selected' : ''}`} onClick={() => setOrderDetails({...orderDetails, service: s})}>
                        <div className="option-icon"><Shirt size={32} style={{ margin: '0 auto' }}/></div>
                        <h4>{s}</h4>
                     </div>
                  ))}
                </div>
              </div>
            )}
            
            {orderStep === 2 && (
               <div className="fade-in">
                 <h3>Pickup Address</h3>
                 <div className="input-group" style={{ marginBottom: '1rem' }}>
                   <label className="form-label">Street Address</label>
                   <textarea className="form-input" style={{ minHeight: '120px' }} value={orderDetails.address} onChange={(e) => setOrderDetails({...orderDetails, address: e.target.value})} placeholder="Enter your full pickup & delivery address..." />
                 </div>
               </div>
            )}

            {orderStep === 3 && (
               <div className="fade-in">
                 <h3>Choose Pickup Time</h3>
                 <div className="options-grid">
                   {['Morning (9 AM - 12 PM)', 'Afternoon (12 PM - 4 PM)', 'Evening (4 PM - 8 PM)'].map(t => (
                      <div key={t} className={`option-card ${orderDetails.time === t ? 'selected' : ''}`} onClick={() => setOrderDetails({...orderDetails, time: t})}>
                         <div className="option-icon"><Clock size={32} style={{ margin: '0 auto' }}/></div>
                         <h4 style={{ fontSize: '1rem', lineHeight: '1.4' }}>{t}</h4>
                      </div>
                   ))}
                 </div>
               </div>
            )}

            {orderStep === 4 && (
               <div className="fade-in">
                 <h3>Review Your Order</h3>
                 <div className="summary-details">
                   <div className="summary-row">
                     <span className="summary-label">Service</span>
                     <span className="summary-value">{orderDetails.service}</span>
                   </div>
                   <div className="summary-row">
                     <span className="summary-label">Address</span>
                     <span className="summary-value" style={{ textAlign: 'right', maxWidth: '60%' }}>{orderDetails.address}</span>
                   </div>
                   <div className="summary-row">
                     <span className="summary-label">Pickup Time</span>
                     <span className="summary-value">{orderDetails.time}</span>
                   </div>
                 </div>
               </div>
            )}

            <div className="order-actions">
               {orderStep > 1 ? (
                 <button className="btn btn-secondary" style={{ padding: '0.8rem 2rem' }} onClick={() => setOrderStep(orderStep - 1)}>Back</button>
               ) : (
                 <button className="btn btn-secondary" style={{ padding: '0.8rem 2rem' }} onClick={() => setIsOrdering(false)}>Cancel</button>
               )}
               
               {orderStep < 4 ? (
                 <button className="btn btn-primary" style={{ padding: '0.8rem 2rem' }} onClick={() => setOrderStep(orderStep + 1)} disabled={
                   (orderStep===1 && !orderDetails.service) ||
                   (orderStep===2 && !orderDetails.address.trim()) ||
                   (orderStep===3 && !orderDetails.time)
                 }>Next Step</button>
               ) : (
                 <button className="btn btn-primary" style={{ padding: '0.8rem 2rem' }} onClick={() => {
                   alert(`Success! Our concierge will arrive for your ${orderDetails.service} pickup during ${orderDetails.time}.`);
                   setIsOrdering(false);
                   setOrderDetails({ service: '', address: '', time: '' });
                 }}>Confirm Order</button>
               )}
            </div>
          </div>
        </main>
      )}

      <footer className="footer container fade-in" style={{ animationDelay: '3s' }}>
        <p style={{ fontSize: '0.9rem', opacity: 0.6 }}>
          &copy; 2026 Subratha Premium Laundry. All rights reserved.
        </p>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ textAlign: 'center' }}
          >
            <button className="modal-close" onClick={() => setShowAuthModal(false)}>
              <X />
            </button>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                {isSignup ? 'Create Account' : 'Experience Premium'}
              </h2>
              <p style={{ fontSize: '1rem' }}>
                {isSignup ? 'Sign up for elite wardrobe care.' : 'Log in to Subratha for elite care.'}
              </p>
            </div>

            <div className="auth-form">
              <button className="google-btn" onClick={handleAuth}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isSignup ? 'Sign up with Google' : 'Continue with Google'}
              </button>

              <div className="divider">or use email</div>

              <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {isSignup && (
                  <div className="input-group" style={{ textAlign: 'left' }}>
                    <input type="text" className="input-field" placeholder="Full Name" required />
                  </div>
                )}
                <div className="input-group" style={{ textAlign: 'left' }}>
                  <input type="email" className="input-field" placeholder="Email address" required />
                </div>
                <div className="input-group" style={{ textAlign: 'left' }}>
                  <input type="password" className="input-field" placeholder="Password" required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }}>
                  {isSignup ? 'Create Account' : 'Sign In'}
                </button>
              </form>
            </div>
            
            <p style={{ fontSize: '0.85rem', marginTop: 'var(--space-md)' }}>
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setIsSignup(!isSignup); }} 
                style={{ color: 'var(--color-primary)', fontWeight: '600' }}
              >
                {isSignup ? 'Sign In' : 'Create one'}
              </a>
            </p>

            <button 
              className="btn btn-secondary" 
              style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem', fontSize: '0.9rem', borderColor: 'rgba(255,255,255,0.2)' }}
              onClick={() => { setIsHotelPortal(true); setShowAuthModal(false); }}
            >
              <Hotel size={16} style={{ marginRight: '0.5rem' }} /> Hotel Partner Login
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;

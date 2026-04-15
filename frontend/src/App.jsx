import React, { useState } from 'react';
import axios from 'axios';
import { X, LogIn, Mail, Waves, Shirt, Wind, Sparkles, Hotel, Zap, Tag, ShieldCheck, Award, Phone, MapPin, CheckCircle, Clock, User, Menu } from 'lucide-react';
import './index.css';
import HotelDashboard from './HotelDashboard';
import AdminDashboard from './AdminDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [isHotelPortal, setIsHotelPortal] = useState(false);
  const [isAdminPortal, setIsAdminPortal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [globalScrollProgress, setGlobalScrollProgress] = useState(0);

  // Order Flow State
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderStep, setOrderStep] = useState(1);
  const [products, setProducts] = useState([]); const [globalServices, setGlobalServices] = useState([]);
  const [cart, setCart] = useState([]);
  const [isKgBased, setIsKgBased] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState(1);
  const [orderDetails, setOrderDetails] = useState({ address: '', time: '', service: '' });

  const fetchProducts = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        axios.get('https://subratha.onrender.com/api/products'),
        axios.get('https://subratha.onrender.com/api/services')
      ]);
      setProducts(pRes.data);
      setGlobalServices(sRes.data.filter(s => s.type === 'Global'));
    } catch (err) {
      console.error('Error fetching pricing data:', err);
    }
  };

  // Persistent Auth Check
  const checkAuthStatus = async () => {
    try {
      const { data } = await axios.get('https://subratha.onrender.com/api/auth/me', { withCredentials: true });
      if (data.user) {
        setIsAuthenticated(true);
        setUser({
          name: data.user.name || 'Shiva Varma',
          email: data.user.email,
          picture: data.user.picture || null,
          role: data.user.role || 'user'
        });
      }
    } catch (err) {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get('https://subratha.onrender.com/api/auth/logout', { withCredentials: true });
    } catch (err) {
      console.error('Logout error', err);
    }
    setIsAuthenticated(false);
    setUser(null);
    setShowProfileDropdown(false);
    setIsOrdering(false);
    setCart([]);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const handleOrderSubmit = async () => {
    try {
      const totalAmount = calculateTotal();
      const payload = {
        items: cart,
        address: orderDetails.address,
        time: orderDetails.time,
        totalAmount
      };
      const response = await axios.post('https://subratha.onrender.com/api/orders', payload, { withCredentials: true });
      if (response.data.success) {
        alert(`Success! Our concierge will arrive for your pickup during ${orderDetails.time}. Total Amount: ₹${totalAmount}`);
        setIsOrdering(false);
        setCart([]);
        setOrderDetails({ address: '', time: '' });
      }
    } catch (err) {
      alert('Error placing order. Please try again.');
    }
  };

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
  };

  const handleGoogleLogin = () => {
    // Redirect to the backend OAuth route
    window.location.href = 'https://subratha.onrender.com/api/auth/google';
  };

  const storyRef = React.useRef(null);
  const worksRef = React.useRef(null);
  const [activeStep, setActiveStep] = React.useState(1);
  const [activeWorksStep, setActiveWorksStep] = React.useState(0);
  const [worksScrollProgress, setWorksScrollProgress] = React.useState(0);

  React.useEffect(() => {
    checkAuthStatus();
    fetchProducts();
  }, []);

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    setTimeout(() => {
      document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    }, 100);

    return () => observer.disconnect();
  }, [isOrdering]);

  React.useEffect(() => {
    const handleScroll = () => {
      if (storyRef.current) {
        const rect = storyRef.current.getBoundingClientRect();
        const scrollProgress = -rect.top / (rect.height - window.innerHeight);

        if (scrollProgress < 0.25) setActiveStep(1);
        else if (scrollProgress < 0.5) setActiveStep(2);
        else if (scrollProgress < 0.75) setActiveStep(3);
        else setActiveStep(4);
      }

      if (worksRef.current) {
        const rect = worksRef.current.getBoundingClientRect();
        // User's recommended scroll math to track viewport interception
        const progress = Math.min(
          Math.max((window.innerHeight - rect.top) / rect.height, 0),
          1
        );

        setWorksScrollProgress(progress);

        let step = Math.floor(progress * 5);
        if (step > 4) step = 4; // clamp to max index
        setActiveWorksStep(step);
      }

      // Global Scroll Progress
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setGlobalScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAdminPortal) {
    return <AdminDashboard onLogout={() => setIsAdminPortal(false)} />;
  }

  if (isHotelPortal) {
    return <HotelDashboard onLogout={() => setIsHotelPortal(false)} />;
  }

  return (
    <>
      <header>
        <nav className="navbar fade-in">
          <a href="/" className="navbar-brand">Subratha</a>
          <div className="flex-row">
            {!isAuthenticated ? (
              <div
                className="user-profile user-profile--guest"
                onClick={() => { setIsSignup(false); setShowAuthModal(true); }}
                title="Sign In"
              >
                <div className="user-avatar user-avatar--guest">
                  <User size={22} strokeWidth={1.5} />
                </div>
              </div>
            ) : (
              <div className={`user-profile ${showProfileDropdown ? 'active' : ''}`} onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                <div className="user-avatar">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} />
                  ) : (
                    user?.name ? user.name.charAt(0).toUpperCase() : 'S'
                  )}
                </div>

                {showProfileDropdown && (
                  <div className="dropdown-menu">
                    {user?.role === 'admin' && (
                      <button
                        className="dropdown-item"
                        style={{ color: 'var(--color-primary)', fontWeight: '600' }}
                        onClick={() => { setIsAdminPortal(true); setShowProfileDropdown(false); }}
                      >
                        ⚙ Admin Dashboard
                      </button>
                    )}
                    <button className="dropdown-item">
                      <Phone size={16} /> My Orders
                    </button>
                    <button className="dropdown-item">
                      <ShieldCheck size={16} /> Profile Settings
                    </button>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <LogIn size={16} style={{ transform: 'rotate(180deg)' }} /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}


          </div>

          {/* Mobile Menu Overlay */}
          {showMobileMenu && (
            <div className={`mobile-menu-overlay ${showMobileMenu ? 'active' : ''}`} onClick={() => setShowMobileMenu(false)}>
              <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
                <div className="mobile-menu-header">
                  <span className="navbar-brand">Subratha</span>
                  <button className="mobile-menu-close" onClick={() => setShowMobileMenu(false)}>
                    <X size={28} />
                  </button>
                </div>
                <div className="mobile-menu-links">
                  <a href="/" onClick={() => setShowMobileMenu(false)}>Home</a>
                  <button onClick={() => { handleAction(true); setShowMobileMenu(false); }}>Schedule Pickup</button>
                  <a href="#" onClick={() => setShowMobileMenu(false)}>Our Services</a>
                  <div className="mobile-menu-divider"></div>
                  {isAuthenticated ? (
                    <>
                      {user?.role === 'admin' && (
                        <button className="mobile-menu-item admin-link" onClick={() => { setIsAdminPortal(true); setShowMobileMenu(false); }}>
                          ⚙ Admin Dashboard
                        </button>
                      )}
                      <button className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>My Orders</button>
                      <button className="mobile-menu-item text-danger" onClick={() => { handleLogout(); setShowMobileMenu(false); }}>
                        Logout
                      </button>
                    </>
                  ) : (
                    <button className="mobile-menu-item" onClick={() => { setIsSignup(false); setShowAuthModal(true); setShowMobileMenu(false); }}>
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {!isOrdering ? (
        <>
          <main className="hero-wrapper fade-in" style={{ animationDelay: '0.2s' }}>
            <video
              className="hero-video-mobile"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source src="/images/mobile_land.mov" type="video/mp4" />
              <source src="/images/mobile_land.mov" type="video/quicktime" />
            </video>
            <div className="hero-content">
              <div className="hero-glass-box">
                <h1 className="reveal-text">
                  <span className="reveal-text-inner" style={{ animationDelay: '0.4s' }}>Subratha</span>
                  <span className="reveal-text-inner" style={{ animationDelay: '0.6s' }}>Concierge</span>
                </h1>

                <div className="hero-separator fade-in" style={{ animationDelay: '0.8s' }}></div>

                <div className="hero-meta fade-in" style={{ animationDelay: '0.9s' }}>
                  <span className="dot"></span>
                  <span className="letter-animation">
                    {"Service 01/04".split('').map((char, i) => (
                      <span key={i} className={`stagger-${(i % 5) + 1}`} style={{ animationDelay: `${1.0 + (i * 0.05)}s` }}>{char === ' ' ? '\u00A0' : char}</span>
                    ))}
                  </span>
                </div>

                <p className="hero-subtext fade-in" style={{ animationDelay: '1.2s' }}>
                  A premium wardrobe care community with professional handling and door-to-door concierge service.
                </p>

                <div className="hero-actions fade-in" style={{ animationDelay: '0.8s' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAction(true)}
                  >
                    Schedule Pickup
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* Storytelling Section */}
          <section className="story-scroll-container" ref={storyRef}>
            <div className="story-sticky-wrapper">
              <div className="story-grid">
                <div className="story-left">
                  {[1, 2, 3, 4].map(n => (
                    <h2 key={n} className={`story-number ${activeStep === n ? 'active' : activeStep > n ? 'past' : 'next'}`}>
                      {n}
                    </h2>
                  ))}
                </div>

                <div className="story-right">
                  {[
                    {
                      step: 1,
                      label: "Everyday Care",
                      title: "Wash and dry",
                      desc: "Perfectly cleaned and dried everyday wear for maximum comfort and hygiene, delivered fresh to your door.",
                      img: "/images/service-1.jpg"
                    },
                    {
                      step: 2,
                      label: "Crisp & Clean",
                      title: "Wash and iron",
                      desc: "Deep cleaning followed by professional ironing for a sharp, fresh look suitable for business or formal wear.",
                      img: "/images/service-2.jpg"
                    },
                    {
                      step: 3,
                      label: "Premium Treatment",
                      title: "Wash and steam iron",
                      desc: "Delicate washing with professional steam ironing to preserve fabric quality and provide a wrinkle-free finish.",
                      img: "/images/wash-steam.png"
                    },
                    {
                      step: 4,
                      label: "Expert Care",
                      title: "Dry clean",
                      desc: "Specialized eco-friendly chemical cleaning for delicate fabrics, high-end garments, and designer wear.",
                      img: "/images/service-4.jpg"
                    }
                  ].map((s) => (
                    <div key={s.step} className={`story-step-content ${activeStep === s.step ? 'active' : activeStep > s.step ? 'past' : 'next'}`}>
                      <span className="story-label">{s.label}</span>
                      <h3 className="story-title">{s.title}</h3>
                      <div className="story-image-wrap">
                        <img src={s.img} alt={s.title} />
                      </div>
                      <p className="story-description">{s.desc}</p>
                      <div className="story-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleAction(true)}
                        >
                          Schedule Pickup
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section Divider */}
          <div className="container">
            <hr style={{ border: 'none', borderTop: '1px solid rgba(91, 62, 132, 0.15)', margin: '4rem auto -4rem auto', width: '85%' }} />
          </div>

          {/* Why Subratha Section */}
          <section className="container section">
            <div className="scroll-reveal" style={{ transitionDelay: '0.1s' }}>
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
                <div key={index} className="benefit-item scroll-reveal" style={{ transitionDelay: `${(index * 0.1) + 0.2}s` }}>
                  <div className="benefit-icon-container">{benefit.icon}</div>
                  <h3 className="benefit-title">{benefit.title}</h3>
                  <p className="benefit-description">{benefit.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex-center scroll-reveal" style={{ marginTop: 'var(--space-lg)', transitionDelay: '0.6s' }}>
              <button className="btn btn-primary" onClick={() => handleAction(true)}>
                Get Started
              </button>
            </div>
          </section>

          {/* Section Divider */}
          <div className="container">
            <hr style={{ border: 'none', borderTop: '1px solid rgba(91, 62, 132, 0.15)', margin: '-2rem auto 2rem auto', width: '85%' }} />
          </div>

          {/* How It Works Section */}
          <section className="works-scroll-container" ref={worksRef}>
            <div className="works-sticky-wrapper">
              <div className="container" style={{ width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
                  <h2 style={{ marginBottom: '0.5rem' }}>How It Works</h2>
                  <p style={{ margin: '0 auto' }}>Laundry in 5 Simple Steps</p>
                </div>

                <div className="works-grid">
                  <div className="timeline-container">
                    {[
                      { title: "Order Placed", desc: "Place your order easily through our website", icon: <CheckCircle size={24} strokeWidth={1.5} /> },
                      { title: "Laundry Pickup", desc: "We collect your clothes from your doorstep", icon: <MapPin size={24} strokeWidth={1.5} /> },
                      { title: "Processing", desc: "Clothes are washed, dried, and ironed", icon: <Waves size={24} strokeWidth={1.5} /> },
                      { title: "Delivery", desc: "Fresh clothes delivered back to you", icon: <Shirt size={24} strokeWidth={1.5} /> },
                      { title: "Payment", desc: "Pay easily after delivery", icon: <Tag size={24} strokeWidth={1.5} /> }
                    ].map((step, index, arr) => {
                      const isActive = activeWorksStep === index;
                      const isPast = activeWorksStep > index;

                      return (
                        <div key={index} className={`timeline-item ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}>
                          <div className="timeline-left">
                            <div className={`timeline-dot ${isActive || isPast ? 'active' : ''}`}>
                              {step.icon}
                            </div>
                            {index !== arr.length - 1 && (
                              <div className="timeline-line-wrapper">
                                <div className="timeline-line-progress" style={{ height: isPast ? '100%' : '0%' }}></div>
                              </div>
                            )}
                          </div>
                          <div className="timeline-content">
                            <h3 className="timeline-title">{step.title}</h3>
                            <p className="timeline-desc">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="works-image-col">
                    {[
                      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=1000",
                      "https://images.unsplash.com/photo-1582735689369-0eb66e6bc527?auto=format&fit=crop&q=80&w=1000",
                      "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=1000",
                      "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&q=80&w=1000",
                      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1000"
                    ].map((src, idx) => (
                      <div key={idx} className={`works-image-wrapper ${activeWorksStep === idx ? 'active' : ''}`}>
                        <img
                          src={src}
                          alt={`Step ${idx + 1}`}
                          style={{ transform: `translateY(${(worksScrollProgress - 0.5) * -12}%)` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>


        </>
      ) : (
        <main className="container order-container fade-in">
          <div className="mobile-only-brand" style={{ textAlign: 'center', marginBottom: '2rem', display: 'none' }}>
            <span className="navbar-brand">Subratha</span>
          </div>
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-lg)', fontSize: 'clamp(1.5rem, 5vw, 2.25rem)' }}>Schedule Premium Service</h2>

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
                <h3>Add Laundry Items</h3>
                <div className="tab-switcher" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <button
                    onClick={() => { setIsKgBased(false); setSelectedService(null); setSelectedProduct(null); }}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: !isKgBased ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontWeight: '600' }}
                  >By Item</button>
                  <button
                    onClick={() => { setIsKgBased(true); setSelectedService(null); setSelectedProduct(null); }}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: isKgBased ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontWeight: '600' }}
                  >By Weight (KG)</button>
                </div>

                <div className="order-item-builder" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '2rem',
                  border: '1px solid var(--color-border)'
                }}>
                  <div className="form-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    {!isKgBased ? (
                      <>
                        <div className="input-group">
                          <label className="form-label" style={{ color: '#b6a3ce' }}>Product</label>
                          <select
                            className="form-input"
                            style={{ height: '50px', background: '#5b3e84', color: '#f5f2f8' }}
                            value={selectedProduct?._id || ''}
                            onChange={(e) => {
                              const p = products.find(prod => prod._id === e.target.value);
                              setSelectedProduct(p);
                              setSelectedService(null);
                            }}
                          >
                            <option value="">Select Product...</option>
                            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                          </select>
                        </div>

                        <div className="input-group">
                          <label className="form-label" style={{ color: '#b6a3ce' }}>Service</label>
                          <select
                            className="form-input"
                            style={{ height: '50px', background: '#5b3e84', color: '#f5f2f8' }}
                            disabled={!selectedProduct}
                            value={selectedService?.name || ''}
                            onChange={(e) => {
                              const s = selectedProduct.services.find(serv => serv.name === e.target.value);
                              setSelectedService(s);
                            }}
                          >
                            <option value="">Select Service...</option>
                            {selectedProduct?.services.map(s => <option key={s.name} value={s.name}>{s.name} (₹{s.price})</option>)}
                          </select>
                        </div>

                        <div className="input-group">
                          <label className="form-label" style={{ color: '#b6a3ce' }}>Quantity</label>
                          <input
                            type="number"
                            className="form-input"
                            style={{ height: '50px', background: '#5b3e84', color: '#f5f2f8' }}
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="input-group">
                          <label className="form-label" style={{ color: '#b6a3ce' }}>Service</label>
                          <select
                            className="form-input"
                            style={{ height: '50px', background: '#5b3e84', color: '#f5f2f8' }}
                            value={selectedService?.name || ''}
                            onChange={(e) => {
                              const s = globalServices.find(serv => serv.name === e.target.value);
                              setSelectedService(s);
                            }}
                          >
                            <option value="">Select Service...</option>
                            {globalServices.map(s => <option key={s._id} value={s.name}>{s.name} (₹{s.basePrice}/kg)</option>)}
                          </select>
                        </div>

                        <div className="input-group">
                          <label className="form-label" style={{ color: '#b6a3ce' }}>Weight (approx kg)</label>
                          <input
                            type="number"
                            className="form-input"
                            style={{ height: '50px', background: '#5b3e84', color: '#f5f2f8' }}
                            min="1"
                            step="0.5"
                            value={weight}
                            onChange={(e) => setWeight(parseFloat(e.target.value) || 1)}
                          />
                        </div>
                        <div className="input-group" style={{ opacity: 0 }}></div>
                      </>
                    )}
                  </div>

                  {selectedService && (
                    <div style={{ textAlign: 'right', marginBottom: '1rem', color: '#f5f2f8' }}>
                      <p style={{ display: 'inline', fontSize: '1.1rem', marginRight: '2rem' }}>Price: <strong>₹{isKgBased ? selectedService.basePrice : selectedService.price} / {isKgBased ? 'kg' : 'pc'}</strong></p>
                      <p style={{ display: 'inline', fontSize: '1.25rem' }}>Total: <strong style={{ color: 'var(--color-primary)', background: '#f5f2f8', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>₹{isKgBased ? (selectedService.basePrice * weight) : (selectedService.price * quantity)}</strong></p>
                    </div>
                  )}

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
                    disabled={(!selectedProduct && !isKgBased) || !selectedService}
                    onClick={() => {
                      const newItem = {
                        id: Date.now(),
                        product: isKgBased ? 'Bulk/KG' : selectedProduct.name,
                        service: selectedService.name,
                        quantity: isKgBased ? weight : quantity,
                        unit: isKgBased ? 'kg' : 'pcs',
                        price: isKgBased ? selectedService.basePrice : selectedService.price,
                        total: isKgBased ? (selectedService.basePrice * weight) : (selectedService.price * quantity)
                      };
                      setCart([...cart, newItem]);
                      setSelectedProduct(null);
                      setSelectedService(null);
                      setQuantity(1);
                      setWeight(1);
                    }}
                  >
                    + Add Item
                  </button>
                </div>

                {cart.length > 0 && (
                  <div className="cart-display fade-in">
                    <h4 style={{ color: '#f5f2f8', marginBottom: '1rem' }}>Added Items</h4>
                    <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f5f2f8', borderRadius: 'var(--radius-md)', color: '#5b3e84' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--color-border)', color: '#5b3e84', fontWeight: 'bold' }}>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Product</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Service</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Qty</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Price</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Total</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cart.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid rgba(91, 62, 132, 0.1)' }}>
                              <td style={{ padding: '1rem' }}>{item.product}</td>
                              <td style={{ padding: '1rem' }}>{item.service}</td>
                              <td style={{ padding: '1rem', textAlign: 'center' }}>{item.quantity} {item.unit || 'pcs'}</td>
                              <td style={{ padding: '1rem', textAlign: 'right' }}>₹{item.price}/{item.unit === 'kg' ? 'kg' : 'pc'}</td>
                              <td style={{ padding: '1rem', textAlign: 'right' }}>₹{item.total}</td>
                              <td style={{ padding: '1rem', textAlign: 'center' }}>
                                <button
                                  onClick={() => setCart(cart.filter(i => i.id !== item.id))}
                                  style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}
                                >
                                  <X size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ color: '#5b3e84', fontWeight: '800', fontSize: '1.2rem' }}>
                            <td colSpan="4" style={{ padding: '1.5rem', textAlign: 'right' }}>Grand Total</td>
                            <td style={{ padding: '1.5rem', textAlign: 'right' }}>₹{calculateTotal()}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {orderStep === 2 && (
              <div className="fade-in">
                <h3>Pickup Address</h3>
                <div className="input-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Street Address</label>
                  <textarea className="form-input" style={{ minHeight: '120px' }} value={orderDetails.address} onChange={(e) => setOrderDetails({ ...orderDetails, address: e.target.value })} placeholder="Enter your full pickup & delivery address..." />
                </div>
              </div>
            )}

            {orderStep === 3 && (
              <div className="fade-in">
                <h3>Choose Pickup Time</h3>
                <div className="options-grid">
                  {['Morning (9 AM - 12 PM)', 'Afternoon (12 PM - 4 PM)', 'Evening (4 PM - 8 PM)'].map(t => (
                    <div key={t} className={`option-card ${orderDetails.time === t ? 'selected' : ''}`} onClick={() => setOrderDetails({ ...orderDetails, time: t })}>
                      <div className="option-icon"><Clock size={32} style={{ margin: '0 auto' }} /></div>
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
                    <span className="summary-label">Items</span>
                    <span className="summary-value" style={{ textAlign: "right" }}>{cart.length} item(s)</span>
                  </div>
                  <div className="summary-row" style={{ borderTop: "1px solid var(--color-border)", paddingTop: "0.5rem", marginTop: "0.5rem", fontWeight: "bold" }}>
                    <span className="summary-label">Grand Total</span>
                    <span className="summary-value">₹{calculateTotal()}</span>
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
                  (orderStep === 1 && cart.length === 0) ||
                  (orderStep === 2 && !orderDetails.address.trim()) ||
                  (orderStep === 3 && !orderDetails.time)
                }>Next Step</button>
              ) : (
                <button className="btn btn-primary" style={{ padding: '0.8rem 2rem' }} onClick={handleOrderSubmit}>Confirm Order</button>
              )}
            </div>
          </div>
        </main>
      )}

      {!isOrdering && (
        <footer className="site-footer fade-in" style={{ animationDelay: '1s' }}>
          <div className="footer-tagline">
            <p>The gold standard in modern laundry &amp; garment care.</p>
          </div>
          <div className="container footer-grid">
            <div className="footer-links-col">
              <h4>Quick Links</h4>
              <a href="#" onClick={(e) => { e.preventDefault(); handleAction(true); }}>Schedule Pickup</a>
              <a href="#">Our Services</a>
              <a href="#">FAQ</a>
            </div>

            <div className="footer-contact-col">
              <h4>Contact</h4>
              <p>+91 98765 43210</p>
              <p>concierge@subratha.com</p>
              <p>Premium Laundry Lab, Indiranagar, Bangalore</p>
            </div>
          </div>
          <div className="container">
            <div className="footer-bottom">
              <p>&copy; 2026 Premium Laundry. All rights reserved.</p>
              <div className="footer-legal">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      )}

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
              <button className="google-btn" onClick={handleGoogleLogin}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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

          </div>
        </div>
      )}
      <a
        href="https://wa.me/919000199811"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with us on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      {/* Floating Mobile Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        <div className="menu-icon-wrapper">
          <Menu size={24} />
          <svg className="menu-circle-svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" className="menu-circle-bg" />
            <circle
              cx="50" cy="50" r="45"
              className="menu-circle-stroke"
              style={{
                strokeDashoffset: 283 - (283 * globalScrollProgress / 100)
              }}
            />
          </svg>
        </div>
      </button>
    </>
  );
}

export default App;

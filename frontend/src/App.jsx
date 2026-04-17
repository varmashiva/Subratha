import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Axios Interceptor to attach the token if available
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
import { X, LogIn, Waves, Shirt, Zap, Tag, ShieldCheck, Award, MapPin, CheckCircle, Clock, User, Menu } from 'lucide-react';
import './index.css';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HotelDashboard from './HotelDashboard';
import AdminDashboard from './AdminDashboard';
import ProfilePage from './ProfilePage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [globalScrollProgress, setGlobalScrollProgress] = useState(0);
  const [activeSub, setActiveSub] = useState(null);

  // Order Flow State
  const navigate = useNavigate();
  const location = useLocation();

  const handleAction = (signupToggle = false) => {
    if (!isAuthenticated) {
      setIsSignup(signupToggle);
      setShowAuthModal(true);
      localStorage.setItem('postAuthRedirect', '/schedule');
    } else {
      navigate('/schedule');
      setOrderStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const [orderStep, setOrderStep] = useState(1);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orderDetails, setOrderDetails] = useState({ address: '', time: '', service: '' });

  const fetchProducts = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        axios.get('https://subratha.onrender.com/api/products'),
        axios.get('https://subratha.onrender.com/api/services')
      ]);
      setProducts(pRes.data);
      setServices(sRes.data);
    } catch (err) {
      console.error('Error fetching pricing data:', err);
    }
  };

  const fetchActiveSubscription = async () => {
    try {
      const { data } = await axios.get('https://subratha.onrender.com/api/subscriptions/my', { withCredentials: true });
      setActiveSub(data.subscription);
    } catch (err) {
      console.error('Error fetching active subscription:', err);
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
        fetchActiveSubscription();
        const redirect = localStorage.getItem('postAuthRedirect');
        if (redirect) {
          navigate(redirect);
          localStorage.removeItem('postAuthRedirect');
        }
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
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setShowProfileDropdown(false);
    navigate('/');
    setCart([]);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const handleOrderSubmit = async () => {
    try {
      const totalAmount = calculateTotal();
      const subItems = cart.filter(item => item.subscriptionApplied);
      const subKgDeducted = subItems.reduce((sum, item) => sum + (item.unit === 'kg' ? item.quantity : 0), 0);
      
      const payload = {
        items: cart,
        address: orderDetails.address,
        time: orderDetails.time,
        totalAmount,
        subscriptionApplied: subItems.length > 0,
        subscriptionKgDeducted: subKgDeducted
      };
      const response = await axios.post('https://subratha.onrender.com/api/orders', payload, { withCredentials: true });
      if (response.data.success) {
        alert(`Success! Our concierge will arrive for your pickup during ${orderDetails.time}. Total Amount: ₹${totalAmount}`);
        navigate('/');
        setOrderStep(1);
        setOrderDetails({ address: '', time: '' });
        fetchActiveSubscription(); // Refresh usage
      }
    } catch (err) {
      alert('Error placing order. Please try again.');
    }
  };



  const handleAuth = (e) => {
    e.preventDefault();
    setIsAuthenticated(true);
    setShowAuthModal(false);
    const redirect = localStorage.getItem('postAuthRedirect');
    if (redirect) {
      navigate(redirect);
      localStorage.removeItem('postAuthRedirect');
    } else {
      navigate('/');
    }
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
    // Capture token from URL if redirected from OAuth
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
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
  }, [location.pathname === '/schedule']);

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

  const isCustomerPage = !['/admin', '/hotel', '/profile'].includes(location.pathname);
  const isHome = location.pathname === '/';

  return (
    <>
      <Routes>
        <Route path="/admin" element={<AdminDashboard onLogout={() => navigate('/')} />} />
        <Route path="/hotel" element={<HotelDashboard onLogout={() => navigate('/')} />} />
        <Route path="/profile" element={<ProfilePage user={user} onBack={() => navigate('/')} onLogout={() => { handleLogout(); navigate('/'); }} />} />

        {/* Customer Facing Layout Wrapper */}
        <Route path="/*" element={
          <>
            <header>
        <nav className="navbar fade-in">
          <a href="/" className="navbar-brand">Subratha</a>
          <div className="flex-row">
            {!isAuthenticated ? (
              <div
                className="user-profile user-profile--guest"
                onClick={() => { setIsSignup(false); setShowAuthModal(true); localStorage.setItem('postAuthRedirect', '/'); }}
                title="Sign In"
              >
                <div className="user-avatar user-avatar--guest">
                  <User size={22} strokeWidth={1.5} />
                </div>
              </div>
            ) : (
              <div
                className="user-profile"
                onClick={() => {
                  if (user?.role === 'admin') {
                    setShowProfileDropdown(!showProfileDropdown);
                  } else {
                    navigate('/profile');
                  }
                }}
              >
                <div className="user-avatar">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} />
                  ) : (
                    user?.name ? user.name.charAt(0).toUpperCase() : 'S'
                  )}
                </div>

                {showProfileDropdown && user?.role === 'admin' && (
                  <div className="dropdown-menu">
                    <button
                      className="dropdown-item"
                      style={{ color: 'var(--color-primary)', fontWeight: '600' }}
                      onClick={() => { navigate('/admin'); setShowProfileDropdown(false); }}
                    >
                      ⚙ Admin Dashboard
                    </button>
                    <button className="dropdown-item" onClick={() => { navigate('/profile'); setShowProfileDropdown(false); }}>
                      <User size={16} /> My Profile
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
                      <button className="mobile-menu-item" onClick={() => { setShowProfilePage(true); setShowMobileMenu(false); }}>My Profile</button>
                      <button className="mobile-menu-item text-danger" onClick={() => { handleLogout(); setShowMobileMenu(false); }}>
                        Logout
                      </button>
                    </>
                  ) : (
                    <button className="mobile-menu-item" onClick={() => { setIsSignup(false); setShowAuthModal(true); setShowMobileMenu(false); localStorage.setItem('postAuthRedirect', '/'); }}>
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={
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
          <div className="section-divider" style={{ padding: 'var(--space-lg) 0' }}>
            <div className="container">
              <hr style={{ border: 'none', borderTop: '1px solid rgba(91, 62, 132, 0.15)', margin: '0 auto', width: '85%' }} />
            </div>
          </div>

          {/* Why Subratha Section */}
          <section className="container section" style={{ paddingTop: 0, paddingBottom: 0 }}>
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
          <div className="section-divider" style={{ padding: 'var(--space-lg) 0' }}>
            <div className="container">
              <hr style={{ border: 'none', borderTop: '1px solid rgba(91, 62, 132, 0.15)', margin: '0 auto', width: '85%' }} />
            </div>
          </div>

          {/* Subscription Plans Section */}
          <section className="section" id="subscriptions" style={{ background: 'var(--color-bg)', paddingTop: 0, paddingBottom: 0 }}>
            <div className="container" id="subscription-plans">
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '1rem' }}>Subscription Plans</h2>
                <p style={{ color: 'var(--color-text-dim)', fontSize: '1.2rem' }}>Premium care for your regular laundry needs</p>
              </div>

              <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                {[
                  {
                    name: "Wash & Fold",
                    price: "1999",
                    weight: "25kg",
                    service: "Wash and dry",
                    features: ["Eco-friendly Wash", "Careful Folding", "Free Pickup & Delivery"]
                  },
                  {
                    name: "Wash & Iron",
                    price: "2499",
                    weight: "25kg",
                    service: "Wash and iron",
                    features: ["Eco-friendly Wash", "Steam Ironing", "Free Pickup & Delivery"]
                  }
                ].map((plan, i) => (
                  <div key={i} className="service-card" style={{
                    padding: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.5rem',
                    textAlign: 'center',
                    background: i === 1 ? 'linear-gradient(135deg, rgba(91,62,132,0.1) 0%, rgba(91,62,132,0.05) 100%)' : 'rgba(255,255,255,0.03)',
                    border: i === 1 ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{plan.name}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                      <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>₹{plan.price}</span>
                      <span style={{ color: 'var(--color-text-dim)' }}>/month</span>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Up to {plan.weight} included</div>
                    <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem', textAlign: 'left', width: '100%' }}>
                      {plan.features.map((f, fi) => (
                        <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                          <CheckCircle size={18} color="var(--color-primary)" /> {f}
                        </li>
                      ))}
                      <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                        <CheckCircle size={18} color="var(--color-primary)" /> Applies to: {plan.service}
                      </li>
                    </ul>
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: 'auto', padding: '1rem' }}
                      onClick={() => {
                        const s = services.find(gs => gs.name === plan.service);
                        if (s) {
                          setSelectedService(s);
                          handleAction();
                          setOrderStep(1);
                        } else {
                          handleAction();
                        }
                      }}
                    >
                      Choose Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section Divider */}
          <div className="section-divider" style={{ padding: 'var(--space-lg) 0' }}>
            <div className="container">
              <hr style={{ border: 'none', borderTop: '1px solid rgba(91, 62, 132, 0.15)', margin: '0 auto', width: '85%' }} />
            </div>
          </div>

          {/* How It Works Section */}
          <section className="works-scroll-container" ref={worksRef} style={{ paddingTop: 0 }}>
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

          {/* Section Divider */}
          <div className="section-divider" style={{ padding: 'var(--space-lg) 0' }}>
            <div className="container">
              <hr style={{ border: 'none', borderTop: '1px solid rgba(91, 62, 132, 0.15)', margin: '0 auto', width: '85%' }} />
            </div>
          </div>

        </>
        } />

        <Route path="/schedule" element={
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
            {orderStep === 1 && (() => {
              const activeServiceProducts = products
                .filter(p => p.services.some(s => s.name === selectedService?.name))
                .map(p => ({ ...p, servicePrice: p.services.find(s => s.name === selectedService?.name).price }));

              return (
                <div className="fade-in">
                  <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)', fontWeight: 800 }}>Add Laundry Items</h3>

                  {/* SERVICE SELECTION CHIPS */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '2rem' }}>
                    {services.map(svc => (
                      <button
                        key={svc._id}
                        onClick={() => { setSelectedService(svc); setCart([]); setSelectedProduct(null); setQuantity(1); }}
                        style={{
                          padding: '0.6rem 1.25rem', borderRadius: '100px', border: '1px solid',
                          borderColor: selectedService?._id === svc._id ? 'var(--color-primary)' : 'rgba(91,62,132,0.15)',
                          background: selectedService?._id === svc._id ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                          color: selectedService?._id === svc._id ? '#fff' : 'var(--color-primary)',
                          cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s',
                          boxShadow: selectedService?._id === svc._id ? '0 4px 12px rgba(91,62,132,0.2)' : 'none'
                        }}
                      >
                        {svc.name}
                      </button>
                    ))}
                  </div>

                  {!selectedService ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#b6a3ce', background: 'rgba(91,62,132,0.03)', borderRadius: '16px', border: '1px dashed rgba(91,62,132,0.2)' }}>
                      Please select a service to continue
                    </div>
                  ) : selectedService.unit === 'kg' ? (
                    /* KG-BASED DYNAMIC CONTENT */
                    <div className="fade-in" style={{ background: 'linear-gradient(135deg, rgba(91,62,132,0.08) 0%, rgba(91,62,132,0.03) 100%)', borderRadius: '20px', padding: '2.5rem', border: '1px solid rgba(91,62,132,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#b6a3ce', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, marginBottom: '0.5rem' }}>Selected Service</div>
                          <div style={{ fontWeight: 900, fontSize: '2rem', color: 'var(--color-primary)' }}>{selectedService.name}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.85rem', color: '#b6a3ce', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, marginBottom: '0.5rem' }}>Estimation Rate</div>
                          <div style={{ fontWeight: 900, fontSize: '2rem', color: 'var(--color-primary)' }}>₹{selectedService.basePrice} / kg</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'var(--color-text)', fontSize: '1.05rem', fontWeight: 600 }}>
                          <CheckCircle size={20} color="var(--color-primary)" />
                          <span>Final weight will be measured at pickup</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'var(--color-text)', fontSize: '1.05rem', fontWeight: 600 }}>
                          <CheckCircle size={20} color="var(--color-primary)" />
                          <span>Exact price will be updated after inspection</span>
                        </div>
                      </div>

                      {activeSub && activeSub.serviceType === selectedService.name && (
                        <div style={{ marginTop: '2rem', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '12px', padding: '1.25rem' }}>
                          <div style={{ color: '#16a34a', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Zap size={20} fill="#16a34a" /> Subscription Active: {activeSub.plan}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* PRODUCT-BASED DYNAMIC CONTENT */
                    <div className="fade-in">
                      {activeServiceProducts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#b6a3ce', background: 'rgba(91,62,132,0.05)', borderRadius: '12px' }}>
                          No products found for this service.
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            {activeServiceProducts.map(prod => {
                              const isSelected = selectedProduct?._id === prod._id;
                              return (
                                <div
                                  key={prod._id}
                                  onClick={() => { setSelectedProduct(isSelected ? null : prod); setQuantity(1); }}
                                  className="product-card"
                                  style={{
                                    background: isSelected ? 'rgba(91,62,132,0.1)' : 'rgba(255,255,255,0.03)',
                                    border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'rgba(91,62,132,0.1)'}`,
                                    borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    textAlign: 'center', position: 'relative'
                                  }}
                                >
                                  <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.95rem', marginBottom: '0.4rem' }}>{prod.name}</div>
                                  {selectedService?.type !== 'Global' && (
                                    <>
                                      <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-text)' }}>₹{prod.servicePrice}</div>
                                      <div style={{ fontSize: '0.75rem', color: '#b6a3ce', textTransform: 'uppercase' }}>per piece</div>
                                    </>
                                  )}
                                  
                                  {isSelected && (
                                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }} onClick={e => e.stopPropagation()}>
                                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                                      <span style={{ fontWeight: 900, minWidth: '24px', fontSize: '1.1rem' }}>{quantity}</span>
                                      <button onClick={() => setQuantity(quantity + 1)}
                                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {selectedProduct && (
                            <div style={{ background: 'var(--color-primary)', borderRadius: '16px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', boxShadow: '0 8px 24px rgba(91,62,132,0.2)' }}>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{selectedProduct.name}</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{selectedService.name} · {quantity} piece{quantity > 1 ? 's' : ''}</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ fontWeight: 900, fontSize: selectedService?.type === 'Global' ? '1.1rem' : '1.5rem' }}>
                                  {selectedService?.type === 'Global' ? 'Weighed at Pickup' : `₹${selectedProduct.servicePrice * quantity}`}
                                </div>
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: '0.6rem 1.5rem', background: '#fff', color: 'var(--color-primary)', fontWeight: 800 }}
                                  onClick={() => {
                                    const newItem = {
                                      id: Date.now(),
                                      product: selectedProduct.name,
                                      service: selectedService.name,
                                      quantity,
                                      unit: 'pcs',
                                      price: selectedProduct.servicePrice,
                                      total: selectedProduct.servicePrice * quantity,
                                      subscriptionApplied: false
                                    };
                                    setCart([...cart, newItem]);
                                    setSelectedProduct(null);
                                    setQuantity(1);
                                  }}
                                >Add Item</button>
                              </div>
                            </div>
                          )}

                          {cart.length > 0 && (
                            <div className="fade-in" style={{ marginTop: '2.5rem' }}>
                              <h4 style={{ color: 'var(--color-primary)', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Shirt size={20} /> Your Selection ({cart.length})
                              </h4>
                              <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid rgba(91,62,132,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                  <thead>
                                    <tr style={{ background: 'rgba(91,62,132,0.05)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                      <th style={{ padding: '1rem', textAlign: 'left' }}>Item</th>
                                      <th style={{ padding: '1rem', textAlign: 'center' }}>Qty</th>
                                      <th style={{ padding: '1rem', textAlign: 'right' }}>Total</th>
                                      <th style={{ padding: '1rem', width: '50px' }}></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {cart.map(item => (
                                      <tr key={item.id} style={{ borderTop: '1px solid rgba(91,62,132,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>
                                          <div style={{ fontWeight: 700 }}>{item.product}</div>
                                          <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{item.service}</div>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800 }}>
                                          {services.find(s => s.name === item.service)?.type === 'Global' ? '-' : `₹${item.total}`}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                          <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={18} /></button>
                                        </td>
                                      </tr>
                                    ))}
                                    <tr style={{ background: 'rgba(91,62,132,0.03)', fontWeight: 900, fontSize: '1.1rem' }}>
                                      <td colSpan="2" style={{ padding: '1.25rem', textAlign: 'right' }}>Total</td>
                                      <td style={{ padding: '1.25rem', textAlign: 'right', color: 'var(--color-primary)' }}>₹{calculateTotal()}</td>
                                      <td></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}



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
                    <span className="summary-value">
                      {calculateTotal() > 0 ? `₹${calculateTotal()}` : 'Weight pending'}
                    </span>
                  </div>
                  {calculateTotal() === 0 && (
                     <div style={{ fontSize: '0.75rem', color: '#b6a3ce', marginTop: '-0.25rem', marginBottom: '0.5rem', textAlign: 'right' }}>
                       Final price will be updated after pickup
                     </div>
                  )}
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
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.8rem 2rem' }}
                  onClick={() => {
                    if (orderStep === 1 && selectedService?.unit === 'kg') {
                      const isSubApplied = activeSub && activeSub.serviceType === selectedService.name;
                      const newItem = {
                        id: Date.now(),
                        product: 'Bulk/Weight',
                        service: selectedService.name,
                        quantity: 0, // 0 signifies pending weight
                        unit: 'kg',
                        price: isSubApplied ? 0 : selectedService.basePrice,
                        total: 0,
                        subscriptionApplied: isSubApplied
                      };
                      setCart([newItem]);
                    }
                    setOrderStep(orderStep + 1);
                  }}
                  disabled={
                    (orderStep === 1 && (!selectedService || (selectedService.unit === 'piece' && cart.length === 0))) ||
                    (orderStep === 2 && !orderDetails.address.trim()) ||
                    (orderStep === 3 && !orderDetails.time)
                  }
                >Next Step</button>
              ) : (
                <button className="btn btn-primary" style={{ padding: '0.8rem 2rem' }} onClick={handleOrderSubmit}>Confirm Order</button>
              )}

            </div>
          </div>
        </main>
        } />
      </Routes>

      {isCustomerPage && isHome && (
        <footer className="site-footer fade-in" style={{ animationDelay: '1s' }}>
          {/* Section Divider */}
          <div className="section-divider" style={{ padding: 'var(--space-lg) 0' }}>
            <div className="container">
              <hr style={{ border: 'none', borderTop: '1px solid rgba(91, 62, 132, 0.15)', margin: '0 auto', width: '85%' }} />
            </div>
          </div>

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
        } />
      </Routes>
    </>
  );
}

export default App;

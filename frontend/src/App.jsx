import React, { useState, useEffect, Suspense, lazy } from 'react';
import axios from 'axios';

// Configure Axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://subratha.onrender.com';

// Axios Interceptor to attach the token if available
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
import { X, LogIn, Waves, Shirt, Zap, Tag, ShieldCheck, Award, MapPin, CheckCircle, Clock, User, Menu, AlertCircle } from 'lucide-react';
import './index.css';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

const HotelDashboard = lazy(() => import('./HotelDashboard'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const ProfilePage = lazy(() => import('./ProfilePage'));
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Story from './components/Story';
import Benefits from './components/Benefits';
import AuthModal from './components/AuthModal';
import SubscriptionPlans from './components/SubscriptionPlans';
import HowItWorks from './components/HowItWorks';



const SCHEDULE_STORAGE = {
  pickup: {
    orderStep: 'orderStep1',
    cart: 'cart1',
    orderDetails: 'orderDetails1',
    selectedServiceIds: 'selectedServiceIds1',
    selectionQuantities: 'selectionQuantities1',
    selectedPlan: 'selectedPlan1',
  },
  subscription: {
    orderStep: 'orderStep2',
    cart: 'cart2',
    orderDetails: 'orderDetails2',
    selectedServiceIds: 'selectedServiceIds2',
    selectionQuantities: 'selectionQuantities2',
    selectedPlan: 'selectedPlan2',
  },
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [globalScrollProgress, setGlobalScrollProgress] = useState(0);
  const [subscriptions, setSubscriptions] = useState([]);

  // Order Flow State
  const navigate = useNavigate();
  const location = useLocation();
  const isScheduleRoute = location.pathname === '/schedule' || location.pathname === '/schedule-subscription';
  const isSubscriptionSchedule = location.pathname === '/schedule-subscription';
  const activeScheduleStorage = isSubscriptionSchedule ? SCHEDULE_STORAGE.subscription : SCHEDULE_STORAGE.pickup;

  const handleAction = (signupToggle = false, isFromPlan = false, redirectPath = '/schedule') => {
    // If starting a fresh order not from a specific Plan button, clear the selectedPlan
    if (!isFromPlan) {
      setSelectedPlan(null);
      localStorage.removeItem('selectedPlan');
      localStorage.removeItem(SCHEDULE_STORAGE.pickup.selectedPlan);
      localStorage.removeItem(SCHEDULE_STORAGE.subscription.selectedPlan);
    }

    if (!isAuthenticated) {
      setIsSignup(signupToggle);
      setShowAuthModal(true);
      localStorage.setItem('postAuthRedirect', redirectPath);
    } else {
      navigate(redirectPath);
      setOrderStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const [orderStep, setOrderStep] = useState(() => Number(localStorage.getItem(activeScheduleStorage.orderStep)) || 1);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem(activeScheduleStorage.cart)) || []);
  const [selectedProduct, setSelectedProduct] = useState(null); // Keep for backwards compatibility if needed, but we'll use selectionQuantities for multi-select
  const [selectionQuantities, setSelectionQuantities] = useState(() => JSON.parse(localStorage.getItem(activeScheduleStorage.selectionQuantities)) || {});
  const [selectedServices, setSelectedServices] = useState([]);
  const [activeServiceId, setActiveServiceId] = useState(null);
  const [showSubConflictWarning, setShowSubConflictWarning] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [orderDetails, setOrderDetails] = useState(() => JSON.parse(localStorage.getItem(activeScheduleStorage.orderDetails)) || { address: '', time: '', service: '' });
  const [selectedPlan, setSelectedPlan] = useState(() => {
    if (isSubscriptionSchedule) {
      return JSON.parse(localStorage.getItem(activeScheduleStorage.selectedPlan)) || JSON.parse(localStorage.getItem('selectedPlan')) || null;
    }
    return JSON.parse(localStorage.getItem('selectedPlan')) || null;
  });
  const [hasHydratedSchedule, setHasHydratedSchedule] = useState(!isScheduleRoute);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/services')
      ]);
      setProducts(pRes.data);
      setServices(sRes.data);
      
      // Re-hydrate selectedServices from draftOrder (if logged in) or localStorage
      let savedServiceIds = [];
      if (!isSubscriptionSchedule && user?.draftOrder?.selectedServiceIds) {
        savedServiceIds = user.draftOrder.selectedServiceIds;
      } else {
        savedServiceIds = JSON.parse(localStorage.getItem(activeScheduleStorage.selectedServiceIds)) || [];
      }

      if (savedServiceIds.length > 0) {
        const found = sRes.data.filter(s => savedServiceIds.includes(s._id));
        setSelectedServices(found);
        setActiveServiceId(found[found.length - 1]._id);
      }
    } catch (err) {
      console.error('Error fetching pricing data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveSubscription = async () => {
    try {
      const { data } = await axios.get('/api/subscriptions/my', { withCredentials: true });
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      console.error('Error fetching active subscriptions:', err);
    }
  };

  // Persistent Auth Check
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/api/auth/me', { withCredentials: true });
      if (data.user) {
        setIsAuthenticated(true);
        setUser(data.user); // Store the full user object including draftOrder
        fetchActiveSubscription();
        
        // Re-hydrate from MongoDB draft order if it exists
        if (!isSubscriptionSchedule && data.user.draftOrder) {
          const { cart: dbCart, selectionQuantities: dbQty, selectedServiceIds: dbIds, orderStep: dbStep, orderDetails: dbDetails } = data.user.draftOrder;
          if (dbCart) setCart(dbCart);
          if (dbQty) setSelectionQuantities(dbQty);
          if (dbStep) setOrderStep(dbStep);
          if (dbDetails) setOrderDetails(dbDetails);
          
          if (dbIds && dbIds.length > 0) {
            localStorage.setItem(activeScheduleStorage.selectedServiceIds, JSON.stringify(dbIds));
          }
        }

        const redirect = localStorage.getItem('postAuthRedirect');
        if (redirect) {
          navigate(redirect);
          localStorage.removeItem('postAuthRedirect');
        }
      }
    } catch (err) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const syncDraftOrder = async () => {
    if (!isAuthenticated) return;
    try {
      const draftOrder = {
        cart,
        selectionQuantities,
        selectedServiceIds: selectedServices.map(s => s._id),
        orderStep,
        orderDetails
      };
      await axios.put('/api/auth/draft-order', { draftOrder }, { withCredentials: true });
    } catch (err) {
      console.error('Error syncing draft order:', err);
    }
  };

  const clearDraftOrder = async () => {
    if (!isAuthenticated) return;
    try {
      const emptyDraft = {
        cart: [],
        selectionQuantities: {},
        selectedServiceIds: [],
        orderStep: 1,
        orderDetails: { address: '', time: '', service: '' }
      };
      await axios.put('https://subratha.onrender.com/api/auth/draft-order', { draftOrder: emptyDraft }, { withCredentials: true });
    } catch (err) {
      console.error('Error clearing draft order:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get('/api/auth/logout', { withCredentials: true });
    } catch (err) {
      console.error('Logout error', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('orderStep');
    localStorage.removeItem('cart');
    localStorage.removeItem('orderDetails');
    localStorage.removeItem('selectedServiceIds');
    localStorage.removeItem('selectionQuantities');
    Object.values(SCHEDULE_STORAGE).forEach((storage) => {
      localStorage.removeItem(storage.orderStep);
      localStorage.removeItem(storage.cart);
      localStorage.removeItem(storage.orderDetails);
      localStorage.removeItem(storage.selectedServiceIds);
      localStorage.removeItem(storage.selectionQuantities);
      localStorage.removeItem(storage.selectedPlan);
    });
    setIsAuthenticated(false);
    setUser(null);
    setShowProfileDropdown(false);
    navigate('/');
    setCart([]);
    setSelectionQuantities({});
    setSelectedPlan(null);
    localStorage.removeItem('selectedPlan');
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const mergeCartItems = (existingCart, incomingItems) => {
    const itemsToAdd = Array.isArray(incomingItems) ? incomingItems : [incomingItems];

    return itemsToAdd.reduce((nextCart, incomingItem) => {
      const existingIndex = nextCart.findIndex(
        (item) =>
          item.product === incomingItem.product &&
          item.service === incomingItem.service &&
          item.unit === incomingItem.unit
      );

      if (existingIndex === -1) {
        return [...nextCart, incomingItem];
      }

      const matchedItem = nextCart[existingIndex];
      const mergedItem = {
        ...matchedItem,
        quantity: (matchedItem.quantity || 0) + (incomingItem.quantity || 0),
        total: (matchedItem.total || 0) + (incomingItem.total || 0),
        price: incomingItem.price ?? matchedItem.price,
        subscriptionApplied: matchedItem.subscriptionApplied || incomingItem.subscriptionApplied,
      };

      const updatedCart = [...nextCart];
      updatedCart[existingIndex] = mergedItem;
      return updatedCart;
    }, existingCart);
  };

  const normalizeServiceValue = (value) => {
    const compact = value?.toLowerCase().replace(/[^a-z]/g, '') || '';

    if ((compact.includes('wash') && (compact.includes('fold') || compact.includes('dry'))) || compact === 'washfold') {
      return 'washdry';
    }

    if (compact.includes('wash') && (compact.includes('iron') || compact.includes('ironing'))) {
      return 'washiron';
    }

    return compact.replace('and', '').replace('ironing', 'iron');
  };

  const getCartItemStandardPrice = (item) => {
    const matchingService = services.find(
      (service) => normalizeServiceValue(service.name) === normalizeServiceValue(item.service)
    );

    if (item.unit === 'kg' || matchingService?.type === 'Global') {
      return Number(matchingService?.basePrice ?? item.price ?? 0);
    }

    const matchingProduct = products.find((product) => product.name === item.product);
    const productService = matchingProduct?.services?.find(
      (service) => normalizeServiceValue(service.name) === normalizeServiceValue(item.service)
    );

    return Number(productService?.price ?? item.price ?? 0);
  };

  const applyPlanCoverageToCartItem = (item, plan) => {
    if (!plan || item.isPlanItem || item.unit === 'plan') return item;

    const isCoveredByPlan = normalizeServiceValue(item.service) === normalizeServiceValue(plan.service);
    if (!isCoveredByPlan) {
      const standardPrice = getCartItemStandardPrice(item);
      return {
        ...item,
        price: standardPrice,
        total: item.unit === 'kg' ? 0 : standardPrice * (item.quantity || 0),
        subscriptionApplied: false,
      };
    }

    return {
      ...item,
      price: 0,
      total: 0,
      subscriptionApplied: true,
    };
  };

  const getMatchingCoverage = (serviceName) => {
    if (!serviceName) return null;

    const target = normalizeServiceValue(serviceName);
    const activeSubscription = subscriptions.find(
      (sub) =>
        sub.status === 'Active' &&
        (normalizeServiceValue(sub.service) === target || normalizeServiceValue(sub.plan) === target)
    );

    if (activeSubscription) return activeSubscription;

    if (selectedPlan && normalizeServiceValue(selectedPlan.service) === target) {
      return { ...selectedPlan, isTemporary: true };
    }

    return null;
  };

  const createSubscriptionPlanItem = (plan) => ({
    id: `subscription-plan-${Date.now()}`,
    product: `${plan.name} Subscription`,
    service: plan.service,
    quantity: 1,
    unit: 'plan',
    price: Number(plan.price) || 0,
    total: Number(plan.price) || 0,
    subscriptionApplied: false,
    isPlanItem: true,
  });

  const handleOrderSubmit = async () => {
    setIsLoading(true);
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
      const response = await axios.post('/api/orders', payload, { withCredentials: true });
      if (response.data.success) {
        alert(`Success! Our concierge will arrive for your pickup during ${orderDetails.time}.`);
        
        // Clear everything
        clearDraftOrder();
        
        navigate('/');
        setOrderStep(1);
        setOrderDetails({ address: '', time: '' });
        setCart([]);
        setSelectionQuantities({});
        setSelectedServices([]);
        setActiveServiceId(null);
        setSelectedPlan(null);
        localStorage.removeItem('selectedPlan');
        localStorage.removeItem(activeScheduleStorage.orderStep);
        localStorage.removeItem(activeScheduleStorage.cart);
        localStorage.removeItem(activeScheduleStorage.orderDetails);
        localStorage.removeItem(activeScheduleStorage.selectedServiceIds);
        localStorage.removeItem(activeScheduleStorage.selectionQuantities);
        localStorage.removeItem(activeScheduleStorage.selectedPlan);
        fetchActiveSubscription(); // Refresh usage
      }
    } catch (err) {
      alert('Error placing order. Please try again.');
    } finally {
      setIsLoading(false);
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
    window.location.href = `${axios.defaults.baseURL}/api/auth/google`;
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
    if (!isScheduleRoute) {
      setHasHydratedSchedule(true);
      return;
    }

    setHasHydratedSchedule(false);

    const savedCart = JSON.parse(localStorage.getItem(activeScheduleStorage.cart)) || [];
    const savedStep = Number(localStorage.getItem(activeScheduleStorage.orderStep)) || 1;
    const savedOrderDetails = JSON.parse(localStorage.getItem(activeScheduleStorage.orderDetails)) || { address: '', time: '', service: '' };
    const savedSelectionQuantities = JSON.parse(localStorage.getItem(activeScheduleStorage.selectionQuantities)) || {};
    const savedServiceIds = JSON.parse(localStorage.getItem(activeScheduleStorage.selectedServiceIds)) || [];
    const savedSelectedPlan = JSON.parse(localStorage.getItem(activeScheduleStorage.selectedPlan)) || null;

    setCart(savedCart);
    setOrderStep(savedStep);
    setOrderDetails(savedOrderDetails);
    setSelectionQuantities(savedSelectionQuantities);

    if (isSubscriptionSchedule) {
      setSelectedPlan(savedSelectedPlan || selectedPlan || null);
    } else {
      setSelectedPlan(null);
    }

    if (services.length > 0) {
      const foundServices = services.filter((service) => savedServiceIds.includes(service._id));
      if (foundServices.length > 0) {
        setSelectedServices(foundServices);
        setActiveServiceId(foundServices[foundServices.length - 1]._id);
      } else if (!isSubscriptionSchedule && subscriptions.length > 0) {
        const coveredService = services.find((svc) => {
          const normalize = (s) => s?.toLowerCase().replace(/[^a-z]/g, '').replace('and', '').replace('ironing', 'iron');
          const target = normalize(svc.name);
          return subscriptions.some(sub => sub.status === 'Active' && (normalize(sub.service) === target || normalize(sub.plan) === target));
        });

        if (coveredService) {
          setSelectedServices([coveredService]);
          setActiveServiceId(coveredService._id);
        } else {
          setSelectedServices([]);
          setActiveServiceId(null);
        }
      } else {
        setSelectedServices([]);
        setActiveServiceId(null);
      }
    }
    setHasHydratedSchedule(true);
  }, [isScheduleRoute, isSubscriptionSchedule, activeScheduleStorage, services, subscriptions]);

  // Auto-select covered service if user has an active subscription
  React.useEffect(() => {
    if (isSubscriptionSchedule) return;
    if (subscriptions.length > 0 && services.length > 0 && selectedServices.length === 0) {
      // Find the first service that is covered by any active subscription
      const coveredService = services.find(svc => {
        const normalize = (s) => s?.toLowerCase().replace(/[^a-z]/g, '').replace('and', '').replace('ironing', 'iron');
        const target = normalize(svc.name);
        return subscriptions.some(sub => sub.status === 'Active' && (normalize(sub.service) === target || normalize(sub.plan) === target));
      });

      if (coveredService) {
        setSelectedServices([coveredService]);
        setActiveServiceId(coveredService._id);
      }
    }
  }, [subscriptions, services, selectedServices.length]);

  // Sync state to localStorage
  React.useEffect(() => {
    if (!isScheduleRoute || !hasHydratedSchedule) return;

    localStorage.setItem(activeScheduleStorage.cart, JSON.stringify(cart));
    localStorage.setItem(activeScheduleStorage.orderStep, orderStep);
    localStorage.setItem(activeScheduleStorage.orderDetails, JSON.stringify(orderDetails));
    localStorage.setItem(activeScheduleStorage.selectionQuantities, JSON.stringify(selectionQuantities));
    if (selectedPlan) {
      localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
      if (isSubscriptionSchedule) {
        localStorage.setItem(activeScheduleStorage.selectedPlan, JSON.stringify(selectedPlan));
      }
    } else {
      localStorage.removeItem('selectedPlan');
      localStorage.removeItem(activeScheduleStorage.selectedPlan);
    }
    if (selectedServices.length > 0) {
      localStorage.setItem(activeScheduleStorage.selectedServiceIds, JSON.stringify(selectedServices.map(s => s._id)));
    } else {
      localStorage.removeItem(activeScheduleStorage.selectedServiceIds);
    }
  }, [cart, orderStep, orderDetails, selectedServices, selectionQuantities, selectedPlan, isScheduleRoute, isSubscriptionSchedule, activeScheduleStorage, hasHydratedSchedule]);

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
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner spinner-lg"></div>
          <p>Loading...</p>
        </div>
      )}
      <Suspense fallback={
        <div className="loading-overlay">
          <div className="spinner spinner-lg"></div>
          <p>Loading...</p>
        </div>
      }>
        <Routes>
          <Route path="/admin" element={<AdminDashboard onLogout={() => navigate('/')} />} />
          <Route path="/hotel" element={<HotelDashboard onLogout={() => navigate('/')} />} />
          <Route path="/profile" element={<ProfilePage user={user} onBack={() => navigate('/')} onLogout={() => { handleLogout(); navigate('/'); }} />} />


        {/* Customer Facing Layout Wrapper */}
        <Route path="/*" element={
          <>
            <Navbar
              isAuthenticated={isAuthenticated}
              user={user}
              showProfileDropdown={showProfileDropdown}
              setShowProfileDropdown={setShowProfileDropdown}
              handleLogout={handleLogout}
              showMobileMenu={showMobileMenu}
              setShowMobileMenu={setShowMobileMenu}
              handleAction={handleAction}
              setIsSignup={setIsSignup}
              setShowAuthModal={setShowAuthModal}
            />


      <Routes>
        <Route path="/" element={
        <>
          <Hero handleAction={handleAction} />


          <Story storyRef={storyRef} activeStep={activeStep} handleAction={handleAction} />

          {/* Section Divider */}
          <div className="section-divider" style={{ padding: 'var(--space-lg) 0' }}>
            <div className="container">
              <hr style={{ border: 'none', borderTop: '1px solid rgba(91, 62, 132, 0.15)', margin: '0 auto', width: '85%' }} />
            </div>
          </div>

          <Benefits handleAction={handleAction} />


          <SubscriptionPlans
            subscriptions={subscriptions}
            services={services}
            setSelectedPlan={setSelectedPlan}
            setCart={setCart}
            setSelectionQuantities={setSelectionQuantities}
            setSelectedServices={setSelectedServices}
            setActiveServiceId={setActiveServiceId}
            handleAction={handleAction}
            setOrderStep={setOrderStep}
            applyPlanCoverageToCartItem={applyPlanCoverageToCartItem}
            createSubscriptionPlanItem={createSubscriptionPlanItem}
            normalizeServiceValue={normalizeServiceValue}
            SCHEDULE_STORAGE={SCHEDULE_STORAGE}
          />


          <HowItWorks
            worksRef={worksRef}
            activeWorksStep={activeWorksStep}
            worksScrollProgress={worksScrollProgress}
          />


          {/* Section Divider */}
          {/* <div className="section-divider" style={{ padding: 'var(--space-lg) 0' }}>
            <div className="container">
              <hr style={{ border: 'none', borderTop: '1px solid rgba(91, 62, 132, 0.15)', margin: '0 auto', width: '85%' }} />
            </div>
          </div> */}

        </>
        } />

        <Route path="/schedule" element={
        <main className="container order-container fade-in">
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
              const activeService = services.find(s => s._id === activeServiceId);
              const activeServiceProducts = products
                .filter(p => p.services.some(s => s.name === activeService?.name))
                .map(p => ({ ...p, servicePrice: p.services.find(s => s.name === activeService?.name).price }));

              const getServiceSubscription = (serviceName) => {
                return getMatchingCoverage(serviceName);
              };

              const isServiceCovered = (serviceName) => !!getServiceSubscription(serviceName);
              const isActiveServiceCovered = activeService && isServiceCovered(activeService.name);

              const handleChipClick = (svc) => {
                const isSelected = selectedServices.some(s => s._id === svc._id);
                const isActive = activeServiceId === svc._id;

                if (isSelected) {
                  if (isActive) {
                    const newSelected = selectedServices.filter(s => s._id !== svc._id);
                    setSelectedServices(newSelected);
                    setActiveServiceId(newSelected.length > 0 ? newSelected[newSelected.length - 1]._id : null);
                  } else {
                    setActiveServiceId(svc._id);
                  }
                  setSelectionQuantities({});
                } else {
                  setSelectedServices([...selectedServices, svc]);
                  setActiveServiceId(svc._id);
                  setSelectionQuantities({});
                }
              };

              const renderServiceChips = () => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
                    {services.map(svc => {
                      const isSelected = selectedServices.some(s => s._id === svc._id);
                      const isActive = activeServiceId === svc._id;
                      const isCovered = isServiceCovered(svc.name);

                      return (
                        <button
                          key={svc._id}
                          onClick={() => handleChipClick(svc)}
                          style={{
                            padding: '0.4rem 0.85rem', borderRadius: '100px', border: '1px solid',
                            borderColor: isActive ? 'var(--color-primary)' : isCovered ? 'rgba(91,62,132,0.4)' : isSelected ? 'rgba(91,62,132,0.4)' : 'rgba(91,62,132,0.15)',
                            background: isActive ? 'var(--color-primary)' : isCovered ? 'rgba(91,62,132,0.08)' : isSelected ? 'rgba(91,62,132,0.1)' : 'rgba(255,255,255,0.05)',
                            color: isActive ? '#fff' : 'var(--color-primary)',
                            cursor: 'pointer',
                            fontWeight: 700, fontSize: '0.75rem', transition: 'all 0.2s',
                            boxShadow: isCovered ? '0 4px 10px rgba(91,62,132,0.06)' : isActive ? '0 4px 10px rgba(91,62,132,0.15)' : 'none',
                            position: 'relative',
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {isCovered && <Zap size={11} fill={isActive ? '#fff' : 'var(--color-primary)'} color="var(--color-primary)" />}
                          {svc.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );

              const renderKgContent = () => {
                const sub = getServiceSubscription(activeService.name);
                const isCovered = !!sub;
                const remaining = sub ? Math.max(0, sub.totalLimit - sub.used) : 0;
                const isLimitExceeded = sub && sub.used >= sub.totalLimit;

                return (
                  <div className="fade-in" style={{ 
                    background: (isCovered && !isLimitExceeded) ? 'linear-gradient(135deg, rgba(91,62,132,0.1) 0%, rgba(91,62,132,0.05) 100%)' : 'linear-gradient(135deg, rgba(91,62,132,0.08) 0%, rgba(91,62,132,0.03) 100%)', 
                    borderRadius: '20px', 
                    padding: 'clamp(1rem, 4vw, 2.5rem)', 
                    border: `1px solid ${(isCovered && !isLimitExceeded) ? 'rgba(91,62,132,0.3)' : 'rgba(91,62,132,0.1)'}`,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: (isCovered && !isLimitExceeded) ? '0 15px 35px -10px rgba(91,62,132,0.15)' : 'none'
                  }}>
                    {isCovered && !isLimitExceeded ? (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'linear-gradient(90deg, #5b3e84, #7c5cb5)', color: 'white', padding: '0.6rem 1rem', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        <Zap size={12} fill="white" /> SUBSCRIPTION COVERED · {remaining}KG REMAINING
                      </div>
                    ) : isLimitExceeded ? (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#d97706', color: 'white', padding: '0.6rem 1rem', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        <AlertCircle size={12} /> LIMIT EXCEEDED · NORMAL PRICING
                      </div>
                    ) : (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'rgba(91,62,132,0.08)', color: 'var(--color-primary)', padding: '0.6rem 1rem', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        <AlertCircle size={12} /> NOT INCLUDED · NORMAL PRICING
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem', marginTop: '2rem' }}>
                      <div style={{ flex: '1 1 120px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#b6a3ce', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, marginBottom: '0.15rem' }}>Service</div>
                        <div style={{ fontWeight: 900, fontSize: 'clamp(1.25rem, 4.5vw, 1.75rem)', color: 'var(--color-primary)' }}>{activeService.name}</div>
                      </div>
                      <div style={{ flex: '1 1 120px', textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: '#b6a3ce', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, marginBottom: '0.15rem' }}>Rate</div>
                        <div style={{ fontWeight: 900, fontSize: 'clamp(1.25rem, 4.5vw, 1.75rem)', color: 'var(--color-primary)' }}>
                          {(isCovered && !isLimitExceeded) ? '₹0' : `₹${activeService.basePrice}/kg`}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--color-text)', fontSize: '0.95rem', fontWeight: 600 }}>
                        <CheckCircle size={18} color="var(--color-primary)" />
                        <span>Weight measured at pickup</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--color-text)', fontSize: '0.95rem', fontWeight: 600 }}>
                        <CheckCircle size={18} color="var(--color-primary)" />
                        <span>Exact price after inspection</span>
                      </div>
                    </div>

                    <button
                      className="btn btn-primary"
                      disabled={cart.some(item => item.service === activeService.name)}
                      style={{ 
                        width: '100%', marginTop: '1.5rem', padding: '0.85rem', 
                        background: (isCovered && !isLimitExceeded) ? 'linear-gradient(90deg, #5b3e84, #7c5cb5)' : 'var(--color-primary)',
                        opacity: cart.some(item => item.service === activeService.name) ? 0.6 : 1,
                        cursor: cart.some(item => item.service === activeService.name) ? 'not-allowed' : 'pointer',
                        borderRadius: '12px'
                      }}
                      onClick={() => {
                        const newItem = {
                          id: Date.now(),
                          product: activeService.name,
                          service: activeService.name,
                          quantity: 0,
                          unit: 'kg',
                          price: (isCovered && !isLimitExceeded) ? 0 : activeService.basePrice,
                          total: 0,
                          subscriptionApplied: isCovered && !isLimitExceeded,
                        };
                        setCart(prev => mergeCartItems(prev, newItem));
                      }}
                    >
                      {cart.some(item => item.service === activeService.name) ? 'Already in Bag' : 'Add Service to Bag'}
                    </button>
                  </div>
                );
              };

              const renderProductContent = () => {
                const sub = getServiceSubscription(activeService.name);
                const isCovered = !!sub;
                const remaining = sub ? Math.max(0, sub.totalLimit - sub.used) : 0;
                const isLimitExceeded = sub && sub.used >= sub.totalLimit;

                return (
                  <div className="fade-in">
                    {/* Subscription status banner */}
                    {isCovered && !isLimitExceeded ? (
                      <div style={{
                        background: 'linear-gradient(90deg, #5b3e84, #7c5cb5)',
                        color: 'white', padding: '0.85rem 1.25rem', fontSize: '0.85rem', fontWeight: 900,
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        borderRadius: '14px', marginBottom: '1.5rem',
                        boxShadow: '0 8px 20px rgba(91,62,132,0.2)',
                        letterSpacing: '0.04em', textTransform: 'uppercase'
                      }}>
                        <Zap size={18} fill="white" />
                        COVERED UNDER YOUR SUBSCRIPTION · REMAINING: {remaining} KG · TOTAL: ₹0
                      </div>
                    ) : isLimitExceeded ? (
                      <div style={{
                        background: '#d97706',
                        color: 'white', padding: '0.85rem 1.25rem', fontSize: '0.85rem', fontWeight: 900,
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        borderRadius: '14px', marginBottom: '1.5rem',
                        boxShadow: '0 8px 20px rgba(217,119,6,0.2)',
                        letterSpacing: '0.04em', textTransform: 'uppercase'
                      }}>
                        <AlertCircle size={18} fill="white" />
                        SUBSCRIPTION LIMIT EXCEEDED · NORMAL PRICING APPLIES
                      </div>
                    ) : (
                      <div style={{
                        background: 'rgba(91,62,132,0.05)', border: '1px solid rgba(91,62,132,0.12)',
                        color: 'var(--color-text)', padding: '0.85rem 1.25rem', fontSize: '0.85rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        borderRadius: '14px', marginBottom: '1.5rem', opacity: 0.85,
                      }}>
                        <AlertCircle size={18} />
                        NOT INCLUDED IN YOUR SUBSCRIPTION · NORMAL PRICING APPLIES
                      </div>
                    )}

                    {activeServiceProducts.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem', color: '#b6a3ce', background: 'rgba(91,62,132,0.05)', borderRadius: '12px' }}>
                        No products found for this service.
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                          {activeServiceProducts.map(prod => {
                            const qty = selectionQuantities[prod._id] || 0;
                            const isProductSelected = qty > 0;
                            const isEffectivelyCovered = isCovered && !isLimitExceeded;
                            return (
                              <div
                                key={prod._id}
                                onClick={() => {
                                  if (!isProductSelected) {
                                    setSelectionQuantities({ ...selectionQuantities, [prod._id]: 1 });
                                  }
                                }}
                                className="product-card"
                                style={{
                                  border: `1.5px solid ${isProductSelected
                                    ? 'var(--color-primary)'
                                    : 'rgba(91,62,132,0.1)'}`,
                                  borderRadius: '16px', padding: '1.25rem', cursor: 'pointer',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  textAlign: 'center', position: 'relative',
                                  boxShadow: isProductSelected ? '0 8px 20px rgba(91,62,132,0.1)' : 'none',
                                }}
                              >
                                <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.95rem', marginBottom: '0.4rem' }}>{prod.name}</div>
                                {activeService?.type !== 'Global' && (
                                  isEffectivelyCovered ? (
                                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-primary)' }}>₹0 (Covered)</div>
                                  ) : (
                                    <>
                                      <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-text)' }}>Rs. {prod.servicePrice}</div>
                                      <div style={{ fontSize: '0.75rem', color: '#b6a3ce', textTransform: 'uppercase' }}>per piece</div>
                                    </>
                                  )
                                )}

                                {isProductSelected && (
                                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }} onClick={e => e.stopPropagation()}>
                                    <button onClick={() => {
                                      const newQty = qty - 1;
                                      if (newQty <= 0) {
                                        const newSelection = { ...selectionQuantities };
                                        delete newSelection[prod._id];
                                        setSelectionQuantities(newSelection);
                                      } else {
                                        setSelectionQuantities({ ...selectionQuantities, [prod._id]: newQty });
                                      }
                                    }} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                                    <span style={{ fontWeight: 900, minWidth: '24px', fontSize: '1.1rem' }}>{qty}</span>
                                    <button onClick={() => setSelectionQuantities({ ...selectionQuantities, [prod._id]: qty + 1 })} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {Object.keys(selectionQuantities).length > 0 && (
                          <div style={{
                            background: (isCovered && !isLimitExceeded) ? 'linear-gradient(90deg, #16a34a, #15803d)' : 'var(--color-primary)',
                            borderRadius: '16px', padding: '1.25rem', marginBottom: '2rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            color: '#fff', boxShadow: (isCovered && !isLimitExceeded) ? '0 8px 24px rgba(22,163,74,0.25)' : '0 8px 24px rgba(91,62,132,0.2)',
                          }}>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{Object.keys(selectionQuantities).length} Items Selected</div>
                              <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>{activeService.name} · {(isCovered && !isLimitExceeded) ? 'Covered under subscription' : isLimitExceeded ? 'Limit exceeded · Normal pricing applies' : "Click '+' to add to bag"}</div>
                            </div>
                            <div style={{
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '1rem', 
                              marginTop: window.innerWidth < 480 ? '1rem' : '0',
                              flexWrap: 'wrap'
                            }}>
                              <div style={{ fontWeight: 900, fontSize: 'clamp(1.2rem, 4vw, 1.5rem)' }}>
                                {(isCovered && !isLimitExceeded) ? '₹0 (Covered)' : (() => {
                                  const total = Object.entries(selectionQuantities).reduce((acc, [id, qty]) => {
                                    const p = activeServiceProducts.find(prod => prod._id === id);
                                    return acc + (p?.servicePrice || 0) * qty;
                                  }, 0);
                                  return `Rs. ${total}`;
                                })()}
                              </div>
                              <button
                                className="btn btn-secondary"
                                style={{ 
                                  padding: '0.6rem 1.5rem', 
                                  background: '#fff', 
                                  color: (isCovered && !isLimitExceeded) ? '#16a34a' : 'var(--color-primary)', 
                                  fontWeight: 800,
                                  width: window.innerWidth < 480 ? '100%' : 'auto'
                                }}
                                onClick={() => {
                                  const newItems = Object.entries(selectionQuantities).map(([id, qty]) => {
                                    const prod = activeServiceProducts.find(p => p._id === id);
                                    return {
                                      id: Date.now() + Math.random(),
                                      product: prod.name,
                                      service: activeService.name,
                                      quantity: qty,
                                      unit: 'pcs',
                                      price: (isCovered && !isLimitExceeded) ? 0 : prod.servicePrice,
                                      total: (isCovered && !isLimitExceeded) ? 0 : prod.servicePrice * qty,
                                      subscriptionApplied: isCovered && !isLimitExceeded,
                                    };
                                  });
                                  setCart(prev => mergeCartItems(prev, newItems));
                                  setSelectionQuantities({});
                                }}
                              >Add to Bag</button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              };

              const renderCartContent = () => {
                if (cart.length === 0) return null;
                return (
                  <div className="fade-in" style={{ marginTop: '2.5rem' }}>
                    <h4 style={{ color: 'var(--color-primary)', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Shirt size={20} /> Your Bag ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                    </h4>
                    <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid rgba(91,62,132,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'rgba(91,62,132,0.05)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Item</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Qty</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Price</th>
                            <th style={{ padding: '1rem', width: '50px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                           {cart.map(item => {
                            const svc = services.find(s => s.name === item.service);
                            const isSubUsed = item.subscriptionApplied;
                            return (
                              <tr key={item.id} style={{ borderTop: '1px solid rgba(91,62,132,0.05)' }}>
                                <td style={{ padding: '1rem' }}>
                                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    {item.product}
                                    {isSubUsed && (
                                      <span style={{
                                        fontSize: '0.65rem', fontWeight: 900, background: 'rgba(91,62,132,0.12)',
                                        color: 'var(--color-primary)', padding: '0.15rem 0.6rem', borderRadius: '100px',
                                        border: '1px solid rgba(91,62,132,0.2)', letterSpacing: '0.04em',
                                        textTransform: 'uppercase'
                                      }}>⚡ Covered</span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{item.service}</div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700 }}>{item.quantity || '—'}</td>
                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: isSubUsed ? 'var(--color-primary)' : 'inherit' }}>
                                  {(() => {
                                    if (item.unit === 'plan' || item.isPlanItem) {
                                      return `Rs. ${item.total}`;
                                    }
                                    if (item.unit === 'kg' || svc?.type === 'Global') {
                                      return isSubUsed ? '₹0/kg ✓' : `Rs. ${svc?.basePrice || item.price}/kg`;
                                    }
                                    return isSubUsed ? '₹0 ✓' : `Rs. ${item.total}`;
                                  })()}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                  <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={18} /></button>
                                </td>
                              </tr>
                            );
                          })}
                          <tr style={{ background: 'rgba(91,62,132,0.03)', fontWeight: 700, fontSize: '0.9rem' }}>
                            <td colSpan="4" style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--color-primary)' }}>
                              Total price will be finalised in the review process
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              };

              return (
                <div className="fade-in">
                  <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)', fontWeight: 800 }}>Add Laundry Items</h3>
                  <p style={{ color: '#b6a3ce', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 500 }}>Select one or more services. Subscription-covered services are highlighted in green.</p>


                  {renderServiceChips()}

                  {!activeService ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#b6a3ce', background: 'rgba(91,62,132,0.03)', borderRadius: '16px', border: '1px dashed rgba(91,62,132,0.2)' }}>
                      Select a service above to get started
                    </div>
                  ) : activeService.unit === 'kg' ? renderKgContent() : renderProductContent()}

                  {renderCartContent()}
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
                  <div className="summary-row" style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1rem", marginTop: "0.5rem", justifyContent: 'center' }}>
                    <span className="summary-value" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                      Total price will be finaled in review process
                    </span>
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
                  <button className="btn btn-secondary" style={{ padding: '0.8rem 2rem' }} onClick={() => {
                    navigate('/');
                  }}>Cancel</button>
              )}

              {orderStep < 4 ? (
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.8rem 2rem' }}
                  onClick={() => {
                    if (orderStep === 1) {
                      const kgServices = selectedServices.filter(s => s.unit === 'kg');
                      if (kgServices.length > 0) {
                        const newKgItems = kgServices
                          .filter(s => !cart.some(item => item.service === s.name && item.unit === 'kg'))
                          .map(s => {
                            const matchingSub = getMatchingCoverage(s.name);
                            const isSubApplied = !!matchingSub && matchingSub.used < matchingSub.totalLimit;
                            return {
                              id: Date.now() + Math.random(),
                              product: 'Bulk/Weight',
                              service: s.name,
                              quantity: 0,
                              unit: 'kg',
                              price: isSubApplied ? 0 : s.basePrice,
                              total: 0,
                              subscriptionApplied: !!isSubApplied
                            };
                          });
                        if (newKgItems.length > 0) {
                          setCart(prev => [...prev, ...newKgItems]);
                        }
                      }
                    }
                    setOrderStep(orderStep + 1);
                  }}
                  disabled={
                    (orderStep === 1 && selectedServices.length === 0) ||
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

        <Route path="/schedule-subscription" element={
        <main className="container order-container fade-in">
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
              const activeService = services.find(s => s._id === activeServiceId);
              const activeServiceProducts = products
                .filter(p => p.services.some(s => s.name === activeService?.name))
                .map(p => ({ ...p, servicePrice: p.services.find(s => s.name === activeService?.name).price }));

              const getServiceSubscription = (serviceName) => {
                return getMatchingCoverage(serviceName);
              };

              const isServiceCovered = (serviceName) => !!getServiceSubscription(serviceName);
              const isActiveServiceCovered = activeService && isServiceCovered(activeService.name);

              const handleChipClick = (svc) => {
                const isSelected = selectedServices.some(s => s._id === svc._id);
                const isActive = activeServiceId === svc._id;

                if (isSelected) {
                  if (isActive) {
                    const newSelected = selectedServices.filter(s => s._id !== svc._id);
                    setSelectedServices(newSelected);
                    setActiveServiceId(newSelected.length > 0 ? newSelected[newSelected.length - 1]._id : null);
                  } else {
                    setActiveServiceId(svc._id);
                  }
                  setSelectionQuantities({});
                } else {
                  setSelectedServices([...selectedServices, svc]);
                  setActiveServiceId(svc._id);
                  setSelectionQuantities({});
                }
              };

              const renderServiceChips = () => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
                    {services.map(svc => {
                      const isSelected = selectedServices.some(s => s._id === svc._id);
                      const isActive = activeServiceId === svc._id;
                      const isCovered = isServiceCovered(svc.name);

                      return (
                        <button
                          key={svc._id}
                          onClick={() => handleChipClick(svc)}
                          style={{
                            padding: '0.4rem 0.85rem', borderRadius: '100px', border: '1px solid',
                            borderColor: isActive ? 'var(--color-primary)' : isCovered ? 'rgba(91,62,132,0.4)' : isSelected ? 'rgba(91,62,132,0.4)' : 'rgba(91,62,132,0.15)',
                            background: isActive ? 'var(--color-primary)' : isCovered ? 'rgba(91,62,132,0.08)' : isSelected ? 'rgba(91,62,132,0.1)' : 'rgba(255,255,255,0.05)',
                            color: isActive ? '#fff' : 'var(--color-primary)',
                            cursor: 'pointer',
                            fontWeight: 700, fontSize: '0.75rem', transition: 'all 0.2s',
                            boxShadow: isCovered ? '0 4px 10px rgba(91,62,132,0.06)' : isActive ? '0 4px 10px rgba(91,62,132,0.15)' : 'none',
                            position: 'relative',
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {isCovered && <Zap size={11} fill={isActive ? '#fff' : 'var(--color-primary)'} color="var(--color-primary)" />}
                          {svc.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );

              const renderKgContent = () => {
                const sub = getServiceSubscription(activeService.name);
                const isCovered = !!sub;
                const remaining = sub ? Math.max(0, sub.totalLimit - sub.used) : 0;
                const isLimitExceeded = sub && sub.used >= sub.totalLimit;

                return (
                  <div className="fade-in" style={{ 
                    background: (isCovered && !isLimitExceeded) ? 'linear-gradient(135deg, rgba(91,62,132,0.1) 0%, rgba(91,62,132,0.05) 100%)' : 'linear-gradient(135deg, rgba(91,62,132,0.08) 0%, rgba(91,62,132,0.03) 100%)', 
                    borderRadius: '20px', 
                    padding: '2.5rem', 
                    border: `1px solid ${(isCovered && !isLimitExceeded) ? 'rgba(91,62,132,0.3)' : 'rgba(91,62,132,0.1)'}`,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: (isCovered && !isLimitExceeded) ? '0 15px 35px -10px rgba(91,62,132,0.15)' : 'none'
                  }}>
                    {isCovered && !isLimitExceeded ? (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'linear-gradient(90deg, #5b3e84, #7c5cb5)', color: 'white', padding: '0.6rem 1.25rem', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        <Zap size={14} fill="white" /> COVERED UNDER YOUR SUBSCRIPTION · REMAINING: {remaining} KG · TOTAL: ₹0
                      </div>
                    ) : isLimitExceeded ? (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#d97706', color: 'white', padding: '0.6rem 1.25rem', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        <AlertCircle size={14} /> SUBSCRIPTION LIMIT EXCEEDED · NORMAL PRICING APPLIES
                      </div>
                    ) : (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'rgba(91,62,132,0.08)', color: 'var(--color-primary)', opacity: 0.8, padding: '0.6rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', textTransform: 'uppercase' }}>
                        <AlertCircle size={14} /> NOT INCLUDED IN YOUR SUBSCRIPTION · NORMAL PRICING APPLIES
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', marginTop: '1.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#b6a3ce', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, marginBottom: '0.5rem' }}>Selected Service</div>
                        <div style={{ fontWeight: 900, fontSize: '2rem', color: 'var(--color-primary)' }}>{activeService.name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: '#b6a3ce', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, marginBottom: '0.5rem' }}>Estimation Rate</div>
                        <div style={{ fontWeight: 900, fontSize: '2rem', color: 'var(--color-primary)' }}>
                          {(isCovered && !isLimitExceeded) ? 'Rs. 0 (Included)' : `Rs. ${activeService.basePrice} / kg`}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'var(--color-text)', fontSize: '1.05rem', fontWeight: 600 }}>
                        <CheckCircle size={20} color="var(--color-primary)" />
                        <span>Final weight will be measured at pickup</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'var(--color-text)', fontSize: '1.05rem', fontWeight: 600 }}>
                        <CheckCircle size={20} color={(isCovered && !isLimitExceeded) ? 'var(--color-primary)' : 'var(--color-primary)'} />
                        <span>Exact price will be updated after inspection</span>
                      </div>
                    </div>

                    <button
                      className="btn btn-primary"
                      disabled={cart.some(item => item.service === activeService.name)}
                      style={{ 
                        width: '100%', marginTop: '2rem', padding: '1rem', 
                        background: (isCovered && !isLimitExceeded) ? 'linear-gradient(90deg, #5b3e84, #7c5cb5)' : 'var(--color-primary)',
                        opacity: cart.some(item => item.service === activeService.name) ? 0.6 : 1,
                        cursor: cart.some(item => item.service === activeService.name) ? 'not-allowed' : 'pointer',
                        border: 'none', boxShadow: (isCovered && !isLimitExceeded) ? '0 10px 25px -5px rgba(91,62,132,0.3)' : '0 10px 25px -5px rgba(91,62,132,0.2)'
                      }}
                      onClick={() => {
                        const newItem = {
                          id: Date.now(),
                          product: activeService.name,
                          service: activeService.name,
                          quantity: 0, // Weight determined at pickup
                          unit: 'kg',
                          price: (isCovered && !isLimitExceeded) ? 0 : activeService.basePrice,
                          total: 0,
                          subscriptionApplied: isCovered && !isLimitExceeded,
                        };
                        setCart(prev => mergeCartItems(prev, newItem));
                      }}
                    >
                      {cart.some(item => item.service === activeService.name) ? 'Already in Bag' : 'Add Service to Bag'}
                    </button>
                  </div>
                );
              };

              const renderProductContent = () => {
                const sub = getServiceSubscription(activeService.name);
                const isCovered = !!sub;
                const remaining = sub ? Math.max(0, sub.totalLimit - sub.used) : 0;
                const isLimitExceeded = sub && sub.used >= sub.totalLimit;

                return (
                  <div className="fade-in">
                    {/* Subscription status banner */}
                    {isCovered && !isLimitExceeded ? (
                      <div style={{
                        background: 'linear-gradient(90deg, #5b3e84, #7c5cb5)',
                        color: 'white', padding: '0.85rem 1.25rem', fontSize: '0.85rem', fontWeight: 900,
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        borderRadius: '14px', marginBottom: '1.5rem',
                        boxShadow: '0 8px 20px rgba(91,62,132,0.2)',
                        letterSpacing: '0.04em', textTransform: 'uppercase'
                      }}>
                        <Zap size={18} fill="white" />
                        COVERED UNDER YOUR SUBSCRIPTION · REMAINING: {remaining} KG · TOTAL: ₹0
                      </div>
                    ) : isLimitExceeded ? (
                      <div style={{
                        background: '#d97706',
                        color: 'white', padding: '0.85rem 1.25rem', fontSize: '0.85rem', fontWeight: 900,
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        borderRadius: '14px', marginBottom: '1.5rem',
                        boxShadow: '0 8px 20px rgba(217,119,6,0.2)',
                        letterSpacing: '0.04em', textTransform: 'uppercase'
                      }}>
                        <AlertCircle size={18} fill="white" />
                        SUBSCRIPTION LIMIT EXCEEDED · NORMAL PRICING APPLIES
                      </div>
                    ) : (
                      <div style={{
                        background: 'rgba(91,62,132,0.05)', border: '1px solid rgba(91,62,132,0.12)',
                        color: 'var(--color-text)', padding: '0.85rem 1.25rem', fontSize: '0.85rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        borderRadius: '14px', marginBottom: '1.5rem', opacity: 0.85,
                      }}>
                        <AlertCircle size={18} />
                        NOT INCLUDED IN YOUR SUBSCRIPTION · NORMAL PRICING APPLIES
                      </div>
                    )}

                    {activeServiceProducts.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem', color: '#b6a3ce', background: 'rgba(91,62,132,0.05)', borderRadius: '12px' }}>
                        No products found for this service.
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                          {activeServiceProducts.map(prod => {
                            const qty = selectionQuantities[prod._id] || 0;
                            const isProductSelected = qty > 0;
                            const isEffectivelyCovered = isCovered && !isLimitExceeded;
                            return (
                              <div
                                key={prod._id}
                                onClick={() => {
                                  if (!isProductSelected) {
                                    setSelectionQuantities({ ...selectionQuantities, [prod._id]: 1 });
                                  }
                                }}
                                className="product-card"
                                style={{
                                  border: `1.5px solid ${isProductSelected
                                    ? 'var(--color-primary)'
                                    : 'rgba(91,62,132,0.1)'}`,
                                  borderRadius: '16px', padding: '1.25rem', cursor: 'pointer',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  textAlign: 'center', position: 'relative',
                                  boxShadow: isProductSelected ? '0 8px 20px rgba(91,62,132,0.1)' : 'none',
                                }}
                              >
                                <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.95rem', marginBottom: '0.4rem' }}>{prod.name}</div>
                                {activeService?.type !== 'Global' && (
                                  isEffectivelyCovered ? (
                                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-primary)' }}>₹0 (Covered)</div>
                                  ) : (
                                    <>
                                      <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-text)' }}>Rs. {prod.servicePrice}</div>
                                      <div style={{ fontSize: '0.75rem', color: '#b6a3ce', textTransform: 'uppercase' }}>per piece</div>
                                    </>
                                  )
                                )}

                                {isProductSelected && (
                                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }} onClick={e => e.stopPropagation()}>
                                    <button onClick={() => {
                                      const newQty = qty - 1;
                                      if (newQty <= 0) {
                                        const newSelection = { ...selectionQuantities };
                                        delete newSelection[prod._id];
                                        setSelectionQuantities(newSelection);
                                      } else {
                                        setSelectionQuantities({ ...selectionQuantities, [prod._id]: newQty });
                                      }
                                    }} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                                    <span style={{ fontWeight: 900, minWidth: '24px', fontSize: '1.1rem' }}>{qty}</span>
                                    <button onClick={() => setSelectionQuantities({ ...selectionQuantities, [prod._id]: qty + 1 })} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {Object.keys(selectionQuantities).length > 0 && (
                          <div style={{
                            background: (isCovered && !isLimitExceeded) ? 'linear-gradient(90deg, #16a34a, #15803d)' : 'var(--color-primary)',
                            borderRadius: '16px', padding: '1.25rem', marginBottom: '2rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            color: '#fff', boxShadow: (isCovered && !isLimitExceeded) ? '0 8px 24px rgba(22,163,74,0.25)' : '0 8px 24px rgba(91,62,132,0.2)',
                          }}>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{Object.keys(selectionQuantities).length} Items Selected</div>
                              <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>{activeService.name} · {(isCovered && !isLimitExceeded) ? 'Covered under subscription' : isLimitExceeded ? 'Limit exceeded · Normal pricing applies' : "Click '+' to add to bag"}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                              <div style={{ fontWeight: 900, fontSize: '1.5rem' }}>
                                {(isCovered && !isLimitExceeded) ? '₹0 (Covered)' : (() => {
                                  const total = Object.entries(selectionQuantities).reduce((acc, [id, qty]) => {
                                    const p = activeServiceProducts.find(prod => prod._id === id);
                                    return acc + (p?.servicePrice || 0) * qty;
                                  }, 0);
                                  return `Rs. ${total}`;
                                })()}
                              </div>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.6rem 1.5rem', background: '#fff', color: (isCovered && !isLimitExceeded) ? '#16a34a' : 'var(--color-primary)', fontWeight: 800 }}
                                onClick={() => {
                                  const newItems = Object.entries(selectionQuantities).map(([id, qty]) => {
                                    const prod = activeServiceProducts.find(p => p._id === id);
                                    return {
                                      id: Date.now() + Math.random(),
                                      product: prod.name,
                                      service: activeService.name,
                                      quantity: qty,
                                      unit: 'pcs',
                                      price: (isCovered && !isLimitExceeded) ? 0 : prod.servicePrice,
                                      total: (isCovered && !isLimitExceeded) ? 0 : prod.servicePrice * qty,
                                      subscriptionApplied: isCovered && !isLimitExceeded,
                                    };
                                  });
                                  setCart(prev => mergeCartItems(prev, newItems));
                                  setSelectionQuantities({});
                                }}
                              >Add to Bag</button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              };

              const renderCartContent = () => {
                if (cart.length === 0) return null;
                return (
                  <div className="fade-in" style={{ marginTop: '2.5rem' }}>
                    <h4 style={{ color: 'var(--color-primary)', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Shirt size={20} /> Your Bag ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                    </h4>
                    <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid rgba(91,62,132,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'rgba(91,62,132,0.05)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Item</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Qty</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Price</th>
                            <th style={{ padding: '1rem', width: '50px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                           {cart.map(item => {
                            const svc = services.find(s => s.name === item.service);
                            const isSubUsed = item.subscriptionApplied;
                            return (
                              <tr key={item.id} style={{ borderTop: '1px solid rgba(91,62,132,0.05)' }}>
                                <td style={{ padding: '1rem' }}>
                                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    {item.product}
                                    {isSubUsed && (
                                      <span style={{
                                        fontSize: '0.65rem', fontWeight: 900, background: 'rgba(91,62,132,0.12)',
                                        color: 'var(--color-primary)', padding: '0.15rem 0.6rem', borderRadius: '100px',
                                        border: '1px solid rgba(91,62,132,0.2)', letterSpacing: '0.04em',
                                        textTransform: 'uppercase'
                                      }}>⚡ Covered</span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{item.service}</div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700 }}>{item.quantity || '—'}</td>
                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: isSubUsed ? 'var(--color-primary)' : 'inherit' }}>
                                  {(() => {
                                    if (item.unit === 'plan' || item.isPlanItem) {
                                      return `Rs. ${item.total}`;
                                    }
                                    if (item.unit === 'kg' || svc?.type === 'Global') {
                                      return isSubUsed ? '₹0/kg ✓' : `Rs. ${svc?.basePrice || item.price}/kg`;
                                    }
                                    return isSubUsed ? '₹0 ✓' : `Rs. ${item.total}`;
                                  })()}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                  <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={18} /></button>
                                </td>
                              </tr>
                            );
                          })}
                          <tr style={{ background: 'rgba(91,62,132,0.03)', fontWeight: 700, fontSize: '0.9rem' }}>
                            <td colSpan="4" style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--color-primary)' }}>
                              Total price will be finalised in the review process
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              };

              return (
                <div className="fade-in">
                  <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)', fontWeight: 800 }}>Add Laundry Items</h3>
                  <p style={{ color: '#b6a3ce', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 500 }}>Select one or more services. Subscription-covered services are highlighted in green.</p>


                  {renderServiceChips()}

                  {!activeService ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#b6a3ce', background: 'rgba(91,62,132,0.03)', borderRadius: '16px', border: '1px dashed rgba(91,62,132,0.2)' }}>
                      Select a service above to get started
                    </div>
                  ) : activeService.unit === 'kg' ? renderKgContent() : renderProductContent()}

                  {renderCartContent()}
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
                  <div className="summary-row" style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1rem", marginTop: "0.5rem", justifyContent: 'center' }}>
                    <span className="summary-value" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                      Total price will be finaled in review process
                    </span>
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
                  <button className="btn btn-secondary" style={{ padding: '0.8rem 2rem' }} onClick={() => {
                    setSelectedPlan(null);
                    localStorage.removeItem('selectedPlan');
                    navigate('/');
                  }}>Cancel</button>
              )}

              {orderStep < 4 ? (
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.8rem 2rem' }}
                  onClick={() => {
                    if (orderStep === 1) {
                      const kgServices = selectedServices.filter(s => s.unit === 'kg');
                      if (kgServices.length > 0) {
                        const newKgItems = kgServices
                          .filter(s => !cart.some(item => item.service === s.name && item.unit === 'kg'))
                          .map(s => {
                            const matchingSub = getMatchingCoverage(s.name);
                            const isSubApplied = !!matchingSub && matchingSub.used < matchingSub.totalLimit;
                            return {
                              id: Date.now() + Math.random(),
                              product: 'Bulk/Weight',
                              service: s.name,
                              quantity: 0,
                              unit: 'kg',
                              price: isSubApplied ? 0 : s.basePrice,
                              total: 0,
                              subscriptionApplied: !!isSubApplied
                            };
                          });
                        if (newKgItems.length > 0) {
                          setCart(prev => [...prev, ...newKgItems]);
                        }
                      }
                    }
                    setOrderStep(orderStep + 1);
                  }}
                  disabled={
                    (orderStep === 1 && selectedServices.length === 0) ||
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
          {/* <div className="section-divider" style={{ padding: 'var(--space-lg) 0' }}>
            <div className="container">
              <hr style={{ border: 'none', borderTop: '1px solid rgba(91, 62, 132, 0.15)', margin: '0 auto', width: '85%' }} />
            </div>
          </div> */}

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
              <p>+91 90001 99811</p>
              <p>hello@subratha.com</p>
              <p>53-16-82/24, Maddilapalem, near Shivalayam street, near venkateshwara Apartments, Visakhapatnam - 530013.</p>
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

      <AuthModal
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        isSignup={isSignup}
        setIsSignup={setIsSignup}
        handleAuth={handleAuth}
        handleGoogleLogin={handleGoogleLogin}
      />

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

      </Suspense>

    </>
  );
}

export default App;

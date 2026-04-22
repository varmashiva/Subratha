import React from 'react';
import { CheckCircle, Zap, AlertCircle, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';

const SchedulingFlow = ({
  orderStep,
  setOrderStep,
  services,
  products,
  activeServiceId,
  setActiveServiceId,
  selectedServices,
  setSelectedServices,
  selectionQuantities,
  setSelectionQuantities,
  cart,
  setCart,
  getMatchingCoverage,
  user,
  orderDetails,
  setOrderDetails,
  handleOrderSubmit
}) => {
  const activeService = services.find(s => s._id === activeServiceId);
  const activeServiceProducts = products
    .filter(p => p.services.some(s => s.name === activeService?.name))
    .map(p => ({ ...p, servicePrice: p.services.find(s => s.name === activeService?.name).price }));

  const isServiceCovered = (serviceName) => !!getMatchingCoverage(serviceName);

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

  const renderStepper = () => (
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
  );

  const renderServiceStep = () => {
    if (!activeService) return null;
    const sub = getMatchingCoverage(activeService.name);
    const isCovered = !!sub;
    const remaining = sub ? Math.max(0, sub.totalLimit - sub.used) : 0;
    const isLimitExceeded = sub && sub.used >= sub.totalLimit;

    return (
      <div className="scheduling-content">
        <div className="service-chips-container">
          {services.map(svc => {
            const isSelected = selectedServices.some(s => s._id === svc._id);
            const isActive = activeServiceId === svc._id;
            const isCoveredSvc = isServiceCovered(svc.name);

            return (
              <button
                key={svc._id}
                onClick={() => handleChipClick(svc)}
                className={`service-chip ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''} ${isCoveredSvc ? 'covered' : ''}`}
              >
                {isCoveredSvc && <Zap size={14} className="chip-icon" />}
                {svc.name}
              </button>
            );
          })}
        </div>

        <div className={`service-info-card ${isCovered && !isLimitExceeded ? 'covered' : isLimitExceeded ? 'exceeded' : 'normal'}`}>
          <div className="service-header-banner">
            {isCovered && !isLimitExceeded ? (
              <><Zap size={14} fill="currentColor" /> Subscription Coverage · {remaining}kg remaining</>
            ) : isLimitExceeded ? (
              <><AlertCircle size={14} /> Subscription limit exceeded</>
            ) : (
              <><AlertCircle size={14} /> Basic Pricing Applies</>
            )}
          </div>

          <div className="service-details">
            <div className="service-title-group">
              <span className="service-label">Service</span>
              <h3 className="service-name">{activeService.name}</h3>
            </div>
            <div className="service-price-group">
              <span className="service-label">Rate</span>
              <span className="service-base-price">
                {isCovered && !isLimitExceeded ? '₹0 (Included)' : `₹${activeService.basePrice || 0}/kg`}
              </span>
            </div>
          </div>

          {activeService.isPerKg ? (
             <div className="kg-service-notice">
                <div className="notice-item"><CheckCircle size={16} /> Final weight at pickup</div>
                <div className="notice-item"><CheckCircle size={16} /> Update after inspection</div>
             </div>
          ) : (
            <div className="product-list">
              {activeServiceProducts.map(product => {
                const qty = selectionQuantities[product._id] || 0;
                return (
                  <div key={product._id} className="product-item">
                    <div className="product-info">
                      <span className="product-name">{product.name}</span>
                      <span className="product-price">₹{product.servicePrice}</span>
                    </div>
                    <div className="quantity-controls">
                      <button 
                        className="qty-btn" 
                        onClick={() => setSelectionQuantities(prev => ({ ...prev, [product._id]: Math.max(0, qty - 1) }))}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="qty-value">{qty}</span>
                      <button 
                        className="qty-btn" 
                        onClick={() => setSelectionQuantities(prev => ({ ...prev, [product._id]: qty + 1 }))}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="service-cart-actions">
            <button
               className="btn btn-primary fluid"
               onClick={() => {
                  // Add to cart logic
               }}
            >
              Add to Items
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="scheduling-container fade-in">
      <h2 className="scheduling-title">Schedule Premium Service</h2>
      {renderStepper()}
      
      <div className="order-step-content">
        {orderStep === 1 && renderServiceStep()}
        {/* Other steps... */}
      </div>

      <div className="scheduling-footer">
        <button 
          className="btn btn-secondary" 
          onClick={() => setOrderStep(prev => Math.max(1, prev - 1))}
          disabled={orderStep === 1}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => setOrderStep(prev => Math.min(4, prev + 1))}
        >
          {orderStep === 4 ? 'Confirm Order' : 'Next Step'} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default SchedulingFlow;

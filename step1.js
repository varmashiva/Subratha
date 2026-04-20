            {orderStep === 1 && (() => {
              const activeService = services.find(s => s._id === activeServiceId);
              const activeServiceProducts = products
                .filter(p => p.services.some(s => s.name === activeService?.name))
                .map(p => ({ ...p, servicePrice: p.services.find(s => s.name === activeService?.name).price }));

              return (
                <div className="fade-in">
                  <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)', fontWeight: 800 }}>Add Laundry Items</h3>

                  {selectedPlan && activeService?.name === selectedPlan.service && (
                    <div className="fade-in" style={{ marginBottom: '1.5rem', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '12px', padding: '1.25rem' }}>
                      <div style={{ color: '#16a34a', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Zap size={20} fill="#16a34a" /> Subscription Plan Selected: {selectedPlan.name}
                      </div>
                      <div style={{ color: '#16a34a', fontSize: '0.85rem', marginTop: '0.2rem', fontWeight: 600 }}>This service is covered under your subscription</div>
                    </div>
                  )}

                  {/* SERVICE SELECTION CHIPS */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '2rem' }}>
                    {services.map(svc => {
                      const isSelected = selectedServices.some(s => s._id === svc._id);
                      const isActive = activeServiceId === svc._id;
                      const isCovered = (selectedPlan && svc.name === selectedPlan.service) || (activeSub && svc.name === activeSub.serviceType);
                      return (
                        <button
                          key={svc._id}
                          onClick={() => {
                            if (isSelected) {
                              if (isActive) {
                                const newSelected = selectedServices.filter(s => s._id !== svc._id);
                                setSelectedServices(newSelected);
                                if (newSelected.length > 0) {
                                  setActiveServiceId(newSelected[newSelected.length - 1]._id);
                                } else {
                                  setActiveServiceId(null);
                                }
                              } else {
                                setActiveServiceId(svc._id);
                              }
                            } else {
                              setSelectedServices([...selectedServices, svc]);
                              setActiveServiceId(svc._id);
                            }
                            setSelectionQuantities({});
                          }}
                          style={{
                            padding: '0.6rem 1.25rem', borderRadius: '100px', border: '1px solid',
                            borderColor: isActive ? 'var(--color-primary)' : isCovered ? '#16a34a' : isSelected ? 'rgba(91,62,132,0.4)' : 'rgba(91,62,132,0.15)',
                            background: isActive ? 'var(--color-primary)' : isSelected ? 'rgba(91,62,132,0.1)' : 'rgba(255,255,255,0.05)',
                            color: isActive ? '#fff' : isCovered ? '#16a34a' : 'var(--color-primary)',
                            cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s',
                            boxShadow: isCovered ? '0 0 10px rgba(22,163,74,0.1)' : isActive ? '0 4px 12px rgba(91,62,132,0.2)' : 'none',
                            position: 'relative',
                            display: 'flex', alignItems: 'center', gap: '0.4rem'
                          }}
                        >
                          {isCovered && <Zap size={14} fill="#16a34a" />}
                          {svc.name}
                          {isSelected && !isActive && (
                            <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: isCovered ? '#16a34a' : 'var(--color-primary)', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {!activeService ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#b6a3ce', background: 'rgba(91,62,132,0.03)', borderRadius: '16px', border: '1px dashed rgba(91,62,132,0.2)' }}>
                      Please select a service to continue
                    </div>
                  ) : activeService.unit === 'kg' ? (
                    /* KG-BASED DYNAMIC CONTENT */
                    (() => {
                      const isCovered = (selectedPlan && activeService.name === selectedPlan.service) || (activeSub && activeService.name === activeSub.serviceType);
                      return (
                        <div className="fade-in" style={{ 
                          background: isCovered ? 'linear-gradient(135deg, rgba(22,163,74,0.08) 0%, rgba(22,163,74,0.03) 100%)' : 'linear-gradient(135deg, rgba(91,62,132,0.08) 0%, rgba(91,62,132,0.03) 100%)', 
                          borderRadius: '20px', 
                          padding: '2.5rem', 
                          border: `1px solid ${isCovered ? '#16a34a' : 'rgba(91,62,132,0.1)'}`,
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          {isCovered ? (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#16a34a', color: 'white', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Zap size={14} fill="white" /> COVERED UNDER YOUR SUBSCRIPTION
                            </div>
                          ) : (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'rgba(91,62,132,0.1)', color: 'var(--color-text)', opacity: 0.6, padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <AlertCircle size={14} /> NOT INCLUDED IN YOUR SUBSCRIPTION
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                            <div>
                              <div style={{ fontSize: '0.85rem', color: '#b6a3ce', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, marginBottom: '0.5rem' }}>Selected Service</div>
                              <div style={{ fontWeight: 900, fontSize: '2rem', color: 'var(--color-primary)' }}>{activeService.name}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.85rem', color: '#b6a3ce', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, marginBottom: '0.5rem' }}>Estimation Rate</div>
                              <div style={{ fontWeight: 900, fontSize: '2rem', color: isCovered ? '#16a34a' : 'var(--color-primary)' }}>
                                {isCovered ? '₹0 (Included)' : `₹${activeService.basePrice} / kg`}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'var(--color-text)', fontSize: '1.05rem', fontWeight: 600 }}>
                              <CheckCircle size={20} color={isCovered ? '#16a34a' : 'var(--color-primary)'} />
                              <span>Final weight will be measured at pickup</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'var(--color-text)', fontSize: '1.05rem', fontWeight: 600 }}>
                              <CheckCircle size={20} color={isCovered ? '#16a34a' : 'var(--color-primary)'} />
                              <span>Exact price will be updated after inspection</span>
                            </div>
                          </div>
                          {/* Closing banner logic from previous version was removed here as it's now integrated at the top */}
                        </div>
                      );
                    })()
                  ) : (
                    /* PRODUCT-BASED DYNAMIC CONTENT */
                    <div className="fade-in">
                      {(() => {
                        const isCovered = (selectedPlan && activeService.name === selectedPlan.service) || (activeSub && activeService.name === activeSub.serviceType);
                        return (
                          <>
                            {isCovered ? (
                              <div style={{ background: '#16a34a', color: 'white', padding: '0.8rem 1.25rem', fontSize: '0.85rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '16px', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(22,163,74,0.2)' }}>
                                <Zap size={18} fill="white" /> THIS SERVICE IS COVERED UNDER YOUR SUBSCRIPTION (₹0)
                              </div>
                            ) : (
                              <div style={{ background: 'rgba(91,62,132,0.05)', border: '1px solid rgba(91,62,132,0.1)', color: 'var(--color-text)', opacity: 0.8, padding: '0.8rem 1.25rem', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                                <AlertCircle size={18} /> NOT INCLUDED IN YOUR CURRENT SUBSCRIPTION
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
                              const isSelected = qty > 0;
                              return (
                                <div
                                  key={prod._id}
                                  onClick={() => {
                                    if (!isSelected) {
                                      setSelectionQuantities({ ...selectionQuantities, [prod._id]: 1 });
                                    }
                                  }}
                                  className="product-card"
                                  style={{
                                    background: isSelected ? 'rgba(91,62,132,0.1)' : 'rgba(255,255,255,0.03)',
                                    border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'rgba(91,62,132,0.1)'}`,
                                    borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    textAlign: 'center', position: 'relative'
                                  }}
                                >
                                  <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.95rem', marginBottom: '0.4rem' }}>{prod.name}</div>
                                  {activeService?.type !== 'Global' && (
                                    <>
                                      <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-text)' }}>₹{prod.servicePrice}</div>
                                      <div style={{ fontSize: '0.75rem', color: '#b6a3ce', textTransform: 'uppercase' }}>per piece</div>
                                    </>
                                  )}
                                  
                                  {isSelected && (
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
                                      }}
                                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                                      <span style={{ fontWeight: 900, minWidth: '24px', fontSize: '1.1rem' }}>{qty}</span>
                                      <button onClick={() => setSelectionQuantities({ ...selectionQuantities, [prod._id]: qty + 1 })}
                                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {Object.keys(selectionQuantities).length > 0 && (
                            <div style={{ background: 'var(--color-primary)', borderRadius: '16px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', boxShadow: '0 8px 24px rgba(91,62,132,0.2)' }}>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{Object.keys(selectionQuantities).length} Items Selected</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{activeService.name} · Click '+' to add to bag</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ fontWeight: 900, fontSize: '1.5rem' }}>
                                  {(() => {
                                    const isCovered = (selectedPlan && activeService.name === selectedPlan.service) || (activeSub && activeService.name === activeSub.serviceType);
                                    if (isCovered) return '₹0 (Covered)';
                                    const total = Object.entries(selectionQuantities).reduce((acc, [id, qty]) => {
                                      const p = activeServiceProducts.find(prod => prod._id === id);
                                      return acc + (p?.servicePrice || 0) * qty;
                                    }, 0);
                                    return `₹${total}`;
                                  })()}
                                </div>
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: '0.6rem 1.5rem', background: '#fff', color: 'var(--color-primary)', fontWeight: 800 }}
                                  onClick={() => {
                                    const newItems = Object.entries(selectionQuantities).map(([id, qty]) => {
                                      const prod = activeServiceProducts.find(p => p._id === id);
                                      return {
                                        id: Date.now() + Math.random(),
                                        product: prod.name,
                                        service: activeService.name,
                                        quantity: qty,
                                        unit: 'pcs',
                                        price: prod.servicePrice,
                                        total: prod.servicePrice * qty,
                                        subscriptionApplied: false
                                      };
                                    });
                                    setCart([...cart, ...newItems]);
                                    setSelectionQuantities({});
                                  }}
                                >Add to Bag</button>
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
                                          {(() => {
                                            const svc = services.find(s => s.name === item.service);
                                            const isSubscribed = (selectedPlan && item.service === selectedPlan.service) || (activeSub && item.service === activeSub.serviceType);
                                            
                                            if (svc?.type === 'Global' || item.unit === 'kg') {
                                              return isSubscribed ? '₹0 (Covered)' : `₹${svc?.basePrice || item.price}/kg`;
                                            }
                                            return isSubscribed ? '₹0 (Covered)' : `₹${item.total}`;
                                          })()}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                          <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={18} /></button>
                                        </td>
                                      </tr>
                                    ))}
                                    <tr style={{ background: 'rgba(91,62,132,0.03)', fontWeight: 700, fontSize: '0.9rem' }}>
                                       <td colSpan="4" style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--color-primary)' }}>
                                         Total price will be finaled in review process
                                       </td>
                                     </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                          </>
                        );
                      })()}
                    </div>
                  )
                }
              </div>
            );
          })() ) } }



            {orderStep === 2 && (

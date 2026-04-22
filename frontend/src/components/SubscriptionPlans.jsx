import React from 'react';
import { CheckCircle } from 'lucide-react';

const SubscriptionPlans = ({
  subscriptions,
  services,
  setSelectedPlan,
  setCart,
  setSelectionQuantities,
  setSelectedServices,
  setActiveServiceId,
  handleAction,
  setOrderStep,
  applyPlanCoverageToCartItem,
  createSubscriptionPlanItem,
  normalizeServiceValue,
  SCHEDULE_STORAGE
}) => {
  const allPlans = [
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
  ];

  const availablePlans = allPlans.filter(plan => 
    !subscriptions.some(sub => 
      (sub.service === plan.service || sub.plan === plan.name) && 
      sub.status === 'Active' && 
      sub.used < sub.totalLimit
    )
  );

  if (availablePlans.length === 0) return null;

  return (
    <>
      <div className="section-divider" style={{ padding: 'var(--space-lg) 0' }}>
        <div className="container">
          <hr style={{ border: 'none', borderTop: '1px solid rgba(91, 62, 132, 0.15)', margin: '0 auto', width: '85%' }} />
        </div>
      </div>

      <section className="section" id="subscriptions" style={{ background: 'var(--color-bg)', paddingTop: 0, paddingBottom: 0 }}>
        <div className="container" id="subscription-plans">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '1rem' }}>Subscription Plans</h2>
            <p style={{ color: 'var(--color-text-dim)', fontSize: '1.2rem' }}>Premium care for your regular laundry needs</p>
          </div>

          <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {availablePlans.map((plan, i) => (
              <div key={plan.name} className="service-card" style={{
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                textAlign: 'center',
                background: i === 1 ? 'linear-gradient(135deg, rgba(91,62,132,0.1) 0%, rgba(91,62,132,0.05) 100%)' : 'rgba(255,255,255,0.03)',
                border: i === 1 ? '1px solid var(--color-primary)' : '1px solid #5b3e84',
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>Rs. {plan.price}</span>
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
                    const planServiceName = plan.name === 'Wash & Fold' ? 'Wash and dry' : plan.service;
                    const s = services.find(gs => normalizeServiceValue(gs.name) === normalizeServiceValue(planServiceName));
                    const nextSelectedPlan = { 
                      name: plan.name, 
                      service: planServiceName,
                      price: Number(plan.price),
                      totalLimit: parseInt(plan.weight),
                      used: 0
                    };
                    const planCartItem = createSubscriptionPlanItem(nextSelectedPlan);
                    const existingSubscriptionCart = JSON.parse(localStorage.getItem(SCHEDULE_STORAGE.subscription.cart)) || [];
                    const preservedLaundryItems = existingSubscriptionCart.filter(item => !item.isPlanItem);
                    const nextSubscriptionCart = [
                      planCartItem,
                      ...preservedLaundryItems.map(item => applyPlanCoverageToCartItem(item, nextSelectedPlan))
                    ];

                    setSelectedPlan(nextSelectedPlan);
                    setCart(nextSubscriptionCart);
                    setSelectionQuantities({});
                    localStorage.setItem(SCHEDULE_STORAGE.subscription.cart, JSON.stringify(nextSubscriptionCart));
                    localStorage.setItem(SCHEDULE_STORAGE.subscription.orderStep, '1');
                    localStorage.setItem(SCHEDULE_STORAGE.subscription.selectionQuantities, JSON.stringify({}));
                    localStorage.setItem(SCHEDULE_STORAGE.subscription.selectedPlan, JSON.stringify(nextSelectedPlan));
                    if (s) {
                      setSelectedServices([s]);
                      setActiveServiceId(s._id);
                      localStorage.setItem(SCHEDULE_STORAGE.subscription.selectedServiceIds, JSON.stringify([s._id]));
                      handleAction(false, true, '/schedule-subscription');
                      setOrderStep(1);
                    } else {
                      localStorage.removeItem(SCHEDULE_STORAGE.subscription.selectedServiceIds);
                      handleAction(false, true, '/schedule-subscription');
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

      <div className="section-divider" style={{ padding: 'var(--space-lg) 0' }}>
        <div className="container">
          <hr style={{ border: 'none', borderTop: '1px solid rgba(91, 62, 132, 0.15)', margin: '0 auto', width: '85%' }} />
        </div>
      </div>
    </>
  );
};

export default SubscriptionPlans;

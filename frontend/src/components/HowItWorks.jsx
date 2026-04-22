import React from 'react';
import { CheckCircle, MapPin, Waves, Shirt, Tag } from 'lucide-react';

const HowItWorks = ({ worksRef, activeWorksStep, worksScrollProgress }) => {
  const steps = [
    { title: "Order Placed", desc: "Place your order easily through our website", icon: <CheckCircle size={24} strokeWidth={1.5} /> },
    { title: "Laundry Pickup", desc: "We collect your clothes from your doorstep", icon: <MapPin size={24} strokeWidth={1.5} /> },
    { title: "Processing", desc: "Clothes are washed, dried, and ironed", icon: <Waves size={24} strokeWidth={1.5} /> },
    { title: "Delivery", desc: "Fresh clothes delivered back to you", icon: <Shirt size={24} strokeWidth={1.5} /> },
    { title: "Payment", desc: "Pay easily after delivery", icon: <Tag size={24} strokeWidth={1.5} /> }
  ];

  const images = [
    "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1582735689369-0eb66e6bc527?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1000"
  ];

  return (
    <section className="works-scroll-container" ref={worksRef} style={{ paddingTop: 0 }}>
      <div className="works-sticky-wrapper">
        <div className="container" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>How It Works</h2>
            <p style={{ margin: '0 auto' }}>Laundry in 5 Simple Steps</p>
          </div>

          <div className="works-grid">
            <div className="timeline-container">
              {steps.map((step, index, arr) => {
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
              {images.map((src, idx) => (
                <div key={idx} className={`works-image-wrapper ${activeWorksStep === idx ? 'active' : ''}`}>
                  <img
                    src={src}
                    alt={`Step ${idx + 1}`}
                    loading="lazy"
                    style={{ transform: `translateY(${(worksScrollProgress - 0.5) * -12}%)` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

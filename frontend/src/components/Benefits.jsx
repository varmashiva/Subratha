import React from 'react';
import { Zap, Tag, ShieldCheck, Award } from 'lucide-react';

const Benefits = ({ handleAction }) => {
  const benefits = [
    { title: "Fast Delivery", desc: "24-hour turnaround for standard orders and same-day express options.", icon: <Zap size={28} /> },
    { title: "Affordable Pricing", desc: "Transparent, competitive rates without compromising on premium quality.", icon: <Tag size={28} /> },
    { title: "Professional Handling", desc: "Every garment is inspected by experts and treated with specialized care.", icon: <ShieldCheck size={28} /> },
    { title: "Trusted by Hotels", desc: "Proven reliability serving elite hospitality chains and boutiques.", icon: <Award size={28} /> }
  ];

  return (
    <section className="container section subratha-section" style={{ paddingTop: 0, paddingBottom: 0, textAlign: 'center' }}>
      <div className="scroll-reveal" style={{ transitionDelay: '0.1s' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '1rem' }}>Why Subratha?</h2>
        <p style={{ color: 'var(--color-text-dim)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
          The gold standard in modern laundry & garment care.
        </p>
      </div>

      <div className="benefits-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
        {benefits.map((benefit, index) => (
          <div key={index} className="benefit-item scroll-reveal" style={{ 
            transitionDelay: `${(index * 0.1) + 0.2}s`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '2rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '24px',
            border: '1px solid rgba(91,62,132,0.1)'
          }}>
            <div className="benefit-icon-container" style={{ color: 'var(--color-primary)', background: 'rgba(91,62,132,0.1)', padding: '1rem', borderRadius: '16px', marginBottom: '1.25rem' }}>{benefit.icon}</div>
            <h3 className="benefit-title" style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.75rem' }}>{benefit.title}</h3>
            <p className="benefit-description" style={{ color: 'var(--color-text-dim)', lineHeight: 1.6 }}>{benefit.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex-center scroll-reveal" style={{ marginTop: '3.5rem', transitionDelay: '0.6s' }}>
        <button className="btn btn-primary" onClick={() => handleAction(true)} style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 700 }}>
          Get Started
        </button>
      </div>
    </section>
  );
};

export default Benefits;

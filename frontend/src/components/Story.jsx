import React from 'react';

const Story = ({ storyRef, activeStep, handleAction }) => {
  const steps = [
    {
      step: 1,
      label: "Everyday Care",
      title: "Wash and fold",
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
  ];

  return (
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
            {steps.map((s) => (
              <div key={s.step} className={`story-step-content ${activeStep === s.step ? 'active' : activeStep > s.step ? 'past' : 'next'}`}>
                <span className="story-label">{s.label}</span>
                <h3 className="story-title">{s.title}</h3>
                <div className="story-image-wrap">
                  <img src={s.img} alt={s.title} loading="lazy" />
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
  );
};

export default Story;

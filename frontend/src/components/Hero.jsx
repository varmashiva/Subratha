import React from 'react';

const Hero = ({ handleAction }) => {
  return (
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
          {/* <img src="/images/subratha_iconography.png" alt="Subratha Icon" className="hero-brand-icon fade-in" style={{ height: '64px', width: 'auto', marginBottom: '1.5rem', animationDelay: '0.3s' }} /> */}
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
  );
};

export default Hero;

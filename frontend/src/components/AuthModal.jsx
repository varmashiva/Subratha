import React from 'react';
import { X, LogIn } from 'lucide-react';
import GoogleLoginButton from './GoogleLoginButton';

const AuthModal = ({
  showAuthModal,
  setShowAuthModal,
  isSignup,
  setIsSignup,
  handleAuth,
  handleGoogleLogin
}) => {
  if (!showAuthModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowAuthModal(false)}><X /></button>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            {isSignup ? "Join the Community" : "Welcome Back"}
          </h2>
          <p style={{ color: 'var(--color-text-dim)', fontSize: '0.9rem' }}>
            {isSignup ? "Create an account for premium wardrobe care." : "Sign in to manage your concierge services."}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleAuth}>
          {isSignup && (
            <div className="input-group">
              <input type="text" className="input-field" placeholder="Full Name" required />
            </div>
          )}
          <div className="input-group">
            <input type="email" className="input-field" placeholder="Email Address" required />
          </div>
          <div className="input-group">
            <input type="password" className="input-field" placeholder="Password" required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
            {isSignup ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="divider">or continue with</div>

        <GoogleLoginButton onClick={handleGoogleLogin} />

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-dim)' }}>
          {isSignup ? "Already have an account?" : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignup(!isSignup)}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer' }}
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;

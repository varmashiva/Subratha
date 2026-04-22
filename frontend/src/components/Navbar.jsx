import React from 'react';
import { User, LogIn, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({
  isAuthenticated,
  user,
  showProfileDropdown,
  setShowProfileDropdown,
  handleLogout,
  showMobileMenu,
  setShowMobileMenu,
  handleAction,
  setIsSignup,
  setShowAuthModal
}) => {
  const navigate = useNavigate();

  return (
    <header>
      <nav className="navbar fade-in">
        <a href="/" className="navbar-brand">
          <img src="/images/subrathalogo.png" alt="Subratha" style={{ height: '72px', width: 'auto', display: 'block' }} />
        </a>
        <div className="flex-row">
          {!isAuthenticated ? (
            <div
              className="user-profile user-profile--guest"
              onClick={() => {
                setIsSignup(false);
                setShowAuthModal(true);
                localStorage.setItem('postAuthRedirect', '/');
              }}
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
          <>
            <div className={`nav-overlay active`} onClick={() => setShowMobileMenu(false)} />
            <div className={`mobile-menu-overlay active`} onClick={() => setShowMobileMenu(false)}>
              <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
                <div className="mobile-menu-header">
                  <div className="navbar-brand">
                    <img src="/images/subrathalogo.png" alt="Subratha" style={{ height: '32px', width: 'auto', display: 'block' }} />
                  </div>
                  <button className="mobile-menu-close" onClick={() => setShowMobileMenu(false)}>
                    <X size={28} />
                  </button>
                </div>
                <div className="mobile-menu-links">
                  <a href="/" onClick={() => setShowMobileMenu(false)}>Home</a>
                  <button onClick={() => { handleAction(true); setShowMobileMenu(false); }}>Schedule Pickup</button>
                  <a href="#" onClick={() => setShowMobileMenu(false)}>Our Services</a>
                  <div className="mobile-menu-divider" />
                  {isAuthenticated ? (
                    <>
                      {user?.role === 'admin' && (
                        <button className="mobile-menu-item admin-link" onClick={() => { navigate('/admin'); setShowMobileMenu(false); }}>
                          ⚙ Admin Dashboard
                        </button>
                      )}
                      <button className="mobile-menu-item" onClick={() => { navigate('/profile'); setShowMobileMenu(false); }}>My Profile</button>
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
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

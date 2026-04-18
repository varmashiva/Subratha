import React from 'react';
import { Mail } from 'lucide-react';

const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    // Redirect to backend OAuth route
    const backendUrl = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production'
      ? 'https://subratha.onrender.com'
      : 'http://localhost:5001');

    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#5b3e84]">
      <div className="p-8 bg-[#3d295a] rounded-3xl shadow-2xl border border-[#7c56b3] max-w-sm w-full transition-all hover:scale-[1.02]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#f5f2f8] mb-2">Welcome to Subratha</h1>
          <p className="text-[#b6a3ce]">Premium Laundry Experience</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#f5f2f8] text-[#3d295a] rounded-2xl font-bold text-lg hover:shadow-[0_0_20px_rgba(245,242,248,0.3)] transition-all active:scale-95 active:bg-[#e1dde6]"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94L5.84 14.1z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="mt-8 text-center text-xs text-[#b6a3ce]/60 px-4">
          By signing in, you agree to Subratha's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default GoogleLoginButton;

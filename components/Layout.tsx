import React, { useState, useEffect } from 'react';
import { IconMenu, CustemoCircularLogo, CustemoTextLogo, IconUser } from './Icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Handle scroll effect for transparency
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthAction = () => {
      if (user) {
          if (user.role === 'admin') {
              navigate('/admin');
          } else {
              navigate('/profile');
          }
      } else {
          navigate('/login');
      }
      setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-stone-50">
      
      {/* HEADER */}
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-stone-100 py-3' 
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* LEFT: LOGO + BRAND NAME */}
            <Link to="/" className="flex items-center gap-3 group">
              <CustemoCircularLogo className="h-10 w-10 text-custemo-dark transition-transform group-hover:rotate-12" />
              <CustemoTextLogo className="h-6 w-auto text-custemo-dark hidden sm:block" />
            </Link>
            
            {/* RIGHT: 3 CTAs (Desktop) */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-custemo-green' : 'text-stone-600 hover:text-custemo-dark'}`}
              >
                Home
              </Link>
              <Link 
                to="/studio" 
                className={`text-sm font-medium transition-colors ${isActive('/studio') ? 'text-custemo-green' : 'text-stone-600 hover:text-custemo-dark'}`}
              >
                Studio
              </Link>
              
              <button 
                onClick={handleAuthAction}
                className={`text-sm font-medium transition-all px-5 py-2 rounded-full border ${
                    user 
                    ? 'border-transparent bg-stone-100 text-stone-800 hover:bg-stone-200' 
                    : 'border-custemo-dark text-custemo-dark hover:bg-custemo-dark hover:text-white'
                }`}
              >
                {user ? 'My Profile' : 'SignUp/Login'}
              </button>
            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-stone-800 hover:bg-stone-100 rounded-full transition-colors"
                aria-label="Menu"
              >
                <IconMenu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU OVERLAY */}
        <div 
          className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-stone-200 shadow-xl transition-all duration-300 overflow-hidden ${
            isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col p-4 space-y-2">
            <Link 
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-3 rounded-lg text-base font-medium ${isActive('/') ? 'bg-custemo-sage/30 text-custemo-green' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              Home
            </Link>
            <Link 
              to="/studio" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-3 rounded-lg text-base font-medium ${isActive('/studio') ? 'bg-custemo-sage/30 text-custemo-green' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              Studio
            </Link>
            <button 
              onClick={handleAuthAction}
              className="p-3 rounded-lg text-base font-medium text-left text-stone-600 hover:bg-stone-50 flex items-center gap-2"
            >
              {user && <IconUser className="w-4 h-4" />}
              {user ? 'My Profile' : 'SignUp/Login'}
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      {/* Padding top is adjusted so content isn't hidden behind fixed header */}
      <main className="flex-grow pt-20 animate-fade-in">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-custemo-dark text-stone-400 py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-white font-serif text-xl flex items-center gap-2">
               <CustemoCircularLogo className="h-6 w-6 text-white bg-white rounded-full p-0.5" />
               Custemo
            </h3>
            <p className="text-sm leading-relaxed max-w-xs">
              Redefining fashion through AI-powered personalization and on-demand manufacturing. Minimizing waste, maximizing style.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4 tracking-wide">Company</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
              <li className="hover:text-white cursor-pointer transition-colors">Sustainability</li>
              <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4 tracking-wide">Support</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer transition-colors">FAQ</li>
              <li className="hover:text-white cursor-pointer transition-colors">Shipping</li>
              <li className="hover:text-white cursor-pointer transition-colors">Returns</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4 tracking-wide">Connect</h4>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-stone-700 rounded-full hover:bg-custemo-gold hover:text-custemo-dark transition-all cursor-pointer transform hover:-translate-y-1"></div>
              <div className="w-8 h-8 bg-stone-700 rounded-full hover:bg-custemo-gold hover:text-custemo-dark transition-all cursor-pointer transform hover:-translate-y-1"></div>
              <div className="w-8 h-8 bg-stone-700 rounded-full hover:bg-custemo-gold hover:text-custemo-dark transition-all cursor-pointer transform hover:-translate-y-1"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-stone-800 text-center text-xs">
          © 2024 Custemo Pvt Ltd. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
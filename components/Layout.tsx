import React from 'react';
import { IconShoppingBag } from './Icons';
import { Link } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl font-serif font-bold text-custemo-green tracking-tight">Custemo</span>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-600">
                <Link to="/" className="hover:text-custemo-green transition-colors">Home</Link>
                <Link to="/studio" className="hover:text-custemo-green transition-colors">Studio</Link>
                <span className="cursor-not-allowed opacity-50" title="Coming Soon">Collection</span>
                <span className="cursor-not-allowed opacity-50" title="Coming Soon">About</span>
              </div>
              <Link to="/studio" className="bg-custemo-green text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-800 transition-colors flex items-center gap-2">
                <span>Design Now</span>
                <IconShoppingBag className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-custemo-dark text-stone-400 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-serif text-xl mb-4">Custemo</h3>
            <p className="text-sm leading-relaxed">
              Redefining fashion through AI-powered personalization and on-demand manufacturing. Minimizing waste, maximizing style.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>About Us</li>
              <li>Sustainability</li>
              <li>Careers</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>FAQ</li>
              <li>Shipping</li>
              <li>Returns</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Connect</h4>
            <div className="flex space-x-4">
              {/* Social placeholders */}
              <div className="w-8 h-8 bg-stone-700 rounded-full"></div>
              <div className="w-8 h-8 bg-stone-700 rounded-full"></div>
              <div className="w-8 h-8 bg-stone-700 rounded-full"></div>
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

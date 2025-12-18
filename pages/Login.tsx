import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { IconSparkles, IconLock, IconUser, CustemoTextLogo, IconLoader } from '../components/Icons';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
        if (isRegistering) {
            await register(email, name || 'New User');
        } else {
            const success = await login(email);
            if (!success) {
                setError("User not found. Try 'demo@custemo.com' or register.");
                return;
            }
        }
        navigate('/studio');
    } catch (err) {
        setError('An error occurred. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-stone-50">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in-up hover:shadow-3xl transition-shadow duration-500">
          
          {/* Brand Panel */}
          <div className="w-full md:w-1/2 bg-custemo-dark p-12 text-white flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80')] bg-cover bg-center transition-transform duration-[5s] ease-linear group-hover:scale-110" />
            <div className="relative z-10 animate-fade-in stagger-delay-1">
                <div className="flex items-center gap-2 mb-6">
                    <IconSparkles className="w-6 h-6 text-custemo-gold animate-pulse" />
                    <CustemoTextLogo className="h-10 w-auto text-white" />
                </div>
                <h2 className="text-3xl font-serif font-bold mb-4 leading-tight">Welcome Back to Future Fashion.</h2>
                <p className="text-stone-300 leading-relaxed mb-4">
                    Sign in to access your digital wardrobe, saved designs, and order history. 
                </p>
                <div className="text-xs text-stone-400 bg-black/40 p-4 rounded-lg border border-stone-600">
                    <p className="font-bold text-stone-300">Demo Credentials:</p>
                    <p>Admin: admin@custemo.com</p>
                    <p>User: demo@custemo.com</p>
                </div>
            </div>
          </div>

          {/* Form Panel */}
          <div className="w-full md:w-1/2 p-8 md:p-12 animate-slide-in-right stagger-delay-2">
            <h3 className="text-2xl font-bold text-custemo-dark mb-2">{isRegistering ? 'Create Account' : 'Sign In'}</h3>
            <p className="text-stone-500 mb-6 text-sm">
                {isRegistering ? 'Already have an account?' : "Don't have an account?"} 
                <button onClick={() => setIsRegistering(!isRegistering)} className="text-custemo-green font-medium hover:underline ml-1">
                    {isRegistering ? 'Sign In' : 'Create one now'}
                </button>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                {isRegistering && (
                    <div>
                        <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Full Name</label>
                        <div className="relative group">
                            <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-custemo-green transition-colors" />
                            <input 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white text-stone-900 placeholder-stone-400 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-custemo-green focus:border-transparent transition-all duration-300 ease-spring" 
                                placeholder="Jane Doe"
                                required={isRegistering}
                            />
                        </div>
                    </div>
                )}
                <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Email Address</label>
                    <div className="relative group">
                        <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-custemo-green transition-colors" />
                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white text-stone-900 placeholder-stone-400 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-custemo-green focus:border-transparent transition-all duration-300 ease-spring" 
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                </div>
                {!isRegistering && (
                    <div>
                        <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Password</label>
                        <div className="relative group">
                            <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-custemo-green transition-colors" />
                            <input 
                                type="password" 
                                className="w-full pl-10 pr-4 py-3 bg-white text-stone-900 placeholder-stone-400 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-custemo-green focus:border-transparent transition-all duration-300 ease-spring" 
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                )}

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-custemo-dark text-white py-3.5 rounded-lg font-medium hover:bg-black transition-all duration-300 ease-spring hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] flex justify-center items-center gap-2"
                >
                    {loading && <IconLoader className="w-4 h-4 animate-spin" />}
                    {isRegistering ? 'Sign Up' : 'Sign In'}
                </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
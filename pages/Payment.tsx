import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { IconCheck, IconLock, IconCreditCard, IconLoader, IconChevronLeft } from '../components/Icons';

const Payment: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
      return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-lg w-full animate-fade-in-up border border-stone-100">
                    <div className="w-20 h-20 bg-custemo-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-custemo-green/30">
                        <IconCheck className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-custemo-dark mb-4">Order Confirmed!</h1>
                    <p className="text-stone-500 mb-8 leading-relaxed">
                        Thank you for designing with Custemo. Your unique garment is now entering our production queue. We've sent a receipt to your email.
                    </p>
                    <div className="bg-stone-50 p-4 rounded-lg mb-8 text-sm text-stone-600">
                        Order #CUS-882910 • Estimated Delivery: Oct 24
                    </div>
                    <Link to="/" className="block w-full bg-custemo-dark text-white py-4 rounded-xl font-medium hover:bg-black transition-all hover:shadow-lg active:scale-[0.98]">
                        Return Home
                    </Link>
                </div>
            </div>
        </Layout>
      );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
            <Link to="/checkout" className="flex items-center text-stone-500 hover:text-custemo-dark transition-colors mb-4 group">
                <IconChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                Back to Shipping
            </Link>
            <h1 className="text-3xl font-serif font-bold text-custemo-dark">Payment</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden animate-fade-in-up">
            <div className="bg-stone-50 p-6 border-b border-stone-200 flex justify-between items-center">
                <span className="font-bold text-stone-700">Total to Pay</span>
                <span className="font-bold text-2xl text-custemo-dark">$137.50</span>
            </div>

            <form onSubmit={handlePay} className="p-6 md:p-8 space-y-6">
                
                {/* Method Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <button type="button" className="p-4 border-2 border-custemo-green bg-custemo-sage/10 rounded-xl flex flex-col items-center justify-center gap-2 transition-all">
                        <IconCreditCard className="w-6 h-6 text-custemo-green" />
                        <span className="text-sm font-bold text-custemo-dark">Credit Card</span>
                    </button>
                    <button type="button" className="p-4 border border-stone-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-stone-50 transition-all opacity-60">
                         <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="GPay" className="w-6 h-6 grayscale" />
                        <span className="text-sm font-medium text-stone-600">Google Pay</span>
                    </button>
                </div>

                {/* Card Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Card Number</label>
                        <div className="relative">
                            <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-3 bg-white text-stone-900 placeholder-stone-400 border border-stone-200 rounded-lg focus:ring-1 focus:ring-custemo-green focus:outline-none transition-shadow" 
                                placeholder="0000 0000 0000 0000"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Expiration</label>
                            <input 
                                type="text" 
                                className="w-full p-3 bg-white text-stone-900 placeholder-stone-400 border border-stone-200 rounded-lg focus:ring-1 focus:ring-custemo-green focus:outline-none" 
                                placeholder="MM / YY"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-stone-500 mb-1">CVC</label>
                            <input 
                                type="text" 
                                className="w-full p-3 bg-white text-stone-900 placeholder-stone-400 border border-stone-200 rounded-lg focus:ring-1 focus:ring-custemo-green focus:outline-none" 
                                placeholder="123"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Cardholder Name</label>
                        <input 
                            type="text" 
                            className="w-full p-3 bg-white text-stone-900 placeholder-stone-400 border border-stone-200 rounded-lg focus:ring-1 focus:ring-custemo-green focus:outline-none" 
                            placeholder="Full Name on Card"
                            required
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={isProcessing}
                        className="w-full bg-custemo-dark text-white py-4 rounded-xl font-medium hover:bg-black transition-all hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isProcessing ? (
                            <>
                                <IconLoader className="w-5 h-5 animate-spin" />
                                Processing Payment...
                            </>
                        ) : (
                            <>
                                <IconLock className="w-4 h-4" />
                                Pay $137.50 Securely
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-stone-400 mt-4 flex items-center justify-center gap-1">
                        <IconLock className="w-3 h-3" />
                        Payments are SSL encrypted and secure.
                    </p>
                </div>
            </form>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;
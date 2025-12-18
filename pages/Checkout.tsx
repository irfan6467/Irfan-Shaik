import React from 'react';
import Layout from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { IconCheck, IconTruck, IconChevronLeft } from '../components/Icons';

const Checkout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 animate-fade-in">
            <Link to="/studio" className="flex items-center text-stone-500 hover:text-custemo-dark transition-colors mb-4 group w-fit">
                <IconChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                Back to Studio
            </Link>
            <h1 className="text-3xl font-serif font-bold text-custemo-dark">Checkout</h1>
        </div>

        <div className="flex flex-col-reverse md:grid md:grid-cols-12 gap-12">
            
            {/* Left Column: Shipping Form - Staggered Entrance */}
            <div className="md:col-span-7 space-y-8">
                
                {/* Contact Info */}
                <section className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm animate-fade-in-up stagger-delay-1 hover:shadow-md transition-shadow duration-300">
                    <h2 className="text-lg font-bold text-custemo-dark mb-4 flex items-center gap-2">
                        <span className="bg-custemo-dark text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                        Contact Information
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Email Address</label>
                            <input type="email" className="w-full p-3 bg-white text-stone-900 placeholder-stone-400 border border-stone-200 rounded-lg focus:ring-1 focus:ring-custemo-green focus:outline-none transition-shadow duration-300" placeholder="you@email.com" />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="rounded text-custemo-green focus:ring-custemo-green" />
                            <span className="text-sm text-stone-600 group-hover:text-custemo-green transition-colors">Email me with news and offers</span>
                        </label>
                    </div>
                </section>

                {/* Shipping Address */}
                <section className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm animate-fade-in-up stagger-delay-2 hover:shadow-md transition-shadow duration-300">
                     <h2 className="text-lg font-bold text-custemo-dark mb-4 flex items-center gap-2">
                        <span className="bg-custemo-dark text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                        Shipping Address
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                             <label className="block text-xs font-bold uppercase text-stone-500 mb-1">First Name</label>
                             <input type="text" className="w-full p-3 bg-white text-stone-900 placeholder-stone-400 border border-stone-200 rounded-lg focus:ring-1 focus:ring-custemo-green focus:outline-none transition-shadow" />
                        </div>
                        <div className="col-span-1">
                             <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Last Name</label>
                             <input type="text" className="w-full p-3 bg-white text-stone-900 placeholder-stone-400 border border-stone-200 rounded-lg focus:ring-1 focus:ring-custemo-green focus:outline-none transition-shadow" />
                        </div>
                        <div className="col-span-2">
                             <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Address</label>
                             <input type="text" className="w-full p-3 bg-white text-stone-900 placeholder-stone-400 border border-stone-200 rounded-lg focus:ring-1 focus:ring-custemo-green focus:outline-none transition-shadow" />
                        </div>
                        <div className="col-span-2">
                             <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Apartment, suite, etc.</label>
                             <input type="text" className="w-full p-3 bg-white text-stone-900 placeholder-stone-400 border border-stone-200 rounded-lg focus:ring-1 focus:ring-custemo-green focus:outline-none transition-shadow" />
                        </div>
                        <div className="col-span-1">
                             <label className="block text-xs font-bold uppercase text-stone-500 mb-1">City</label>
                             <input type="text" className="w-full p-3 bg-white text-stone-900 placeholder-stone-400 border border-stone-200 rounded-lg focus:ring-1 focus:ring-custemo-green focus:outline-none transition-shadow" />
                        </div>
                        <div className="col-span-1">
                             <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Postal Code</label>
                             <input type="text" className="w-full p-3 bg-white text-stone-900 placeholder-stone-400 border border-stone-200 rounded-lg focus:ring-1 focus:ring-custemo-green focus:outline-none transition-shadow" />
                        </div>
                    </div>
                </section>

                {/* Shipping Method */}
                <section className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm animate-fade-in-up stagger-delay-3 hover:shadow-md transition-shadow duration-300">
                    <h2 className="text-lg font-bold text-custemo-dark mb-4 flex items-center gap-2">
                        <span className="bg-custemo-dark text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                        Shipping Method
                    </h2>
                    <div className="border border-stone-200 rounded-lg overflow-hidden">
                        <div className="p-4 flex items-center justify-between border-b border-stone-200 bg-custemo-sage/10 cursor-pointer hover:bg-custemo-sage/20 transition-colors">
                            <div className="flex items-center gap-3">
                                <IconTruck className="w-5 h-5 text-custemo-green" />
                                <span className="font-medium text-sm">Standard Shipping (5-7 Days)</span>
                            </div>
                            <span className="font-bold text-sm">Free</span>
                        </div>
                        <div className="p-4 flex items-center justify-between opacity-50 cursor-not-allowed bg-stone-50">
                             <div className="flex items-center gap-3">
                                <IconTruck className="w-5 h-5 text-stone-400" />
                                <span className="font-medium text-sm">Express Production (2-3 Days)</span>
                            </div>
                            <span className="font-bold text-sm">$25.00</span>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end pt-4 animate-fade-in stagger-delay-3">
                    <button 
                        onClick={() => navigate('/payment')}
                        className="bg-custemo-dark text-white px-8 py-4 rounded-xl font-medium hover:bg-black transition-all duration-300 ease-spring hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] flex items-center gap-2 w-full md:w-auto justify-center"
                    >
                        Continue to Payment
                        <IconChevronLeft className="w-4 h-4 rotate-180" />
                    </button>
                </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="md:col-span-5 h-fit md:sticky md:top-24 animate-slide-in-right stagger-delay-2">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-stone-100 transition-all duration-500 hover:shadow-xl">
                    <h2 className="text-lg font-serif font-bold text-custemo-dark mb-6">Order Summary</h2>
                    
                    {/* Mock Cart Item */}
                    <div className="flex gap-4 mb-6 pb-6 border-b border-stone-100 group">
                        <div className="w-20 h-24 bg-stone-100 rounded-lg overflow-hidden relative group-hover:shadow-md transition-shadow">
                             {/* Placeholder for Studio Image */}
                             <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-400 font-medium">Preview</div>
                             <img src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=200" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt="Custom Shirt" />
                        </div>
                        <div className="flex-grow">
                            <h3 className="font-bold text-stone-800">Custom Organic Shirt</h3>
                            <p className="text-xs text-stone-500 mt-1">Surat Cotton • Regular Fit</p>
                            <p className="text-xs text-stone-500">Crew Neck • Short Sleeve</p>
                        </div>
                        <div className="text-right">
                            <p className="font-medium">$125.00</p>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm text-stone-600 mb-6">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>$125.00</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span className="text-custemo-green font-medium">Free</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Taxes (Estimated)</span>
                            <span>$12.50</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-stone-200 flex justify-between items-center">
                        <span className="font-bold text-lg text-custemo-dark">Total</span>
                        <div className="text-right">
                            <span className="text-xs text-stone-400 block font-normal">USD</span>
                            <span className="font-bold text-2xl text-custemo-dark">$137.50</span>
                        </div>
                    </div>
                    
                    <div className="mt-6 bg-stone-50 p-3 rounded-lg flex items-start gap-2">
                        <IconCheck className="w-4 h-4 text-custemo-green mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-stone-500 leading-relaxed">
                            Your order is made on-demand. Expect production to take 3-5 days before shipping.
                        </p>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
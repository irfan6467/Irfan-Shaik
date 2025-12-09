import React from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { IconLeaf, IconSparkles, IconShoppingBag, IconCheck } from '../components/Icons';

const Landing: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative bg-stone-100 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-custemo-gold/10 text-custemo-gold text-sm font-medium mb-6 border border-custemo-gold/20">
              <IconSparkles className="w-4 h-4" />
              <span>The Future of Fashion is Personal</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-custemo-dark mb-6 leading-tight">
              Design Your Style.<br/>
              <span className="text-custemo-green italic">Preserve the Planet.</span>
            </h1>
            <p className="text-xl text-stone-600 mb-10 leading-relaxed">
              Experience true luxury with on-demand manufacturing. 
              Collaborate with our AI to create clothing that fits your body and values perfectly.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/studio" className="px-8 py-4 bg-custemo-dark text-white rounded-full font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                Start Designing
                <IconShoppingBag className="w-4 h-4" />
              </Link>
              <button className="px-8 py-4 bg-white text-custemo-dark border border-stone-300 rounded-full font-medium hover:bg-stone-50 transition-all">
                View Collection
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-custemo-dark">Why Custemo?</h2>
            <p className="mt-4 text-stone-500">Combining technology with traditional craftsmanship.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="p-8 bg-stone-50 rounded-2xl hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-custemo-sage rounded-xl flex items-center justify-center mb-6 text-custemo-green">
                <IconSparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Style Agent</h3>
              <p className="text-stone-600 leading-relaxed">
                Our intelligent "Styla" agent helps you pick the perfect fabrics and fits based on your occasion and preferences.
              </p>
            </div>
            <div className="p-8 bg-stone-50 rounded-2xl hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-custemo-sage rounded-xl flex items-center justify-center mb-6 text-custemo-green">
                <IconShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">On-Demand Making</h3>
              <p className="text-stone-600 leading-relaxed">
                We don't start sewing until you order. This zero-inventory model eliminates textile waste entirely.
              </p>
            </div>
            <div className="p-8 bg-stone-50 rounded-2xl hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-custemo-sage rounded-xl flex items-center justify-center mb-6 text-custemo-green">
                <IconLeaf className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Sustainable Luxury</h3>
              <p className="text-stone-600 leading-relaxed">
                Premium fabrics sourced from Surat, including organic cotton and ethical silk, traced via blockchain.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fabric Showcase */}
      <div className="py-24 bg-custemo-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <img 
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1974&auto=format&fit=crop" 
                alt="Fabric Texture" 
                className="rounded-2xl shadow-2xl opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Sourced with Purpose.</h2>
            <p className="text-stone-300 mb-6 text-lg">
                We believe that what you wear matters. Our fabrics are carefully selected for their environmental impact and longevity.
            </p>
            <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                    <IconCheck className="text-custemo-green" />
                    <span>Certified Organic Cotton</span>
                </li>
                 <li className="flex items-center gap-3">
                    <IconCheck className="text-custemo-green" />
                    <span>Recycled Polyesters</span>
                </li>
                 <li className="flex items-center gap-3">
                    <IconCheck className="text-custemo-green" />
                    <span>Supply Chain Transparency</span>
                </li>
            </ul>
            <Link to="/studio" className="text-custemo-gold hover:text-white transition-colors font-medium underline underline-offset-4">
                Explore Materials &rarr;
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Landing;
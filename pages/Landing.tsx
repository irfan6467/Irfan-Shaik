import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { IconLeaf, IconSparkles, IconShoppingBag, IconCheck, IconTruck, IconWand } from '../components/Icons';
import Magnetic from '../components/Magnetic';

const Landing: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [expandedBento, setExpandedBento] = useState<string | null>(null);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30, // Increased range for liquid feel
        y: (e.clientY / window.innerHeight - 0.5) * 30
      });
    };
    
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const rect = scrollContainerRef.current.getBoundingClientRect();
        const height = rect.height;
        const top = rect.top;
        const windowHeight = window.innerHeight;
        
        let progress = (windowHeight - top) / (windowHeight + height);
        progress = Math.max(0, Math.min(1, progress));
        setScrollProgress(progress);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Layout>
      {/* 1. Kinetic Hero Section - Liquid Metal Aesthetic */}
      <div ref={heroRef} className="relative bg-stone-100 overflow-hidden min-h-[95vh] flex items-center justify-center">
        
        {/* Organic Blobs / Gooey Effect Container */}
        <div className="absolute inset-0 goo-filter">
             <div className="absolute top-[-10%] left-[-10%] w-[900px] h-[900px] bg-custemo-sage/30 rounded-full animate-blob mix-blend-multiply"></div>
             <div className="absolute top-[30%] right-[-10%] w-[700px] h-[700px] bg-purple-200/30 rounded-full animate-blob animation-delay-2000 mix-blend-multiply"></div>
             <div className="absolute bottom-[0%] left-[40%] w-[500px] h-[500px] bg-pink-200/30 rounded-full animate-blob mix-blend-multiply filter blur-3xl"></div>
        </div>
        
        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-40 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Molten Chrome Undulation Typography */}
            <div className="relative inline-block perspective-[1000px]">
                <h1 
                    className="text-8xl md:text-[10rem] font-black font-sans mb-4 leading-[0.85] tracking-tighter text-liquid transition-transform duration-100 ease-out"
                    style={{ 
                        transform: `translate(${mousePos.x}px, ${mousePos.y}px) rotateX(${mousePos.y * -0.1}deg) rotateY(${mousePos.x * 0.1}deg)`,
                    }}
                >
                  FUTURE
                  <br />
                  <span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(28, 28, 28, 0.5)' }}>FASHION</span>
                </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-stone-600 mb-12 max-w-2xl mx-auto font-serif italic animate-fade-in stagger-delay-2 mix-blend-darken">
              "Hyper-realistic textures. Zero-waste production. The interface between your imagination and the loom."
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up stagger-delay-3 relative z-20">
              <Magnetic strength={0.4}>
                <Link 
                  to="/studio" 
                  className="group px-12 py-6 bg-custemo-dark text-white rounded-full font-medium hover:bg-black transition-all shadow-2xl hover:shadow-custemo-gold/20 flex items-center justify-center gap-3 relative overflow-hidden iridescent-hover"
                >
                  <span className="relative z-10">Enter Studio</span>
                  <IconWand className="relative z-10 w-5 h-5 text-custemo-gold group-hover:rotate-12 transition-transform" />
                </Link>
              </Magnetic>
            </div>
        </div>
      </div>

      {/* 2. Fluid Scrolling Marquee & Waving Typography */}
      <div className="bg-custemo-dark text-white py-12 overflow-hidden border-y border-stone-700 relative z-20">
        <div className="animate-marquee whitespace-nowrap flex gap-32 text-7xl font-black uppercase tracking-widest opacity-90 cursor-default">
            {['Gaussian', 'Generative', 'Physical', 'Liquid'].map((text, i) => (
                <div key={i} className="flex items-center gap-8 group hover:scale-110 transition-transform duration-500 ease-fluid">
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-stone-400 to-white hover:text-white transition-colors">
                        {text}
                     </span>
                     <span className="text-custemo-green text-4xl group-hover:animate-spin">✦</span>
                </div>
            ))}
             {/* Duplicate for seamless loop */}
             {['Gaussian', 'Generative', 'Physical', 'Liquid'].map((text, i) => (
                <div key={i} className="flex items-center gap-8 group hover:scale-110 transition-transform duration-500 ease-fluid">
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-stone-400 to-white hover:text-white transition-colors">
                        {text}
                     </span>
                     <span className="text-custemo-green text-4xl group-hover:animate-spin">✦</span>
                </div>
            ))}
        </div>
      </div>

      {/* 3. Fluid Bento Grid Collection */}
      <div className="py-24 bg-stone-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12 animate-fade-in">
                 <div>
                    <h2 className="text-4xl font-serif font-bold text-custemo-dark">Volumetric Collection</h2>
                    <p className="text-stone-500 mt-2">Digital-first garments simulated at 8K resolution.</p>
                 </div>
                 <Link to="/studio" className="text-custemo-green font-medium hover:underline decoration-2 underline-offset-4">View All &rarr;</Link>
            </div>

            {/* Fluid Grid Layout: Using Flexbox for expansion physics */}
            <div className="flex flex-col md:flex-row h-[1200px] md:h-[600px] gap-4">
                
                {/* Item 1: The Oxford - Default Large */}
                <div 
                    onClick={() => setExpandedBento(expandedBento === 'oxford' ? null : 'oxford')}
                    className={`relative rounded-[2rem] overflow-hidden cursor-pointer shadow-xl transition-all duration-700 ease-spring group ${expandedBento === 'oxford' ? 'md:flex-[3]' : expandedBento ? 'md:flex-[0.5]' : 'md:flex-[1.5]'}`}
                >
                    <img src="https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Feature" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                    <div className="absolute bottom-8 left-8 text-white z-10 transition-opacity duration-300">
                         {(!expandedBento || expandedBento === 'oxford') && (
                            <>
                                <span className="glass px-3 py-1 rounded-full text-xs font-bold uppercase border border-white/20 mb-3 inline-block backdrop-blur-md">Gaussian Render</span>
                                <h3 className="text-4xl font-serif font-bold mb-2">The Oxford</h3>
                                <p className="text-stone-300 text-sm max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">
                                    Simulated Surat cotton with physically accurate drape.
                                </p>
                            </>
                         )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-[1] gap-4">
                    {/* Item 2: Silk Bombers */}
                    <div 
                        onClick={() => setExpandedBento(expandedBento === 'silk' ? null : 'silk')}
                        className={`relative rounded-[2rem] overflow-hidden cursor-pointer shadow-lg transition-all duration-700 ease-spring group flex-grow ${expandedBento === 'silk' ? 'flex-[3]' : 'flex-[1]'}`}
                    >
                        <img src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" alt="Item" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        <div className="absolute bottom-4 left-4 text-white">
                             {(!expandedBento || expandedBento === 'silk') && <h3 className="text-lg font-bold">Silk Bombers</h3>}
                        </div>
                    </div>

                    {/* Item 3: AI Feature Box - Iridescent */}
                    <Magnetic strength={0.1}>
                        <div className="relative bg-stone-900 rounded-[2rem] p-6 flex flex-col justify-between overflow-hidden group cursor-pointer border border-stone-800 h-full iridescent-hover">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] animate-pulse"></div>
                            
                            <div className="relative z-10 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                <IconSparkles className="w-6 h-6 text-custemo-gold animate-spin" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-white">GenUI Stylist</h3>
                                <p className="text-xs text-stone-400 mt-2 font-medium">Talk to Styla.</p>
                            </div>
                        </div>
                    </Magnetic>
                </div>
            </div>
        </div>
      </div>

      {/* 4. Scrollytelling - The Thread of Life */}
      <div ref={scrollContainerRef} className="bg-[#0f0f0f] text-white py-32 relative overflow-hidden">
        {/* Animated Background Thread */}
        <svg className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-full z-0 opacity-20 pointer-events-none" preserveAspectRatio="none">
             <path d="M 50% 0 Q 60% 25% 40% 50% T 50% 100%" fill="none" stroke="#d4af37" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeDasharray="10 20" className="animate-pulse" />
        </svg>

        <div className="max-w-4xl mx-auto px-4 relative z-20">
            <div className="text-center mb-24 opacity-100 transition-opacity duration-500" style={{ opacity: Math.min(1, scrollProgress * 2), transform: `scale(${0.8 + scrollProgress * 0.2})` }}>
                <span className="text-custemo-gold font-bold tracking-[0.3em] uppercase text-xs">Radical Transparency</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold mt-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-600">From Soil to Studio</h2>
            </div>

            <div className="space-y-32">
                {/* Step 1 - Scrollytelling Deconstruction */}
                <div className={`flex flex-col md:flex-row items-center gap-12 transition-all duration-1000 ease-fluid ${scrollProgress > 0.2 ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-20 blur-lg'}`}>
                    <div className="w-full md:w-1/2 text-right pr-8 hidden md:block">
                        <h3 className="text-3xl font-bold font-serif">Regenerative Origins</h3>
                        <p className="text-stone-400 mt-4 leading-relaxed">Our Surat cotton is grown in soil enriched by 3D-mapped cover crops, capturing carbon before the seed is even sown.</p>
                    </div>
                    <div className="w-full md:w-1/2 group perspective-[1000px]">
                         <div className="bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md transform transition-transform duration-700 group-hover:rotate-y-12 group-hover:rotate-x-6">
                            <img src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=600" className="rounded-xl w-full h-64 object-cover opacity-80 hover:opacity-100 transition-opacity duration-700" alt="Cotton" />
                         </div>
                    </div>
                </div>

                {/* Step 2 */}
                <div className={`flex flex-col md:flex-row items-center gap-12 transition-all duration-1000 ease-fluid ${scrollProgress > 0.5 ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-20 blur-lg'}`}>
                     <div className="w-full md:w-1/2 md:order-2 text-left pl-8 hidden md:block">
                        <h3 className="text-3xl font-bold font-serif">Just-in-Time Creation</h3>
                        <p className="text-stone-400 mt-4 leading-relaxed">The garment exists only as data until you click 'Buy'. Lasers cut the fabric in real-time, eliminating 90% of textile waste.</p>
                    </div>
                    <div className="w-full md:w-1/2 md:order-0 text-right">
                         <div className="bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md hover:scale-105 transition-transform duration-500">
                             <div className="w-full h-64 rounded-xl overflow-hidden relative group">
                                 <img src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500 scale-105" alt="Sewing Workshop" />
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default Landing;
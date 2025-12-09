import React, { useState, useRef, useEffect } from 'react';
import { CustomizationState, GarmentType } from '../types';
import { generateGarmentPreview } from '../services/geminiService';
import { IconWand, IconLoader, IconSparkles } from './Icons';

interface Props {
  state: CustomizationState;
}

const GarmentPreview: React.FC<Props> = ({ state }) => {
  const { color, type, sleeveLength, neckline } = state;
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentRequestRef = useRef(0);

  // Reset generated image when customization changes
  useEffect(() => {
    setGeneratedImage(null);
    setError(null);
    currentRequestRef.current += 1; // Invalidate pending requests
  }, [state]);

  const handleGenerateRealistic = async () => {
    setIsGenerating(true);
    setError(null);
    const requestId = currentRequestRef.current;
    
    try {
        const img = await generateGarmentPreview(state);
        // Only update if the request is still valid (user hasn't changed state)
        if (requestId === currentRequestRef.current) {
            setGeneratedImage(img);
        }
    } catch (error) {
        console.error("Failed to generate preview", error);
        if (requestId === currentRequestRef.current) {
            setError("Could not generate realistic preview. Please try again.");
        }
    } finally {
        if (requestId === currentRequestRef.current) {
            setIsGenerating(false);
        }
    }
  };

  // Simplified SVG path generators based on state
  const getShirtPath = () => {
    const isLongSleeve = sleeveLength === 'long';
    // Basic Shirt Shape
    let sleeves = isLongSleeve 
      ? "M60 80 L30 180 L50 190 L75 100" // Left Long
      : "M60 80 L40 130 L60 140 L75 100"; // Left Short
    
    sleeves += isLongSleeve
      ? " M140 80 L170 180 L150 190 L125 100" // Right Long
      : " M140 80 L160 130 L140 140 L125 100"; // Right Short

    const body = "M75 100 L75 250 L125 250 L125 100"; // Torso
    
    let neck = "";
    if (neckline === 'V-Neck') {
      neck = "M75 20 L100 60 L125 20";
    } else if (neckline === 'Boat Neck') {
       neck = "M60 20 Q100 40 140 20";
    } else {
      // Crew
      neck = "M75 20 Q100 50 125 20";
    }
    
    // Shoulder lines
    const shoulders = "M75 20 L60 80 M125 20 L140 80";

    return (
      <g stroke="none" fill={color}>
         <path d={`${shoulders} ${sleeves} ${body}`} stroke="none" />
         <path d={neck} stroke="none" fill="white" fillOpacity="0.0" /> 
         {/* We construct a full path for fill */}
         <path d={`M75 20 L60 80 ${isLongSleeve ? "L30 180 L50 190 L75 100" : "L40 130 L60 140 L75 100"} L75 250 L125 250 L125 100 ${isLongSleeve ? "L150 190 L170 180 L140 80" : "L140 140 L160 130 L140 80"} L125 20 Q100 ${neckline === 'V-Neck' ? '60' : neckline === 'Crew Neck' ? '50' : '40'} 75 20 Z`} />
      </g>
    );
  };

  const getDressPath = () => {
      // Simple Dress Shape
      return (
        <path 
          d={`M80 20 L60 70 L40 180 L160 180 L140 70 L120 20 Q100 50 80 20 Z`} 
          fill={color}
        />
      );
  };

  const getPantsPath = () => {
      // Simple Pants Shape
      return (
          <g fill={color}>
            <path d="M70 20 L60 280 L90 280 L95 100 L105 100 L110 280 L140 280 L130 20 Z" />
          </g>
      );
  };

  const renderSVG = () => (
    <>
      <svg viewBox="0 0 200 300" className="w-64 h-96 drop-shadow-xl transition-all duration-500 ease-in-out">
        <defs>
            <filter id="fabricTexture">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.1 0"/>
                <feComposite operator="in" in2="SourceGraphic" result="monoNoise"/>
                <feBlend in="SourceGraphic" in2="monoNoise" mode="multiply" />
            </filter>
        </defs>
        <g filter="url(#fabricTexture)">
            {type === GarmentType.SHIRT && getShirtPath()}
            {type === GarmentType.DRESS && getDressPath()}
            {type === GarmentType.PANTS && getPantsPath()}
        </g>
        
        {/* Pockets Overlay */}
        {state.hasPockets && type !== GarmentType.DRESS && (
            <g fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth="1">
                <rect x="80" y="120" width="15" height="15" rx="2" />
            </g>
        )}
      </svg>
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur p-2 rounded text-xs text-stone-500 shadow-sm">
          <p className="font-bold text-stone-800">{state.type}</p>
          <p>{state.fabric}</p>
          <p>{state.fit}</p>
      </div>
    </>
  );

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-stone-100 rounded-lg overflow-hidden shadow-inner group">
      {/* Background Grid */}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10 pointer-events-none z-0">
         {Array.from({length: 36}).map((_, i) => (
             <div key={i} className="border border-stone-300"></div>
         ))}
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {generatedImage ? (
            <img 
                src={generatedImage} 
                alt="AI Generated Garment" 
                className="w-full h-full object-cover animate-fadeIn"
            />
        ) : (
            renderSVG()
        )}
      </div>
      
      {/* Error State */}
      {error && !isGenerating && !generatedImage && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm px-6 text-center">
              <div className="bg-white p-4 rounded-lg shadow-lg border border-red-100">
                  <p className="text-red-500 text-sm font-medium mb-2">{error}</p>
                  <button 
                    onClick={handleGenerateRealistic}
                    className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 transition-colors"
                  >
                      Try Again
                  </button>
              </div>
          </div>
      )}

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center text-custemo-green">
            <IconLoader className="w-8 h-8 animate-spin mb-2" />
            <span className="text-sm font-medium tracking-wide animate-pulse">Creating realistic preview...</span>
        </div>
      )}

      {/* Generate Button - Visible when not generating */}
      {!isGenerating && !generatedImage && !error && (
         <button 
            onClick={handleGenerateRealistic}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-custemo-dark/90 text-white px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-medium shadow-lg hover:bg-black hover:scale-105 transition-all group-hover:opacity-100"
         >
            <IconWand className="w-4 h-4 text-custemo-gold" />
            <span>View Realistic Model</span>
         </button>
      )}
      
      {/* Regenerate Button - Visible when image exists */}
      {!isGenerating && generatedImage && (
         <button 
            onClick={() => setGeneratedImage(null)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-white/90 text-stone-800 px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-medium shadow-lg hover:bg-white hover:scale-105 transition-all"
         >
            <span>Edit Design</span>
         </button>
      )}

      {/* Sustainability Badge - Hide if image covers it, or overlay on top */}
      {!generatedImage && !error && (
        <div className="absolute top-6 right-6 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-green-100 flex items-center gap-2 text-xs font-medium text-green-800 shadow-sm">
            <IconSparkles className="w-3 h-3" />
            <span>Eco-Impact: -40% Water</span>
        </div>
      )}
    </div>
  );
};

export default GarmentPreview;
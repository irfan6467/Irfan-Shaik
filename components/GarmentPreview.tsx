import React, { useState, useRef, useEffect } from 'react';
import { CustomizationState, PatternType, GraphicType, NecklineType, FabricType, FitType } from '../types';
import { generateGarmentPreview } from '../services/geminiService';
import { IconWand, IconLoader, IconSparkles } from './Icons';

interface Props {
  state: CustomizationState;
}

const TEXTURE_WATER = "https://images.unsplash.com/photo-1555412654-72a95a495859?auto=format&fit=crop&w=500&q=80";
const TEXTURE_FLORAL = "https://images.unsplash.com/photo-1548366086-7f1b76106622?auto=format&fit=crop&w=500&q=80";
const TEXTURE_STARS = "https://images.unsplash.com/photo-1533575770077-052fa2c609fc?auto=format&fit=crop&w=500&q=80";

// Base64 Textures for Vectors
const TEXTURE_STRIPES = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCc+CiAgPHJlY3Qgd2lkdGg9JzQwJyBoZWlnaHQ9JzQwJyBmaWxsPSd0cmFuc3BhcmVudCcvPgogIDxwYXRoIGQ9J00wLDQwIEw0MCwwIE0yMCw0MCBMNDAsMjAgTTAuMjAgTDIwLDAnIHN0cm9rZT0nYmxhY2snIHN0cm9rZS13aWR0aD0nMicgb3BhY2l0eT0nMC4yJy8+Cjwvc3ZnPg==";
const TEXTURE_DOTS = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyMCcgaGVpZ2h0PScyMCc+CiAgPGNpcmNsZSBjeD0nMTAnIGN5PScxMCcgcj0nMicgZmlsbD0nYmxhY2snIG9wYWNpdHk9JzAuMicvPgo8L3N2Zz4=";
const TEXTURE_CHECKERED = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCc+CiAgPHJlY3QgeD0nMCcgeT0nMCcgd2lkdGg9JzIwJyBoZWlnaHQ9JzIwJyBmaWxsPSdibGFjaycgb3BhY2l0eT0nMC4xJy8+CiAgPHJlY3QgeD0nMjAnIHk9JzIwJyB3aWR0aD0nMjAnIGhlaWdodD0nMjAnIGZpbGw9J2JsYWNrJyBvcGFjaXR5PScwLjEnLz4KPC9zdmc+";

const GarmentPreview: React.FC<Props> = ({ state }) => {
  const { color, pattern, graphic, textureOpacity = 0.8, textureScale = 1, neckline, fabric, fit } = state;
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 3DGS Simulation State
  const [viewMode, setViewMode] = useState<'splat' | 'sketch'>('splat');
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRequestRef = useRef(0);

  useEffect(() => {
    setGeneratedImage(null);
    setError(null);
    currentRequestRef.current += 1;
  }, [state]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height
        });
    }
  };

  const handleGenerateRealistic = async () => {
    setIsGenerating(true);
    setError(null);
    const requestId = currentRequestRef.current;
    
    try {
        const img = await generateGarmentPreview(state);
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

  // --- Topology Generators ---
  const BODY_BASE_PATH = "L 240 60 L 200 120 L 200 380 Q 150 390 100 380 L 100 120 L 60 60 Z";

  const getBodyNeckPath = (type: NecklineType) => {
      switch (type) {
          case NecklineType.V_NECK: return "M 105 20 L 150 75 L 195 20";
          case NecklineType.CREW: return "M 105 20 C 105 50 195 50 195 20";
          case NecklineType.BOAT: return "M 80 25 Q 150 35 220 25";
          case NecklineType.COWL: return "M 100 20 Q 150 60 200 20";
          case NecklineType.MOCK: return "M 115 10 L 185 10";
          case NecklineType.COLLAR:
          default: return "M 110 20 Q 150 35 190 20";
      }
  };

  const currentBodyPath = `${getBodyNeckPath(neckline)} ${BODY_BASE_PATH}`;

  const PATHS = {
      SLEEVE_R: `M 240 60 L 230 200 L 200 210 L 200 120 Z`,
      SLEEVE_L: `M 60 60 L 70 200 L 100 210 L 100 120 Z`,
      PLACKET: `M 138 45 L 162 45 L 162 385 L 138 385 Z`,
      COLLAR_SPREAD: `M 110 20 L 60 60 L 85 75 Q 150 90 215 75 L 240 60 L 190 20 Q 150 45 110 20 Z`
  };

  const getTextureUrl = () => {
      switch(pattern) {
          case PatternType.WATER: return TEXTURE_WATER;
          case PatternType.VINTAGE_FLORAL: return TEXTURE_FLORAL;
          case PatternType.STARS: return TEXTURE_STARS;
          case PatternType.STRIPES: return TEXTURE_STRIPES;
          case PatternType.DOTS: return TEXTURE_DOTS;
          case PatternType.CHECKERED: return TEXTURE_CHECKERED;
          case PatternType.FLORAL: return TEXTURE_FLORAL;
          case PatternType.ABSTRACT: return TEXTURE_WATER;
          default: return null;
      }
  };

  interface RenderPartConfig {
      rotationDeg?: number;
      zIndex?: number;
      shadowIntensity?: number;
      textureOffset?: { x: number; y: number };
      dropShadow?: boolean;
      stitching?: boolean;
  }

  const renderPart = (pathData: string, config: RenderPartConfig = {}) => {
      const { 
          rotationDeg = 0, 
          zIndex = 10, 
          shadowIntensity = 0.1, 
          textureOffset = { x: 0, y: 0 },
          dropShadow = false,
          stitching = false
      } = config;
      
      const textureUrl = getTextureUrl();
      const hasPattern = pattern !== PatternType.NONE;

      // Anisotropic Sheen Logic: Move gradient based on mouse
      const lightX = mousePos.x * 100;
      const lightY = mousePos.y * 100;

      return (
          <div 
            className={`absolute inset-0 w-full h-full pointer-events-none z-${zIndex}`}
            style={{ 
                clipPath: `path('${pathData}')`,
                filter: dropShadow ? 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))' : 'none'
            }}
          >
             {/* Base Color Layer */}
              {color !== '#ffffff' && (
                  <div 
                    className="absolute inset-0 w-full h-full mix-blend-multiply transition-colors duration-300"
                    style={{ backgroundColor: color, opacity: hasPattern ? 0.6 : 0.85 }} 
                  />
              )}

              {/* Fuzzy Volume Layer (Noise + Micro Blur) */}
              <div className="absolute inset-0 w-full h-full opacity-60 mix-blend-overlay" style={{ filter: 'url(#fabric-micro)' }}></div>

              {/* Anisotropic Sheen (View-Dependent Shading) */}
              {fabric === FabricType.SILK || fabric === FabricType.RECYCLED_POLY ? (
                  // Shiny: Sharp highlights
                  <div 
                    className="absolute inset-0 w-full h-full mix-blend-soft-light transition-all duration-75"
                    style={{ 
                        background: `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255,255,255,0.8) 0%, transparent 40%)`,
                        opacity: 0.9
                    }} 
                  />
              ) : (
                  // Matte: Diffuse scattering
                  <div 
                    className="absolute inset-0 w-full h-full mix-blend-soft-light transition-all duration-75"
                    style={{ 
                         background: `linear-gradient(${lightX * 3.6}deg, rgba(255,255,255,0.2) 0%, transparent 100%)`,
                         opacity: 0.4
                    }} 
                  />
              )}

              {/* Anisotropic Shimmer (Simulates Iridescence/Nap) */}
              <div 
                className="absolute inset-0 w-full h-full opacity-30 pointer-events-none anisotropic-shimmer transition-all duration-75"
                style={{ backgroundPosition: `${lightX}% ${lightY}%` }}
              ></div>

              {/* Volume Gradient */}
              <div 
                className="absolute inset-0 w-full h-full mix-blend-multiply pointer-events-none"
                style={{
                    background: `linear-gradient(90deg, 
                        rgba(0,0,0,${shadowIntensity}) 0%, 
                        rgba(0,0,0,0) 25%, 
                        rgba(0,0,0,0) 75%, 
                        rgba(0,0,0,${shadowIntensity}) 100%)`
                }}
              />

              {/* Texture Layer */}
              {textureUrl && (
                  <div className="absolute inset-[-50%] w-[200%] h-[200%] flex items-center justify-center">
                    <div 
                        className="w-full h-full transition-opacity duration-300 mix-blend-multiply"
                        style={{ 
                            backgroundImage: `url(${textureUrl})`,
                            backgroundSize: `${200 * textureScale}px`,
                            backgroundRepeat: 'repeat',
                            backgroundPosition: `${textureOffset.x}px ${textureOffset.y}px`,
                            opacity: textureOpacity,
                            transform: `rotate(${rotationDeg}deg)`,
                        }}
                    />
                  </div>
              )}
              
              {/* Stitching */}
              {stitching && (
                 <svg className="absolute inset-0 w-full h-full pointer-events-none">
                     <path 
                        d={pathData} 
                        fill="none" 
                        stroke="rgba(255,255,255,0.4)" 
                        strokeWidth="1.5" 
                        strokeDasharray="4 3" 
                        className="mix-blend-overlay"
                        style={{ transform: 'scale(0.98)', transformOrigin: 'center' }}
                     />
                 </svg>
              )}
          </div>
      );
  };

  const renderRealMockup = () => {
    const showPlacket = neckline === NecklineType.COLLAR;

    return (
      <div className="relative w-full h-full flex items-center justify-center p-4 perspective-[1000px]">
          {/* Fabric Relaxation Animation: animate-fabric-settle */}
          <div 
            className="relative w-[300px] h-[400px] transition-transform duration-200 ease-out preserve-3d animate-fabric-settle"
            style={{ 
                transform: `rotateY(${(mousePos.x - 0.5) * 10}deg) rotateX(${(mousePos.y - 0.5) * -10}deg)` 
            }}
          >
              {/* Drop Shadow */}
              <div className="absolute top-[90%] left-[10%] w-[80%] h-[20px] bg-black/20 blur-xl rounded-full transform translate-y-4 scale-x-110"></div>

              {/* Body */}
              {renderPart(currentBodyPath, { zIndex: 10, shadowIntensity: 0.15 })}
              
              {/* Sleeves */}
              {renderPart(PATHS.SLEEVE_L, { rotationDeg: 10, zIndex: 10, shadowIntensity: 0.3 })}
              {renderPart(PATHS.SLEEVE_R, { rotationDeg: -10, zIndex: 10, shadowIntensity: 0.3 })}

              {/* Placket */}
              {showPlacket && renderPart(PATHS.PLACKET, { 
                  zIndex: 20, 
                  shadowIntensity: 0.05, 
                  dropShadow: true,
                  stitching: true,
                  textureOffset: { x: 50, y: 100 }
              })}

              {/* Collar */}
               {neckline === NecklineType.COLLAR && renderPart(PATHS.COLLAR_SPREAD, { 
                    rotationDeg: 90, 
                    zIndex: 30, 
                    shadowIntensity: 0.1, 
                    dropShadow: true, 
                    stitching: true,
                    textureOffset: { x: 20, y: 20 }
                })}
              
              {/* Simple Neckline SVG render for other types (simplified for brevity) */}
              {neckline !== NecklineType.COLLAR && (
                 <div className="absolute inset-0 z-30 pointer-events-none">
                     <svg className="w-full h-full">
                         {neckline === NecklineType.V_NECK && <path d="M 105 20 L 150 75 L 195 20" fill="none" stroke={color} strokeWidth="8" className="mix-blend-multiply opacity-90" />}
                         {neckline === NecklineType.CREW && <path d="M 105 20 C 105 50 195 50 195 20" fill="none" stroke={color} strokeWidth="8" className="mix-blend-multiply opacity-90" />}
                     </svg>
                 </div>
              )}


              {/* Seam/Fold Definition (Enhanced Realism) */}
              <div className="absolute inset-0 z-20 pointer-events-none">
                 <svg className="w-full h-full">
                     <defs>
                        <filter id="blur-sm"><feGaussianBlur in="SourceGraphic" stdDeviation="2" /></filter>
                     </defs>
                     <g className="mix-blend-multiply opacity-40">
                         <path d={fit === FitType.OVERSIZED ? "M 200 130 Q 220 160 210 190" : "M 200 120 Q 210 140 205 160"} fill="none" stroke="#2a2a2a" strokeWidth="4" filter="url(#blur-sm)" />
                         <path d={fit === FitType.OVERSIZED ? "M 100 130 Q 80 160 90 190" : "M 100 120 Q 90 140 95 160"} fill="none" stroke="#2a2a2a" strokeWidth="4" filter="url(#blur-sm)" />
                     </g>
                 </svg>
              </div>

              {/* Graphic Layer */}
              {graphic !== GraphicType.NONE && (
                  <div 
                    className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none mix-blend-multiply opacity-90"
                    style={{ transform: 'translateY(-5%)' }}
                  >
                      {graphic === GraphicType.VINTAGE_LOGO && (
                          <div className="border-4 border-stone-800 p-4 rounded-full w-28 h-28 flex items-center justify-center bg-white/10 backdrop-blur-sm shadow-sm rotate-[-2deg]">
                              <span className="font-serif font-bold text-lg text-stone-800 text-center">EST.<br/>1990</span>
                          </div>
                      )}
                      {graphic === GraphicType.MINIMAL_TEXT && (
                          <span className="font-sans font-black text-2xl tracking-widest text-stone-800 uppercase drop-shadow-md rotate-[-2deg]">Sustainable</span>
                      )}
                      {graphic === GraphicType.ECO_BADGE && (
                          <div className="bg-custemo-green/80 border-2 border-custemo-green rounded-full p-4 w-24 h-24 flex items-center justify-center text-center shadow-lg">
                              <span className="text-[10px] font-bold text-white uppercase">100% Eco Friendly</span>
                          </div>
                      )}
                      {graphic === GraphicType.CUSTOM && state.customGraphicUrl && (
                          <img src={state.customGraphicUrl} alt="Custom Design" className="w-32 h-32 object-contain drop-shadow-md" />
                      )}
                  </div>
              )}
          </div>
      </div>
    );
  };

  const renderSketch = () => (
      <svg viewBox="0 0 300 400" className="w-full h-full drop-shadow-xl transition-all duration-500 ease-in-out bg-white p-4">
        <g stroke="black" strokeWidth="1.5" fill="transparent">
            <path d={currentBodyPath} />
            <path d={PATHS.SLEEVE_L} />
            <path d={PATHS.SLEEVE_R} />
        </g>
        <path d={currentBodyPath} fill="none" stroke="black" strokeWidth="0.5" strokeDasharray="4 4" className="opacity-50" />
      </svg>
  );

  return (
    <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 rounded-3xl overflow-hidden shadow-2xl group"
    >
      {/* HUD Controls - Glassmorphism 2.0 */}
      <div className="absolute top-4 left-4 z-40 bg-white/20 backdrop-blur-xl rounded-full p-1.5 flex shadow-[0_8px_32px_rgba(31,38,135,0.15)] border border-white/40 ring-1 ring-white/50">
          <button 
            onClick={() => setViewMode('splat')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-500 flex items-center gap-2 ${viewMode === 'splat' ? 'bg-black text-white shadow-lg scale-105' : 'text-stone-600 hover:text-black hover:bg-white/30'}`}
          >
              <IconSparkles className="w-3 h-3" />
              3D Simulation
          </button>
          <button 
            onClick={() => setViewMode('sketch')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-500 ${viewMode === 'sketch' ? 'bg-black text-white shadow-lg scale-105' : 'text-stone-600 hover:text-black hover:bg-white/30'}`}
          >
              Pattern Blueprint
          </button>
      </div>

      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {generatedImage ? (
            <img 
                src={generatedImage} 
                alt="AI Generated Garment" 
                className="w-full h-full object-cover animate-fade-in"
            />
        ) : (
            viewMode === 'splat' ? renderRealMockup() : renderSketch()
        )}
      </div>
      
      {/* Interactive Tooltip Simulation */}
      {!generatedImage && viewMode === 'splat' && (
          <div 
            className="absolute pointer-events-none z-50 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm"
            style={{ 
                left: `${mousePos.x * 100}%`, 
                top: `${mousePos.y * 100}%`,
                transform: 'translate(-50%, -150%)'
            }}
          >
              Light: {(mousePos.x * 100).toFixed(0)}%
          </div>
      )}

      {/* Button controls - Liquid/Iridescent */}
      {!isGenerating && !generatedImage && !error && (
         <button 
            onClick={handleGenerateRealistic}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-black/80 backdrop-blur-xl text-white px-8 py-3 rounded-full flex items-center gap-2 text-sm font-medium shadow-2xl hover:bg-black hover:scale-105 transition-all border border-white/20 iridescent-hover overflow-hidden group"
         >
            <span className="relative z-10 flex items-center gap-2">
                <IconWand className="w-4 h-4 text-custemo-gold group-hover:animate-pulse" />
                <span>Generate 3D Render</span>
            </span>
         </button>
      )}
       {!isGenerating && generatedImage && (
         <button 
            onClick={() => setGeneratedImage(null)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-xl text-stone-800 px-6 py-3 rounded-full flex items-center gap-2 text-sm font-medium shadow-lg hover:bg-white hover:scale-105 transition-all"
         >
            <span>Back to Editor</span>
         </button>
      )}
    </div>
  );
};

export default GarmentPreview;
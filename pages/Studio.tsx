import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import GarmentPreview from '../components/GarmentPreview';
import ChatInterface from '../components/ChatInterface';
import { GarmentType, FabricType, FitType, NecklineType, PatternType, GraphicType, CustomizationState, AspectRatio, PrintMethod, HardwareType, Gender } from '../types';
import { IconCheck, IconSparkles, IconPhoto, IconWand, IconMovie, IconLoader, IconLeaf, IconPaperclip, IconLock } from '../components/Icons';
import { generateProImage, editGarmentImage, generateFashionVideo } from '../services/geminiService';
import { mockDB } from '../services/mockBackend';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Studio: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<CustomizationState>({
    gender: Gender.WOMEN,
    type: GarmentType.SHIRT,
    color: '#ffffff',
    fabric: FabricType.COTTON,
    fit: FitType.REGULAR,
    neckline: NecklineType.CREW,
    hasPockets: false,
    sleeveLength: 'short',
    pattern: PatternType.NONE,
    graphic: GraphicType.NONE,
    printMethod: PrintMethod.SCREEN,
    hardware: HardwareType.STANDARD,
    textureOpacity: 0.8,
    textureScale: 1.0
  });

  const [activeTab, setActiveTab] = useState<'style' | 'design' | 'fabric' | 'details' | 'campaign'>('style');
  const [isSaving, setIsSaving] = useState(false);

  // Campaign Mode States
  const [campaignPrompt, setCampaignPrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('4K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [generatedProImage, setGeneratedProImage] = useState<string | null>(null);
  const [isProGenerating, setIsProGenerating] = useState(false);
  
  const [editInstruction, setEditInstruction] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);

  useEffect(() => {
    setCampaignPrompt(`Dramatic studio lighting, cinematic editorial shot.`);
  }, [state]);

  const handleProGenerate = async () => {
    if (isProGenerating) return;
    setIsProGenerating(true);
    setGeneratedProImage(null);
    setVideoUrl(null); 
    try {
        const img = await generateProImage(state, campaignPrompt, imageSize, aspectRatio);
        setGeneratedProImage(img);
    } catch (e) {
        console.error(e);
        alert("Failed to generate pro image. Please try again.");
    } finally {
        setIsProGenerating(false);
    }
  };

  const handleEditImage = async () => {
    if (!generatedProImage || !editInstruction) return;
    setIsEditing(true);
    try {
        const newImg = await editGarmentImage(generatedProImage, editInstruction);
        setGeneratedProImage(newImg);
        setEditInstruction('');
    } catch (e) {
        console.error(e);
        alert("Failed to edit image.");
    } finally {
        setIsEditing(false);
    }
  };

  const handleVideoGenerate = async () => {
    if (!generatedProImage) return;
    setIsVideoGenerating(true);
    try {
        const vid = await generateFashionVideo(generatedProImage, `Cinematic fashion film showing the ${state.type} in motion, fabric flowing.`);
        setVideoUrl(vid);
    } catch (e) {
        console.error(e);
        alert("Failed to generate video. Ensure you have a paid API key selected.");
    } finally {
        setIsVideoGenerating(false);
    }
  };

  const handleCustomGraphicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const url = event.target!.result as string;
                setState(prev => ({
                    ...prev,
                    graphic: GraphicType.CUSTOM,
                    customGraphicUrl: url
                }));
                // Implicitly upload to "assets" in a real DB here, currently handled by state
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSaveDesign = async () => {
      if (!user) {
          navigate('/login');
          return;
      }
      setIsSaving(true);
      try {
          const name = `${state.gender} ${state.type} - ${new Date().toLocaleDateString()}`;
          // In a real app, we'd capture the canvas or GL preview as a blob here.
          // For now, we simulate a preview image or use the uploaded graphic
          const preview = state.customGraphicUrl || undefined;
          await mockDB.saveDesign(user.id, state, name, preview);
          alert("Design saved to your wardrobe!");
      } catch(e) {
          console.error(e);
          alert("Failed to save.");
      } finally {
          setIsSaving(false);
      }
  };

  const colors = [
    { name: 'White', value: '#ffffff', class: 'bg-white border-gray-200' },
    { name: 'Black', value: '#1a1a1a', class: 'bg-gray-900' },
    { name: 'Navy', value: '#1e3a8a', class: 'bg-blue-900' },
    { name: 'Olive', value: '#3f4d28', class: 'bg-[rgb(63,77,40)]' },
    { name: 'Clay', value: '#9c6644', class: 'bg-[rgb(156,102,68)]' },
    { name: 'Sage', value: '#a3b18a', class: 'bg-[rgb(163,177,138)]' },
    { name: 'Red', value: '#9b2226', class: 'bg-red-800' },
    { name: 'Mustard', value: '#e9c46a', class: 'bg-yellow-500' },
  ];

  const aspectRatios: AspectRatio[] = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];

  const handleAddToBag = () => {
    navigate('/checkout');
  };

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-stone-100 overflow-hidden">
        
        {/* Spatial Layering: Ambient Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
             <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-custemo-sage/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-200/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob animation-delay-2000"></div>
             {/* Grain Texture */}
             <div className="absolute inset-0 opacity-40 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
        </div>

        {/* Left Panel: Glass Controls - Dynamic Glass */}
        <div className="w-full lg:w-1/3 border-r border-white/20 lg:h-[calc(100vh-64px)] flex flex-col z-20 shadow-2xl lg:shadow-none animate-slide-in-right glass">
          <div className="p-6 overflow-y-auto flex-grow no-scrollbar">
            <h2 className="text-2xl font-serif font-bold mb-6 text-custemo-dark drop-shadow-sm">Customize Your Look</h2>
            
            <div className="flex space-x-6 border-b border-stone-200/50 mb-6 overflow-x-auto no-scrollbar mask-gradient-right">
              {['style', 'design', 'fabric', 'details', 'campaign'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-3 text-sm font-medium capitalize transition-all whitespace-nowrap duration-300 ease-spring ${
                    activeTab === tab 
                    ? 'text-custemo-green border-b-2 border-custemo-green translate-y-[1px]' 
                    : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-8 pb-12">
              {activeTab === 'style' && (
                <>
                  <div className="animate-fade-in">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Collection</label>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {Object.values(Gender).map((g) => (
                             <button
                                key={g}
                                onClick={() => setState(prev => ({ ...prev, gender: g }))}
                                className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                                    state.gender === g
                                    ? 'bg-stone-800 text-white shadow-md'
                                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                                }`}
                             >
                                {g}
                             </button>
                        ))}
                    </div>
                  </div>

                  <div className="animate-fade-in stagger-delay-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Garment Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.values(GarmentType).map(type => (
                        <button
                          key={type}
                          onClick={() => setState(prev => ({ ...prev, type }))}
                          className={`py-3 px-2 rounded-lg text-sm font-medium border transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                            state.type === type 
                            ? 'border-custemo-green bg-custemo-sage/40 text-custemo-green ring-1 ring-custemo-green shadow-sm' 
                            : 'border-stone-200/50 bg-white/50 hover:bg-white text-stone-600'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* ... Fit options ... */}
                   <div className="animate-fade-in stagger-delay-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Fit & Silhouette</label>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.values(FitType).map(fit => (
                            <button
                                key={fit}
                                onClick={() => setState(prev => ({ ...prev, fit }))}
                                className={`py-3 px-4 text-left rounded-lg text-sm border transition-all duration-300 flex justify-between items-center hover:-translate-y-1 hover:shadow-sm ${
                                    state.fit === fit
                                    ? 'border-custemo-green bg-white/80 ring-1 ring-custemo-green shadow-sm'
                                    : 'border-stone-200/50 bg-white/50 hover:bg-white'
                                }`}
                            >
                                <span className="truncate mr-2">{fit}</span>
                                {state.fit === fit && <IconCheck className="w-4 h-4 text-custemo-green flex-shrink-0 animate-fade-in" />}
                            </button>
                        ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'design' && (
                  <>
                     <div className="animate-fade-in stagger-delay-1">
                         <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Texture & Pattern</label>
                         <div className="grid grid-cols-2 gap-3">
                             {Object.values(PatternType).map(pat => (
                                 <button
                                     key={pat}
                                     onClick={() => setState(prev => ({ ...prev, pattern: pat }))}
                                     className={`py-3 px-3 text-sm rounded-lg border text-left transition-all hover:shadow-sm ${
                                         state.pattern === pat
                                         ? 'border-custemo-green bg-custemo-sage/40 text-custemo-green'
                                         : 'border-stone-200/50 bg-white/50 hover:bg-white text-stone-600'
                                     }`}
                                 >
                                     {pat}
                                 </button>
                             ))}
                         </div>
                     </div>
                     <div className="animate-fade-in stagger-delay-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Base Color</label>
                        <div className="flex flex-wrap gap-4">
                            {colors.map((c) => (
                                <button
                                    key={c.name}
                                    onClick={() => setState(prev => ({ ...prev, color: c.value }))}
                                    className={`w-10 h-10 rounded-full border-2 shadow-sm transition-transform duration-300 ease-spring hover:scale-110 active:scale-95 ${c.class} ${state.color === c.value ? 'border-custemo-dark ring-2 ring-offset-2 ring-stone-300 scale-110' : 'border-transparent'}`}
                                    title={c.name}
                                />
                            ))}
                        </div>
                     </div>
                     <div className="animate-fade-in stagger-delay-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Custom Graphic (Upload)</label>
                        <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer hover:bg-stone-50 transition-colors">
                            <div className="text-center">
                                <IconPaperclip className="mx-auto h-8 w-8 text-stone-400" />
                                <span className="mt-2 block text-sm font-medium text-stone-600">Upload Image</span>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleCustomGraphicUpload} />
                        </label>
                        {state.customGraphicUrl && (
                            <div className="mt-2 text-xs text-custemo-green flex items-center gap-1">
                                <IconCheck className="w-3 h-3" /> Image Uploaded & Stored
                            </div>
                        )}
                     </div>
                  </>
              )}

              {/* ... Other Tabs (fabric, details, campaign) unchanged ... */}
              {activeTab === 'fabric' && (
                <div className="animate-fade-in">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Premium Material</label>
                    <div className="space-y-3">
                        {Object.values(FabricType).map(fabric => (
                            <button
                                key={fabric}
                                onClick={() => setState(prev => ({ ...prev, fabric }))}
                                className={`w-full p-4 text-left rounded-xl border transition-all duration-300 group hover:shadow-lg hover:-translate-y-1 ${
                                    state.fabric === fabric
                                    ? 'border-custemo-green bg-custemo-sage/40 shadow-md'
                                    : 'border-stone-200/50 bg-white/50 hover:bg-white'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`font-medium ${state.fabric === fabric ? 'text-custemo-green' : 'text-stone-700'}`}>{fabric}</span>
                                    {state.fabric === fabric && <span className="text-xs bg-custemo-green text-white px-2 py-0.5 rounded-full animate-fade-in">Selected</span>}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
              )}

              {activeTab === 'details' && (
                  <div className="animate-fade-in space-y-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Neckline</label>
                        <select 
                            value={state.neckline}
                            onChange={(e) => setState(prev => ({...prev, neckline: e.target.value as NecklineType}))}
                            className="w-full p-3 rounded-lg border border-stone-200 focus:ring-custemo-green focus:border-custemo-green outline-none text-sm bg-white/80 text-stone-900 hover:shadow-sm transition-shadow"
                        >
                            {Object.values(NecklineType).map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                  </div>
              )}

              {activeTab === 'campaign' && (
                  <div className="space-y-6 animate-fade-in">
                     <div className="bg-purple-50/50 backdrop-blur-sm border border-purple-100 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <IconSparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                            <h3 className="font-bold text-purple-900 text-sm">AI Campaign Studio</h3>
                        </div>
                        <p className="text-xs text-purple-700">
                            Generate high-fidelity marketing assets using Gemini 3 Pro + Veo.
                        </p>
                     </div>

                     <div className="space-y-3">
                         <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">1. High-Fidelity Photoshoot</label>
                         <textarea 
                            className="w-full p-3 bg-white/80 backdrop-blur text-stone-900 placeholder-stone-400 rounded-lg border border-stone-200 text-sm h-24 focus:ring-custemo-green focus:border-custemo-green"
                            value={campaignPrompt}
                            onChange={(e) => setCampaignPrompt(e.target.value)}
                            placeholder="Describe the lighting and mood..."
                         />
                     </div>

                     <button 
                        onClick={handleProGenerate}
                        disabled={isProGenerating}
                        className="w-full bg-stone-800 text-white py-3 rounded-lg text-sm font-medium flex justify-center items-center gap-2 hover:bg-black disabled:opacity-70 mt-2 transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 iridescent-hover"
                     >
                         {isProGenerating ? <IconLoader className="animate-spin w-4 h-4" /> : <IconPhoto className="w-4 h-4" />}
                         Generate Studio Photo
                     </button>
                  </div>
              )}
            </div>
          </div>
          
          {activeTab !== 'campaign' && (
              <div className="p-6 border-t border-stone-200/50 bg-white/80 backdrop-blur-xl z-10 flex gap-4">
                   <button 
                      onClick={handleSaveDesign}
                      disabled={isSaving}
                      className="flex-1 bg-white text-stone-800 border border-stone-200 py-4 rounded-xl font-medium hover:bg-stone-50 transition-all flex justify-center items-center gap-2"
                  >
                      {isSaving ? <IconLoader className="w-4 h-4 animate-spin" /> : <IconLock className="w-4 h-4" />}
                      <span>Save</span>
                  </button>
                  <button 
                      onClick={handleAddToBag}
                      className="flex-[2] bg-custemo-dark text-white py-4 rounded-xl font-medium hover:bg-black transition-all duration-300 ease-spring hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex justify-center items-center gap-2 iridescent-hover"
                  >
                      <span>Add to Bag</span>
                      <IconCheck className="w-4 h-4" />
                  </button>
              </div>
          )}
        </div>

        {/* Middle Panel: Preview with Shimmer */}
        <div className="w-full lg:w-1/3 p-4 lg:p-8 flex items-center justify-center relative min-h-[500px] lg:h-auto z-10">
            {activeTab === 'campaign' ? (
                 <div className="w-full max-w-md flex flex-col items-center gap-4 animate-fade-in-up">
                    <div className="relative w-full shadow-2xl rounded-xl overflow-hidden bg-white/90 backdrop-blur group hover:scale-[1.01] transition-transform duration-500 border border-white/20">
                        {isProGenerating && (
                            <div className="absolute inset-0 z-50 bg-gradient-to-r from-transparent via-white/40 to-transparent w-[200%] animate-shimmer pointer-events-none"></div>
                        )}
                        {generatedProImage ? (
                            <img src={generatedProImage} alt="Campaign Asset" className="w-full h-auto object-cover" />
                        ) : (
                            <div className="w-full aspect-[3/4] border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center text-stone-400 bg-stone-100/50 backdrop-blur-sm relative overflow-hidden">
                                {/* Placeholder Background Image - Updated to a Modern Studio Vibe */}
                                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-10" alt="Studio Background" />
                                <div className="relative z-10 flex flex-col items-center">
                                    {isProGenerating ? <IconLoader className="w-12 h-12 mb-2 animate-spin text-custemo-gold" /> : <IconPhoto className="w-12 h-12 mb-2 opacity-50" />}
                                    <span className="text-sm">{isProGenerating ? "Dreaming up scene..." : "Your studio shot will appear here"}</span>
                                </div>
                            </div>
                        )}
                    </div>
                 </div>
            ) : (
                <div className="w-full max-w-md aspect-[3/4] animate-fade-in-up drop-shadow-2xl">
                    <GarmentPreview state={state} />
                </div>
            )}
        </div>

        {/* Right Panel: AI Agent Glass Panel */}
        <div className="w-full lg:w-1/3 p-6 border-l border-white/20 flex flex-col min-h-[400px] animate-slide-in-right stagger-delay-2 z-20 glass">
            <div className="mb-4">
                <h2 className="text-xl font-serif font-bold text-custemo-dark flex items-center gap-2">
                    <IconSparkles className="text-custemo-gold animate-pulse" />
                    Styla Assistant
                </h2>
                <p className="text-sm text-stone-500 mt-1">Not sure what to pick? Ask our AI fashion consultant.</p>
            </div>
            <div className="flex-grow shadow-lg rounded-xl overflow-hidden border border-white/30 hover:shadow-xl transition-shadow duration-500 bg-white/40 backdrop-blur-sm">
                <ChatInterface context={state} />
            </div>
             <div className="mt-6 p-4 bg-custemo-sage/40 backdrop-blur-md rounded-lg border border-custemo-sage/50">
                <p className="text-xs text-custemo-green leading-relaxed flex items-start gap-2">
                    <IconLeaf className="w-4 h-4 flex-shrink-0 mt-0.5 animate-float" />
                    <span>
                        <strong>Eco Fact:</strong> Customizing this piece creates zero inventory waste. We only manufacture what you order.
                    </span>
                </p>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default Studio;
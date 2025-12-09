import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import GarmentPreview from '../components/GarmentPreview';
import ChatInterface from '../components/ChatInterface';
import { GarmentType, FabricType, FitType, NecklineType, CustomizationState } from '../types';
import { IconCheck, IconSparkles, IconPhoto, IconWand, IconMovie, IconLoader } from '../components/Icons';
import { generateProImage, editGarmentImage, generateFashionVideo } from '../services/geminiService';

const Studio: React.FC = () => {
  const [state, setState] = useState<CustomizationState>({
    type: GarmentType.SHIRT,
    color: '#ffffff',
    fabric: FabricType.COTTON,
    fit: FitType.REGULAR,
    neckline: NecklineType.CREW,
    hasPockets: false,
    sleeveLength: 'short'
  });

  const [activeTab, setActiveTab] = useState<'style' | 'fabric' | 'details' | 'campaign'>('style');

  // Campaign Mode States
  const [campaignPrompt, setCampaignPrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [generatedProImage, setGeneratedProImage] = useState<string | null>(null);
  const [isProGenerating, setIsProGenerating] = useState(false);
  
  const [editInstruction, setEditInstruction] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);

  // Auto-update prompt based on state
  useEffect(() => {
    setCampaignPrompt(`A high-fashion editorial shot of a ${state.color} ${state.fabric} ${state.type}, ${state.fit}, ${state.neckline}, photorealistic, 8k resolution.`);
  }, [state]);

  const handleProGenerate = async () => {
    if (isProGenerating) return;
    setIsProGenerating(true);
    setGeneratedProImage(null);
    setVideoUrl(null); // Reset video if new image
    try {
        const img = await generateProImage(campaignPrompt, imageSize);
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
        const vid = await generateFashionVideo(generatedProImage, `Cinematic fashion film showing the ${state.type} in motion.`);
        setVideoUrl(vid);
    } catch (e) {
        console.error(e);
        alert("Failed to generate video. Ensure you have a paid API key selected.");
    } finally {
        setIsVideoGenerating(false);
    }
  };

  const colors = [
    { name: 'White', value: '#ffffff', class: 'bg-white border-gray-200' },
    { name: 'Black', value: '#1a1a1a', class: 'bg-gray-900' },
    { name: 'Navy', value: '#1e3a8a', class: 'bg-blue-900' },
    { name: 'Olive', value: '#3f4d28', class: 'bg-[rgb(63,77,40)]' },
    { name: 'Clay', value: '#9c6644', class: 'bg-[rgb(156,102,68)]' },
    { name: 'Sage', value: '#a3b18a', class: 'bg-[rgb(163,177,138)]' },
  ];

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] bg-stone-50 flex flex-col lg:flex-row">
        {/* Left Panel: Controls */}
        <div className="w-full lg:w-1/3 bg-white border-r border-stone-200 overflow-y-auto h-auto lg:h-[calc(100vh-64px)]">
          <div className="p-6">
            <h2 className="text-2xl font-serif font-bold mb-6 text-custemo-dark">Customize Your Look</h2>
            
            {/* Tabs */}
            <div className="flex space-x-4 border-b border-stone-200 mb-6 overflow-x-auto">
              {['style', 'fabric', 'details', 'campaign'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-3 text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                    activeTab === tab 
                    ? 'text-custemo-green border-b-2 border-custemo-green' 
                    : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-8 animate-fadeIn">
              {activeTab === 'style' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Garment Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.values(GarmentType).map(type => (
                        <button
                          key={type}
                          onClick={() => setState(prev => ({ ...prev, type }))}
                          className={`py-3 px-2 rounded-lg text-sm font-medium border transition-all ${
                            state.type === type 
                            ? 'border-custemo-green bg-custemo-sage/20 text-custemo-green' 
                            : 'border-stone-200 hover:border-stone-300 text-stone-600'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Fit</label>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.values(FitType).map(fit => (
                            <button
                                key={fit}
                                onClick={() => setState(prev => ({ ...prev, fit }))}
                                className={`py-3 px-4 text-left rounded-lg text-sm border transition-all flex justify-between items-center ${
                                    state.fit === fit
                                    ? 'border-custemo-green bg-white ring-1 ring-custemo-green'
                                    : 'border-stone-200 hover:bg-stone-50'
                                }`}
                            >
                                {fit}
                                {state.fit === fit && <IconCheck className="w-4 h-4 text-custemo-green" />}
                            </button>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                     <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Color</label>
                     <div className="flex flex-wrap gap-4">
                        {colors.map((c) => (
                            <button
                                key={c.name}
                                onClick={() => setState(prev => ({ ...prev, color: c.value }))}
                                className={`w-10 h-10 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${c.class} ${state.color === c.value ? 'border-custemo-dark ring-2 ring-offset-2 ring-stone-300' : 'border-transparent'}`}
                                title={c.name}
                            />
                        ))}
                     </div>
                  </div>
                </>
              )}

              {activeTab === 'fabric' && (
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Premium Material</label>
                    <div className="space-y-3">
                        {Object.values(FabricType).map(fabric => (
                            <button
                                key={fabric}
                                onClick={() => setState(prev => ({ ...prev, fabric }))}
                                className={`w-full p-4 text-left rounded-xl border transition-all group ${
                                    state.fabric === fabric
                                    ? 'border-custemo-green bg-custemo-sage/10'
                                    : 'border-stone-200 hover:border-custemo-green/50'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`font-medium ${state.fabric === fabric ? 'text-custemo-green' : 'text-stone-700'}`}>{fabric}</span>
                                    {state.fabric === fabric && <span className="text-xs bg-custemo-green text-white px-2 py-0.5 rounded-full">Selected</span>}
                                </div>
                                <p className="text-xs text-stone-500">Sourced sustainably from premium mills in Surat.</p>
                            </button>
                        ))}
                    </div>
                </div>
              )}

              {activeTab === 'details' && (
                  <>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Neckline</label>
                        <select 
                            value={state.neckline}
                            onChange={(e) => setState(prev => ({...prev, neckline: e.target.value as NecklineType}))}
                            className="w-full p-3 rounded-lg border border-stone-200 focus:ring-custemo-green focus:border-custemo-green outline-none text-sm"
                        >
                            {Object.values(NecklineType).map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-stone-200 rounded-lg">
                        <span className="text-sm font-medium text-stone-700">Sleeve Length</span>
                        <div className="flex bg-stone-100 rounded-lg p-1">
                            <button 
                                onClick={() => setState(prev => ({...prev, sleeveLength: 'short'}))}
                                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${state.sleeveLength === 'short' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}
                            >
                                Short
                            </button>
                            <button 
                                onClick={() => setState(prev => ({...prev, sleeveLength: 'long'}))}
                                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${state.sleeveLength === 'long' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}
                            >
                                Long
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-stone-200 rounded-lg">
                        <span className="text-sm font-medium text-stone-700">Add Pockets</span>
                        <button 
                            onClick={() => setState(prev => ({...prev, hasPockets: !prev.hasPockets}))}
                            className={`w-12 h-6 rounded-full transition-colors relative ${state.hasPockets ? 'bg-custemo-green' : 'bg-stone-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${state.hasPockets ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>
                  </>
              )}

              {activeTab === 'campaign' && (
                  <div className="space-y-6">
                     <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <IconSparkles className="w-5 h-5 text-purple-600" />
                            <h3 className="font-bold text-purple-900 text-sm">AI Campaign Studio</h3>
                        </div>
                        <p className="text-xs text-purple-700">
                            Generate high-fidelity marketing assets for your design.
                        </p>
                     </div>

                     {/* Step 1: Pro Image Gen */}
                     <div className="space-y-3">
                         <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">1. High-Fidelity Photoshoot</label>
                         <textarea 
                            className="w-full p-3 rounded-lg border border-stone-200 text-sm h-24 focus:ring-custemo-green focus:border-custemo-green"
                            value={campaignPrompt}
                            onChange={(e) => setCampaignPrompt(e.target.value)}
                         />
                         <div className="flex gap-2">
                            {(['1K', '2K', '4K'] as const).map(s => (
                                <button 
                                    key={s}
                                    onClick={() => setImageSize(s)}
                                    className={`flex-1 py-2 text-xs font-medium rounded border ${imageSize === s ? 'bg-stone-800 text-white border-stone-800' : 'bg-white border-stone-200 hover:bg-stone-50'}`}
                                >
                                    {s}
                                </button>
                            ))}
                         </div>
                         <button 
                            onClick={handleProGenerate}
                            disabled={isProGenerating}
                            className="w-full bg-stone-800 text-white py-3 rounded-lg text-sm font-medium flex justify-center items-center gap-2 hover:bg-black disabled:opacity-70"
                         >
                             {isProGenerating ? <IconLoader className="animate-spin w-4 h-4" /> : <IconPhoto className="w-4 h-4" />}
                             Generate Studio Photo
                         </button>
                     </div>

                     {/* Step 2: Magic Editor */}
                     {generatedProImage && (
                         <div className="space-y-3 pt-4 border-t border-stone-200 animate-fadeIn">
                             <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">2. Magic Editor (Nano Banana)</label>
                             <div className="flex gap-2">
                                 <input 
                                    type="text" 
                                    placeholder="e.g., 'Add a vintage filter', 'Remove background'" 
                                    className="flex-grow p-2 text-sm border border-stone-200 rounded-lg"
                                    value={editInstruction}
                                    onChange={(e) => setEditInstruction(e.target.value)}
                                 />
                                 <button 
                                    onClick={handleEditImage}
                                    disabled={isEditing || !editInstruction}
                                    className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                 >
                                     {isEditing ? <IconLoader className="animate-spin w-4 h-4" /> : <IconWand className="w-4 h-4" />}
                                 </button>
                             </div>
                         </div>
                     )}

                     {/* Step 3: Veo Video */}
                     {generatedProImage && (
                         <div className="space-y-3 pt-4 border-t border-stone-200 animate-fadeIn">
                             <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">3. Runway Video (Veo)</label>
                             <button 
                                onClick={handleVideoGenerate}
                                disabled={isVideoGenerating}
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg text-sm font-medium flex justify-center items-center gap-2 hover:opacity-90 disabled:opacity-70"
                             >
                                 {isVideoGenerating ? <IconLoader className="animate-spin w-4 h-4" /> : <IconMovie className="w-4 h-4" />}
                                 Animate with Veo
                             </button>
                             <p className="text-[10px] text-stone-400 text-center">Requires paid API Key selection.</p>
                         </div>
                     )}

                  </div>
              )}
            </div>
            
            {/* Total & Action */}
            {activeTab !== 'campaign' && (
                <div className="mt-12 pt-6 border-t border-stone-200">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-stone-500 text-sm">Estimated Cost</span>
                        <span className="text-xl font-bold font-serif text-custemo-dark">$125.00</span>
                    </div>
                    <button className="w-full bg-custemo-dark text-white py-4 rounded-xl font-medium hover:bg-black transition-colors flex justify-center items-center gap-2">
                        <span>Add to Bag</span>
                        <IconCheck className="w-4 h-4" />
                    </button>
                </div>
            )}
          </div>
        </div>

        {/* Middle Panel: Preview */}
        <div className="w-full lg:w-1/3 p-8 flex items-center justify-center bg-stone-100 relative overflow-hidden">
            {/* Display for Campaign Mode */}
            {activeTab === 'campaign' ? (
                 <div className="w-full max-w-md flex flex-col items-center gap-4">
                    {generatedProImage ? (
                        <div className="relative w-full aspect-square shadow-2xl rounded-xl overflow-hidden bg-white group">
                            <img src={generatedProImage} alt="Campaign Asset" className="w-full h-full object-cover" />
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                                {imageSize} Generated
                            </div>
                        </div>
                    ) : (
                        <div className="w-full aspect-square border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center text-stone-400">
                            <IconPhoto className="w-12 h-12 mb-2 opacity-50" />
                            <span className="text-sm">Your studio shot will appear here</span>
                        </div>
                    )}

                    {videoUrl && (
                        <div className="w-full mt-4">
                            <p className="text-xs font-bold uppercase text-stone-500 mb-2">Runway Video</p>
                            <video src={videoUrl} controls autoPlay loop className="w-full rounded-xl shadow-lg" />
                        </div>
                    )}
                 </div>
            ) : (
                /* Standard Preview */
                <>
                    <div className="w-full max-w-md aspect-[3/4]">
                        <GarmentPreview state={state} />
                    </div>
                    
                    {/* Sustainability Badge */}
                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-green-100 flex items-center gap-2 text-xs font-medium text-green-800 shadow-sm">
                        <IconSparkles className="w-3 h-3" />
                        <span>Eco-Impact: -40% Water Usage</span>
                    </div>
                </>
            )}
        </div>

        {/* Right Panel: AI Agent (Floating on mobile, fixed on desktop) */}
        <div className="w-full lg:w-1/3 p-6 bg-white lg:bg-stone-50 lg:border-l border-stone-200 flex flex-col">
            <div className="mb-4">
                <h2 className="text-xl font-serif font-bold text-custemo-dark flex items-center gap-2">
                    <IconSparkles className="text-custemo-gold" />
                    Styla Assistant
                </h2>
                <p className="text-sm text-stone-500 mt-1">Not sure what to pick? Ask our AI fashion consultant.</p>
            </div>
            <div className="flex-grow">
                <ChatInterface context={state} />
            </div>
             <div className="mt-6 p-4 bg-custemo-sage/30 rounded-lg border border-custemo-sage">
                <p className="text-xs text-custemo-green leading-relaxed">
                    <strong>Did you know?</strong> Customizing this piece creates zero inventory waste. We only manufacture what you order.
                </p>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default Studio;
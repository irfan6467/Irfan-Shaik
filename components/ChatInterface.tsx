import React, { useState, useRef, useEffect } from 'react';
import { GenerateContentResponse } from "@google/genai";
import { sendMessageStream, generateGarmentPreview } from '../services/geminiService';
import { CustomizationState, ChatMessage, FabricType } from '../types';
import { IconSend, IconBot, IconSparkles, IconSearch, IconMap, IconBrain, IconPaperclip, IconLoader, IconLeaf } from './Icons';

interface Props {
  context: CustomizationState;
}

interface ExtendedChatMessage extends ChatMessage {
  groundingSources?: { uri: string; title: string; type: 'web' | 'map' }[];
  genUIComponent?: 'FabricCard' | 'SustainabilityScore' | 'StyleMoodBoard' | null;
}

// Streaming Typography Component with Variable Font Weight Animation
const StreamingText: React.FC<{ text: string }> = ({ text }) => {
    return (
        <span className="inline-block">
            {text.split('').map((char, index) => (
                <span 
                    key={index} 
                    className="inline-block animate-stream-text transition-all duration-300" 
                    style={{ animationDelay: `${index * 5}ms`, fontWeight: index > text.length - 10 ? 700 : 400 }}
                >
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </span>
    );
};

// Generative Thinking State Visualization (Shimmering Wave)
const ThinkingState: React.FC = () => (
    <div className="flex items-center gap-1 h-6">
        {[1, 2, 3, 4, 5].map((i) => (
            <div 
                key={i} 
                className="w-1 bg-gradient-to-t from-custemo-gold to-purple-500 rounded-full animate-breathe"
                style={{ 
                    height: `${Math.random() * 10 + 10}px`, 
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.8s'
                }}
            />
        ))}
        <span className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-custemo-gold to-purple-600 ml-2 font-bold animate-pulse">
            Visualizing...
        </span>
    </div>
);

const ChatInterface: React.FC<Props> = ({ context }) => {
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    { role: 'model', text: "I'm Styla, your generative fashion agent. I can analyze trends, explain fabric physics, or visualize new cuts. What are we creating today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setAttachedImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const determineGenUI = (text: string, ctx: CustomizationState): 'FabricCard' | 'SustainabilityScore' | null => {
      const lower = text.toLowerCase();
      if (lower.includes('fabric') || lower.includes('material') || lower.includes('feel')) return 'FabricCard';
      if (lower.includes('sustainable') || lower.includes('eco') || lower.includes('carbon')) return 'SustainabilityScore';
      return null;
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if ((!textToSend.trim() && !attachedImage) || isLoading) return;

    const userMsg: ExtendedChatMessage = { 
        role: 'user', 
        text: textToSend,
        image: attachedImage || undefined 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const currentImage = attachedImage;
    setAttachedImage(null);
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'model', text: '', isTyping: true }]);

    try {
      const stream = await sendMessageStream(textToSend, context, { 
          useThinking, 
          image: currentImage || undefined 
      });

      let fullResponse = '';
      let shouldGenerateImage = false;
      let foundSources: { uri: string; title: string; type: 'web' | 'map' }[] = [];

      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        const text = c.text || '';
        fullResponse += text;
        
        if (fullResponse.includes('{{GENERATE_IMAGE}}')) {
            shouldGenerateImage = true;
        }

        const chunks = c.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
             chunks.forEach((chunk: any) => {
                 if (chunk.web) {
                     foundSources.push({ uri: chunk.web.uri, title: chunk.web.title, type: 'web' });
                 } else if (chunk.maps) {
                     const title = chunk.maps.title || "Google Maps Location";
                     const uri = chunk.maps.googleMapsUri || "#";
                     foundSources.push({ uri, title, type: 'map' });
                 }
             });
        }
        
        const cleanText = fullResponse.replace('{{GENERATE_IMAGE}}', '');

        setMessages(prev => {
            const newArr = [...prev];
            const lastMsg = newArr[newArr.length - 1];
            if (lastMsg.role === 'model' && lastMsg.isTyping) {
                lastMsg.text = cleanText;
            }
            return newArr;
        });
      }

      setMessages(prev => {
        const newArr = [...prev];
        const lastMsg = newArr[newArr.length - 1];
        lastMsg.isTyping = false;
        if (foundSources.length > 0) {
            const unique = foundSources.filter((v,i,a)=>a.findIndex(v2=>(v2.uri===v.uri))===i);
            lastMsg.groundingSources = unique;
        }
        lastMsg.genUIComponent = determineGenUI(lastMsg.text, context);
        return newArr;
      });

      if (shouldGenerateImage) {
         setMessages(prev => [...prev, { role: 'model', text: 'Generating visual preview...', isTyping: true }]);
         try {
            const imageUrl = await generateGarmentPreview(context);
            setMessages(prev => {
                const newArr = [...prev];
                const lastMsg = newArr[newArr.length - 1];
                lastMsg.text = "Here is your design preview:";
                lastMsg.image = imageUrl;
                lastMsg.isTyping = false;
                return newArr;
            });
         } catch (err) {
             console.error(err);
         }
      }

    } catch (error) {
      console.error("Error sending message", error);
      setMessages(prev => {
          const updated = [...prev];
          updated[updated.length-1].text = "I encountered an error. Please try again.";
          updated[updated.length-1].isTyping = false;
          return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = ["🔮 Trend Forecast", "Fabric Analysis", "Generate Look"];

  // --- GenUI Components ---
  const FabricCard = ({ type }: { type: FabricType }) => (
      <div className="mt-3 bg-stone-50 border border-stone-200 rounded-lg p-3 flex gap-3 animate-fade-in hover:shadow-md transition-all duration-300">
          <div className="w-16 h-16 bg-stone-200 rounded-md overflow-hidden flex-shrink-0 relative group">
               <img src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=200" alt="Microscope" className="w-full h-full object-cover transition-transform group-hover:scale-125" />
          </div>
          <div className="flex-grow">
              <h4 className="text-xs font-bold uppercase text-stone-500">Material Analysis</h4>
              <p className="text-sm font-bold text-stone-800">{type}</p>
              <div className="flex gap-2 mt-1">
                  <span className="text-[10px] bg-white border border-stone-200 px-1.5 py-0.5 rounded shadow-sm">High Breathability</span>
                  <span className="text-[10px] bg-white border border-stone-200 px-1.5 py-0.5 rounded shadow-sm">Matte Finish</span>
              </div>
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-[600px] rounded-2xl overflow-hidden glass border-0 shadow-2xl transition-all duration-500">
      {/* Header with Dynamic Glass */}
      <div className="bg-white/10 backdrop-blur-xl p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full backdrop-blur-md border border-white/20 transition-all duration-500 ${useThinking ? 'bg-custemo-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-white/10'}`}>
                <IconBot className="w-5 h-5 text-white" />
            </div>
            <div>
                <h3 className="font-bold text-sm text-white drop-shadow-md">Styla AI</h3>
                <p className="text-[10px] text-white/60 flex items-center gap-1">
                    {useThinking ? 'Reasoning Model Active' : 'Standard Mode'}
                </p>
            </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer bg-black/20 px-3 py-1.5 rounded-full hover:bg-black/30 transition-colors border border-white/10">
            <IconBrain className={`w-3 h-3 ${useThinking ? 'text-custemo-gold animate-pulse' : 'text-stone-300'}`} />
            <input 
                type="checkbox" 
                className="hidden"
                checked={useThinking}
                onChange={(e) => setUseThinking(e.target.checked)}
            />
        </label>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6 no-scrollbar relative">
        {/* Subtle background particles */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in relative z-10`}>
            {msg.role === 'model' && msg.isTyping && msg.text === '' ? (
                 <div className="pl-2">
                    <ThinkingState />
                 </div>
            ) : (
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed backdrop-blur-md shadow-sm border transition-all duration-300 ${
                msg.role === 'user' 
                    ? 'bg-custemo-dark/90 text-white rounded-br-none border-transparent hover:scale-[1.01]' 
                    : 'bg-white/60 text-stone-800 rounded-bl-none border-white/40 hover:bg-white/70'
                }`}>
                    {/* Apply Streaming Text for Model, Normal Text for User */}
                    {msg.role === 'model' && !msg.isTyping ? <StreamingText text={msg.text} /> : msg.text}
                </div>
            )}
            
            {/* GenUI Component Rendering */}
            {msg.genUIComponent === 'FabricCard' && <FabricCard type={context.fabric} />}
            {msg.genUIComponent === 'SustainabilityScore' && (
                <div className="mt-2 bg-green-50/90 p-3 rounded-xl border border-green-100 flex items-center gap-3 w-[85%] animate-fade-in">
                    <div className="bg-green-100 p-2 rounded-full"><IconLeaf className="w-4 h-4 text-green-700" /></div>
                    <div>
                        <div className="h-1 w-32 bg-green-200 rounded-full mb-1"><div className="h-full w-[90%] bg-green-600 rounded-full"></div></div>
                        <p className="text-[10px] text-green-800 font-bold">90/100 Sustainability Score</p>
                    </div>
                </div>
            )}

            {msg.image && (
                <div className="mt-2 max-w-[85%] rounded-xl overflow-hidden shadow-lg border-2 border-white bg-stone-100 p-1 animate-fade-in-up hover:scale-105 transition-transform duration-500 ease-spring">
                    <img src={msg.image} alt="Attachment" className="w-full h-auto object-cover rounded-lg" />
                </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white/20 backdrop-blur-xl border-t border-white/10">
        <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-2">
            {suggestions.map((s) => (
                <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="whitespace-nowrap px-3 py-1 rounded-full bg-white/40 hover:bg-white/60 border border-white/20 text-[10px] font-bold text-stone-700 transition-all backdrop-blur-sm hover:scale-105"
                >
                    {s}
                </button>
            ))}
         </div>

        <div className="relative flex items-center gap-2">
            <button 
                onClick={() => fileInputRef.current?.click()} 
                className="p-2 text-stone-500 hover:text-custemo-dark bg-white/40 rounded-full transition-colors active:scale-90"
            >
                <IconPaperclip className="w-5 h-5" />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your intent..."
                className="flex-grow px-4 py-3 bg-white/40 text-stone-900 placeholder-stone-600 rounded-xl border border-white/10 focus:outline-none focus:bg-white/60 text-sm transition-all shadow-inner hover:shadow-lg focus:ring-1 focus:ring-white/50"
                disabled={isLoading}
            />
            <button 
                onClick={() => handleSend()}
                disabled={isLoading}
                className="p-3 bg-custemo-dark text-white rounded-xl hover:bg-black transition-all shadow-lg active:scale-90"
            >
                {isLoading ? <IconLoader className="w-4 h-4 animate-spin" /> : <IconSend className="w-4 h-4" />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
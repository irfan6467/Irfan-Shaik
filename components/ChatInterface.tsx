
import React, { useState, useRef, useEffect } from 'react';
import { GenerateContentResponse } from "@google/genai";
import { sendMessageStream, generateGarmentPreview } from '../services/geminiService';
import { CustomizationState, ChatMessage } from '../types';
import { IconSend, IconBot, IconSparkles, IconSearch } from './Icons';

interface Props {
  context: CustomizationState;
}

// Extend ChatMessage for internal state to hold grounding data
interface ExtendedChatMessage extends ChatMessage {
  groundingSources?: { uri: string; title: string }[];
}

const ChatInterface: React.FC<Props> = ({ context }) => {
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    { role: 'model', text: "Hi! I'm Styla. I can help with trend forecasts, body shape advice, or even visualize your design. What's on your mind?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ExtendedChatMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Add a placeholder for the streaming response
    setMessages(prev => [...prev, { role: 'model', text: '', isTyping: true }]);

    try {
      const stream = await sendMessageStream(textToSend, context);
      let fullResponse = '';
      let shouldGenerateImage = false;
      let foundGroundingChunks: { uri: string; title: string }[] = [];

      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        const text = c.text || '';
        fullResponse += text;
        
        // Check for the tag in real-time
        if (fullResponse.includes('{{GENERATE_IMAGE}}')) {
            shouldGenerateImage = true;
        }

        // Check for Grounding (Google Search)
        const chunks = c.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
             chunks.forEach((chunk: any) => {
                 if (chunk.web) {
                     foundGroundingChunks.push(chunk.web);
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

      // Finalize text message & add grounding
      setMessages(prev => {
        const newArr = [...prev];
        const lastMsg = newArr[newArr.length - 1];
        lastMsg.isTyping = false;
        if (foundGroundingChunks.length > 0) {
            lastMsg.groundingSources = foundGroundingChunks;
        }
        return newArr;
      });

      // Handle Image Generation if tagged
      if (shouldGenerateImage) {
         // Add a loading bubble for image
         setMessages(prev => [...prev, { role: 'model', text: 'Generating visual preview...', isTyping: true }]);
         
         try {
            const imageUrl = await generateGarmentPreview(context);
            
            // Replace loader with image
            setMessages(prev => {
                const newArr = [...prev];
                const lastMsg = newArr[newArr.length - 1];
                lastMsg.text = "Here is your design preview:";
                lastMsg.image = imageUrl;
                lastMsg.isTyping = false;
                return newArr;
            });
         } catch (err) {
             setMessages(prev => {
                const newArr = [...prev];
                const lastMsg = newArr[newArr.length - 1];
                lastMsg.text = "I apologize, I couldn't generate the image at this moment.";
                lastMsg.isTyping = false;
                return newArr;
             });
         }
      }

    } catch (error) {
      console.error("Error sending message", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having a little trouble connecting to my style database. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "🔮 Trend Forecast",
    "🧘 Body Shape Tips",
    "📸 Visualize This",
    "🎉 Occasion Help"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    let prompt = "";
    switch(suggestion) {
        case "🔮 Trend Forecast":
            prompt = "What are the latest sustainable fashion trends for this season?";
            break;
        case "🧘 Body Shape Tips":
            prompt = "What customization options suit my body shape best? (Ask me my shape if you need)";
            break;
        case "📸 Visualize This":
            prompt = "Can you generate a realistic image of this outfit for me?";
            break;
        case "🎉 Occasion Help":
            prompt = "Is this design suitable for a formal work event or a casual party?";
            break;
        default:
            prompt = suggestion;
    }
    handleSend(prompt);
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden">
      <div className="bg-custemo-green p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-full">
                <IconBot className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-sm">Custemo Style Agent</h3>
                <p className="text-xs text-green-100 opacity-80">Powered by Gemini</p>
            </div>
        </div>
        <IconSparkles className="w-4 h-4 opacity-50" />
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-stone-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-custemo-dark text-white rounded-br-none' 
                : 'bg-white text-stone-700 border border-stone-200 shadow-sm rounded-bl-none'
            }`}>
              {msg.text}
              {msg.isTyping && !msg.image && (
                  <span className="inline-flex ml-2 gap-1">
                      <span className="w-1 h-1 bg-stone-400 rounded-full animate-bounce"></span>
                      <span className="w-1 h-1 bg-stone-400 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1 h-1 bg-stone-400 rounded-full animate-bounce delay-150"></span>
                  </span>
              )}
            </div>
            
            {/* Image Attachment */}
            {msg.image && (
                <div className="mt-2 max-w-[85%] rounded-lg overflow-hidden shadow-md border border-stone-200 bg-white p-1">
                    <img src={msg.image} alt="AI Generated Outfit" className="w-full h-auto object-cover rounded" />
                </div>
            )}

            {/* Grounding Sources */}
            {msg.groundingSources && msg.groundingSources.length > 0 && (
                <div className="mt-2 max-w-[85%] flex flex-wrap gap-2">
                    {msg.groundingSources.map((source, i) => (
                        <a 
                            key={i} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 bg-white border border-stone-200 px-2 py-1 rounded text-[10px] text-stone-500 hover:text-custemo-green hover:border-custemo-green transition-colors"
                        >
                            <IconSearch className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{source.title}</span>
                        </a>
                    ))}
                </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions Chips */}
      <div className="px-4 pt-2 bg-white border-t border-stone-100">
         <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">Quick Suggestions</p>
         <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {suggestions.map((s) => (
                <button
                    key={s}
                    onClick={() => handleSuggestionClick(s)}
                    disabled={isLoading}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full border border-stone-200 bg-stone-50 hover:bg-custemo-sage/20 hover:border-custemo-green text-xs font-medium text-stone-600 hover:text-custemo-green transition-all"
                >
                    {s}
                </button>
            ))}
         </div>
      </div>

      <div className="p-3 bg-white border-t border-stone-200">
        <div className="relative">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Styla or say 'Show me'..."
            className="w-full pl-4 pr-12 py-3 rounded-full border border-stone-300 focus:outline-none focus:border-custemo-green focus:ring-1 focus:ring-custemo-green text-sm"
            disabled={isLoading}
            />
            <button 
                onClick={() => handleSend()}
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-custemo-green text-white rounded-full hover:bg-green-800 disabled:opacity-50 transition-all"
            >
                <IconSend className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

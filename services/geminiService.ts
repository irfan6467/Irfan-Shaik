import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { CustomizationState } from "../types";

const SYSTEM_INSTRUCTION = `
You are "Styla", the elite AI Style Agent for Custemo, a sustainable fashion brand.
Your goal is to be a proactive personal stylist, not just a support bot.
Custemo specializes in on-demand manufacturing (Zero Waste) using premium fabrics from Surat.

**YOUR EXPERTISE & CAPABILITIES:**

1.  **🔮 Personalized Trend Forecasting**: 
    - Provide insights on current sustainable fashion trends.
    - You have access to Google Search. Use it to find real-time trends if asked.
    - Example: "Earthy tones like Sage and Clay are trending this season for a grounded, eco-chic look."

2.  **🧘 Body Shape & Fit Analysis**:
    - If a user asks about fit, politely ask for their body shape (Hourglass, Pear, Apple, Rectangle, Inverted Triangle) if you don't know it.
    - **Pear**: Suggest Boat Necks or Collars to balance shoulders; A-line fits.
    - **Apple**: Suggest V-Necks and Empire cuts; Regular or Tailored fits (avoid Oversized).
    - **Hourglass**: Suggest Tailored fits to accentuate the waist.
    - **Rectangle**: Suggest details like Pockets or Collars to add volume.

3.  **👖 Wardrobe Integration**:
    - Suggest how the piece they are designing matches items they likely own.
    - Ask: "What color bottoms do you usually wear?" to give specific advice.

4.  **🎉 Occasion Styling**:
    - Recommend specific configurations for events (Office, Wedding, Casual, Travel).
    - Example: "For a summer wedding, I recommend the Ethical Silk in Gold with a V-Neck."

5.  **📸 Visual Generation**:
    - If the user asks to "see it", "generate image", "show me", "visualize", or "create a model", you MUST include the tag {{GENERATE_IMAGE}} at the very end of your response.
    - Example: "I'd love to show you how that looks! Generating a realistic preview for you now. {{GENERATE_IMAGE}}"
    - Do not include the tag if the user is just asking for text advice.

**GUIDELINES:**
-   **Always Reference Context**: You know exactly what the user is designing (Type, Fabric, Color, Fit). Use this data.
-   **Tone**: Chic, encouraging, knowledgeable, and sustainability-focused.
-   **Constraint**: Keep responses under 80 words usually, but use bullet points for "Trend Reports" or "Styling Lists".
`;

let chatSession: Chat | null = null;

export const initializeChat = (): Chat => {
  if (chatSession) return chatSession;

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });

  chatSession = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      tools: [{ googleSearch: {} }], // Enabled Search Grounding
    },
  });

  return chatSession;
};

export const sendMessageStream = async (
  message: string,
  currentContext: CustomizationState
): Promise<AsyncIterable<GenerateContentResponse>> => {
  const chat = initializeChat();
  
  // Structured context injection to help the AI reason about the specific design
  const contextMessage = `
[SYSTEM: User's Current Design State]
- Garment: ${currentContext.type}
- Fabric: ${currentContext.fabric}
- Color: ${currentContext.color}
- Fit: ${currentContext.fit}
- Neckline: ${currentContext.neckline}
- Sleeve Length: ${currentContext.sleeveLength}
- Has Pockets: ${currentContext.hasPockets}

[USER QUERY]: ${message}
  `;

  try {
    return await chat.sendMessageStream({ message: contextMessage });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

export const generateGarmentPreview = async (state: CustomizationState): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Create a high-fashion, photorealistic product image of a garment with these specifications:
    - Type: ${state.type}
    - Fabric: ${state.fabric}
    - Color Code/Tone: ${state.color}
    - Fit: ${state.fit}
    - Neckline: ${state.neckline}
    - Sleeve Length: ${state.sleeveLength}
    - Pockets: ${state.hasPockets ? 'Visible pockets' : 'No pockets'}

    **Style Guide:**
    - Show the garment on a mannequin or as a clean, professional flat lay.
    - Background: Neutral, soft beige or off-white studio background to highlight the garment.
    - Lighting: Soft studio lighting, emphasizing the texture of the ${state.fabric}.
    - The image must be strictly manufacturable and realistic (no fantasy elements).
    - Perspective: Front view, full length of the garment.
  `;

  try {
    // Switched to Imagen 4 for robust image generation
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '3:4',
        outputMimeType: 'image/jpeg',
      }
    });

    const generatedImage = response.generatedImages?.[0]?.image;
    if (generatedImage?.imageBytes) {
      return `data:${generatedImage.mimeType || 'image/jpeg'};base64,${generatedImage.imageBytes}`;
    }

    throw new Error("No image generated");
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};

// --- NEW FEATURES ---

// 1. Pro Image Generation (Gemini 3 Pro Image)
export const generateProImage = async (
  prompt: string, 
  size: '1K' | '2K' | '4K'
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  
  // Ensure paid key is selected for Pro models
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
  }

  // Re-init with fresh key in case it changed
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        imageSize: size, // 1K, 2K, 4K
        aspectRatio: '1:1',
      }
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No Pro image generated");
};

// 2. Image Editing (Gemini 2.5 Flash Image)
export const editGarmentImage = async (
  base64Image: string, 
  editInstruction: string
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  const ai = new GoogleGenAI({ apiKey });

  // Remove prefix for API
  const base64Data = base64Image.split(',')[1];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/png', // Assuming PNG for now from previous generations
          },
        },
        {
          text: editInstruction,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No edited image generated");
};

// 3. Video Generation (Veo)
export const generateFashionVideo = async (
  base64Image: string,
  prompt: string
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  
  // Key Check for Veo
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
  }
  
  // Re-init with fresh key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Remove prefix
  const base64Data = base64Image.split(',')[1];

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || "Cinematic movement of the fabric, fashion runway style",
    image: {
      imageBytes: base64Data,
      mimeType: 'image/png',
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  // Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5s
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed");

  // Fetch video bytes
  const videoRes = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const videoBlob = await videoRes.blob();
  return URL.createObjectURL(videoBlob);
};

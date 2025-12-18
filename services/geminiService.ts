import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { CustomizationState, AspectRatio, FabricType, FitType, PrintMethod, GarmentType, GraphicType, Gender } from "../types";

// --- KEYWORD CLUSTERS (The "Database") ---

const MATERIAL_PHYSICS: Record<FabricType, string> = {
  [FabricType.COTTON]: "Premium Surat organic cotton fabric, matte finish with high light absorption, visible natural fiber texture, soft micro-fuzz on surface, heavyweight drape, breathable weave structure.",
  [FabricType.SILK]: "Luxurious Surat mulberry silk satin, high-gloss liquid sheen, anisotropic reflections, fluid and pooling drape, soft specular highlights, premium evening-wear aesthetic.",
  [FabricType.LINEN]: "Natural Surat hemp-linen blend, visible slub texture with irregular yarn thickness, dry hand feel, crisp and angular folds, slightly translucent under studio light, earthy organic dye tones.",
  [FabricType.RECYCLED_POLY]: "Technical sportswear weave, moisture-wicking texture, interlock knit, subtle synthetic sheen, smooth uniform surface.",
  [FabricType.HEMP]: "Raw hemp fiber, coarse weave texture, earthy matte finish, rigid drape structure, authentic sustainable aesthetic."
};

const FIT_TOPOLOGY: Record<FitType, string> = {
  [FitType.OVERSIZED]: "Oversized fit with drop shoulders, baggy sleeves, wide hem, excess fabric pooling, anti-fit streetwear aesthetic.",
  [FitType.SLIM]: "Slim fit, tapered waist, high armholes, darted back construction, fabric contouring to body.",
  [FitType.TAILORED]: "Tailored fit, structured silhouette, precise seam lines, professional drape.",
  [FitType.REGULAR]: "Classic regular fit, balanced proportions, comfortable drape."
};

const PRINT_PHYSICS: Record<PrintMethod, string> = {
  [PrintMethod.SCREEN]: "Plastisol ink screen print, vibrant opaque colors, slight surface gloss, crisp edges, thick ink application, minimal fabric show-through.",
  [PrintMethod.DTG]: "Water-based pigment print, soft-hand feel, ink absorbed into fabric fibers, muted vintage colors, fabric texture visible through graphic, distressed edges.",
  [PrintMethod.PUFF]: "3D puff print, raised foam ink texture, voluminous lettering, rounded beveled edges, matte rubber finish, casting soft shadows on fabric.",
  [PrintMethod.EMBROIDERY]: "High-density satin stitch embroidery, raised thread texture, individual thread gloss, tactile relief, embroidered patch, slight fabric puckering around stitches."
};

const SYSTEM_INSTRUCTION = `
You are "Styla", the elite AI Style Agent for Custemo, a sustainable fashion brand.
Custemo specializes in on-demand manufacturing (Zero Waste) using premium fabrics from Surat.

**YOUR ARCHITECTURE & KNOWLEDGE BASE:**

1.  **🧬 Fabric Physics & Sourcing**: 
    - You know that "Surat Cotton" is high-gauge and matte.
    - You know "Linen" creates crisp, angular folds.
    - Explain these physical properties to users to justify quality.

2.  **🎨 Vector Integration**:
    - If a user chooses "Puff Print", explain how the 3D foam ink sits on the fabric.
    - If "Embroidery", mention the satin stitch gloss.

3.  **🧘 Body & Fit Logic**:
    - **Oversized (Gen Z)**: Drop shoulders, anti-fit, street aesthetic.
    - **Tailored (Pro)**: Structured, darted, professional.

4.  **📸 Visual Generation**:
    - If the user asks to "see it", "generate image", "show me", you MUST include the tag {{GENERATE_IMAGE}} at the very end of your response.

**GUIDELINES:**
-   **Always Reference Context**: You see the exact "Digital Twin" configuration (Fabric, Print Method, Hardware, Gender).
-   **Tone**: Chic, encouraging, knowledgeable, and sustainability-focused.
`;

// --- MASTER PROMPT ASSEMBLER ---

const constructMasterPrompt = (state: CustomizationState, promptOverride?: string): string => {
  // 1. Subject Layer (Persona Logic)
  const genderTerm = state.gender === Gender.MEN ? "male" : state.gender === Gender.WOMEN ? "female" : "androgynous";
  const isStreetwear = state.fit === FitType.OVERSIZED || state.type === GarmentType.HOODIE;
  
  const subject = isStreetwear 
    ? `Full body fashion shot of a Gen Z ${genderTerm} model with a lean build and authentic look` 
    : `Full body fashion shot of a professional ${genderTerm} model with a confident pose`;

  // 2. Garment Container
  const garment = `wearing a premium ${state.color} ${state.type}. Fit style is ${state.fit} (${FIT_TOPOLOGY[state.fit]}). Features ${state.neckline} and ${state.hardware} hardware details.`;

  // 3. Material Physics Layer (Surat Sourcing)
  const material = `The fabric is ${MATERIAL_PHYSICS[state.fabric]}`;

  // 4. Vector & Customization Layer
  let design = "";
  if (state.graphic !== GraphicType.NONE) {
    const graphicName = state.graphic === GraphicType.CUSTOM ? "custom vector logo" : state.graphic;
    design = `Centered on the chest/body, a '${graphicName}' design is applied as a ${state.printMethod}. The render shows ${PRINT_PHYSICS[state.printMethod]}. The graphic wraps realistically around the body form, distorted by fabric wrinkles and folds (displacement map effect).`;
  }
  
  if (state.pattern !== 'Solid') {
     design += ` The fabric features a ${state.pattern} pattern integrated into the weave.`;
  }

  // 5. Environment & Lighting Layer
  const lighting = isStreetwear
    ? "Background is a blurred Urban Street Scene with concrete textures. High contrast natural lighting, golden hour."
    : "Background is a clean High-End Studio Cyclorama. Soft diffused shadows, distinct separation between subject and background, Rembrandt lighting.";

  // 6. Technical Modifiers
  const technical = "Hyper-realistic, Unreal Engine 5 render style, raytracing, 8k resolution, macro photography details, sharp focus, phase one camera quality, no prompt pollution.";

  // Assembly
  return `${subject}, ${garment} ${material} ${design} ${lighting} ${technical} ${promptOverride || ''}`;
};


let chatSession: Chat | null = null;
let currentModel: string = '';

export const sendMessageStream = async (
  message: string,
  currentContext: CustomizationState,
  options?: { useThinking?: boolean; image?: string }
) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  const ai = new GoogleGenAI({ apiKey });

  // Determine Model & Config
  let targetModel = 'gemini-2.5-flash';
  let config: any = {
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.7,
    tools: [
        { googleSearch: {} }
    ]
  };

  if (options?.useThinking) {
      targetModel = 'gemini-3-pro-preview';
      config = {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingBudget: 32768 },
          tools: [] 
      };
  } else if (options?.image) {
      targetModel = 'gemini-3-pro-preview';
      config = {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }]
      };
  }

  // Session Management
  let history: Content[] = [];
  if (chatSession) {
      try {
          history = await chatSession.getHistory();
      } catch (e) {
          console.warn("Failed to get history", e);
      }
  }

  if (!chatSession || currentModel !== targetModel) {
      chatSession = ai.chats.create({
          model: targetModel,
          config,
          history
      });
      currentModel = targetModel;
  }

  // Construct Context Message with detailed physics
  const contextMessage = `
[SYSTEM: Digital Twin Configuration]
- Collection: ${currentContext.gender}
- Garment: ${currentContext.type} (${currentContext.fit})
- Material: ${currentContext.fabric} (${MATERIAL_PHYSICS[currentContext.fabric]})
- Hardware: ${currentContext.hardware}
- Print Tech: ${currentContext.printMethod} (${PRINT_PHYSICS[currentContext.printMethod]})
- Graphic: ${currentContext.graphic}

[USER QUERY]: ${message}
  `;

  let msgToSend: any = contextMessage;

  if (options?.image) {
      const base64Data = options.image.split(',')[1];
      const mimeType = options.image.substring(options.image.indexOf(':') + 1, options.image.indexOf(';')) || 'image/jpeg';
      
      msgToSend = [
          { text: contextMessage },
          { inlineData: { data: base64Data, mimeType } }
      ];
  }

  try {
    return await chatSession.sendMessageStream({ message: msgToSend });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

export const generateGarmentPreview = async (state: CustomizationState): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  const ai = new GoogleGenAI({ apiKey });

  const masterPrompt = constructMasterPrompt(state);
  console.log("Generating with Master Prompt:", masterPrompt);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: masterPrompt },
      ],
    },
    config: {
        imageConfig: {
          aspectRatio: "3:4",
        }
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

// 1. Pro Image Generation (Gemini 3 Pro Image)
export const generateProImage = async (
  state: CustomizationState, 
  customInstruction: string,
  size: '1K' | '2K' | '4K',
  aspectRatio: AspectRatio = '1:1'
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const masterPrompt = constructMasterPrompt(state, customInstruction);

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: masterPrompt }],
    },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: aspectRatio,
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

  const base64Data = base64Image.split(',')[1];
  const mimeType = base64Image.substring(base64Image.indexOf(':') + 1, base64Image.indexOf(';')) || 'image/png';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
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
  
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = base64Image.split(',')[1];

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || "Cinematic movement of the fabric, slow motion fashion film.",
    image: {
      imageBytes: base64Data,
      mimeType: 'image/png',
    },
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed");

  const videoRes = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const videoBlob = await videoRes.blob();
  return URL.createObjectURL(videoBlob);
};

export const analyzeImage = async (base64Image: string, prompt: string): Promise<string> => {
    return ""; 
};
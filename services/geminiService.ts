import { GoogleGenAI, Chat, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatSession: Chat | null = null;

// --- Chat Initialization ---

export const initializeChat = () => {
  chatSession = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
    },
  });
};

export const sendMessage = async (message: string): Promise<string> => {
  try {
    if (!chatSession) {
      initializeChat();
    }
    const response = await chatSession!.sendMessage({ message });
    const text = response.text;
    if (!text) {
        throw new Error("No content generated.");
    }
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const resetSession = () => {
  initializeChat();
};

// --- Media Generation ---

/**
 * Generate an Image using gemini-2.5-flash-image
 */
export const generateImage = async (prompt: string, aspectRatio: string = "16:9"): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      }
    });

    // Extract image
    let base64String = null;
    if (response.candidates?.[0]?.content?.parts) {
       for (const part of response.candidates[0].content.parts) {
         if (part.inlineData) {
           base64String = part.inlineData.data;
           break;
         }
       }
    }
    
    if (!base64String) {
      throw new Error("No image data returned from API");
    }

    return `data:image/png;base64,${base64String}`;
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};

/**
 * Generate Speech using gemini-2.5-flash-preview-tts
 */
export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data returned");
    }

    // Convert Base64 PCM to WAV for browser playback
    const audioBytes = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
    const wavBytes = pcmToWav(audioBytes, 24000); // 24kHz is default for this model
    
    // Create blob URL
    const blob = new Blob([wavBytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Speech Generation Error:", error);
    throw error;
  }
};

/**
 * Generate Video using veo-3.1-fast-generate-preview
 */
export const generateVideo = async (prompt: string, aspectRatio: string = "16:9"): Promise<string> => {
  // Check for paid key selection (required for Veo)
  // @ts-ignore
  if (window.aistudio && window.aistudio.hasSelectedApiKey && !(await window.aistudio.hasSelectedApiKey())) {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    // Re-check just in case, though we assume success or user retry
  }
  
  // Re-instantiate AI to pick up potential new key from session
  const paidAi = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    let operation = await paidAi.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await paidAi.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("No video URI returned");
    }

    // Fetch the actual MP4 bytes
    const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Video Generation Error:", error);
    throw error;
  }
};

// --- Helpers ---

// Convert raw PCM to WAV container
function pcmToWav(pcmData: Uint8Array, sampleRate: number): ArrayBuffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + dataSize, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, byteRate, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, bitsPerSample, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, dataSize, true);

  // write the PCM data
  const pcmBytes = new Uint8Array(buffer, 44);
  pcmBytes.set(pcmData);

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName, SpeakerConfig } from "../types";

const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const NATIVE_AUDIO_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

export async function generateSingleSpeakerSpeech(text: string, voice: VoiceName): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: TTS_MODEL,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error('No audio data received from Gemini API');
  }
  return base64Audio;
}

export async function generateMultiSpeakerSpeech(text: string, speakers: SpeakerConfig[]): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: TTS_MODEL,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: speakers.map(s => ({
            speaker: s.speakerName,
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: s.voice }
            }
          }))
        }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error('No audio data received from Gemini API (Multi-Speaker)');
  }
  return base64Audio;
}

/**
 * Cross-Lingual Voice Cloning: Mimic identity while translating/speaking regional languages.
 */
export async function mirrorVoice(
  text: string, 
  sampleBase64: string, 
  sampleMimeType: string,
  targetLanguage: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const response = await ai.models.generateContent({
    model: NATIVE_AUDIO_MODEL,
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: sampleBase64,
              mimeType: sampleMimeType
            }
          },
          {
            text: `You are a state-of-the-art neural voice cloning engine. 
            STEP 1: Analyze the provided audio sample for unique vocal characteristics: pitch, timbre, speed, and emotional undertones.
            STEP 2: Maintaining this EXACT vocal identity, speak the following text in ${targetLanguage}. 
            Even if the output language is different from the sample language, the speaker MUST sound like the same person.
            Focus heavily on regional naturalness for ${targetLanguage}.
            
            Text to speak: "${text}"`
          }
        ]
      }
    ],
    config: {
      responseModalities: [Modality.AUDIO],
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
  if (!base64Audio) {
    throw new Error('Could not mirror voice. Ensure the text is written in the correct script.');
  }
  return base64Audio;
}

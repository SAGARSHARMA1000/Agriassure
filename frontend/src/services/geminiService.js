/**
 * Gemini AI Service for AgriAssure Assistant
 * Features full console logging and candidate model retries.
 */

import { GoogleGenAI } from "@google/genai";
import api from "./api";

// Primary & Fallback Candidate Models for Google AI Studio / Gemini API
const CANDIDATE_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite"
];

// In-memory cache for the API key retrieved from backend DB
let cachedGeminiApiKey = null;

/**
 * Retrieve Gemini API Key from backend MongoDB Database
 */
export const fetchGeminiApiKey = async (forceRefresh = false) => {
  if (cachedGeminiApiKey && !forceRefresh) {
    return cachedGeminiApiKey;
  }

  try {
    const res = await api.getGeminiApiKey();
    if (res?.data?.apiKey) {
      cachedGeminiApiKey = res.data.apiKey.trim();
      return cachedGeminiApiKey;
    }
  } catch (error) {
    console.warn("⚠️ [AgriAssure AI] Failed to fetch API key from backend DB, checking fallback:", error?.message || error);
  }

  return "";
};

// System knowledge base for AgriAssure
const SYSTEM_KNOWLEDGE = `
You are "AgriAssure AI" (कृषि आश्वासन एआई सहायक), an intelligent AI assistant for AgriAssure - a transparent contract farming & escrow payment platform connecting farmers directly with buyers in India.

Core Capabilities & Knowledge Base:
1. MARKETPLACE (मंडी / बाज़ार): Farmers list harvested or upcoming crops (Wheat, Soybean, Mustard, Rice, Onion, etc.) with price per Quintal, location, quantity, and quality grade. Buyers can search, filter by state/price/quality, bookmark crops, and send custom purchase proposals.
2. CONTRACT MANAGEMENT (अनुबंध प्रबंधन): Digital contract agreements with price negotiation options. When a farmer accepts a buyer's offer, a legal digital contract is generated.
3. ESCROW PAYMENTS (एस्क्रो सुरक्षा): Buyer funds are deposited securely into Razorpay Escrow before delivery. Funds are safely held until crop delivery conditions & quality specifications are verified by the buyer.
4. MANDI RATES (मंडी भाव): Real-time tracking of crop market rates across Indian states (MP, UP, Rajasthan, Maharashtra, Punjab) to aid fair pricing decisions.
5. DELIVERY & ORDER TRACKING (डिलीवरी ट्रैकिंग): Step-by-step milestone tracking from farm pickup to destination warehouse, status updates, and automated escrow release.
`;

/**
 * Generate System Prompt based on selected user language and role
 */
export const buildSystemInstruction = (language = "English", role = "Explorer") => {
  let langGuidance = "";
  if (language === "Hindi" || language === "हिंदी") {
    langGuidance = "Respond politely and naturally in simple, clear Hindi (हिन्दी / देवनागरी लिपि). Use easy agricultural terms.";
  } else if (language === "Hinglish") {
    langGuidance = "Respond in conversational Hinglish (Hindi mixed with English using Roman script e.g. 'Aap AgriAssure par crops easily list kar sakte hain'). Keep it friendly and concise.";
  } else {
    langGuidance = "Respond in clear, professional English.";
  }

  let roleGuidance = "";
  if (role === "Farmer" || role === "किसान") {
    roleGuidance = "The user is a FARMER (किसान). Focus on guiding them on listing crops, receiving buyer proposals, negotiating fair prices, verifying delivery, and getting guaranteed escrow payment releases.";
  } else if (role === "Buyer" || role === "खरीदार") {
    roleGuidance = "The user is a BUYER (खरीदार / व्यापारी). Focus on helping them browse & filter crop listings, send custom counter-offers, deposit funds safely in Razorpay Escrow, and track delivery status.";
  } else {
    roleGuidance = "The user is EXPLORING (अन्वेषक). Provide concise high-level overviews of how AgriAssure eliminates middlemen, guarantees payment via Escrow, and simplifies contract farming.";
  }

  return `${SYSTEM_KNOWLEDGE}\n\nLanguage Preference: ${langGuidance}\nRole Persona: ${roleGuidance}\nKeep responses helpful, structured with bullet points or emojis where useful, and under 150 words unless detailed explanation is requested.`;
};

/**
 * Fallback Intelligent Response Engine (when API key is not present or offline)
 */
const getFallbackResponse = (userMessage, language, role) => {
  const query = userMessage.toLowerCase();
  const isHindi = language === "Hindi" || language === "हिंदी";
  const isHinglish = language === "Hinglish";

  if (query.includes("escrow") || query.includes("payment") || query.includes("पेमेंट") || query.includes("सुरक्षा")) {
    if (isHindi) {
      return "💰 **एस्क्रो भुगतान सुरक्षा (Escrow Payments)**:\n• खरीदार की राशि रेज़रपे (Razorpay) एस्क्रो खाते में सुरक्षित रखी जाती है।\n• डिलीवरी पूरी होने और फसल की गुणवत्ता जांच के बाद ही भुगतान किसान के खाते में स्थानांतरित किया जाता है।\n• इससे धोखाधड़ी की कोई संभावना नहीं रहती!";
    }
    if (isHinglish) {
      return "💰 **Escrow Security in AgriAssure**:\n• Buyer ka payment Razorpay Escrow me securely hold rehta hai.\n• Crop delivery aur quality verification ke baad hi payment Farmer ke account me release hota hai.\n• Both farmer and buyer 100% safe rehte hain!";
    }
    return "💰 **AgriAssure Escrow Payment Protection**:\n• Buyer payments are held securely in Razorpay Escrow during contract fulfillment.\n• Funds are automatically released to the farmer once delivery and quality checks pass.\n• 100% risk-free trade guarantee!";
  }

  if (query.includes("market") || query.includes("crop") || query.includes("listing") || query.includes("फसल") || query.includes("बेचना")) {
    if (isHindi) {
      return "🌾 **मार्केटप्लेस और फसल बिक्री**:\n• किसान अपनी फसल (गेहूं, सोयाबीन, सरसों आदि) की मात्रा, दर और गुणवत्ता की जानकारी के साथ लिस्ट कर सकते हैं।\n• खरीदार आसानी से फ़िल्टर करके देख सकते हैं और सीधे 'Make Offer' भेज सकते हैं।";
    }
    if (isHinglish) {
      return "🌾 **Marketplace Guide**:\n• Farmers apni crop, quantity, quality grade aur price ke saath list kar sakte hain.\n• Buyers search & filter karke direct proposal / offer bhej sakte hain.";
    }
    return "🌾 **AgriAssure Marketplace**:\n• Farmers post crop availability with quantity, location, and price per Quintal.\n• Buyers filter by crop, state, or price and click **Make Offer** to initiate digital contracts.";
  }

  if (query.includes("mandi") || query.includes("rate") || query.includes("भाव") || query.includes("कीमत")) {
    if (isHindi) {
      return "📊 **मंडी भाव जानकारी**:\n• AgriAssure पर आप एमपी, यूपी, राजस्थान आदि राज्यों के ताज़ा मंडी भाव देख सकते हैं।\n• इससे किसान और खरीदार सही मूल्य पर अनुबंध कर पाते हैं।";
    }
    if (isHinglish) {
      return "📊 **Mandi Rates Information**:\n• Aap top nav me 'Mandi Rates' par click karke Madhya Pradesh, UP, Rajasthan ke live rates dekh sakte hain.";
    }
    return "📊 **Real-time Mandi Rates**:\n• Track current crop prices across major Indian states via the **Mandi Rates** tab in the main navigation bar to make informed pricing proposals.";
  }

  // General default fallback
  if (isHindi) {
    return `🌾 **नमस्कार! मैं एग्रीएश्योर एआई सहायक हूँ।**\nमैं अनुबंध खेती (Contract Farming), एस्क्रो भुगतान, मंडी भाव और खरीदार/किसान प्रस्तावों में आपकी मदद कर सकता हूँ।\nआप मुझसे कुछ भी पूछ सकते हैं!`;
  }
  if (isHinglish) {
    return `🌾 **Namaste! Main AgriAssure AI Assistant hu.**\nAap contract farming, Razorpay Escrow, crop listings, ya proposals ke baare me koi bhi sawaal pooch sakte hain!`;
  }
  return `🌾 **Hello! I am your AgriAssure AI Assistant.**\nI can help you navigate contract farming, Razorpay Escrow security, marketplace crop proposals, and real-time Mandi rates. How can I assist you today?`;
};

/**
 * Call Gemini AI using SDK & Direct REST API with full debugging console logs
 */
export const askGeminiAI = async (messagesHistory, userMessage, language = "English", role = "Explorer") => {
  // Retrieve API Key dynamically from backend MongoDB database
  const apiKey = (await fetchGeminiApiKey()) || "";
  const systemInstructionText = buildSystemInstruction(language, role);



  if (!apiKey || apiKey.includes("YOUR_")) {
   // console.warn("⚠️ [AgriAssure AI Debug] No VITE_GEMINI_API_KEY provided in .env. Using AgriAssure Knowledge Engine.");
    await new Promise((res) => setTimeout(res, 600));
    const fallbackAnswer = getFallbackResponse(userMessage, language, role);
   // console.log("ℹ️ [AgriAssure AI Debug] Fallback Answer:", fallbackAnswer);
    return fallbackAnswer;
  }

  // Method 1: Try Official @google/genai SDK
  try {
   // console.log("🚀 [AgriAssure AI Debug] Attempting @google/genai SDK call...");
    const ai = new GoogleGenAI({ apiKey });

    const contents = [];
    messagesHistory.forEach((msg) => {
      if (msg.sender === "user" || msg.sender === "bot") {
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      }
    });
    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    for (const modelName of CANDIDATE_MODELS) {
      try {
     //   console.log(`🤖 [AgriAssure AI Debug] Trying model via SDK: ${modelName}`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: systemInstructionText,
            temperature: 0.7,
            maxOutputTokens: 400,
          },
        });

        if (response && response.text) {
        //  console.log(`✅ [AgriAssure AI Debug] SDK Success with model ${modelName}! Output:`, response.text);
          return response.text;
        }
      } catch (sdkModelErr) {
        console.warn(`⚠️ [AgriAssure AI Debug] SDK call to ${modelName} failed:`, sdkModelErr?.message || sdkModelErr);
      }
    }
  } catch (sdkInitErr) {
    console.warn("⚠️ [AgriAssure AI Debug] SDK initialization failed:", sdkInitErr);
  }

  // Method 2: Direct REST API Endpoint Fallback with Detailed Console Error Logging
  console.log("📡 [AgriAssure AI Debug] Fallback to direct Gemini REST API calls...");
  
  const formattedContents = [];
  messagesHistory.forEach((msg) => {
    if (msg.sender === "user" || msg.sender === "bot") {
      formattedContents.push({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    }
  });
  formattedContents.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  const restPayload = {
    system_instruction: {
      parts: [{ text: systemInstructionText }],
    },
    contents: formattedContents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 400,
    },
  };

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
     // console.log(`📡 [AgriAssure AI Debug] Fetching REST API: ${restUrl}`);

      const response = await fetch(restUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(restPayload),
      });

   //   console.log(`📡 [AgriAssure AI Debug] REST Response Status for ${modelName}:`, response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
      //  console.log(`✅ [AgriAssure AI Debug] REST API JSON Data:`, data);
        const botText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (botText) {
       //   console.log(`✅ [AgriAssure AI Debug] Successfully generated text!`);
          return botText;
        }
      } else {
        const errJson = await response.json().catch(() => ({}));
        console.error(`❌ [AgriAssure AI Debug] Gemini REST API Error for ${modelName}:`, {
          status: response.status,
          statusText: response.statusText,
          errorDetails: errJson,
        });
      }
    } catch (restErr) {
      console.error(`❌ [AgriAssure AI Debug] REST Fetch Exception for ${modelName}:`, restErr);
    }
  }

  // If all API calls fail, log error and return knowledge engine response
 // console.info("ℹ️ [AgriAssure AI Debug] API calls unsuccessful. Delivering AgriAssure Intelligent Knowledge response.");
  const finalFallback = getFallbackResponse(userMessage, language, role);
 // console.log("ℹ️ [AgriAssure AI Debug] Final Output Delivered to UI:", finalFallback);
  return finalFallback;
};

const Config = require("../models/Config");

/**
 * Retrieve Gemini API Key from Database
 */
exports.getGeminiKey = async (req, res) => {
  try {
    // 1. Search in MongoDB Database first
    let configDoc = await Config.findOne({ key: "GEMINI_API_KEY" });

    // 2. Fallback to process.env if not in DB yet
    let apiKey = configDoc ? configDoc.value : (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "");

    // 3. Auto-seed into DB if found in env but not in DB
    if (!configDoc && apiKey) {
      try {
        await Config.create({
          key: "GEMINI_API_KEY",
          value: apiKey,
          description: "Google Gemini AI API Key for AgriAssure Assistant",
        });
        console.log("🌱 [Config] Seeded Gemini API key into database");
      } catch (seedErr) {
        // Ignore duplicate key error during race conditions
      }
    }

    return res.status(200).json({
      success: true,
      apiKey: apiKey || "",
      source: configDoc ? "database" : "environment",
    });
  } catch (error) {
    console.error("❌ [Config Controller] Error fetching Gemini API key:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Gemini API key from database",
      apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "",
    });
  }
};

/**
 * Update or Save Gemini API Key to Database
 */
exports.setGeminiKey = async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid apiKey string is required in request body",
      });
    }

    const configDoc = await Config.findOneAndUpdate(
      { key: "GEMINI_API_KEY" },
      {
        key: "GEMINI_API_KEY",
        value: apiKey.trim(),
        description: "Google Gemini AI API Key for AgriAssure Assistant",
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Gemini API key saved to database successfully",
      config: configDoc,
    });
  } catch (error) {
    console.error("❌ [Config Controller] Error saving Gemini API key:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save Gemini API key to database",
    });
  }
};

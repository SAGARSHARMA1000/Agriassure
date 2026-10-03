const express = require("express");
const router = express.Router();
const { getGeminiKey, setGeminiKey } = require("../controllers/configController");

router.get("/gemini-key", getGeminiKey);
router.post("/gemini-key", setGeminiKey);

module.exports = router;

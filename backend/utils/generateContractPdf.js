
const PDFDocument = require("pdfkit");
const cloudinary = require("../config/Cloudinary");
const streamifier = require("streamifier");
const axios = require("axios");

module.exports = async function generatePdf(contract) {
  try {
    const doc = new PDFDocument({ margin: 50 });

    let buffers = [];
    doc.on("data", (data) => buffers.push(data));

    /* ---------------- SAFE EXTRACTION ---------------- */

    const buyerName =
      contract.signatures?.buyerName ||
      contract.buyerName ||
      "N/A";

    const farmerName =
      contract.signatures?.farmerName ||
      contract.farmerName ||
      "N/A";

    const commodity =
      contract.cropDetails?.name || contract.commodity || "N/A";

    const quantity =
      contract.cropDetails?.quantity || contract.quantity || "N/A";

    const price =
      contract.cropDetails?.pricePerQuintal ||
      contract.offerPrice ||
      "N/A";

    const location =
      contract.delivery?.location || contract.deliveryAddress || "N/A";

    const deliveryDate =
      contract.delivery?.deadline ||
      contract.pickupDate ||
      "N/A";

    const createdDate = contract.createdAt
      ? new Date(contract.createdAt).toDateString()
      : new Date().toDateString();

    /* ---------------- DOWNLOAD SIGNATURES FIRST ---------------- */

    let buyerImageBuffer = null;
    let farmerImageBuffer = null;

    if (contract.signatures?.buyerSignatureUrl) {
      try {
        const response = await axios.get(
          contract.signatures.buyerSignatureUrl,
          { responseType: "arraybuffer" }
        );
        buyerImageBuffer = Buffer.from(response.data);
      } catch (err) {
        console.error("Buyer sign image error:", err.message);
      }
    }

    if (contract.signatures?.farmerSignatureUrl) {
      try {
        const response = await axios.get(
          contract.signatures.farmerSignatureUrl,
          { responseType: "arraybuffer" }
        );
        farmerImageBuffer = Buffer.from(response.data);
      } catch (err) {
        console.error("Farmer sign image error:", err.message);
      }
    }

    /* ---------------- TITLE ---------------- */

    doc.fontSize(18)
      .font("Times-Bold")
      .text("CONTRACT FARMING AGREEMENT", { align: "center" });

    doc.moveDown(1.5);

    doc.fontSize(10)
      .font("Times-Roman")
      .text(`Agreement ID: ${contract._id}`, { align: "center" })
      .text(`Date: ${createdDate}`, { align: "center" });

    doc.moveDown(2);

    /* ---------------- INTRO ---------------- */

    doc.fontSize(12)
      .text(
        `This Contract Farming Agreement is entered into on ${createdDate}, between:`
      );

    doc.moveDown();

    doc.font("Times-Bold").text("Buyer (First Party)");
    doc.font("Times-Roman").text(buyerName);

    doc.moveDown();

    doc.font("Times-Bold").text("Farmer (Second Party)");
    doc.font("Times-Roman").text(farmerName);

    doc.moveDown(2);

    /* ---------------- SECTION 1 ---------------- */

    doc.font("Times-Bold").text("1. Crop & Price Specifications");
    doc.moveDown(0.5);
    doc.font("Times-Roman").text(`• Crop: ${commodity}`);
    doc.text(`• Quantity: ${quantity}`);
    doc.text(`• Agreed Price: ₹${price} per unit`);

    doc.moveDown();

    /* ---------------- SECTION 2 ---------------- */

    doc.font("Times-Bold").text("2. Delivery Terms");
    doc.moveDown(0.5);
    doc.font("Times-Roman").text(`• Delivery Location: ${location}`);
    doc.text(`• Delivery Deadline: ${deliveryDate}`);

    doc.moveDown();

    /* ---------------- SIGNATURES ---------------- */

    doc.moveDown(2);

    doc.font("Times-Bold").text("IN WITNESS WHEREOF,", { align: "left" });
    doc.font("Times-Roman").text(
      "the parties have digitally signed this Agreement on the Agriassure platform."
    );

    doc.moveDown(2);

    // BUYER SIGNATURE
    doc.font("Times-Bold").text("Buyer Signature");

    if (buyerImageBuffer) {
      doc.image(buyerImageBuffer, { width: 120 });
    }

    doc.font("Times-Roman").text(`Name: ${buyerName}`);
    doc.moveDown();

    // FARMER SIGNATURE
    doc.font("Times-Bold").text("Farmer Signature");

    if (farmerImageBuffer) {
      doc.image(farmerImageBuffer, { width: 120 });
    }

    doc.font("Times-Roman").text(`Name: ${farmerName}`);

    doc.moveDown(2);

    doc.fontSize(9)
      .fillColor("gray")
      .text(
        "This document is digitally generated and valid without physical signature.",
        { align: "center" }
      );

    doc.end();

    /* ---------------- WAIT FOR PDF BUFFER ---------------- */

    const pdfBuffer = await new Promise((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);
    });

    /* ---------------- UPLOAD TO CLOUDINARY ---------------- */

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "agriassure/contracts",
          resource_type: "auto",
          public_id: `contract-${contract._id}`,
          format: "pdf",
          overwrite: true,
          type: "upload",   
          access_mode: "public",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
    });

    return uploadResult.secure_url;

  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
};
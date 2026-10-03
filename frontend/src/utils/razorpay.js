import api from "../services/api";

/**
 * Dynamically loads the official Razorpay checkout.js script
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay Checkout SDK");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Initiates real Razorpay checkout in Test Mode
 * @param {Object} params
 * @param {Object} params.contract Contract details
 * @param {Object} params.user Active buyer user
 * @param {number} params.amount Total payable in INR
 * @param {Function} params.onSuccess Callback with razorpay response
 * @param {Function} params.onFailure Optional error callback
 */
export const openRazorpayCheckout = async ({
  contract,
  user,
  amount,
  onSuccess,
  onFailure,
}) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    alert("Razorpay checkout failed to load. Please check your internet connection.");
    if (onFailure) onFailure(new Error("SDK load failed"));
    return;
  }

  try {
    // 1. Create real order on backend
    const orderRes = await api.createRazorpayOrder({
      amount,
      contractId: contract._id,
      currency: "INR",
    });

    const { orderId, amount: amountInPaise, currency, key } = orderRes.data;
    const razorpayKey =
      key || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_t4LUM04KXw6wHc";

    const options = {
      key: razorpayKey,
      amount: amountInPaise,
      currency: currency || "INR",
      name: "AgriAssure Escrow Vault",
      description: `Escrow Protection for ${contract.commodity} (${contract.quantity} ${contract.unit || "Quintal"})`,
      image:
        "https://res.cloudinary.com/dtbuqsryl/image/upload/v1771403701/Gemini_Generated_Image_ltuieeltuieeltui_bnu3ct.png",
      order_id: orderId,
      handler: async function (response) {
        if (onSuccess) {
          await onSuccess(response);
        }
      },
      prefill: {
        name: user?.name || contract.buyerName || "Verified Buyer",
        email: user?.email || "buyer@agriassure.in",
        contact: user?.phone || "9876543210",
      },
      notes: {
        contractId: contract._id,
        commodity: contract.commodity,
        farmerName: contract.farmerName,
        farmerId: contract.farmerId,
        buyerId: user?.id || contract.buyerId,
      },
      theme: {
        color: "#059669", // emerald-600
      },
      modal: {
        ondismiss: function () {
          if (onFailure) onFailure(new Error("Payment window closed"));
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      console.error("Razorpay payment failed:", response.error);
      alert(
        `Payment Failed: ${
          response.error.description ||
          response.error.reason ||
          "Transaction was declined"
        }`
      );
      if (onFailure) onFailure(response.error);
    });

    rzp.open();
  } catch (err) {
    console.error("Failed to initiate Razorpay checkout:", err);
    alert(
      err?.response?.data?.message ||
        "Failed to initiate Razorpay payment order. Please try again."
    );
    if (onFailure) onFailure(err);
  }
};

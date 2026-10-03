import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const instance = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Example endpoints used by frontend. Adjust to your MVC backend routes.
export default {
  register: (payload) => instance.post("/api/auth/register", payload),
  login: (payload) => instance.post("/api/auth/login", payload),

  createListing: (payload) =>
    instance.post("/api/listings", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  //createListing: (payload) => instance.post("/api/listings", payload),
  updateListing: (id, payload) => instance.put(`/api/listings/${id}`, payload),
  deleteListing: (id) => instance.delete(`/api/listings/${id}`),
  getFarmerListings: (farmerId, farmerName) =>
    instance.get("/api/listings/farmer", {
      params: { farmerId, farmerName },
    }),
  getAllListings: () => instance.get("/api/listings"),

  /* ---------- PROPOSALS ---------- */

  // buyer → farmer
  createProposal: (payload) => instance.post("/api/proposals", payload),

  // farmer dashboard
  // getFarmerProposals: (farmerName) =>
  //   instance.get(`/api/proposals?farmerName=${encodeURIComponent(farmerName).trim()}`),
  getFarmerProposals: (farmerName) => {
    //console.log("📤 Sending farmerName to API:", farmerName); // LOG 4
    return instance.get(
      `/api/proposals?farmerName=${encodeURIComponent(farmerName.trim())}`,
    );
  },

  // 🔄 UPDATE PROPOSAL STATUS (farmer accept / reject)
  updateProposalStatus: (proposalId, status) =>
    instance.patch(`/api/proposals/${proposalId}/status`, {
      status,
    }),

  // buyer dashboard
  getBuyerProposals: (buyerId) =>
    instance.get(`/api/proposals?buyerId=${buyerId}`),

  getAllProposals: () => instance.get("/api/proposals/pro"),

  acceptProposal: (proposalId) =>
    instance.post(`api/proposals/${proposalId}/createContract`),

  // signContract: (contractId, signer) => instance.post(`/api/contracts/${contractId}/sign`, { signer }),
  // depositEscrow: (contractId, payload) => instance.post(`/api/contracts/${contractId}/deposit`, payload),
  fetchListings: () => instance.get("/api/listings"),
  // fetchProposals: () => instance.get("/api/proposals"),

  /* CONTRACTS */
  getContractByProposal: (proposalId) =>
    instance.get(`/api/contracts/proposal/${proposalId}`),

  // buyerSignContract: (contractId, payload) =>
  // instance.post(`/api/contracts/${contractId}/buyer-sign`, payload),

  buyerSignContract: (contractId, payload) =>
    instance.post(`/api/contracts/${contractId}/buyer-sign`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getFarmerContracts: (farmerId) =>
    instance.get(`/api/contracts/farmer/${farmerId}`),

  // farmerSignContract: (contractId, formData) =>
  // instance.post(`/api/contracts/${contractId}/farmer-sign`, formData)
  farmerSignContract: (contractId, formData) =>
    instance.post(`/api/contracts/${contractId}/farmer-sign`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  getContractById: (contractId) => instance.get(`/api/contracts/${contractId}`),
  rejectContract: (contractId) =>
    instance.post(`/api/contracts/${contractId}/reject`),

  getBuyerContracts: (buyerId) =>
    instance.get(`/api/contracts/buyer/${buyerId}`),

  /* ---------- ESCROW ---------- */
  createRazorpayOrder: (payload) =>
    instance.post("/api/escrow/create-order", payload),

  getBuyerEscrowDashboard: (buyerId) =>
    instance.get(`/api/escrow/dashboard/${buyerId}`),

  getBuyerEscrows: (buyerId) => instance.get(`/api/escrow/buyer/v1/${buyerId}`),

  getBuyerPaymentDetails: (buyerId) =>
    instance.get(`/api/escrow/buyer/${buyerId}`),

  depositEscrow: (payload) => instance.post("/api/escrow/deposit", payload),
  //farmer
  getFarmerEscrowDashboard: (farmerId) =>
    instance.get(`/api/escrow/farmer/${farmerId}`),
  requestFarmerPayout: (payload) =>
    instance.post("/api/escrow/farmer/payout", payload),

  /* ================= DELIVERY ================= */
  getFarmerDeliveries: (farmerId) =>
    instance.get(`/api/delivery/farmer/${farmerId}`),

  getBuyerDeliveries: (buyerId) =>
    instance.get(`/api/delivery/buyer/${buyerId}`),

  confirmBuyerDelivery: (deliveryId) =>
    instance.post(`/api/delivery/buyer/confirm`, { deliveryId }),

  reportDeliveryIssue: (deliveryId, description) =>
    instance.post(`/api/delivery/buyer/report-issue`, {
      deliveryId,
      description,
    }),

  /* ================= ADMIN DELIVERY ================= */

  getAllDeliveries: () => instance.get("/api/delivery/admin/all"),

  schedulePickup: (deliveryId) =>
    instance.post("/api/delivery/admin/schedule-pickup", { deliveryId }),

  collectFromFarmer: (deliveryId) =>
    instance.post("/api/delivery/admin/collected", { deliveryId }),

  markInTransit: (deliveryId) =>
    instance.post("/api/delivery/admin/in-transit", { deliveryId }),

  markDeliveredToBuyer: (deliveryId) =>
    instance.post("/api/delivery/admin/delivered", { deliveryId }),

  /* ================= CONFIG / AI ================= */
  getGeminiApiKey: () => instance.get("/api/config/gemini-key"),
  setGeminiApiKey: (apiKey) => instance.post("/api/config/gemini-key", { apiKey }),
};


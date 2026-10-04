# 🌾 AgriAssure

### Assured Contract Farming System for Stable Market Access

> **AgriAssure** is a full-stack MERN-based contract farming platform that connects **farmers and buyers** through secure contracts, price negotiation, escrow-based payments, crop listings, delivery tracking, and transparent transaction management.

---

## 📸 Screenshots

> Replace the empty URLs below with your actual screenshot URLs.

### 🏠 Landing Page
(screenshots/landingpage.png)



---

### 🛒 Marketplace
(screenshots/marketplace.png)


---

### 👨‍🌾 Farmer Dashboard
(screenshots/farmerDashboard.png)


---

### 🏢 Buyer Dashboard
(screenshots/buyerDashboard.png)



---

### 📄 Contract Management
(screenshots/contract.png)



---

### 💰 Escrow Payment
(screenshots/escrow.png)


---

### 📊 Payment Dashboard
(screenshots/paymentDashboard.png)



---

### 🤖 AI Chatbot
(screenshots/chatbot.png)



---

## 🔗 Project Links

| Resource             | Link                                 |
| -------------------- | ------------------------------------ |
| 🌐 Live Demo         | `https://agriassure-beta.vercel.app`|
| 💻 GitHub Repository | `https://github.com/SAGARSHARMA1000/Agriassure` |
| 🎥 Demo Video        | ``|

---

# 📌 About The Project

Traditional agricultural markets often expose farmers to problems such as:

- Unstable crop prices
- Uncertain buyers
- Delayed payments
- Lack of transparent agreements
- Limited access to reliable market information
- Difficulties in managing contracts and deliveries

**AgriAssure** addresses these challenges by providing a digital platform where farmers and buyers can interact, negotiate crop prices, create contracts, make secure escrow payments, and track the complete transaction lifecycle.

The platform is designed around the concept of **contract farming**, where buyers and farmers agree on crop quantity, pricing, delivery conditions, and payment terms before the agricultural transaction takes place.

---

# 🎯 Problem Statement

Farmers frequently face uncertainty after producing their crops.

A farmer may:

1. Grow a crop without having a confirmed buyer.
2. Depend on local intermediaries.
3. Face unpredictable market prices.
4. Experience delayed or uncertain payments.
5. Have limited visibility into current mandi prices.

At the same time, buyers may struggle to:

- Find reliable farmers.
- Source specific crops and quantities.
- Manage multiple offers.
- Track contracts.
- Verify delivery status.
- Manage agricultural payments efficiently.

### 💡 AgriAssure Solution

AgriAssure creates a digital bridge between farmers and buyers.

```text
Farmer
   │
   ├── Create Crop Listing
   │
   ├── Receive Buyer Offers
   │
   ├── Negotiate Price
   │
   ▼
Contract Creation
   │
   ▼
Buyer Signs Contract
   │
   ▼
Escrow Payment
   │
   ▼
Farmer Delivers Crop
   │
   ▼
Delivery Confirmation
   │
   ▼
Payment Released
```

---

# 🚀 Key Features

## 👨‍🌾 Farmer Features

- Create crop listings
- Specify crop quantity and expected price
- Manage active listings
- Receive buyer proposals
- Accept or reject proposals
- Negotiate crop prices
- Create and manage contracts
- Upload digital signatures
- Track contract status
- Track payment status
- View locked escrow amount
- View released payments
- Monitor delivery status
- View mandi rates

---

## 🏢 Buyer Features

- Browse farmer crop listings
- Search available crops
- View crop details
- Send proposals to farmers
- Send multiple offers for suitable listings
- Negotiate prices
- Manage incoming/outgoing proposals
- View active contracts
- Sign contracts digitally
- Make escrow payments
- Track payment status
- Monitor delivery progress
- View transaction information

---

## 💰 Escrow Payment System

One of the core features of AgriAssure is the **escrow-based payment workflow**.

Instead of directly transferring money to the farmer immediately, the buyer deposits the agreed amount into the platform's payment system.

### Payment Flow

```text
Buyer
  │
  │ Payment
  ▼
Razorpay
  │
  │ Escrow Deposit
  ▼
AgriAssure
  │
  │ Funds Locked
  ▼
Escrow
  │
  │ Delivery Confirmed
  ▼
Payment Released
  │
  ▼
Farmer
```

### Payment States

The system supports payment states such as:

- `Pending`
- `Locked`
- `Released`

This provides better visibility for both parties throughout the transaction.

---

# 📄 Contract Management

AgriAssure allows buyers and farmers to create digital agricultural contracts.

A contract can contain:

- Farmer information
- Buyer information
- Crop details
- Quantity
- Agreed price
- Delivery terms
- Payment terms
- Contract status
- Buyer signature
- Farmer signature
- Escrow information

### Contract Lifecycle

```text
Proposal
   ↓
Negotiation
   ↓
Agreement
   ↓
Contract Draft
   ↓
Buyer Signature
   ↓
Farmer Signature
   ↓
Escrow Deposit
   ↓
Active Contract
   ↓
Delivery
   ↓
Payment Release
   ↓
Completed
```

---

# 🛒 Marketplace

The AgriAssure marketplace allows farmers to publish available crops and buyers to discover them.

### Marketplace capabilities

- Crop listings
- Crop search
- Category filtering
- Quantity information
- Expected price
- Farmer information
- Listing status
- Buyer proposals
- Negotiation support

---

# 📈 Mandi Rates

AgriAssure also provides mandi price information to help users make better decisions.

Users can explore:

- Crop prices
- State-wise rates
- Market information
- Crop-specific pricing

This gives farmers additional market context before negotiating contracts.

---

# 📊 Dashboards

AgriAssure provides role-based dashboards.

### Farmer Dashboard

```text
┌─────────────────────────────┐
│       Farmer Dashboard      │
├─────────────────────────────┤
│ Active Listings             │
│ Pending Proposals           │
│ Active Contracts            │
│ Escrow Locked               │
│ Released Payments           │
│ Delivery Status             │
└─────────────────────────────┘
```

### Buyer Dashboard

```text
┌─────────────────────────────┐
│        Buyer Dashboard      │
├─────────────────────────────┤
│ Crop Listings               │
│ Sent Proposals              │
│ Active Contracts            │
│ Pending Payments            │
│ Locked Escrow               │
│ Delivery Tracking           │
└─────────────────────────────┘
```

---

# 🤖 AI Chatbot

AgriAssure also includes an AI-powered chatbot designed specifically around the platform.

The chatbot can help users with questions related to:

- AgriAssure features
- Contracts
- Escrow payments
- Marketplace
- Proposals
- Crop listings
- Platform workflow
- General agricultural queries

The chatbot architecture is designed to allow integration with modern Generative AI APIs.

---

# 🧑‍💻 Technology Stack

## Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- JavaScript
- HTML5
- CSS3

## Backend

- Node.js
- Express.js
- REST APIs
- JWT-based authentication architecture
- Nodemailer / email services

## Database

- MongoDB
- MongoDB Atlas
- Mongoose

## Payments

- Razorpay

## Cloud & Deployment

- Vercel
- Render
- MongoDB Atlas
- Cloudinary

## Development Tools

- Git
- GitHub
- VS Code
- Postman

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      Frontend       │
                    │   React + Vite      │
                    │    Tailwind CSS     │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │       Backend       │
                    │ Node.js + Express.js│
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
        ┌─────────────┐ ┌────────────┐ ┌─────────────┐
        │   MongoDB   │ │  Razorpay  │ │ Cloudinary  │
        │   Database  │ │  Payments  │ │   Storage   │
        └─────────────┘ └────────────┘ └─────────────┘
                               │
                               ▼
                       Escrow Workflow
```

---

# 📁 Project Structure

```text
AgriAssure/
│
├── client/
│   │
│   ├── public/
│   │
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── context/
│       ├── hooks/
│       ├── services/
│       ├── utils/
│       ├── data/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   │
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

# 🗄️ Core Data Models

The application uses MongoDB with Mongoose models.

Major entities include:

### User

```text
User
├── name
├── email
├── role
├── profile
└── account information
```

### Listing

```text
Listing
├── farmer
├── crop
├── quantity
├── expectedPrice
├── location
├── status
└── negotiationAllowed
```

### Proposal

```text
Proposal
├── buyer
├── farmer
├── listing
├── offeredPrice
├── quantity
├── message
└── status
```

### Contract

```text
Contract
├── farmer
├── buyer
├── listing
├── crop
├── quantity
├── agreedPrice
├── buyerSignature
├── farmerSignature
├── deliveryStatus
└── contractStatus
```

### Escrow

```text
Escrow
├── contractId
├── buyerId
├── farmerId
├── amount
├── status
├── releaseCondition
└── depositedAt
```

---

# 🔄 Complete Application Workflow

## Step 1 — Farmer Creates Listing

The farmer creates a listing containing:

- Crop
- Quantity
- Expected price
- Location
- Negotiation preference

---

## Step 2 — Buyer Discovers Crop

The buyer browses the marketplace and finds a suitable crop.

---

## Step 3 — Buyer Sends Proposal

The buyer submits:

- Proposed quantity
- Offered price
- Message
- Other proposal details

---

## Step 4 — Negotiation

If negotiation is enabled, the buyer and farmer can negotiate the terms.

---

## Step 5 — Contract Creation

Once both parties agree, AgriAssure creates a contract.

---

## Step 6 — Digital Signatures

Both parties can provide their digital signatures.

---

## Step 7 — Escrow Payment

The buyer deposits the agreed amount through Razorpay.

The amount is recorded against the corresponding contract and becomes **locked in escrow**.

---

## Step 8 — Delivery

The farmer delivers the agreed crop.

The delivery status is updated by the appropriate workflow/admin controls.

---

## Step 9 — Payment Release

After delivery confirmation, the escrow amount can move from:

```text
Locked
   ↓
Released
```

The farmer can then receive the released amount through the platform's payout workflow.

---

# 🔐 Security Considerations

AgriAssure follows several security practices:

- Environment variables for sensitive credentials
- API-based backend architecture
- Role-based access control
- JWT authentication architecture
- Protected backend routes
- CORS configuration
- Secure payment gateway integration
- Server-side validation
- MongoDB schema validation
- Sensitive API keys kept outside the frontend

### Environment Variables

Never commit secrets such as:

```text
MONGODB_URI
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
JWT_SECRET
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
AI_API_KEY
```

Use a `.env` file locally.

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL

cd AgriAssure
```

---

## 2. Install Frontend Dependencies

```bash
cd client

npm install
```

---

## 3. Install Backend Dependencies

```bash
cd ../server

npm install
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

AI_API_KEY=your_ai_api_key
```

> ⚠️ Never push your `.env` file or API keys to GitHub.

---

# ▶️ Running the Application

## Start Backend

```bash
cd server

npm run dev
```

Backend:

```text
http://localhost:5000
```

---

## Start Frontend

Open another terminal:

```bash
cd client

npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🧪 API Testing

The backend APIs can be tested using **Postman**.

Example API categories:

```text
/api/auth
/api/users
/api/listings
/api/proposals
/api/contracts
/api/escrow
/api/payments
/api/mandi
```

---

# 💳 Payment Architecture

AgriAssure uses Razorpay for payment processing.

### Buyer Payment

```text
Buyer
   ↓
Create Payment Order
   ↓
Razorpay Checkout
   ↓
Payment Verification
   ↓
Create Escrow Record
   ↓
Escrow = Locked
```

### Delivery & Release

```text
Crop Delivered
      ↓
Delivery Confirmed
      ↓
Escrow Release
      ↓
Farmer Receives Funds
```

> **Note:** In production, actual fund custody, escrow handling, payouts, compliance, KYC, refunds, disputes, and payment settlement must follow the payment provider's supported architecture and applicable regulations.

---

# 🌱 Why AgriAssure?

AgriAssure aims to create a more structured digital workflow for agricultural transactions.

### For Farmers

✅ Better market access
✅ Pre-agreed prices
✅ Digital contracts
✅ Transparent payment status
✅ Reduced payment uncertainty

### For Buyers

✅ Easier farmer discovery
✅ Structured proposals
✅ Negotiation support
✅ Digital contracts
✅ Payment tracking

### For Both

✅ Transparent workflow
✅ Digital documentation
✅ Centralized transaction management
✅ Delivery tracking
✅ Escrow-based payment concept

---

# 🎨 UI / UX

AgriAssure follows a modern agricultural technology design system.

### Design Principles

- 🌿 Green agricultural color palette
- 🪟 Glassmorphism
- 📱 Responsive design
- ✨ Smooth animations
- 🎯 Clear CTAs
- 📊 Dashboard-oriented layouts
- 🧩 Reusable components
- 💻 Desktop and mobile friendly interfaces

---

# 📱 Responsive Design

The application is designed to work across:

- 💻 Desktop
- 💻 Laptop
- 📱 Tablet
- 📱 Mobile

---

# 🧠 Future Improvements

Potential future improvements include:

- [ ] Real farmer/buyer authentication
- [ ] Complete production-grade KYC
- [ ] Real-time notifications
- [ ] Advanced contract generation
- [ ] Automated escrow release
- [ ] Production payout integration
- [ ] Dispute management system
- [ ] Crop quality verification
- [ ] AI-powered crop recommendations
- [ ] AI-based price prediction
- [ ] Weather integration
- [ ] Agricultural news
- [ ] Multilingual support
- [ ] Regional language chatbot
- [ ] Mobile application
- [ ] Blockchain-based contract verification
- [ ] Advanced analytics
- [ ] Fraud detection
- [ ] Real-time delivery tracking

---

# 🏆 Project Highlights

- 🌾 Contract farming marketplace
- 🤝 Farmer–buyer communication
- 💰 Escrow payment workflow
- 📄 Digital contract management
- ✍️ Digital signatures
- 🛒 Agricultural marketplace
- 📈 Mandi price information
- 📊 Role-based dashboards
- 🤖 AI chatbot integration
- ☁️ Cloud-based image/document storage
- 📱 Responsive UI
- 🔐 Secure backend architecture

---

# 🧑‍💻 Development Approach

AgriAssure was developed using a modular full-stack architecture.

The project focuses on:

```text
Reusable Components
        +
REST APIs
        +
Database Modeling
        +
Payment Integration
        +
Role-Based Workflows
        +
Responsive UI
        +
Cloud Services
```

This architecture makes the application easier to maintain, extend, and deploy.

---

# 🛠️ Troubleshooting

### MongoDB Connection Error

Check:

```env
MONGODB_URI
```

and verify that your IP/network is allowed in MongoDB Atlas.

---

### CORS Error

Verify the frontend URL configured in the backend CORS settings.

For example:

```text
http://localhost:5173
```

and your production Vercel URL.

---

### Razorpay Error

Check:

```env
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

Make sure the correct test/live credentials are being used.

---

### Cloudinary Upload Error

Verify:

```env
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

---

# 📚 Learning Outcomes

Building AgriAssure provided practical experience in:

- Full-stack MERN development
- REST API design
- MongoDB data modeling
- Mongoose relationships
- Authentication architecture
- Role-based application design
- Payment gateway integration
- Escrow workflow design
- Cloud storage
- API security
- Responsive UI development
- Deployment
- Git/GitHub workflows
- Real-world business logic

---

# 👨‍💻 Author

## Sagar Sharma

**Full Stack Developer | MERN Stack | AI-integrated Applications**

📍 Bhopal, Madhya Pradesh, India

### Skills

```text
React.js
Next.js
Node.js
Express.js
MongoDB
JavaScript
Tailwind CSS
REST APIs
JWT
Razorpay
Cloudinary
Git
GitHub
Generative AI
RAG
LangChain.js
```

### Connect

- 💼 LinkedIn: `https://www.linkedin.com/in/sagar-sharma-751943336`
- 🐙 GitHub: `https://github.com/SAGARSHARMA1000/`
- 🌐 Portfolio: `https://sagar-sharma-portfolio-six.vercel.app`
- 📧 Email: `sagar09shrm@gmail.com`

---

# 📄 License

This project is developed for educational, portfolio, and demonstration purposes.

Add your preferred license here, for example:

```text
MIT License
```

---

# ⭐ Support

If you find **AgriAssure** interesting:

⭐ Star the repository
🍴 Fork the project
🐛 Report issues
💡 Suggest improvements
🤝 Contribute to the project

---

## 🌾 AgriAssure

> **From Farm to Market — Building a More Assured Agricultural Future.**

**Secure Contracts • Transparent Payments • Better Market Access**

# Agent Aura 🔮

**Agent Aura** is an on-chain personality reading service. It analyzes an Ethereum wallet's transaction history and distills it into a beautifully designed, personalized SVG card representing the wallet's unique "Aura" (Archetype). 

Built as an Agentic System Protocol (ASP) designed for marketplace integration, Agent Aura allows anyone to enter a wallet address (yours, your friend's, or a famous whale's) and instantly reveal its true nature.

## 🌟 The Vision
In the web3 ecosystem, wallets are more than just addresses—they are identities. Agent Aura brings these identities to life by extracting key behavioral signals from the blockchain (wallet age, transaction volume, risk tolerance, and network interactions) and mapping them to deterministic, beautifully crafted archetypes like *The Seedling*, *Yield Alchemist*, or *Gas Martyr*.

Our core viral mechanic relies on simplicity: **No signatures, no permissions, just pure on-chain observation.**

## 🛠 Architecture & Flow
Agent Aura is designed to be lightweight, deterministic, and easily integrable as a microservice.

1. **User Input:** A user submits any 0x... wallet address via the minimalist frontend.
2. **On-Chain Signal Extraction:** The Express.js backend securely queries Etherscan to fetch the wallet's historical transaction data.
3. **Deterministic Mapping:** The `engine.js` processes these signals (Tx count, wallet age, interaction diversity) to deterministically assign an Archetype and tailored reading.
4. **Dynamic SVG Generation:** The `cardRenderer.js` builds a fully self-contained, beautifully styled SVG card on the fly.
5. **Delivery:** The frontend displays the Aura card, ready to be shared or screenshot for social media.

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v16+)
- Etherscan API Key (Free tier works perfectly)

### Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone https://github.com/syther069/Agent-Aura.git
   cd Agent-Aura
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Etherscan API key:
   ```env
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   PORT=3000
   ```
4. **Start the server:**
   ```bash
   node src/index.js
   ```
5. **View the App:**
   Open `http://localhost:3000` in your browser.

## 💎 Design Philosophy
Agent Aura embraces a restrained, editorial aesthetic. We intentionally avoid scattered micro-animations or generic "AI sparkles" in favor of intentional, high-contrast typography and clean lines. The result is a premium, timeless feel that elevates the generated SVG card as the centerpiece of the experience.

## 📦 Deployment & Marketplace Integration
The service is fully stateless and can be deployed instantly to Vercel (via the included `vercel.json`) or any Node.js hosting provider. As an ASP, the `/aura` endpoint is fully compliant with marketplace specs, returning both the structured JSON data and the generated `card_image_base64`.

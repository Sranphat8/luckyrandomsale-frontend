# Lucky Random Sale - Web3 E-Commerce 🛒💎
<img width="1920" height="991" alt="image" src="https://github.com/user-attachments/assets/9715e6e2-2fd3-4001-a155-6a61dec1bfc4" />


An innovative Web3 shopping experience where customers can win exclusive products at promotional prices through a transparent, blockchain-powered random selection system.

---

## ✨ Key Features & Technical Highlights

- **MetaMask Integration**: Seamlessly connect and interact with the **MetaMask** wallet. Handles account switching and network changes automatically to maintain data integrity.
- **Web3 Provider (Ethers.js v6)**: Advanced interaction with Ethereum-compatible networks, utilizing modern provider patterns for stable blockchain communication.
- **On-Chain Randomness**: All winner selections are handled via Smart Contract logic, ensuring a fair and verifiable "Lucky Draw" process.
- **Secure Claim System**: Integrates a `payAndClaim` function that requires both the item's lucky price (in ETH) and a hashed shipping address for privacy and security.
- **Apple-Style UI**: A clean, minimalist interface built with **Tailwind CSS 4**, featuring glassmorphism and smooth animations for a premium feel.
- **Transaction Feedback**: Real-time transaction monitoring with **SweetAlert2** modals and celebration effects using **Canvas-Confetti**.

---

## 🛠️ Tech Stack

### Frontend & UI
- **Framework**: React 19, Vite
- **Styling**: Tailwind CSS 4, DaisyUI
- **Feedback**: SweetAlert2, Canvas-Confetti

### Blockchain & Web3
- **Wallet**: MetaMask (Injected Provider)
- **Library**: Ethers.js v6
- **Smart Contract**: Solidity (EVM Compatible)

---

## 🏗️ Technical Architecture



The application follows a secure transaction flow:
1. **Wallet Connection**: Connect via MetaMask to access the user's Ethereum address.
2. **On-Chain Spin**: Call the `spin()` function; the UI displays a rolling animation until the transaction is mined.
3. **Data Verification**: The system re-verifies the won item's price and stock directly from the blockchain.
4. **Secure Payment**: User pays the `luckyPrice` in ETH and submits a hashed shipping address to the contract.

---

## 🚀 Installation & Setup
```bash
1. Clone the repository

2. Configure Environment
Ensure your MetaMask is connected to the correct network (e.g., Sepolia or Localhost) where the Smart Contract is deployed.

3. Install dependencies
npm install

4. Run the development server
npm run dev

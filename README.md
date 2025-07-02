# Destripe: Web3 Subscription Platform

Destripe is a fullstack Web3 project that demonstrates how to build a decentralized subscription platform using smart contracts, NFTs, ERC20 tokens, and a modern React frontend. It automates recurring payments, grants access via NFTs, and provides a seamless user experience for both users and developers.

---

## ✨ Features
- **Automated Recurring Payments**: Users pay monthly using an ERC20 token (DestripeCoin).
- **NFT Access Control**: Upon payment, users receive an NFT that grants access to the service.
- **Revocation on Missed Payment**: If a user misses a payment, their NFT is revoked automatically.
- **Modern Web3 Frontend**: Connect your wallet, view subscription status, and see time until next payment.
- **Open Source & Modular**: Easily extend or adapt for your own SaaS/Web3 use case.

---

## 🏗️ Architecture
- **Smart Contracts (Solidity/Hardhat)**: Handle payments, NFT minting, and access logic on Ethereum (Sepolia testnet).
- **Backend (Node.js/Express/TypeScript)**: Orchestrates the payment cycle, interacts with the blockchain, and exposes REST APIs for NFT metadata and images.
- **Frontend (React + RainbowKit + Wagmi)**: User interface for wallet connection, subscription status, and payment countdown.

```
[User Wallet] <-> [Frontend (React)] <-> [Backend (Node.js)] <-> [Smart Contracts (Solidity)]
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/your-repo.git
yarn install # or npm install (in each folder)
```

### 2. Blockchain (Hardhat)
- Configure your `.env` with Infura/Alchemy and private key.
- Compile and deploy contracts:
```bash
cd blockchain
npx hardhat compile
npx hardhat ignition deploy ignition/modules/Destripe.ts --network sepolia
```

### 3. Backend
- Configure your `.env` with contract addresses, Infura key, and private key.
- Start the backend:
```bash
cd backend
yarn build
yarn start
```

### 4. Frontend
- Configure your environment variables if needed.
- Start the frontend:
```bash
cd frontend
yarn dev
```

---

## 🧩 Tech Stack
- **Solidity, Hardhat, OpenZeppelin** (Smart Contracts)
- **Node.js, Express, TypeScript, Ethers.js** (Backend)
- **React, RainbowKit, Wagmi, Ethers.js** (Frontend)

---

## 📚 For Recruiters & Web3 Job Seekers
- Demonstrates advanced smart contract logic (NFT, ERC20, access control)
- Shows backend automation and blockchain integration
- Modern, user-friendly Web3 frontend (wallet connect, real-time status)
- Clean, modular codebase for rapid prototyping

---

## 📄 License
MIT

https://github.com/user-attachments/assets/dd43427a-077a-4f01-baa6-5a872d6a3b1a


---

> Made with ❤️ for the Web3 community. Feel free to fork, contribute, or reach out if you want to collaborate! 

// ====== CONFIG ======
const contractAddress = "0xe3d931336f6528246349f9ce6db6F7e20C0c58b8";

// Verified ABI
const contractABI = [
  { "inputs": [], "name": "claim", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }
];

let web3;
let contract;
let selectedAccount;
let wcProvider;

// ====== CONNECT WALLET ======
async function connectWallet() {
    try {
        if (typeof Web3 === "undefined") {
            alert("Web3.js is not loaded. Please include Web3.js in your HTML.");
            return;
        }

        if (window.ethereum && window.ethereum.isMetaMask) {
            await window.ethereum.request({ method: "eth_requestAccounts" });

            let chainId = (await window.ethereum.request({ method: "eth_chainId" })).toLowerCase();
            if (chainId !== "0x1") {
                try {
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x1" }]
                    });
                    chainId = (await window.ethereum.request({ method: "eth_chainId" })).toLowerCase();
                    if (chainId !== "0x1") {
                        alert("Network switch did not complete. Please try again.");
                        return;
                    }
                    // Auto reload on successful switch (fixes MetaMask Mobile)
                    location.reload();
                } catch (switchErr) {
                    if (switchErr.code === 4902) {
                        try {
                            await window.ethereum.request({
                                method: "wallet_addEthereumChain",
                                params: [{
                                    chainId: "0x1",
                                    chainName: "Ethereum Mainnet",
                                    rpcUrls: ["https://mainnet.infura.io/v3/c0a68b8e226b4ffda0e803e6aad70cc1"],
                                    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }
                                }]
                            });
                            location.reload(); // Reload after adding chain
                        } catch {
                            alert("Please add Ethereum Mainnet to MetaMask.");
                            return;
                        }
                    } else if (switchErr.code === 4001) {
                        alert("Network switch cancelled. Please switch to Ethereum Mainnet to claim.");
                        return;
                    } else {
                        alert("Please switch to Ethereum Mainnet to claim.");
                        return;
                    }
                }
            }

            web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            selectedAccount = accounts[0];
            contract = new web3.eth.Contract(contractABI, contractAddress);
            console.log("Connected via MetaMask:", selectedAccount);

        } else if (window.WalletConnectEthereumProvider) {
            try {
                Object.keys(localStorage).forEach(key => {
                    try { if (key.startsWith("walletconnect") || key.startsWith("wc@")) localStorage.removeItem(key); }
                    catch {}
                });
                Object.keys(sessionStorage).forEach(key => {
                    try { if (key.startsWith("walletconnect") || key.startsWith("wc@")) sessionStorage.removeItem(key); }
                    catch {}
                });
            } catch (storageErr) {
                console.warn("Storage clearing failed:", storageErr);
            }

            if (wcProvider) {
                try { await wcProvider.disconnect(); } catch {}
                wcProvider = null;
            }

            wcProvider = await window.WalletConnectEthereumProvider.init({
                projectId: "nDq2YkJGv8vP2WQh4n3x1z4s7Rk9JxBv",
                chains: [1],
                rpc: { 1: "https://mainnet.infura.io/v3/c0a68b8e226b4ffda0e803e6aad70cc1" },
                showQrModal: true
            });

            await wcProvider.connect();
            web3 = new Web3(wcProvider);
            const accounts = await web3.eth.getAccounts();
            selectedAccount = accounts[0];
            contract = new web3.eth.Contract(contractABI, contractAddress);
            console.log("Connected via WalletConnect v2:", selectedAccount);

            wcProvider.on("disconnect", () => console.log("WalletConnect disconnected"));
        } else {
            alert("Wallet provider not found. Please install MetaMask or use a WC-compatible wallet.");
        }
    } catch (err) {
        console.error("Connection failed:", err);
        alert("Wallet connection failed. Please try again.");
    }
}

// ====== CLAIM ======
async function claimTokens() {
    if (!contract || !selectedAccount) {
        alert("Please connect your wallet first");
        return;
    }

    const claimButton = document.getElementById("claimButton");
    if (claimButton) claimButton.disabled = true;

    try {
        let gasEstimate;
        try {
            gasEstimate = await contract.methods.claim().estimateGas({ from: selectedAccount });
            gasEstimate = Math.floor(gasEstimate * 1.25); // Buffer 25%
        } catch (gasErr) {
            console.warn("Gas estimate failed, using fallback:", gasErr);
            try {
                const block = await web3.eth.getBlock("latest");
                const safeLimit = Math.floor(block.gasLimit * 0.08);
                gasEstimate = Math.max(safeLimit, 500000);
            } catch (blockErr) {
                console.warn("Block gas limit fetch failed:", blockErr);
                gasEstimate = 500000; // Final hard fallback
            }
        }

        await contract.methods.claim().send({ from: selectedAccount, gas: gasEstimate });
        alert("Claim successful!");
    } catch (err) {
        console.error("Claim error:", err);
        const message = err.message || "";
        if (message.includes("already claimed")) {
            alert("You have already claimed your tokens.");
        } else if (message.includes("supply finished")) {
            alert("Claim phase has ended. Supply exhausted.");
        } else if (message.includes("wrong network")) {
            alert("Please switch to Ethereum Mainnet.");
        } else if (message.includes("User denied transaction signature")) {
            alert("You cancelled the transaction.");
        } else {
            alert("Claim failed. Please check your wallet and try again.");
        }
    } finally {
        if (claimButton) claimButton.disabled = false;
    }
}

// ====== DOM READY ======
window.addEventListener("DOMContentLoaded", () => {
    const connectBtn = document.getElementById("connectWalletButton");
    const claimBtn = document.getElementById("claimButton");

    if (claimBtn) claimBtn.disabled = false;

    if (connectBtn) connectBtn.addEventListener("click", connectWallet);
    if (claimBtn) claimBtn.addEventListener("click", claimTokens);
});
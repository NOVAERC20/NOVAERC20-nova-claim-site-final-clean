// ====== CONFIG ======
const contractAddress = "0xe3d931336f6528246349f9ce6db6F7e20C0c58b8";

const contractABI = [
  { "inputs": [], "name": "claim", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

let web3;
let contract;
let selectedAccount;
let wcProvider;

// ====== CONNECT WALLET ======
async function connectWallet() {
    try {
        if (window.ethereum) {
            // Generic EIP-1193 Provider (MetaMask, Trust Wallet Extension)
            await window.ethereum.request({ method: "eth_requestAccounts" });

            let chainId = (await window.ethereum.request({ method: "eth_chainId" })).toLowerCase();
            if (chainId !== "0x1") {
                try {
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x1" }]
                    });
                } catch (err) {
                    if (err.code === 4902) {
                        await window.ethereum.request({
                            method: "wallet_addEthereumChain",
                            params: [{
                                chainId: "0x1",
                                chainName: "Ethereum Mainnet",
                                rpcUrls: ["https://mainnet.infura.io/v3/c0a68b8e226b4ffda0e803e6aad70cc1"],
                                nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }
                            }]
                        });
                    } else {
                        alert("Please switch to Ethereum Mainnet.");
                        return;
                    }
                }
            }

            web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            selectedAccount = accounts[0];
            contract = new web3.eth.Contract(contractABI, contractAddress);
            console.log("Connected:", selectedAccount);

        } else if (window.WalletConnectEthereumProvider) {
            // WalletConnect for Trust Wallet Mobile
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
            console.log("Connected via WalletConnect (Trust Wallet Mobile):", selectedAccount);

            wcProvider.on("disconnect", () => console.log("WalletConnect disconnected"));

        } else {
            alert("No compatible wallet found. Please install MetaMask or Trust Wallet.");
        }
    } catch (err) {
        console.error("Connection failed:", err);
        alert("Wallet connection failed: " + err.message);
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
            gasEstimate = Math.floor(gasEstimate * 1.25);
        } catch {
            gasEstimate = 500000;
        }

        await contract.methods.claim().send({ from: selectedAccount, gas: gasEstimate });
        alert("Claim successful!");
    } catch (err) {
        console.error("Claim failed:", err);
        alert("Claim failed: " + err.message);
    } finally {
        if (claimButton) claimButton.disabled = false;
    }
}

// ====== EVENT BINDING ======
window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("connectWalletButton").addEventListener("click", connectWallet);
    document.getElementById("claimButton").addEventListener("click", claimTokens);
});
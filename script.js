// ====== CONFIG ======
const contractAddress = "0xe3d931336f6528246349f9ce6db6F7e20C0c58b8";
const contractABI = []; // Use actual ABI here

let web3;
let contract;
let selectedAccount;

// ====== CONNECT WALLET ======
async function connectWallet() {
    if (window.ethereum && window.ethereum.isMetaMask) {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            selectedAccount = accounts[0];
            contract = new web3.eth.Contract(contractABI, contractAddress);
            console.log("Connected via MetaMask:", selectedAccount);
        } catch (err) {
            console.error(err);
            alert("MetaMask connection failed");
        }
    } else {
        try {
            const provider = new WalletConnectProvider.default({
                rpc: {
                    1: "https://mainnet.infura.io/v3/c0a68b8e226b4ffda0e803e6aad70cc1"
                }
            });
            await provider.enable();
            web3 = new Web3(provider);
            const accounts = await web3.eth.getAccounts();
            selectedAccount = accounts[0];
            contract = new web3.eth.Contract(contractABI, contractAddress);
            console.log("Connected via WalletConnect:", selectedAccount);
        } catch (err) {
            console.error(err);
            alert("WalletConnect connection failed");
        }
    }
}

// ====== CLAIM ======
async function claimTokens() {
    if (!contract || !selectedAccount) {
        alert("Please connect your wallet first");
        return;
    }
    try {
        const gasEstimate = await contract.methods.claim().estimateGas({ from: selectedAccount });
        await contract.methods.claim().send({ from: selectedAccount, gas: gasEstimate });
        alert("Claim successful!");
    } catch (err) {
        console.error(err);
        alert("Claim failed: " + err.message);
    }
}

document.getElementById("connectWallet").addEventListener("click", connectWallet);
document.getElementById("claimButton").addEventListener("click", claimTokens);

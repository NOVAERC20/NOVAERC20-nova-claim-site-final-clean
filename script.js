let provider;
let signer;
let contract;

const CONTRACT_ADDRESS = "0xe3d931336f6528246349f9ce6db6F7e20C0c58b8";
const ABI = [{
  "inputs": [],
  "name": "claim",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}];

async function connectWallet() {
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    document.getElementById("walletAddress").innerText = (await signer.getAddress()).slice(0, 6) + "..." + (await signer.getAddress()).slice(-4);
    document.getElementById("status").innerText = "Wallet connected ✅";
    document.getElementById("claimButton").disabled = false;
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  } else {
    alert("MetaMask not detected. Please install it.");
  }
}

async function claimTokens() {
  try {
    const tx = await contract.claim();
    document.getElementById("status").innerText = "Transaction sent. Waiting for confirmation...";
    await tx.wait();
    document.getElementById("status").innerText = "✅ Claim successful!";
  } catch (err) {
    document.getElementById("status").innerText = "❌ Claim failed: " + (err?.reason || err?.message || "Unknown error");
  }
}

document.getElementById("connectWallet").addEventListener("click", connectWallet);
document.getElementById("claimButton").addEventListener("click", claimTokens);

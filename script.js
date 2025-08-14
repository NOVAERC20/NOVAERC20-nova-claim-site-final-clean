const connectWalletButton = document.getElementById("connectWalletButton");
const claimButton = document.getElementById("claimButton");
const status = document.getElementById("status");

let account;

const abi = [
  {
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contractAddress = "0xF94AF881E98B63FF51af70869907672eb4CC37a9";

connectWalletButton.addEventListener("click", async () => {
  if (typeof window.ethereum === "undefined") {
    status.textContent = "❌ MetaMask not found.";
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    account = accounts[0];
    status.textContent = `✅ Connected: ${account}`;

    const web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId();
    if (networkId !== 1) {
      status.textContent = "⚠️ Please switch to Ethereum Mainnet.";
      claimButton.disabled = true;
      return;
    }

    claimButton.disabled = false;
  } catch (err) {
    console.error("Connection failed:", err);
    status.textContent = "❌ Connection failed.";
  }
});

claimButton.addEventListener("click", async () => {
  if (!account) {
    status.textContent = "❌ Wallet not connected.";
    return;
  }

  const web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(abi, contractAddress);

  try {
    status.textContent = "⏳ Estimating gas...";
    const estimatedGas = await contract.methods.claim().estimateGas({ from: account });

    status.textContent = "⏳ Sending claim transaction...";
    await contract.methods.claim().send({ from: account, gas: estimatedGas + 5000 });

    status.textContent = "✅ Claim successful!";
  } catch (err) {
    console.error("Claim failed:", err);
    if (err.message?.includes("already claimed")) {
      status.textContent = "⚠️ You already claimed.";
    } else if (err.message?.includes("ClaimingDisabled")) {
      status.textContent = "⚠️ Claiming is currently disabled.";
    } else if (err.code === 4001) {
      status.textContent = "❌ Transaction rejected.";
    } else {
      status.textContent = "❌ Claim failed. See console.";
    }
  }
});
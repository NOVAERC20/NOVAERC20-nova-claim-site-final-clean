let account;
let web3;
let contract;

const CONTRACT_ADDRESS = "0xF94AF881E98B63FF51af70869907672eb4CC37a9";

// Debug log helper: adds text to status div
function debugLog(msg) {
  const status = document.getElementById("status");
  status.textContent += `\n${msg}`;
  console.log(msg);
}

async function connectWallet() {
  try {
    debugLog("🔍 Checking for Ethereum provider...");
    if (!window.ethereum) {
      debugLog("❌ No wallet detected.");
      return;
    }

    web3 = new Web3(window.ethereum);
    debugLog("✅ Web3 initialized.");

    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    account = accounts[0];
    debugLog(`🔗 Connected account: ${account}`);

    const chainId = await web3.eth.getChainId();
    debugLog(`🌐 Chain ID: ${chainId}`);

    document.getElementById("claimButton").disabled = false;

    // Load contract
    contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
    debugLog("📄 Contract initialized.");

  } catch (err) {
    debugLog(`❌ Connect error: ${err.message}`);
  }
}

async function claimTokens() {
  if (!account || !contract) {
    debugLog("❌ Wallet not connected.");
    return;
  }

  try {
    debugLog("⏳ Estimating gas...");
    let gasEstimate;
    try {
      gasEstimate = await contract.methods.claim().estimateGas({ from: account });
      debugLog(`✅ Gas estimate: ${gasEstimate}`);
    } catch (err) {
      gasEstimate = 200000;
      debugLog
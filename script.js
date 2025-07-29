let account;
let web3;
let contract;
const CONTRACT_ADDRESS = "0xF94AF881E98B63FF51af70869907672eb4CC37a9"; // Replace if different

function debugLog(msg) {
  const status = document.getElementById("status");
  status.textContent += `\n${msg}`;
  console.log(msg);
}

window.addEventListener('load', () => {
  debugLog("🌐 Page loaded. Waiting for wallet...");

  document.getElementById("connectWalletButton").addEventListener("click", async () => {
    debugLog("🔍 Connect button clicked.");

    if (!window.ethereum) {
      debugLog("❌ No wallet detected. Install MetaMask or Base Wallet.");
      return;
    }

    debugLog(`✅ Provider detected: ${window.ethereum.isMetaMask ? "MetaMask" : window.ethereum.isCoinbaseWallet ? "Base Wallet" : "Other"}`);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      account = accounts[0];
      debugLog(`🔗 Connected account: ${account}`);

      web3 = new Web3(window.ethereum);
      const chainId = await web3.eth.getChainId();
      debugLog(`🌐 Chain ID: ${chainId}`);

      contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

      document.getElementById("claimButton").disabled = false;
    } catch (err) {
      debugLog(`❌ Connection error: ${err.message || JSON.stringify(err)}`);
    }
  });

  document.getElementById("claimButton").addEventListener("click", async () => {
    if (!contract || !account) {
      debugLog("⚠️ Wallet not connected yet.");
      return;
    }

    debugLog("🚀 Claim button clicked. Preparing transaction...");

    try {
      let gas;
      try {
        gas = await contract.methods.claim().estimateGas({ from: account });
      } catch {
        gas = 200000;
        debugLog("⚠️ Gas estimate failed. Using fallback.");
      }

      const tx = await contract.methods.claim().send({
        from: account,
        gas,
        maxFeePerGas: web3.utils.toWei('3', 'gwei'),
        maxPriorityFeePerGas: web3.utils.toWei('2', 'gwei')
      });

      debugLog("✅ Claim successful! TX: " + tx.transactionHash);
    } catch (err) {
      debugLog(`❌ Claim failed: ${err.message || JSON.stringify(err)}`);
    }
  });
});
let account;
let web3;
let contract;

const CONTRACT_ADDRESS = "0xF94AF881E98B63FF51af70869907672eb4CC37a9"; // NOVA Claim Contract

// Minimal ABI for claim()
const abi = [
  {
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Debug logging to status div
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

    const providerType = window.ethereum.isMetaMask ? "MetaMask" :
                         window.ethereum.isCoinbaseWallet ? "Base Wallet" : "Other";
    debugLog(`✅ Provider detected: ${providerType}`);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      account = accounts[0];
      debugLog(`🔗 Connected account: ${account}`);

      web3 = new Web3(window.ethereum);
      const chainId = await web3.eth.getChainId();
      debugLog(`🌐 Chain ID: ${chainId}`);

      contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
      debugLog("📄 Contract initialized.");

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
      let gasEstimate;
      try {
        gasEstimate = await contract.methods.claim().estimateGas({ from: account });
        debugLog(`✅ Gas estimate: ${gasEstimate}`);
      } catch (err) {
        gasEstimate = 200000;
        debugLog(`⚠️ Gas estimate failed. Using fallback: ${err.message}`);
      }

      // Prepare EIP-1559 fees
      let maxFeePerGas, maxPriorityFeePerGas;
      try {
        const block = await web3.eth.getBlock("latest");
        maxFeePerGas = block.baseFeePerGas ? (parseInt(block.baseFeePerGas) * 2).toString() : web3.utils.toWei("3", "gwei");
        maxPriorityFeePerGas = web3.utils.toWei("2", "gwei");
        debugLog(`✅ EIP-1559 fees: maxFeePerGas=${maxFeePerGas}, maxPriorityFeePerGas=${maxPriorityFeePerGas}`);
      } catch (feeErr) {
        debugLog(`⚠️ EIP-1559 fee setup failed. Falling back to gasPrice: ${feeErr.message}`);
      }

      const txParams = {
        from: account,
        to: CONTRACT_ADDRESS,
        data: contract.methods.claim().encodeABI(),
        gas: gasEstimate,
        ...(maxFeePerGas && maxPriorityFeePerGas
          ? { maxFeePerGas, maxPriorityFeePerGas }
          : { gasPrice: await web3.eth.getGasPrice() })
      };

      debugLog("📤 Sending transaction...");
      await web3.eth.sendTransaction(txParams)
        .on("transactionHash", hash => debugLog(`📨 Tx hash: ${hash}`))
        .on("receipt", receipt => debugLog(`✅ Claim successful: ${JSON.stringify(receipt)}`))
        .on("error", err => debugLog(`❌ Claim error: ${err.message || JSON.stringify(err)}`));

    } catch (err) {
      debugLog(`❌ Fatal error: ${err.message || JSON.stringify(err)}`);
    }
  });
});
let account;
let web3;
let contract;

const CONTRACT_ADDRESS = "0xF94AF881E98B63FF51af70869907672eb4CC37a9"; // NOVA Claim Contract
const abi = [
  {
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

function debugLog(msg) {
  const status = document.getElementById("status");
  status.textContent += `\n${msg}`;
  console.log(msg);
}

window.addEventListener('load', () => {
  debugLog("🌐 Page loaded.");

  document.getElementById("connectWalletButton").addEventListener("click", async () => {
    debugLog("🔍 Connect clicked.");

    if (!window.ethereum) {
      debugLog("❌ No wallet detected.");
      return;
    }

    const providerType = window.ethereum.isMetaMask ? "MetaMask" :
                         window.ethereum.isCoinbaseWallet ? "Base Wallet" : "Other";
    debugLog(`✅ Provider: ${providerType}`);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      account = accounts[0];
      debugLog(`🔗 Connected: ${account}`);

      web3 = new Web3(window.ethereum);
      const chainId = await web3.eth.getChainId();
      debugLog(`🌐 Chain ID: ${chainId}`);

      contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
      debugLog("📄 Contract ready.");

      document.getElementById("claimButton").disabled = false;
    } catch (err) {
      debugLog(`❌ Connect error: ${err.message}`);
    }
  });

  document.getElementById("claimButton").addEventListener("click", async () => {
    if (!contract || !account) {
      debugLog("⚠️ Wallet not connected.");
      return;
    }

    debugLog("🚀 Claim clicked.");

    try {
      let gas;
      try {
        gas = await contract.methods.claim().estimateGas({ from: account });
        debugLog(`✅ Gas estimate: ${gas}`);
      } catch (err) {
        gas = 200000;
        debugLog(`⚠️ Gas estimate failed, fallback: ${err.message}`);
      }

      // EIP-1559 fees inside claim only
      let maxFeePerGas, maxPriorityFeePerGas;
      try {
        const block = await web3.eth.getBlock("latest");
        maxFeePerGas = block.baseFeePerGas 
          ? (parseInt(block.baseFeePerGas) * 2).toString() 
          : web3.utils.toWei("3", "gwei");
        maxPriorityFeePerGas = web3.utils.toWei("2", "gwei");
        debugLog(`✅ Fees: maxFeePerGas=${maxFeePerGas}, maxPriorityFeePerGas=${maxPriorityFeePerGas}`);
      } catch (feeErr) {
        debugLog(`⚠️ Fee fetch failed: ${feeErr.message}`);
      }

      const txParams = {
        from: account,
        to: CONTRACT_ADDRESS,
        data: contract.methods.claim().encodeABI(),
        gas,
        ...(maxFeePerGas && maxPriorityFeePerGas
          ? { maxFeePerGas, maxPriorityFeePerGas }
          : { gasPrice: await web3.eth.getGasPrice() })
      };

      debugLog("📤 Sending TX...");
      await web3.eth.sendTransaction(txParams)
        .on("transactionHash", hash => debugLog(`📨 Tx hash: ${hash}`))
        .on("receipt", receipt => debugLog(`✅ Success: ${receipt.transactionHash}`))
        .on("error", err => debugLog(`❌ TX error: ${err.message}`));

    } catch (err) {
      debugLog(`❌ Claim error: ${err.message}`);
    }
  });
});
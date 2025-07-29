let account;
let web3;

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

      debugLog("📄 Wallet connected. Loading claim logic...");

      // Dynamically load claim.js after connection
      const script = document.createElement("script");
      script.src = "claim.js";
      document.body.appendChild(script);

    } catch (err) {
      debugLog(`❌ Connect error: ${err.message}`);
    }
  });
});
let account;
let web3;

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

      document.getElementById("claimButton").disabled = false;
    } catch (err) {
      debugLog(`❌ Connection error: ${err.message || JSON.stringify(err)}`);
    }
  });
});
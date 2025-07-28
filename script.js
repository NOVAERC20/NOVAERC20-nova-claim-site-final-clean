
document.addEventListener("DOMContentLoaded", async () => {
  const connectWalletButton = document.getElementById("connectWalletButton");
  const claimButton = document.getElementById("claimButton");
  const status = document.getElementById("status");

  let account;

  function mobileLog(msg) {
    status.textContent = msg;
  }

  async function waitForEthereum(timeout = 3000) {
    const started = Date.now();
    while (!window.ethereum && Date.now() - started < timeout) {
      await new Promise(res => setTimeout(res, 50));
    }
    if (!window.ethereum) {
      throw new Error("MetaMask or Web3 wallet not found.");
    }
  }

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

  await waitForEthereum();
  const web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(abi, contractAddress);

  connectWalletButton.addEventListener("click", async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      account = accounts[0];
      mobileLog("Connected: " + account);
      claimButton.disabled = false;
    } catch (err) {
      mobileLog("Connection failed: " + err.message);
    }
  });

  claimButton.addEventListener("click", async () => {
    if (!account) return;

    try {
      let gas;
      try {
        gas = await contract.methods.claim().estimateGas({ from: account });
      } catch (e) {
        gas = 200000;
        mobileLog("Gas estimation failed, using fallback.");
      }

      await contract.methods.claim().send({ from: account, gas });
      mobileLog("✅ Claim successful!");
    } catch (err) {
      mobileLog("❌ Claim failed: " + (err.message || err));
    }
  });

  // Optional: auto-refresh UI on network/account change
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => window.location.reload());
    window.ethereum.on("chainChanged", () => window.location.reload());
  }
});

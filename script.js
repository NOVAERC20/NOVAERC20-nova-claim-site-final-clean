// script.js - Fixed version for enabling Claim button on connect

document.addEventListener("DOMContentLoaded", async () => {
  const connectWalletButton = document.getElementById("connectWalletButton");
  const claimButton = document.getElementById("claimButton");
  const status = document.getElementById("status");

  let account;

  connectWalletButton.onclick = async () => {
    console.log("🔍 Connect clicked.");
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        account = accounts[0];
        console.log("✅ Provider:", window.ethereum.isMetaMask ? "MetaMask" : "Other");
        console.log("🔗 Connected:", account);
        status.textContent = `Connected: ${account}`;

        // ✅ Always enable claim button after connect
        claimButton.disabled = false;
      } catch (err) {
        status.textContent = "❌ Wallet connection failed.";
        console.error(err);
      }
    } else {
      status.textContent = "⚠️ No wallet detected.";
    }
  };

  claimButton.onclick = async () => {
    if (!account) {
      status.textContent = "⚠️ Please connect your wallet first.";
      return;
    }
    status.textContent = "🚀 Preparing claim...";
    console.log("🚀 Claim button clicked for", account);

    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(abi, "0xF94AF881E98B63FF51af70869907672eb4CC37a9");

      const gas = await contract.methods.claim().estimateGas({ from: account });
      await contract.methods.claim().send({ from: account, gas });

      status.textContent = "✅ Claim successful!";
    } catch (err) {
      status.textContent = "❌ Claim failed.";
      console.error(err);
    }
  };
});

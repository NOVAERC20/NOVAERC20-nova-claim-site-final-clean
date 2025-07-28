let account;

async function waitForEthereum(timeout = 3000) {
  const started = Date.now();
  while (!window.ethereum && Date.now() - started < timeout) {
    await new Promise(res => setTimeout(res, 50));
  }
  if (!window.ethereum) {
    throw new Error("MetaMask not found. Please use a Web3-enabled browser.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const connectWalletButton = document.getElementById("connectWalletButton");
  const claimButton = document.getElementById("claimButton");
  const status = document.getElementById("status");

  connectWalletButton.onclick = async () => {
    try {
      await waitForEthereum();
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      account = accounts[0];
      status.textContent = "Connected: " + account;
      claimButton.disabled = false;
    } catch (err) {
      status.textContent = "Wallet connection failed.";
    }
  };

  claimButton.onclick = async () => {
    if (!account) return;
    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(abi, "0xF94AF881E98B63FF51af70869907672eb4CC37a9");
      let gas;
      try {
        gas = await contract.methods.claim().estimateGas({ from: account });
      } catch (e) {
        gas = 200000;
        status.textContent = "Gas estimate failed. Using fallback.";
      }
      await contract.methods.claim().send({ from: account, gas });
      status.textContent = "Claim successful!";
    } catch (err) {
      status.textContent = "Claim failed: " + (err.message || err);
    }
  };
});

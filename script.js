document.addEventListener("DOMContentLoaded", async () => {
  const connectWalletButton = document.getElementById("connectWalletButton");
  const claimButton = document.getElementById("claimButton");
  const status = document.getElementById("status");

  let account;
  const contractAddress = "0xF94AF881E98B63FF51af70869907672eb4CC37a9";

  // Inline ABI
  const abi = [
    {
      "inputs": [],
      "name": "claim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  let web3;
  let contract;

  // Wait for Ethereum provider (MetaMask Mobile)
  async function waitForEthereum(timeout = 3000) {
    const start = Date.now();
    while (!window.ethereum && Date.now() - start < timeout) {
      await new Promise(r => setTimeout(r, 50));
    }
    if (!window.ethereum) {
      status.textContent = "MetaMask not found. Open in MetaMask browser.";
      throw new Error("No provider");
    }
  }

  await waitForEthereum();
  web3 = new Web3(window.ethereum);
  contract = new web3.eth.Contract(abi, contractAddress);

  // Connect Wallet
  connectWalletButton.onclick = async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      account = accounts[0];
      status.textContent = `Connected: ${account}`;
      claimButton.disabled = false;
    } catch (err) {
      status.textContent = "Connection failed.";
    }
  };

  // Claim directly on button click
  claimButton.onclick = async () => {
    if (!account) {
      status.textContent = "Please connect wallet first.";
      return;
    }

    status.textContent = "Sending claim transaction...";
    claimButton.disabled = true;

    try {
      const tx = {
        from: account,
        to: contractAddress,
        data: contract.methods.claim().encodeABI()
      };

      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [tx]
      });

      status.textContent = `Transaction sent: ${txHash}`;
    } catch (err) {
      status.textContent = "Claim failed: " + (err.message || err);
    } finally {
      claimButton.disabled = false;
    }
  };
});
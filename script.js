let account;
let web3;
let contract;
const contractAddress = "0xF94AF881E98B63FF51af70869907672eb4CC37a9";

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

  await waitForEthereum();

  connectWalletButton.onclick = async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      account = accounts[0];
      
      // Initialize Web3 + Contract AFTER approval
      web3 = new Web3(window.ethereum);
      contract = new web3.eth.Contract(abi, contractAddress);

      status.textContent = "Connected: " + account;
      claimButton.disabled = false;
    } catch (err) {
      status.textContent = "Wallet connection failed.";
    }
  };

  claimButton.onclick = async () => {
    if (!account) return;
    status.textContent = "Sending claim transaction...";
    try {
      let txParams = { from: account };

      // EIP-1559 support
      try {
        if (web3.eth.getMaxPriorityFeePerGas) {
          const [maxPriorityFeePerGas, maxFeePerGas] = await Promise.all([
            web3.eth.getMaxPriorityFeePerGas(),
            web3.eth.getGasPrice()
          ]);
          txParams.maxPriorityFeePerGas = maxPriorityFeePerGas;
          txParams.maxFeePerGas = maxFeePerGas;
        } else {
          txParams.gasPrice = await web3.eth.getGasPrice();
        }
      } catch {
        txParams.gasPrice = await web3.eth.getGasPrice();
      }

      // Gas estimate
      try {
        txParams.gas = await contract.methods.claim().estimateGas({ from: account });
      } catch {
        txParams.gas = 200000;
        status.textContent = "Gas estimate failed. Using fallback.";
      }

      await contract.methods.claim().send(txParams)
        .on('transactionHash', hash => status.textContent = "Transaction sent: " + hash)
        .on('receipt', receipt => status.textContent = "Claim successful! Tx: " + receipt.transactionHash)
        .on('error', error => status.textContent = "Claim failed: " + (error.message || error));
    } catch (err) {
      status.textContent = "Claim failed: " + (err.message || err);
    }
  };
});
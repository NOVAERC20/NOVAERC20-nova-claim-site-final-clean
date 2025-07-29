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

  // Initialize Web3 when Ethereum is available
  try {
    await waitForEthereum();
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(abi, contractAddress);
  } catch (err) {
    status.textContent = "Ethereum provider not found.";
    return;
  }

  connectWalletButton.onclick = async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      account = accounts[0];
      status.textContent = "Connected: " + account;
      claimButton.disabled = false;
    } catch (err) {
      status.textContent = "Wallet connection failed.";
    }
  };

  claimButton.onclick = async () => {
    if (!account) {
      status.textContent = "Please connect your wallet first.";
      return;
    }

    try {
      // Estimate gas
      let gas;
      try {
        gas = await contract.methods.claim().estimateGas({ from: account });
      } catch (err) {
        gas = 200000; // fallback
        status.textContent = "Gas estimate failed. Using fallback.";
      }

      // Try EIP-1559 fee fields
      let txParams = { from: account, gas, to: contractAddress, data: contract.methods.claim().encodeABI() };
      try {
        const feeData = await web3.eth.getBlock("latest");
        txParams.maxFeePerGas = feeData.baseFeePerGas * 2 || web3.utils.toWei("2", "gwei");
        txParams.maxPriorityFeePerGas = web3.utils.toWei("1.5", "gwei");
      } catch (e) {
        // fallback to gasPrice
        txParams.gasPrice = await web3.eth.getGasPrice();
      }

      await web3.eth.sendTransaction(txParams)
        .on("transactionHash", hash => {
          status.textContent = "Transaction sent: " + hash;
        })
        .on("receipt", receipt => {
          status.textContent = "Claim successful!";
        })
        .on("error", err => {
          status.textContent = "Claim failed: " + (err.message || err);
        });

    } catch (err) {
      status.textContent = "Error: " + (err.message || err);
    }
  };
});
let account;
let web3;
let contract;
const contractAddress = "0xF94AF881E98B63FF51af70869907672eb4CC37a9";
const abi = [ /* ... your contract ABI here ... */ ];

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

  try {
    await waitForEthereum();
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(abi, contractAddress);
  } catch (err) {
    status.textContent = "Ethereum provider not found.";
    console.error(err);
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
      console.error(err);
    }
  };

  claimButton.onclick = async () => {
    if (!account) {
      status.textContent = "Please connect your wallet first.";
      return;
    }

    claimButton.disabled = true;
    status.textContent = "Processing claim...";

    try {
      let gas;
      try {
        gas = await contract.methods.claim().estimateGas({ from: account });
      } catch (err) {
        gas = 200000;
        status.textContent = "Gas estimate failed. Using fallback.";
        console.warn("Gas estimate failed:", err);
      }

      let txParams = { from: account, gas, to: contractAddress, data: contract.methods.claim().encodeABI() };
      try {
        const feeData = await web3.eth.getBlock("latest");
        if (feeData.baseFeePerGas) {
          // Use BigInt for gas calculations
          txParams.maxFeePerGas = (BigInt(feeData.baseFeePerGas) * 2n).toString();
          txParams.maxPriorityFeePerGas = web3.utils.toWei("1.5", "gwei");
        } else {
          txParams.gasPrice = await web3.eth.getGasPrice();
        }
      } catch (e) {
        txParams.gasPrice = await web3.eth.getGasPrice();
        console.warn("EIP-1559 fee fields error, fallback to gasPrice", e);
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
          console.error(err);
        });

    } catch (err) {
      status.textContent = "Error: " + (err.message || err);
      console.error(err);
    } finally {
      claimButton.disabled = false;
    }
  };
});
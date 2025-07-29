let account;
let web3;
let contract;

const contractAddress = "0xF94AF881E98B63FF51af70869907672eb4CC37a9";
const abi = [
  {
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

function logStatus(message) {
  console.log(message);
  const status = document.getElementById("status");
  if (status) status.textContent = message;
}

async function waitForEthereum(timeout = 3000) {
  const start = Date.now();
  while (!window.ethereum && Date.now() - start < timeout) {
    await new Promise(res => setTimeout(res, 50));
  }
  if (!window.ethereum) {
    throw new Error("No Ethereum provider detected. Please open in MetaMask/Base Wallet.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const connectWalletButton = document.getElementById("connectWalletButton");
  const claimButton = document.getElementById("claimButton");

  try {
    await waitForEthereum();
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(abi, contractAddress);
    logStatus("Ethereum provider ready.");
  } catch (err) {
    logStatus("Ethereum provider not found.");
    console.error(err);
    return;
  }

  connectWalletButton.onclick = async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      account = accounts[0];
      logStatus(`Connected: ${account}`);
      claimButton.disabled = false;
    } catch (err) {
      logStatus("Wallet connection failed.");
      console.error("Connection error:", err);
    }
  };

  claimButton.onclick = async () => {
    if (!account) {
      logStatus("Please connect your wallet first.");
      return;
    }

    claimButton.disabled = true;
    logStatus("Checking claim eligibility...");

    try {
      // 🔍 Call first to check eligibility without spending gas
      await contract.methods.claim().call({ from: account });
      logStatus("Eligible to claim. Sending transaction...");

      let gas;
      try {
        gas = await contract.methods.claim().estimateGas({ from: account });
      } catch (err) {
        gas = 200000;
        logStatus("Gas estimate failed. Using fallback.");
        console.warn("Gas estimate failed:", err);
      }

      let txParams = { from: account, gas };
      try {
        const block = await web3.eth.getBlock("latest");
        if (block.baseFeePerGas) {
          txParams.maxFeePerGas = (BigInt(block.baseFeePerGas) * 2n).toString();
          txParams.maxPriorityFeePerGas = web3.utils.toWei("2", "gwei");
        } else {
          txParams.gasPrice = await web3.eth.getGasPrice();
        }
      } catch (feeErr) {
        txParams.gasPrice = await web3.eth.getGasPrice();
      }

      await contract.methods.claim().send(txParams)
        .on("transactionHash", hash => {
          logStatus(`Transaction sent: ${hash}`);
        })
        .on("receipt", receipt => {
          logStatus("✅ Claim successful!");
        })
        .on("error", err => {
          logStatus(`❌ Claim failed: ${err.message || err}`);
        });

    } catch (callError) {
      logStatus("🚫 Already claimed or not eligible.");
      console.warn("Claim eligibility check failed:", callError);
    } finally {
      claimButton.disabled = false;
    }
  };
});
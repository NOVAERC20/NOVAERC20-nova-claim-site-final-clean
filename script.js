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
    throw new Error("Ethereum provider not found. Please open in MetaMask/Base.");
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
    status.textContent = "No Ethereum wallet detected.";
    console.error(err);
    return;
  }

  connectWalletButton.onclick = async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      account = accounts[0];
      status.textContent = `Connected: ${account}`;
      claimButton.disabled = false;
    } catch (err) {
      status.textContent = "Wallet connection failed.";
      console.error("Connection error:", err);
    }
  };

  claimButton.onclick = async () => {
    if (!account) {
      status.textContent = "Connect your wallet first.";
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
        console.warn("Gas estimate failed:", err);
        status.textContent = "Gas estimate failed. Using fallback.";
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
        console.warn("EIP-1559 fee fetch failed:", feeErr);
        txParams.gasPrice = await web3.eth.getGasPrice();
      }

      await contract.methods.claim().send(txParams)
        .on("transactionHash", hash => {
          status.textContent = `Transaction sent: ${hash}`;
        })
        .on("receipt", receipt => {
          status.textContent = "✅ Claim successful!";
        })
        .on("error", err => {
          status.textContent = `❌ Claim failed: ${err.message || err}`;
          console.error("Claim error:", err);
        });

    } catch (err) {
      status.textContent = `Error: ${err.message || err}`;
      console.error("General error:", err);
    } finally {
      claimButton.disabled = false;
    }
  };
});
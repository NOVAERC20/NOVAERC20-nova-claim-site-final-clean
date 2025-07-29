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
    throw new Error("No Ethereum provider found. Open in MetaMask/Base Wallet.");
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
    return;
  }

  connectWalletButton.onclick = async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      account = accounts[0];
      logStatus(`Connected: ${account}`);

      // Diagnostic: log network
      const chainId = await web3.eth.getChainId();
      logStatus(`Chain ID: ${chainId}`);

      claimButton.disabled = false;
    } catch (err) {
      logStatus("Wallet connection failed.");
    }
  };

  claimButton.onclick = async () => {
    if (!account) {
      logStatus("Please connect wallet first.");
      return;
    }

    claimButton.disabled = true;
    logStatus("Checking claim eligibility...");

    try {
      // Pre-check without spending gas
      await contract.methods.claim().call({ from: account });
      logStatus("Eligible. Preparing transaction...");

      // Fixed gas & fees for mobile
      const txParams = {
        from: account,
        to: contractAddress,
        gas: 250000, // safe limit
        maxFeePerGas: web3.utils.toWei('30', 'gwei'),
        maxPriorityFeePerGas: web3.utils.toWei('2', 'gwei'),
        data: contract.methods.claim().encodeABI()
      };

      // Diagnostic: log the exact tx object
      console.log("TX Params:", txParams);
      logStatus("Sending transaction...");

      await web3.eth.sendTransaction(txParams)
        .on("transactionHash", hash => {
          logStatus(`Transaction sent: ${hash}`);
        })
        .on("receipt", receipt => {
          logStatus("✅ Claim successful!");
        })
        .on("error", err => {
          logStatus(`❌ Claim failed: ${err.message}`);
        });

    } catch (err) {
      logStatus(`🚫 Cannot claim: ${err.message}`);
    } finally {
      claimButton.disabled = false;
    }
  };
});
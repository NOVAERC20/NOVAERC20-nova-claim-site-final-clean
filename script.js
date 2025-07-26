
async function claimNOVA() {
  const status = document.getElementById("status");
  const connectButton = document.getElementById("connectWalletButton");
  const claimButton = document.getElementById("claimButton");

  if (typeof window.ethereum === "undefined") {
    status.textContent = "❌ MetaMask not found. Please install it.";
    return;
  }

  const web3 = new Web3(window.ethereum);
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];

  const contract = new web3.eth.Contract(abi, contractAddress);

  status.textContent = "🔍 Checking eligibility...";

  try {
    const isEligible = await contract.methods.claim().call({ from: account });
    console.log("✅ Simulation succeeded. Proceeding to send TX.");
  } catch (error) {
    console.error("❌ Simulation failed. Likely already claimed or not eligible.", error);
    status.textContent = "❌ Claim not allowed. Possibly already claimed.";
    return;
  }

  status.textContent = "📤 Sending transaction...";

  contract.methods.claim().send({ from: account })
    .on("transactionHash", function(hash) {
      console.log("📦 TX Hash:", hash);
      status.textContent = `📦 TX Sent: ${hash}`;
    })
    .on("receipt", function(receipt) {
      console.log("✅ Claim Success:", receipt);
      status.textContent = "✅ Claim successful!";
    })
    .on("error", function(error) {
      console.error("❌ Claim failed:", error);
      status.textContent = "❌ Claim failed. See console for details.";
    });
}

document.getElementById("claimButton").addEventListener("click", claimNOVA);

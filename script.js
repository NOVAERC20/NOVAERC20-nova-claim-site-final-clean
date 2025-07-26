
async function claimNOVA() {
  const status = document.getElementById("status");
  if (typeof window.ethereum === "undefined") {
    status.textContent = "❌ MetaMask not found. Please install it.";
    return;
  }

  const web3 = new Web3(window.ethereum);
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];

  const contract = new web3.eth.Contract(abi, contractAddress);

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
      console.error("❌ Claim failed:", error.message || error);
      status.textContent = "❌ Claim failed. See console for details.";
    });
}

document.getElementById("connectWalletButton").addEventListener("click", async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      document.getElementById("status").textContent = "✅ Wallet connected";
    } catch (error) {
      console.error("Connection rejected:", error.message || error);
      document.getElementById("status").textContent = "❌ Connection rejected";
    }
  } else {
    document.getElementById("status").textContent = "❌ MetaMask not found";
  }
});

document.getElementById("claimButton").addEventListener("click", claimNOVA);

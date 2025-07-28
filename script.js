
async function connectWallet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      window.web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      window.account = accounts[0];
      document.getElementById("walletAddress").innerText = "Connected: " + window.account;
    } catch (error) {
      alert("Wallet connection failed.");
    }
  } else {
    alert("MetaMask not found.");
  }
}

document.getElementById("connectWallet").onclick = connectWallet;

document.getElementById("claimBtn").onclick = async function () {
  try {
    if (!window.web3 || !window.account) {
      alert("Please connect your wallet first.");
      return;
    }

    const contractAddress = "0xe3d931336f6528246349f9ce6db6F7e20C0c58b8";
    const contract = new web3.eth.Contract(abi, contractAddress);

    const gas = await contract.methods.claim().estimateGas({ from: window.account }).catch(() => 150000);

    const tx = {
      from: window.account,
      to: contractAddress,
      data: contract.methods.claim().encodeABI(),
      gas
    };

    const txHash = await web3.eth.sendTransaction(tx);
    alert("Claim sent successfully! Transaction: " + txHash.transactionHash);
  } catch (e) {
    alert("Error: " + e.message);
    console.error(e);
  }
};

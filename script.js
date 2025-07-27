
let web3;
let contract;
let userAddress;

const contractAddress = "0xe3d931336f6528246349f9ce6db6F7e20C0c58b8";

async function connectWallet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      userAddress = accounts[0];

      contract = new web3.eth.Contract(contractABI, contractAddress);  // Uses ABI from abi.js

      document.getElementById("walletStatus").innerText = "Wallet Connected: " + userAddress;
    } catch (error) {
      console.error("Wallet connection failed", error);
      alert("Connection failed. Please try again.");
    }
  } else {
    alert("MetaMask or compatible wallet not detected.");
  }
}

async function claimTokens() {
  if (!contract || !userAddress) {
    alert("Connect your wallet first.");
    return;
  }

  try {
    await contract.methods.claim().send({ from: userAddress });
    alert("Claim successful!");
  } catch (error) {
    console.warn("Standard .send() failed, trying fallback...", error);

    try {
      const encodedData = contract.methods.claim().encodeABI();
      await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: userAddress,
          to: contractAddress,
          data: encodedData
        }]
      });
      alert("Claim sent (fallback successful)!");
    } catch (fallbackError) {
      console.error("Fallback claim failed", fallbackError);
      alert("Claim failed. Please try again or check your wallet.");
    }
  }
}

document.getElementById("connectWalletButton").addEventListener("click", connectWallet);
document.getElementById("claimButton").addEventListener("click", claimTokens);

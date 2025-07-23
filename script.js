const connectWalletButton = document.getElementById("connectWalletButton");
const claimButton = document.getElementById("claimButton");
const status = document.getElementById("status");

let account;

const abi = [
  {
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contractAddress = "0x93f195aC9fe71994487B18b065d80021C14eBcd5";

connectWalletButton.addEventListener("click", async () => {
  if (typeof window.ethereum === "undefined") {
    status.textContent = "MetaMask not found.";
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    account = accounts[0];
    status.textContent = `Connected: ${account}`;
    claimButton.disabled = false;
  } catch (err) {
    status.textContent = "Connection failed.";
  }
});

claimButton.addEventListener("click", async () => {
  if (!account) return;

  const web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(abi, contractAddress);

  try {
    await contract.methods.claim().send({ from: account });
    status.textContent = "Claim successful!";
  } catch (err) {
    status.textContent = "Claim failed.";
  }
});
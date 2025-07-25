
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

const contractAddress = "0xF94AF8B1E9B863F51af70869906762eb4CC37a9";

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
    claimButton.style.pointerEvents = "auto";
  } catch (err) {
    status.textContent = "Connection failed.";
  }
});

claimButton.addEventListener("click", async function handleClaim(event) {
  event.preventDefault();
  if (!account) return;

  const web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(abi, contractAddress);

  try {
    console.log("Claim button clicked");
    await contract.methods.claim().send({ from: account });
    status.textContent = "Claim successful!";
  } catch (err) {
    status.textContent = "Claim failed.";
  }
});

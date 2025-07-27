let web3;
let contract;
const contractAddress = '0xf94AF...C37a9'; // Replace with actual contract address

window.addEventListener('load', async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      document.getElementById("connectWalletButton").innerText = "Connected: " + accounts[0];
      contract = new web3.eth.Contract(contractABI, contractAddress);
      document.getElementById("claimButton").disabled = false;
    } catch (error) {
      console.error("User denied wallet connection");
    }
  } else {
    alert("Please install MetaMask to use this dApp!");
  }
});

document.getElementById("claimButton").addEventListener("click", async () => {
  const accounts = await web3.eth.getAccounts();
  try {
    const gas = await contract.methods.claim().estimateGas({ from: accounts[0] });
    contract.methods.claim().send({ from: accounts[0], gas });
  } catch (err) {
    console.error("Claim failed:", err);
    document.getElementById("status").innerText = "Claim failed.";
  }
});


let web3;
let account;

async function waitForMetaMask() {
  while (typeof window.ethereum === 'undefined') {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  web3 = new Web3(window.ethereum);
}

document.getElementById('connectWalletBtn').onclick = async function() {
  await waitForMetaMask();
  try {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    account = accounts[0];
    document.getElementById('walletAddress').innerText = `Connected: ${account}`;
  } catch (err) {
    document.getElementById('status').innerText = "Connection failed.";
    console.error(err);
  }
};

document.getElementById('claimBtn').onclick = async function() {
  await waitForMetaMask();
  try {
    const contract = new web3.eth.Contract(abi, '0xe3d931336f6528246349f9ce6db6F7e20C0c58b8');
    const gas = await contract.methods.claim().estimateGas({ from: account });
    const tx = await contract.methods.claim().send({ from: account, gas });
    document.getElementById('status').innerText = "Claim successful!";
    console.log("TX:", tx);
  } catch (e) {
    document.getElementById('status').innerText = "Claim failed.";
    console.error("Claim error:", e);
    alert("Error: " + e.message);
  }
};

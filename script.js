let web3;
let contract;
const contractAddress = '0xe3d931336f6528246349f9ce6db6F7e20C0c58b8';

const abi = [
  {
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

window.addEventListener('load', async () => {
  if (typeof window.ethereum !== 'undefined') {
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(abi, contractAddress);

    const connectButton = document.getElementById('connectWalletButton');
    const claimButton = document.getElementById('claimButton');

    connectButton.addEventListener('click', async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAddress = accounts[0];
        connectButton.innerText = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;

        // Enable claim button after connection
        if (claimButton) claimButton.disabled = false;

      } catch (err) {
        alert(`❌ Wallet connection failed: ${err.message}`);
        console.error(err);
      }
    });

    claimButton.addEventListener('click', async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAddress = accounts[0];

        console.log('Claiming from:', userAddress);

        let gasEstimate;
        try {
          gasEstimate = await contract.methods.claim().estimateGas({ from: userAddress });
        } catch (err) {
          console.warn('Gas estimate failed, using fallback:', err.message);
          gasEstimate = 100000; // fallback
        }

        const tx = await contract.methods.claim().send({
          from: userAddress,
          gas: gasEstimate
        });

        console.log('✅ Claim TX Success:', tx);
        alert('✅ NOVA claimed successfully!');
      } catch (err) {
        alert(`❌ Claim failed: ${err.message}`);
        console.error('Claim error:', err);
      }
    });

  } else {
    alert('⚠️ Please open this site in a Web3 wallet like MetaMask or Base Wallet.');
    console.warn('Ethereum provider not found.');
  }
});

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
    console.log('✅ Ethereum provider detected');

    // Load Web3 and contract AFTER wallet connects
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(abi, contractAddress);

    const connectButton = document.getElementById('connectWalletButton');
    const claimButton = document.getElementById('claimButton');

    connectButton.addEventListener('click', async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAddress = accounts[0];
        connectButton.innerText = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
        console.log('🔗 Wallet connected:', userAddress);
      } catch (err) {
        console.error('❌ Wallet connection failed:', err);
        alert('Failed to connect wallet.');
      }
    });

    claimButton.addEventListener('click', async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAddress = accounts[0];

        // Estimate gas (safely, mobile-friendly)
        const gasEstimate = await contract.methods.claim().estimateGas({ from: userAddress });

        // Send transaction
        const tx = await contract.methods.claim().send({
          from: userAddress,
          gas: gasEstimate
        });

        console.log('✅ Claim successful:', tx);
        alert('✅ NOVA claimed successfully!');
      } catch (err) {
        console.error('❌ Claim failed:', err);
        if (err.message?.includes('User denied')) {
          alert('Transaction cancelled.');
        } else {
          alert('❌ Claim failed. See console for details.');
        }
      }
    });

  } else {
    alert('⚠️ No Web3 wallet detected. Please open this site in MetaMask or Base Wallet.');
    console.warn('❌ No Ethereum provider found.');
  }
});

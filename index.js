import { ethers } from "./ethers-5.6.esm.min.js";
import { contractAddress, abi } from "./constants.js";

if (typeof window.ethereum !== "undefined") {
  console.log("I see a MetaMask.");
} else {
  console.log("No MetaMask detected.");
}

const connect = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log(error);
    }
    connectBtn.innerHTML = "You're connected";
    const accounts = await ethereum.request({ method: "eth_accounts" });
    accountText.innerHTML = `Connected with: ${accounts}`;
    console.log(accounts);
  } else {
    connectBtn.innerHTML = "Please install MetaMask";
  }
};

const fund = async () => {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`Funding the contract with ${ethAmount}...`);
  if (typeof window.ethereum !== "undefined") {
    // provider -> connection to the blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // signer/wallet
    const signer = provider.getSigner();
    // contract we're interacting with
    const contract = new ethers.Contract(contractAddress, abi, signer);
    // ABI & Address
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  } else {
    fundBtn.innerHTML = "Please install MetaMask";
  }
};

function listenForTransactionMine(transactionResponse, provider) {
  hashTxt.innerHTML = `Tx hash: ${transactionResponse.hash}`;
  hashTxtBis.innerHTML = `Please wait...`;
  hashTxtTer.innerHTML = `<a href="https://rinkeby.etherscan.io/tx/${transactionResponse.hash}" target="_blank">Link to follow your transaction on Rinkeby Explorer</a>`;
  console.log(`Mining ${transactionResponse.hash}`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      hashTxtBis.innerHTML = `Your transaction has succeeded with ${transactionReceipt.confirmations} confirmations.`;
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations. `
      );
      resolve();
    });
  });
}

async function withdraw() {
  console.log(`Withdrawing...`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask";
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const balance = await provider.getBalance(contractAddress);
      console.log(ethers.utils.formatEther(balance));
      balanceTxt.innerHTML = `Current balance is: ${ethers.utils.formatEther(
        balance
      )}ETH`;
    } catch (error) {
      console.log(error);
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask";
  }
}

const connectBtn = document.getElementById("connectBtn");
const fundBtn = document.getElementById("fundBtn");
const withdrawBtn = document.getElementById("withdrawBtn");
const balanceBtn = document.getElementById("balanceBtn");
connectBtn.onclick = connect;
fundBtn.onclick = fund;
withdrawBtn.onclick = withdraw;
balanceBtn.onclick = getBalance;

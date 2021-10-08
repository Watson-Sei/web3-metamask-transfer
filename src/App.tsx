import React from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import './App.css';
import BigNumber from "bignumber.js";
import Button from '@mui/material/Button';

const toAddress: string = "0xB863d22442084d3B3a0D6321a0F2b61852215FDD"; // 送信先アドレス
const tokenAddress: string = "0xbD9c419003A36F187DAf1273FCe184e1341362C0"; // コントラクトアドレス
const ERC20TransferABI: any = [
  {
      "constant": true,
      "inputs": [],
      "name": "name",
      "outputs": [
          {
              "name": "",
              "type": "string"
          }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  },
  {
      "constant": false,
      "inputs": [
          {
              "name": "_spender",
              "type": "address"
          },
          {
              "name": "_value",
              "type": "uint256"
          }
      ],
      "name": "approve",
      "outputs": [
          {
              "name": "",
              "type": "bool"
          }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "constant": true,
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
          {
              "name": "",
              "type": "uint256"
          }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  },
  {
      "constant": false,
      "inputs": [
          {
              "name": "_from",
              "type": "address"
          },
          {
              "name": "_to",
              "type": "address"
          },
          {
              "name": "_value",
              "type": "uint256"
          }
      ],
      "name": "transferFrom",
      "outputs": [
          {
              "name": "",
              "type": "bool"
          }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "constant": true,
      "inputs": [],
      "name": "decimals",
      "outputs": [
          {
              "name": "",
              "type": "uint8"
          }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  },
  {
      "constant": true,
      "inputs": [
          {
              "name": "_owner",
              "type": "address"
          }
      ],
      "name": "balanceOf",
      "outputs": [
          {
              "name": "balance",
              "type": "uint256"
          }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  },
  {
      "constant": true,
      "inputs": [],
      "name": "symbol",
      "outputs": [
          {
              "name": "",
              "type": "string"
          }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  },
  {
      "constant": false,
      "inputs": [
          {
              "name": "_to",
              "type": "address"
          },
          {
              "name": "_value",
              "type": "uint256"
          }
      ],
      "name": "transfer",
      "outputs": [
          {
              "name": "",
              "type": "bool"
          }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "constant": true,
      "inputs": [
          {
              "name": "_owner",
              "type": "address"
          },
          {
              "name": "_spender",
              "type": "address"
          }
      ],
      "name": "allowance",
      "outputs": [
          {
              "name": "",
              "type": "uint256"
          }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  },
  {
      "payable": true,
      "stateMutability": "payable",
      "type": "fallback"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "name": "owner",
              "type": "address"
          },
          {
              "indexed": true,
              "name": "spender",
              "type": "address"
          },
          {
              "indexed": false,
              "name": "value",
              "type": "uint256"
          }
      ],
      "name": "Approval",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "name": "from",
              "type": "address"
          },
          {
              "indexed": true,
              "name": "to",
              "type": "address"
          },
          {
              "indexed": false,
              "name": "value",
              "type": "uint256"
          }
      ],
      "name": "Transfer",
      "type": "event"
  }
]; // いわゆるABI

function App() {

  const [address, setAddress] = React.useState<string>(""); // ユーザーのウォレットアドレス
  const [balance, setBalance] = React.useState<string | null>(null); // ユーザーのJPYC残高を格納
  const [transfer, setTransfer] = React.useState<boolean>(false); // 送金中はTrueでボタンを無効化

  var web3: Web3;

  const enable = async () => {
    const provider = await detectEthereumProvider();
    if (provider && window.ethereum?.isMetaMask) {
      console.log('Welcome to MetaMask User!');
        web3 = new Web3(Web3.givenProvider)
        web3.eth.defaultChain = "ropsten";

        const accounts = await web3.eth.requestAccounts();
        setAddress(accounts[0]);
        CheckBalance();
    } else {
      console.log('Please Install MetaMask!');
      window.location.href = "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=ja";
    }
  }

  enable();

  // 残高確認ボタンや残高情報更新の際に発火させる
  const CheckBalance = async () => {
    if (address) {
      const contract = new web3.eth.Contract(ERC20TransferABI, tokenAddress);
      const decimals = await contract.methods.decimals().call();
      const BNbalance = ((new BigNumber(await contract.methods.balanceOf(address).call())).div(10**decimals)).toString();
      setBalance(BNbalance);
    }
  }

  // toAddressに100JPYCを送金します
  const OneCoinCheering = async () => {
    if (address && Number(balance) >= 100 && toAddress !== address) {
      const contract = new web3.eth.Contract(ERC20TransferABI, tokenAddress);
      
      const jpycDecimals = web3.utils.toBN(18);
      const jpycAmountToTransferFrom = web3.utils.toBN(100);
      const caluclatedTransferValue = web3.utils.toHex(jpycAmountToTransferFrom.mul(web3.utils.toBN(10).pow(jpycDecimals)));

      contract.methods.transfer(toAddress, caluclatedTransferValue)
        .send({from: address}, () => {
        })
        .on('transactionHash', function(hash: any) {
          setTransfer(true);
          console.log(hash);
        })
        .on('receipt', function(receipt: any) {
          setTransfer(false);
          CheckBalance();
        })
        .on('error', function(error: any) {
          setTransfer(false);
          CheckBalance();
        });
    }
  }

  return (
    <React.Fragment>
      {address && (
        <div style={{ width: '250px', height: 'auto', border: '3px solid #16449A', textAlign: 'center', borderRadius: '20px', padding: '10px'}}>
          <p style={{ fontWeight: 'bold' }}>JPYCを投げ銭する</p>
          <Button disabled={transfer} variant="contained" onClick={OneCoinCheering}>100JPYC送金</Button>
        </div>
      )}
    </React.Fragment>
  );
}

export default App;
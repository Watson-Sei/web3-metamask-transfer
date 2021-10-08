import React, {useEffect,useState,useRef} from 'react';
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

  // useRefで値を保持します
  const web3 = useRef<Web3 | null>(null);
  const address = useRef<string>("");
  const jpyc = useRef<any | null>(null);
  // 長期間の保持が必要じゃない場合useState
  const [balance, setBalance] = useState<string>(""); 
  const [transfer, setTransfer] = useState<boolean>(false);

  // DOM読み込み時一度だけと、balanceの値が変化した際に呼び出します
  useEffect(() => {
    const f = async () => {
        const provider = await detectEthereumProvider();
        if (provider && window.ethereum?.isMetaMask) {
            console.log('Welcome to MetaMask User!');
            // web3のdefault設定(自由)
            web3.current = new Web3(Web3.givenProvider);
            web3.current.eth.defaultChain = "ropsten";

            // ユーザーのアカウントを保存します(後でuseStateか確認する)
            const accounts = await web3.current.eth.requestAccounts();
            address.current = accounts[0];
            // Contractの値を永久保持させる
            jpyc.current = new web3.current.eth.Contract(ERC20TransferABI, tokenAddress);
            CheckBalance();
        } else {
            console.log('Please Install MetaMask!');
        }
    }
    f();
  }, [balance])

  // ユーザーの現在のJPYCの残高取得関数
  const CheckBalance = async () => {
      if (address.current !== "") {
        const decimals = await jpyc.current.methods.decimals().call();
        const BNbalance = ((new BigNumber(await jpyc.current.methods.balanceOf(address.current).call())).div(10**decimals)).toString();
        setBalance(BNbalance);
      }
  }

  // 100JPYCを投げ銭する関数
  const OneCoinCheering = async () => {
      console.log(balance)
      if (address.current !== '' && Number(balance) >= 100 && address.current !== toAddress) {
        const jpycDecimals: any = web3.current?.utils.toBN(18);
        const jpycAmountToTransferFrom: any = web3.current?.utils.toBN(100);
        const caluclatedTransferValue = web3.current?.utils.toHex(jpycAmountToTransferFrom?.mul(web3.current.utils.toBN(10).pow(jpycDecimals)));

        jpyc.current.methods.transfer(toAddress, caluclatedTransferValue)
            .send({from: address.current})
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
          <Button disabled={transfer} variant="contained" onClick={OneCoinCheering} >100JPYC送金</Button>
        </div>
      )}
    </React.Fragment>
  );
}

export default App;
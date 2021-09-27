import React from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import './App.css';

function App() {

  const [address, setAddress] = React.useState<string>("");
  const [metaState, setMetastate] = React.useState<boolean>(false);
  const [price, setPrice] = React.useState<string>("");

  var web3: Web3;

  const enable = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      console.log('Welcome to MetaMask User!');
        setMetastate(true);
        web3 = new Web3(Web3.givenProvider)
        web3.eth.defaultChain = "ropsten";
    } else {
      console.log('Please Install MetaMask!');
      setMetastate(false);
    }
  }

  enable();

  const connect = async () => {
    const accounts = await web3.eth.requestAccounts();
    setAddress(accounts[0]);
  }

  const handleChange = (event: { target: { name: any; value: React.SetStateAction<string>; }; }) => {
    switch (event.target.name) {
      case 'price': 
        setPrice(event.target.value);
        break
      default:
        console.log('key not found');
    }
  }

  const sendEthereum = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    web3.eth.sendTransaction({
      from: address,
      to: '0x...', // 送り主のアドレスを指定してください
      value: web3.utils.toWei(price, 'ether')
    })
      .on('receipt', function(receipt) {
        console.log(receipt);
      })
      .on('error', console.error);
  }

  return (
    <React.Fragment>
      <div className="container">
      {metaState ? (
        <>
        <img src={`${process.env.PUBLIC_URL}/metamask.gif`} alt="" />
          <h2>Welcome to MetaMask User!</h2>
          <p>{address}</p>
          {!address ? (
            <button onClick={connect}>Connect</button>
          ): (
            <>
              <div>
                <form onSubmit={sendEthereum}>
                  <label>
                    Price(eth): 
                    <input 
                      type="text" 
                      name="price" 
                      value={price} 
                      onChange={handleChange} 
                      onKeyPress={e => {
                        if (e.key === 'Enter') e.preventDefault();
                      }} 
                    />
                  </label>
                  <button type="submit">送金</button>
                </form>
              </div>
              <p>disconnectしたい方は<a href="https://metamask.zendesk.com/hc/en-us/articles/360059535551-Disconnect-wallet-from-Dapp">こちらから</a></p>
            </>
          )}
        </>
      ): (
        <h2>Please Install MetaMask!</h2>
      )}
      </div>
    </React.Fragment>
  );
}

export default App;

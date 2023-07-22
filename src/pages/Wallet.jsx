import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useContractWrite, useAccount, useContractRead } from 'wagmi';
import walletABI from '../abi/Wallet.json';
import Button from '../components/ui/Button';

const contract = '0x9D9955688649A7071a032DBf1e565023E6775690';

const Wallet = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState(0);

  const handleAmountChange = e => {
    const { value } = e.target;
    setAmount(value);
  };

  const { data: userBalance } = useContractRead({
    address: contract,
    abi: walletABI,
    functionName: 'userBalance',
    args: [address],
    enabled: isConnected,
    watch: true,
    onError(error) {
      console.log('Error', error);
    },
  });

  const { isLoading: isLoadingDepositTx, write: writeDepositTx } = useContractWrite({
    address: contract,
    abi: walletABI,
    functionName: 'deposit',
    onSuccess() {
      setAmount(0);
    },
    onError(error) {
      console.log('Error', error);
    },
  });

  const { isLoading: isLoadingWithdraw, write: writeWithdrawTx } = useContractWrite({
    address: contract,
    abi: walletABI,
    functionName: 'withdraw',
    onError(error) {
      console.log('Error', error);
    },
  });

  return (
    <div className="container my-5 my-lg-10">
      <div className="row">
        <div className="col-6">
          <h1 className="heading-medium mb-5">Basic contract interaction</h1>
          <div className="d-flex align-items-center">
            <div>
              <input
                type="text"
                className="form-control"
                value={amount}
                onChange={handleAmountChange}
              />
            </div>
            <div className="ms-3">
              <Button
                loading={isLoadingDepositTx}
                disabled={!isConnected || !Number(amount)}
                onClick={() =>
                  writeDepositTx({
                    value: ethers.parseEther(amount),
                  })
                }
                type="primary"
              >
                Deposit
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5">{ethers.formatEther(userBalance || '0')} ETH</div>
      {isConnected && Number(userBalance) > 0 ? (
        <div className="mt-2">
          <Button loading={isLoadingWithdraw} onClick={writeWithdrawTx} type="primary">
            Withdraw
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default Wallet;

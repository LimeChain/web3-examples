import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useSigner, useAccount } from 'wagmi';
import walletABI from '../abi/Wallet.json';
import Button from '../components/ui/Button';

const Wallet = () => {
  const { data: signer } = useSigner();
  const { address } = useAccount();

  const [contract, setContract] = useState();
  const [userBalance, setUserBalance] = useState('0');
  const [amount, setAmount] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  const handleAmountChange = e => {
    const { value } = e.target;
    setAmount(value);
  };

  useEffect(() => {
    if (signer) {
      const _contract = new ethers.Contract(
        '0x9D9955688649A7071a032DBf1e565023E6775690',
        walletABI,
        signer,
      );

      setContract(_contract);
    }
  }, [signer]);

  const getBalance = useCallback(async () => {
    const result = await contract.userBalance(address);
    const balanceFormatted = ethers.utils.formatEther(result);
    setUserBalance(balanceFormatted);
  }, [contract, address]);

  useEffect(() => {
    contract && getBalance();
  }, [contract, getBalance]);

  const handleDepositButtonClick = async () => {
    setIsLoading(true);

    try {
      const tx = await contract.deposit({ value: ethers.utils.parseEther(amount) });
      await tx.wait();

      setAmount('0');

      await getBalance();
    } catch (e) {
      console.log('e', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawButtonClick = async () => {
    setIsLoading(true);

    try {
      const tx = await contract.withdraw();
      await tx.wait();

      await getBalance();
    } catch (e) {
      console.log('e', e);
    } finally {
      setIsLoading(false);
    }
  };

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
              <Button loading={isLoading} onClick={handleDepositButtonClick} type="primary">
                Deposit
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5">{userBalance} ETH</div>
      {Number(userBalance) > 0 ? (
        <div className="mt-2">
          <Button loading={isLoading} onClick={handleWithdrawButtonClick} type="primary">
            Withdraw
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default Wallet;

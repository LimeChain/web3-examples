import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useSigner } from 'wagmi';
import electionABI from '../abi/Election.json';
import Button from '../components/ui/Button';

const Election = () => {
  const { data: signer } = useSigner();
  const contractAddress = '0x6F9D6E5Ac24507016FADda1898AadbE04b407df3';

  const electionMapping = {
    0: 'Tie',
    1: 'Biden',
    2: 'Trump',
  };

  const initialFormData = {
    name: '',
    votesBiden: 0,
    votesTrump: 0,
    stateSeats: 0,
  };

  // Contract states
  const [contract, setContract] = useState();
  const [contractData, setContractData] = useState({});
  const [isLoadingContractData, setIsLoadingContractData] = useState(true);

  // Form states
  const [electionFromData, setElectionFormData] = useState(initialFormData);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [formSubmitError, setFormSubmitError] = useState('');

  const getContractData = useCallback(async () => {
    setIsLoadingContractData(true);

    const currentLeader = await contract.currentLeader();
    const electionEnded = await contract.electionEnded();
    const seatsBiden = await contract.seats(1);
    const seatsTrump = await contract.seats(2);

    setContractData({ currentLeader, electionEnded, seatsBiden, seatsTrump });

    setIsLoadingContractData(false);
  }, [contract]);

  // Handlers
  const handleFormInputChange = e => {
    const { value, name } = e.target;

    setElectionFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitButtonClick = async () => {
    setIsLoadingSubmit(true);
    setFormSubmitError('');

    try {
      const { name, votesBiden, votesTrump, stateSeats } = electionFromData;

      const tx = await contract.submitStateResult([name, votesBiden, votesTrump, stateSeats]);
      await tx.wait();

      // const txResult = await tx.wait();
      // const { status, transactionHash } = txResult;

      setElectionFormData(initialFormData);

      await getContractData();
    } catch (e) {
      setFormSubmitError(e.reason);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const handleEndElectionButtonClick = async () => {
    setIsLoadingSubmit(true);

    try {
      const tx = await contract.endElection();
      await tx.wait();

      // const txResult = await tx.wait();
      // const { status, transactionHash } = txResult;

      await getContractData();
    } catch (e) {
      setFormSubmitError(e.reason);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  // Use effects
  useEffect(() => {
    if (signer) {
      const electionContract = new ethers.Contract(contractAddress, electionABI, signer);

      setContract(electionContract);
    }
  }, [signer]);

  useEffect(() => {
    contract && getContractData();
  }, [contract, getContractData]);

  return (
    <div className="container my-5 my-lg-10">
      <div className="row">
        <div className="col-6 offset-3">
          <h2 className="heading-medium text-center mb-5">Election</h2>
          {isLoadingContractData ? (
            <div className="d-flex justify-content-center align-items-center">
              <div class="spinner-border text-info" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p className="text-center ms-3">Loading...</p>
            </div>
          ) : (
            <>
              {' '}
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div className="text-center">
                      <p>{electionMapping[1]}</p>
                      <p>
                        <span class="badge text-bg-info text-small">{contractData.seatsBiden}</span>
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-bold">
                        Current {contractData.electionEnded ? 'winner' : 'leader'}
                      </p>
                      <p className="text-lead">{electionMapping[contractData.currentLeader]}</p>
                    </div>
                    <div className="text-center">
                      <p>{electionMapping[2]}</p>
                      <p>
                        <span class="badge text-bg-danger text-small">
                          {contractData.seatsTrump}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card mt-5">
                <div className="card-body">
                  {contractData.electionEnded ? (
                    <p>Election ended</p>
                  ) : (
                    <div className="">
                      {formSubmitError ? (
                        <div className="alert alert-danger mb-4">{formSubmitError}</div>
                      ) : null}

                      <div>
                        <p className="text-small text-bold">Name:</p>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={electionFromData.name}
                          onChange={handleFormInputChange}
                        />
                      </div>

                      <div className="mt-4">
                        <p className="text-small text-bold">Votes Biden:</p>
                        <input
                          type="text"
                          className="form-control"
                          name="votesBiden"
                          value={electionFromData.votesBiden}
                          onChange={handleFormInputChange}
                        />
                      </div>

                      <div className="mt-4">
                        <p className="text-small text-bold">Votes Trump:</p>
                        <input
                          type="text"
                          className="form-control"
                          name="votesTrump"
                          value={electionFromData.votesTrump}
                          onChange={handleFormInputChange}
                        />
                      </div>

                      <div className="mt-4">
                        <p className="text-small text-bold">State seats:</p>
                        <input
                          type="text"
                          className="form-control"
                          name="stateSeats"
                          value={electionFromData.stateSeats}
                          onChange={handleFormInputChange}
                        />
                      </div>

                      <div className="mt-4 d-flex justify-content-center">
                        <Button
                          onClick={handleSubmitButtonClick}
                          loading={isLoadingSubmit}
                          type="primary"
                        >
                          Submit
                        </Button>

                        <Button
                          className="ms-2"
                          onClick={handleEndElectionButtonClick}
                          loading={isLoadingSubmit}
                          type="secondary"
                        >
                          End election
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Election;

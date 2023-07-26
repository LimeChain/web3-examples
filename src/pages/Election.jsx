import React, { useState } from 'react';
import { useContractWrite, useAccount, useContractRead } from 'wagmi';

import electionABI from '../abi/Election.json';
import Button from '../components/ui/Button';

const Election = () => {
  const contract = '0xe02FeEe576e9F26a087b78f9c0Fe49Ff7ba0F76d';
  const { isConnected } = useAccount();
  const biden = 1;
  const trump = 2;
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

  // Form states
  const [electionFromData, setElectionFormData] = useState(initialFormData);
  const [formSubmitError, setFormSubmitError] = useState('');

  // Handlers
  const handleFormInputChange = e => {
    const { value, name } = e.target;

    setElectionFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const { data: currentLeader } = useContractRead({
    address: contract,
    abi: electionABI,
    functionName: 'currentLeader',
    enabled: isConnected,
    watch: true,
    onError(error) {
      console.log('Error', error);
    },
  });

  const { data: seatsBiden } = useContractRead({
    address: contract,
    abi: electionABI,
    functionName: 'seats',
    args: [biden],
    enabled: isConnected,
    watch: true,
    onError(error) {
      console.log('Error', error);
    },
  });

  const { data: seatsTrump } = useContractRead({
    address: contract,
    abi: electionABI,
    functionName: 'seats',
    args: [trump],
    enabled: isConnected,
    watch: true,
    onError(error) {
      console.log('Error', error);
    },
  });

  const { data: electionEnded } = useContractRead({
    address: contract,
    abi: electionABI,
    functionName: 'electionEnded',
    enabled: isConnected,
    watch: true,
    onError(error) {
      console.log('Error', error);
    },
  });

  const { isLoading: isLoadingSubmitStateResult, write: writeStateResult } = useContractWrite({
    address: contract,
    abi: electionABI,
    functionName: 'submitStateResult',
    args: [
      [
        electionFromData.name,
        electionFromData.votesBiden,
        electionFromData.votesTrump,
        electionFromData.stateSeats,
      ],
    ],
    onSuccess() {
      setElectionFormData(initialFormData);
    },
    onError(error) {
      console.log('Error', error);
      setFormSubmitError(error);
    },
  });

  const { isLoading: isLoadingEndElection, write: writeEndElection } = useContractWrite({
    address: contract,
    abi: electionABI,
    functionName: 'endElection',
    onSuccess() {
      setElectionFormData(initialFormData);
    },
    onError(error) {
      console.log('Error', error);
      setFormSubmitError(error);
    },
  });

  // // Use effects
  // useEffect(() => {
  //   if (isConnected) {
  //     const electionContract = new ethers.Contract(contractAddress, electionABI, signer);

  //     setContract(electionContract);
  //   }
  // }, [isConnected]);

  // useEffect(() => {
  //   contract && getContractData();
  // }, [contract, getContractData]);

  return (
    <div className="container my-5 my-lg-10">
      <div className="row">
        <div className="col-6 offset-3">
          <h2 className="heading-medium text-center mb-5">Election</h2>
          {!isConnected ? (
            <div className="d-flex justify-content-center align-items-center">
              <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Loading...</span>
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
                        <span className="badge text-bg-info text-small">{seatsBiden}</span>
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-bold">Current {electionEnded ? 'winner' : 'leader'}</p>
                      <p className="text-lead">{electionMapping[currentLeader]}</p>
                    </div>
                    <div className="text-center">
                      <p>{electionMapping[2]}</p>
                      <p>
                        <span className="badge text-bg-danger text-small">{seatsTrump}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card mt-5">
                <div className="card-body">
                  {electionEnded ? (
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
                          onClick={writeStateResult}
                          loading={isLoadingSubmitStateResult}
                          type="primary"
                        >
                          Submit
                        </Button>

                        <Button
                          className="ms-2"
                          onClick={writeEndElection}
                          loading={isLoadingEndElection}
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

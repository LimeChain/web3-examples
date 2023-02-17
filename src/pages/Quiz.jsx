import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useSigner } from 'wagmi';
import Button from '../components/ui/Button';

import quizFactory from '../abi/QuizFactory.json';
import quizGame from '../abi/QuizGame.json';
const FACTORY_CONTRACT_ADDRESS = '0x57a38Df7FF6300C2F8EE2C34A2c5eCf36C85666e';
const salt = 'this is my salt';

function Quiz() {
  const { data: signer } = useSigner();

  const [quizFactoryContract, setQuizFactoryContract] = useState();
  const [gameContract, setGameConract] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCreateGame, setIsLoadingCreateGame] = useState(false);
  const [isLoadingGuessGame, setIsLoadingGuessGame] = useState(false);
  const [createGameQuestion, setCreateGameQuestion] = useState('');
  const [createGameAnswer, setCreateGameAnswer] = useState('');
  const [guessGameAnswer, setGuessGameAnswer] = useState('');
  const [gameContractDetails, setGameContractDetails] = useState();
  const [games, setGames] = useState();
  const [error, setError] = useState();

  // Listen for changes in signer and load the Game Factory Contract
  useEffect(() => {
    if (signer) {
      const _quizFactoryContract = new ethers.Contract(
        FACTORY_CONTRACT_ADDRESS,
        quizFactory.abi,
        signer,
      );

      setQuizFactoryContract(_quizFactoryContract);
    }
  }, [signer]);

  // Read the Game Factory contract for deployed games
  const handleLoadGamesFromFactoryContract = async () => {
    setIsLoading(true);
    try {
      const results = await quizFactoryContract.getQuizzes();
      setGames(results);
    } catch (e) {
      console.log('e', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Deploy new Game
  const handleCreateGame = async () => {
    try {
      setIsLoadingCreateGame(true);
      const hashedAnswer = ethers.utils.keccak256(
        ethers.utils.solidityPack(['string', 'string'], [salt, createGameAnswer]),
      );
      const tx = await quizFactoryContract.createQuiz(createGameQuestion, hashedAnswer);
      await tx.wait();
      setCreateGameQuestion('');
      setCreateGameAnswer('');
    } catch (e) {
      console.log('e', e);
    } finally {
      setIsLoadingCreateGame(false);
      handleLoadGamesFromFactoryContract();
    }
  };

  // Load the Game Contract
  const handleLoadGameContract = async address => {
    if (signer) {
      const _gameContract = new ethers.Contract(address, quizGame.abi, signer);
      setGameConract(_gameContract);
    }
  };

  // Load the Game Contract Details
  const getGameContractDetails = useCallback(async () => {
    const gameContractQuestion = await gameContract.question();
    const balance = await gameContract.getBalance();
    setGameContractDetails({ question: gameContractQuestion, balance: balance.toString() });
  }, [gameContract]);

  // Listen for changes in Game Contract and trigger to load the details
  useEffect(() => {
    gameContract && getGameContractDetails();
  }, [gameContract, getGameContractDetails]);

  // Play Game
  const handlePlayGame = async () => {
    try {
      setError('');
      setIsLoadingGuessGame(true);

      const tx = await gameContract.guess(guessGameAnswer);
      await tx.wait();
      setGuessGameAnswer('');
    } catch (e) {
      console.log('e', e);
      setError(e.reason);
    } finally {
      setIsLoadingGuessGame(false);
    }
  };

  // Handle inputs for question in deployment of a new game
  const handleCreateQuestionChange = event => {
    setCreateGameQuestion(event.target.value);
  };

  // Handle inputs for answer in deployment of a new game
  const handleCreateAnswerChange = event => {
    setCreateGameAnswer(event.target.value);
  };

  // Handle inputs for answer in deployment of a new game
  const handleGuessAnswerChange = event => {
    setGuessGameAnswer(event.target.value);
  };

  // UI Elements
  return (
    <div className="container my-5">
      <h1>LimeAcademy Quiz Game</h1>
      <div className="mt-5">
        {/* <Link to="/styleguide" className="btn btn-primary">
          See styleguide
        </Link> */}
        <Button loading={isLoading} onClick={handleLoadGamesFromFactoryContract}>
          Load Games from Factory Contract
        </Button>
      </div>
      {games && games.length > 0 && (
        <div className="container my-5">
          <div className="mt-5">
            {/* <Button loading={isLoading} onClick={handleLoadGameContract}>
            Load Game Contract
          </Button> */}
            <div className="row">
              <div className="col-md-6">
                <p className="text-main mt-3">There are currently {games.length} games:</p>
                {games.map(game => {
                  return (
                    <div className="row-md-6" key={game}>
                      <h2>Address:</h2>
                      <p> {game}</p>
                      <Button
                        loading={isLoadingCreateGame}
                        onClick={() => handleLoadGameContract(game)}
                      >
                        Play
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <hr className="mt-3 mb-6" />
          {gameContractDetails && (
            <div>
              <div className="row-md-6">
                <h3>Prize: {gameContractDetails.balance}</h3>
              </div>
              <form>
                <div className="form-group">
                  <label htmlFor="question">Question</label>
                  <input
                    type="text"
                    className="form-control"
                    id="question"
                    aria-describedby="question"
                    placeholder="Enter question"
                    value={gameContractDetails.question}
                    disabled={true}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="answer">Answer</label>
                  <input
                    type="password"
                    className="form-control"
                    id="answer"
                    placeholder="Answer"
                    onChange={handleGuessAnswerChange}
                    value={guessGameAnswer}
                  />
                </div>
              </form>
              <Button loading={isLoadingGuessGame} onClick={handlePlayGame}>
                Submit
              </Button>
            </div>
          )}
        </div>
      )}
      {games?.length == 0 && (
        <div>
          <div className="mb-4">
            <div className="row">
              <div className="col-md-6">
                <p className="text-main mt-3">
                  There are no games. Please create a game in the form bellow:
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <form>
              <div className="form-group">
                <label htmlFor="question">Question</label>
                <input
                  type="text"
                  className="form-control"
                  id="question"
                  aria-describedby="question"
                  placeholder="Enter question"
                  onChange={handleCreateQuestionChange}
                  value={createGameQuestion}
                />
              </div>
              <div className="form-group">
                <label htmlFor="answer">Answer</label>
                <input
                  type="password"
                  className="form-control"
                  id="answer"
                  placeholder="Answer"
                  onChange={handleCreateAnswerChange}
                  value={createGameAnswer}
                />
              </div>
            </form>
            <Button loading={isLoadingCreateGame} onClick={handleCreateGame}>
              Create Game
            </Button>
          </div>
        </div>
      )}

      {error && <div className="col-12">{error}</div>}
    </div>
  );
}

export default Quiz;

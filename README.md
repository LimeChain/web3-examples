# 😎 LimeAcademy Web3 advanced example

Election contract iteractions example.

## 📌 Prerequisites

If you are Windows user please consider using a proper [terminal app](https://hyper.is/).

[Node.js](https://nodejs.org/en/) is required to install dependencies and run project.

Recommended Node.js version: `18.13.0`

If you use another version, please use [n](https://github.com/tj/n) to manage.

Optionally [Yarn](https://classic.yarnpkg.com/lang/en/docs/install) could be used instead of `npm`.

For optimal developer friendly experience use [Visual Studio Code](https://code.visualstudio.com/) and install the following plugins:

- [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig) - High level code formatter
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - More customisable code formatter
- [ES7+ React/Redux/React-Native snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets) - React code snippets and autocomplete

A Web3 wallet is required as well. In our case we use [Metamask](https://metamask.io/). Project contracts are deployed at [Sepolia test network](https://metamask.zendesk.com/hc/en-us/articles/360059213492-ETH-on-Sepolia-and-Goerli-networks-testnets-) so please [change](https://medium.com/@mwhc00/how-to-enable-ethereum-test-networks-on-metamask-again-d7831da23a09) to that network in Metamask.

## ⚙️ Install dependencies

```shell
yarn
```

or

```shell
npm i
```

## 🚀 Available Scripts

In the project directory, you can run:

```shell
yarn start
```

or

```shell
npm start
```

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 🗄 Project description, structure and functionalities

Project uses [React.js](https://reactjs.org/) and it's bootstraped via [Create React app](https://create-react-app.dev/).

**Folders and files**

- `.vscode` - Some VSCode settings
- `public` - Public folder for assets like fonts and images
- `src` - Source code for the app, here is all the logic and functionalities
  - `abi` - Compiled json files by the contracts, used for contract interaction with `ethers.js`
  - `components` - React.js component files containing logic for specific behaviours, see more detials below
  - `pages` - Pages components defining the high level app information architecture
  - `style` - `scss` styling files, see more details below
  - `utils` - some helpers functions
  - `index.js` - initial point for boostraping the react.js project

For styling the app, we use sightly extended Bootstrap 5 version with scss. All the needed style variables are in `src/style/_variables.scss` and new styles can be added in `src/style/style.scss`

**Web3 connection**

In order to connect to a blockchain node we need a special library called [wagmi](https://wagmi.sh/react/getting-started).
This library provides react hooks and components for easier connection.
In `src/components/App.jsx` we import couple of components and variables for the connection:

```javascript
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { infuraProvider } from 'wagmi/providers/infura';
import { sepolia } from 'wagmi/chains';
```

After that we get an Infura provider, we need to pass the API KEY:

```javascript
const { publicClient, webSocketPublicClient } = configureChains(
  [sepolia],
  [infuraProvider({ apiKey: 'YOUR_INFURA_KEY' })],
);
```

Then we initialize a config object with the `client`:

```javascript
const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});
```

Keep in mind that the provider is a public one and **does not contain** a signer!

And finally wrap our application with a `WagmiConfig` component and a `config` prop provided:

```javascript
<WagmiConfig config={config}>...</WagmiConfig>
```

Now we can use some of the [hooks](https://wagmi.sh/react/hooks/useAccount) provided by `wagmi` library.

In `src/components/Header.jsx` we are using the `useConnect`, `useAccount` and `useBalance` hooks in order to get data for the connection, user address and user balance.

We can check the connection status with the `isConnected` function and to connect to the node with the `connect` function.

```javascript
const { isConnected, address } = useAccount();
const { connect, isLoading } = useConnect({
  connector,
});
```

In our case for the connection we are using Metamask as a provider and signer by importing the Metamask connector:

```javascript
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
```

initialising a `connector` object with the desired chain (imported also from `wagmi`):

```javascript
const connector = new MetaMaskConnector({
  chains: [sepolia],
  options: {
    shimDisconnect: true,
    UNSTABLE_shimOnConnectSelectAccount: true,
  },
});
```

and providing the `connector` to the `useConnect` hook:

```javascript
const { connect, isLoading } = useConnect({
  connector,
});
```

**Contract initialisation & interaction**
This logic is in src/pages/Election.jsx in branch `election`. In order to read a data from the contract, we are going to use the built-in hook - `useContractRead`:

Let's read some contract data:

```javascript
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
```

The first argument is the contract address, in our case is deployed at Sepolia test network.

The second argument is the contract ABI, which is compiled from the contract itself. It's a .json file describing all the properties and functions of the contract.

The third one is the function name.

Then if the function is accepting arguments, we need to pass them in the `args` field.

Then we can specify when this hook will be enabled. In our case on `isConnected`

Then `watch` param is for watching changes in the state.

Then the `onError` callback is for handling errors.

In this case, we are calling the function userBalance to get some data from the contract.

This function is a read one and does not require gas and signing.

Please Note: Observe the file Election.jsx and the way the data is read and loaded.

Let's see how we can call state change function and pass params:

```javascript
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
```

Please Note: Here the params are passed as one array.

Please Note: If you need to pass value to the contract, you can use the following param:

```javascript
value: parseEther('0.01');
```

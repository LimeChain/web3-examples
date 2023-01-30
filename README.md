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
import { WagmiConfig, configureChains, createClient } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
```

After that we get a provider from the `configureChains` function:

```javascript
const { provider } = configureChains([sepolia], [publicProvider()]);
```

Then we initialise a client with the `provider`:

```javascript
const client = createClient({
  provider,
  autoConnect: true,
});
```

Keep in mind that the provider is a public one and **does not contain** a signer!

And finally wrap our application with a `WagmiConfig` component and a `client` prop provided:

```javascript
<WagmiConfig client={client}>...</WagmiConfig>
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
});
```

and providing the `connector` to the `useConnect` hook:

```javascript
const { connect, isLoading } = useConnect({
  connector,
});
```

**Contract initialisation & interaction**
For contract interaction we are using a library called [ethers.js](https://docs.ethers.org/v5/).
This logic is in `src/pages/Election.jsx`.
In order to create a contract object we initialise the `Contract` class from the `ethers` library:

```javascript
const electionContract = new ethers.Contract(contractAddress, electionABI, signer);
```

The first argument is the contract address, in our case is deployed at Sepolia test network.
The second argument is the contract ABI, which is compiled from the contract itself. It's a `.json` file describing all the properties and functions of the contract.
The third one is the `signer` object get from the `useSigner()` hook provided by `wagmi`:

```javascript
const { data: signer } = useSigner();
```

After we have a contract initialised we can call its functions:

```javascript
const currentLeader = await contract.currentLeader();
```

In this case we are calling the function `currentLeader` to get some data from the contract. This function is a `read` one and does nor require gas and signing.

```javascript
const tx = await contract.submitStateResult([name, votesBiden, votesTrump, stateSeats]);
```

In this case we are calling a `write` function called `submitStateResult` which alters the state of the contract and requires a `signer` and some gas in order to be executed.

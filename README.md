# SPEED QUIZ DApp

Simple application that allows users create and partake in speed quizzes. To access a quiz, the user will use the quiz ID, which makes the quiz somewhat permissioned as only those with the quiz ID can partake in that quiz (...PRIVACY... LOL). To create a quiz an add fee of 2 celo is collected and to partake in the quiz a fee of 1 celo and the reward is 2 celo (2 times the start fee). Rewards are given to fast quizzers, with the aid of a benchmark and for a twist for every wrong answer the user picks he loses 10 seconds.

## Fixes Due to Feedback
- Each quiz section has a mapped pool that contains amount for that specific quiz id.
- Quiz owners can now fund or withdraw funds from their quizzes.
- A quiz can only be taken when the quiz balance is greater or equal to 5, if lesser that quiz will be labelled as unavailable for other users. So quiz owners need to deposit at least 5 celo for their quiz to be playable.
- A reward phrase courtesy of @FarzeenKist, is attachrd to the end quiz transaction to validate that the user actually took the quiz and is not trying to take advantage of the contract.

 # Test 
 [DEMO](https://eroslearningcurve.github.io/CeloQuiz101/)


# Usage
1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the google chrome store.
2. Create a wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.


# Install

```

npm install

```

or 

```

yarn install

```

# Start

```

npm run dev

```

# Build

```

npm run build

```

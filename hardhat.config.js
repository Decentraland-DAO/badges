require("@nomiclabs/hardhat-waffle");
const dotenv = require('dotenv')

dotenv.config()
const OPTIMISM_RPC_URL = process.env.OPTIMISM_RPC_URL
const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY || ''

module.exports = {
  defaultNetwork: 'optimism',
  networks: {
    hardhat: {},
    optimism: {
      url: OPTIMISM_RPC_URL,
      accounts: [SIGNER_PRIVATE_KEY]
    }
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  tasks: {
    badges: {
      description: 'Create, mint, airdrop, revoke, and burn badges.',
      action: require('./tasks/badges')
    }
  }
}



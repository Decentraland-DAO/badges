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
    createBadge: {
      description: 'Uploads a badge spec to IPFS and mints the badge',
      action: require('./tasks/createBadge')
    }
  }
}



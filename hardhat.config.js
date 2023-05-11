require("@nomiclabs/hardhat-waffle");
const dotenv = require('dotenv')

dotenv.config()

// RPCs
const OPTIMISM_RPC_URL = process.env.OPTIMISM_RPC_URL
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL
// Signers
const TESTING_PK = process.env.TESTING_PK || ''
const PRD_PK = process.env.PRD_PK || ''
// Rafts
const OPTIMISM_RAFT_ID = process.env.OPTIMISM_RAFT_ID
const POLYGON_TEST_RAFT_ID = process.env.POLYGON_TEST_RAFT_ID
const POLYGON_PROD_RAFT_ID = process.env.POLYGON_PROD_RAFT_ID

var POLYGON_BLOCK_EXPLORER = process.env.POLYGON_BLOCK_EXPLORER;
var POLYGON_RAFT_CONTRACT_ADDRESS = process.env.POLYGON_RAFTS_CONTRACT_ADDRESS;
var POLYGON_BADGES_CONTRACT_ADDRESS = process.env.POLYGON_BADGES_CONTRACT_ADDRESS;

module.exports = {
  defaultNetwork: 'optimism',
  networks: {
    hardhat: {},
    optimism: {
      url: OPTIMISM_RPC_URL,
      accounts: [TESTING_PK],
      raft_id: OPTIMISM_RAFT_ID,
      badgesContractAddress: process.env.OPTIMISM_BADGES_CONTRACT_ADDRESS,
      raftsContractAddress: process.env.OPTIMISM_RAFTS_CONTRACT_ADDRESS,
      blockExplorer: process.env.OPTIMISM_BLOCK_EXPLORER
    },
    polytest: {
      url: POLYGON_RPC_URL,
      accounts: [TESTING_PK],
      raft_id: POLYGON_TEST_RAFT_ID,
      badgesContractAddress: POLYGON_BADGES_CONTRACT_ADDRESS,
      raftsContractAddress: POLYGON_RAFT_CONTRACT_ADDRESS,
      blockExplorer: POLYGON_BLOCK_EXPLORER
    },
    polygon: {
      url: POLYGON_RPC_URL,
      accounts: [PRD_PK],
      raft_id: POLYGON_PROD_RAFT_ID,
      badgesContractAddress: POLYGON_BADGES_CONTRACT_ADDRESS,
      raftsContractAddress: POLYGON_RAFT_CONTRACT_ADDRESS,
      blockExplorer: POLYGON_BLOCK_EXPLORER
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



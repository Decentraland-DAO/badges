const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')
const { File, NFTStorage } = require('nft.storage')
const { abi: BadgesAbi } = require('@otterspace-xyz/contracts/out/Badges.sol/Badges.json')
const { getOtterspaceConfig } = require('./otterspaceConfig')

dotenv.config()
const API_KEY = process.env.NFT_STORAGE_API_KEY
const RAFT_ID = Number(process.env.RAFT_ID)
const SPEC_OWNER_ADDRESS = process.env.SIGNER_ADDRESS
const OTTERSPACE_CONFIG = getOtterspaceConfig(process.env.NETWORK_ID)
const RAFT_CONTRACT_ADDRESS = OTTERSPACE_CONFIG.raftContractAddress
const BADGES_CONTRACT_ADDRESS = OTTERSPACE_CONFIG.badgesContractAddress
const MANUAL_GAS_LIMIT = 1000000
const LOG_FILE_NAME = 'uploadedBadges.json'

async function storeBadgeSpec(name, description, imageName, expiresAt = undefined) {
  const client = new NFTStorage({ token: API_KEY })
  if (!imageName || imageName.length === 0) {
    throw new Error('Invalid image name')
  }
  const imagePath = path.join(__dirname, `../images/${imageName}`)
  let extension = imageName.split('.').pop()
  let file = new File([await fs.promises.readFile(imagePath)], `./image`, {
    type: 'image/' + extension,
  })

  let badgeSpec = {
    schema: 'https://api.otterspace.xyz/schemas/badge/1.0.1.json',
    name: name,
    description: description,
    properties: {
      raftTokenId: RAFT_ID,
      raftContractAddress: RAFT_CONTRACT_ADDRESS,
      createdByAddress: SPEC_OWNER_ADDRESS,
      expiresAt: typeof expiresAt === 'undefined' ? null : expiresAt,
    },
    image: file,
  }

  const metadata = await client.store(badgeSpec)
  const cid = metadata.ipnft

  const metadataUrl = `https://ipfs.io/ipfs/${cid}/metadata.json`
  const ipfsAddress = `ipfs://${cid}`
  const badgeData = {
    name: name,
    cid: cid,
    metadataUrl: metadataUrl,
    ipfsAddress: ipfsAddress,
    description: description,
    expiresAt: expiresAt,
    imageName: imageName,
  }
  console.log(`Uploaded: `, JSON.stringify(badgeData))

  saveJsonToFile(LOG_FILE_NAME, badgeData)

  return cid
}

function saveJsonToFile(logFileName, json) {
  const logFilePath = path.join(__dirname, `../${logFileName}`)
  let logData = []

  try {
    const data = fs.readFileSync(logFilePath, 'utf-8')
    logData = JSON.parse(data)
  } catch (err) {
    // If the log file doesn't exist, it will be created when we write to it later
  }
  logData.push(json)
  fs.writeFileSync(logFilePath, JSON.stringify(logData))
}

async function mintBadge(hre, badgeCid) {
  const [owner] = await hre.ethers.getSigners()
  const contract = new hre.ethers.Contract(BADGES_CONTRACT_ADDRESS, BadgesAbi, owner)
  const txn = await contract.connect(owner).createSpec(badgeCid, RAFT_ID)
  await txn.wait()
  console.log('Minted badge with txn hash:', txn.hash)
}

const airdrop = async (hre, badgeCid, recipients) => {
  const [owner] = await hre.ethers.getSigners()
  const contract = new hre.ethers.Contract(BADGES_CONTRACT_ADDRESS, BadgesAbi, owner)
  const recipientsArray = recipients.split(',')
  const txn = await contract.connect(owner).airdrop(recipientsArray, badgeCid)
  await txn.wait()
  console.log('Airdropped badge with txn hash:', txn.hash)
}

const revoke = async (hre, badgeId, reason = 2) => {
  const [owner] = await hre.ethers.getSigners()
  const contract = new hre.ethers.Contract(BADGES_CONTRACT_ADDRESS, BadgesAbi, owner)
  const txn = await contract.connect(owner).revokeBadge(RAFT_ID, badgeId, reason, { gasLimit: MANUAL_GAS_LIMIT })
  await txn.wait()
  console.log('Revoked badge with txn hash:', txn.hash)
}

const unequip = async (hre, badgeId) => {
  const [owner] = await hre.ethers.getSigners()
  const contract = new hre.ethers.Contract(BADGES_CONTRACT_ADDRESS, BadgesAbi, owner)
  const txn = await contract.connect(owner).unequip(badgeId)
  await txn.wait()
  console.log('Revoked badge with txn hash:', txn.hash)
}

module.exports = {
  storeBadgeSpec,
  mintBadge,
  airdrop,
  revoke,
  unequip,
}

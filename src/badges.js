const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')
const { File, NFTStorage } = require('nft.storage')
const { abi: BadgesAbi } = require('@otterspace-xyz/contracts/out/Badges.sol/Badges.json')

dotenv.config()
const API_KEY = process.env.NFT_STORAGE_API_KEY
const MANUAL_GAS_LIMIT = 1000000
const LOG_FILE_NAME = 'uploadedBadges.json'
const REASON_TENURE_ENDED = 2

async function storeBadgeSpec(networkName, raftId, signerAddress, raftContractAddress, name, description, imageName, expiresAt = undefined) {
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
      raftTokenId: raftId,
      raftContractAddress: raftContractAddress,
      createdByAddress: signerAddress,
      expiresAt: typeof expiresAt === 'undefined' ? null : expiresAt,
    },
    image: file,
  }

  const metadata = await client.store(badgeSpec)
  const cid = metadata.ipnft

  const metadataUrl = `https://ipfs.io/ipfs/${cid}/metadata.json`
  const ipfsAddress = `ipfs://${cid}/metadata.json`
  const badgeData = {
    name,
    cid,
    metadataUrl,
    ipfsAddress,
    description,
    expiresAt,
    imageName,
    network: networkName,
    raftId
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
  const contract = new hre.ethers.Contract(hre.network.config.badgesContractAddress, BadgesAbi, owner)
  const ipfsAddress = `ipfs://${badgeCid}/metadata.json`
  const txn = await contract.connect(owner).createSpec(ipfsAddress, hre.network.config.raft_id)
  await txn.wait()
  console.log(`Minted badge with txn: ${hre.network.config.blockExplorer}tx/${txn.hash}`)
  console.log('To airdrop this badge run: ')
  console.log(`npx hardhat --network ${hre.network.name} airdrop --badgecid ${badgeCid} --recipients `)
}

const airdrop = async (hre, badgeCid, recipients) => {
  const [owner] = await hre.ethers.getSigners()
  const contract = new hre.ethers.Contract(hre.network.config.badgesContractAddress, BadgesAbi, owner)
  const recipientsArray = recipients.split(',')
  const ipfsAddress = `ipfs://${badgeCid}/metadata.json`
  const txn = await contract.connect(owner).airdrop(recipientsArray, ipfsAddress)
  await txn.wait()
  console.log('Airdropped badge with txn hash:', txn.hash)
}

const revoke = async (hre, badgeId, reason = REASON_TENURE_ENDED) => {
  const [owner] = await hre.ethers.getSigners()
  const contract = new hre.ethers.Contract(hre.network.config.badgesContractAddress, BadgesAbi, owner)
  const txn = await contract.connect(owner).revokeBadge(hre.network.config.raft_id, badgeId, reason, { gasLimit: MANUAL_GAS_LIMIT })
  await txn.wait()
  console.log('Revoked badge with txn hash:', txn.hash)
}

const unequip = async (hre, badgeId) => {
  const [owner] = await hre.ethers.getSigners()
  const contract = new hre.ethers.Contract(hre.network.config.badgesContractAddress, BadgesAbi, owner)
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

const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')
const { File, NFTStorage } = require('nft.storage')
// const { Contract } = require("ethers");
const { abi: BadgesAbi } = require("@otterspace-xyz/contracts/out/Badges.sol/Badges.json");

dotenv.config()
const API_KEY = process.env.NFT_STORAGE_API_KEY
const RAFT_ID = Number(process.env.RAFT_ID)
const RAFT_CONTRACT_ADDRESS = process.env.RAFT_CONTRACT_ADDRESS
const BADGES_CONTRACT_ADDRESS = process.env.BADGES_CONTRACT_ADDRESS
const SPEC_OWNER_ADDRESS = process.env.SIGNER_ADDRESS
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

async function mintBadge(hre, specUri){
  const [owner] = await hre.ethers.getSigners();
  const contract = new hre.ethers.Contract(BADGES_CONTRACT_ADDRESS, BadgesAbi, owner)
  const txn = await contract.connect(owner).createSpec(specUri, RAFT_ID)
  await txn.wait()
  console.log('Minted badge with txn hash:', txn.hash)
}

const airdropBadge = async (hre, badgeCid, recipient) => {
  const [owner] = await hre.ethers.getSigners();
  const contract = new hre.ethers.Contract(BADGES_CONTRACT_ADDRESS, BadgesAbi, owner)
  const txn = await contract.connect(owner).airdrop([recipient], badgeCid)
  await txn.wait()
  console.log('Airdropped badge with txn hash:', txn.hash)
}

module.exports = {
  storeBadgeSpec,
  mintBadge,
  airdropBadge
}



const dotenv = require('dotenv')
const { storeBadgeSpec, mintBadge, airdrop, revoke, unequip } = require('../src/badges')
dotenv.config()

function getRaftId(hre) {
  const networkConfig = hre.network.config
  return Number(networkConfig.raft_id)
}

task('createBadge', 'Uploads a badge spec to IPFS and mints the badge')
  .addParam('name', 'Badge name')
  .addParam('description', 'Badge description')
  .addParam('image', 'Badge image')
  .setAction(async (taskArgs, hre) => {
    const { name, description, image } = taskArgs
    const raftId = getRaftId(hre)
    const [owner] = await hre.ethers.getSigners()
    const badgeCid = await storeBadgeSpec(
      hre.network.name,
      raftId,
      owner.address,
      hre.network.config.raftsContractAddress,
      name,
      description,
      image
    )
    await mintBadge(hre, badgeCid)
  })

task('mintBadge', 'Mints an IPFS badge spec')
  .addParam('badgecid', 'The CID of the badge in IPFS')
  .setAction(async (taskArgs, hre) => {
    const { badgecid } = taskArgs
    await mintBadge(hre, badgecid)
  })

task('airdrop', 'Airdrops a badge')
  .addParam('badgecid', 'The CID of the badge in IPFS')
  .addParam('recipients')
  .setAction(async (taskArgs, hre) => {
    const { badgecid, recipients } = taskArgs
    await airdrop(hre, badgecid, recipients)
  })

task('revoke', 'Revokes a badge')
  .addParam('badgeid', "The tokenId of the user's badge")
  .addOptionalParam(
    'reason',
    'The reason for revocation. Reason 0: Abuse Reason 1: Left community Reason 2: Tenure ended Reason 3: Other. Default is 2'
  )
  .setAction(async (taskArgs, hre) => {
    const { badgeid, reason } = taskArgs
    await revoke(hre, badgeid, reason)
  })

task('burn', 'Burns a badge so a user is not associated to it anymore')
  .addParam('badgeid', "The tokenId of the user's badge")
  .setAction(async (taskArgs, hre) => {
    const { badgeid } = taskArgs
    await unequip(hre, badgeid)
  })

module.exports = {
  createBadge: 'createBadge',
  mintBadge: 'mintBadge',
  airdrop: 'airdrop',
  revoke: 'revoke',
  burn: 'burn',
}

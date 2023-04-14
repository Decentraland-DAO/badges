const dotenv = require('dotenv')
const { storeBadgeSpec, mintBadge, airdropBadge } = require("../src/badges");
dotenv.config()

task('createBadge', 'Uploads a badge spec to IPFS and mints the badge')
  .setAction(async (taskArgs, hre) => {
    const {name, description, image} = taskArgs
    const badgeUri = await storeBadgeSpec(name, description, image)
    await mintBadge(badgeUri, hre)
  })

module.exports = {
  createBadge: 'createBadge'
}


task('mintBadge', 'Mints an IPFS badge spec')
  .addParam("badgeuri", "The CID of the badge in IPFS")
  .setAction(async (taskArgs, hre) => {
    const { badgeuri } = taskArgs
    await mintBadge(hre, badgeuri)
  })


task('airdropBadge', 'Airdrops a badge')
  .addParam("badgeuri", "The CID of the badge in IPFS")
  .addParam("recipient")
  .setAction(async (taskArgs, hre) => {
    const { badgeuri, recipient } = taskArgs
    await airdropBadge(hre, badgeuri, recipient)
  })

module.exports = {
  createBadge: 'createBadge',
  mintBadge: 'mintBadge',
  airdropBadge: 'airdropBadge'
}

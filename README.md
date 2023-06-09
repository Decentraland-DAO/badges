<p align="center">
    <img alt="Decentraland" src="https://decentraland.org/images/logo.png" width="60" />
</p>

<h1 align="center">
  Decentraland DAO Badges
</h1>

# Setup

Create an .env file from .env.example

```shell
  cp .env.example .env
```

### NFT Storage

- Create an account at [NFT Storage](https://nft.storage/)
- Get your API KEY
- Add it to `.env` as `NFT_STORAGE_API_KEY`

### Configure Alchemy RPC
- Create a user in [Alchemy](https://www.alchemy.com/)
- Create an Optimism / Polygon app
- Get your RPC HTTP URL and add it to `.env` as `OPTIMISM_RPC_URL` / `POLYGON_RPC_URL`

It should look like `https://opt-mainnet.g.alchemy.com/v2/your-api-key` or `https://polygon-mainnet.g.alchemy.com/v2/your-api-key`.

Notice that this url might change, so make sure to look into alchemy and get the right HTTP url for your RPC

### Get a Raft

You will need to have an [Otterspace Raft](https://www.otterspace.xyz/), and fill in the `.env` variables
`OPTIMISM_RAFT_ID`, `POLYGON_TEST_RAFT_ID` or `POLYGON_PROD_RAFT_ID`

### Configure the Signer

You will need a signer address to send the transactions, that should also be the raft owner.  
Fill in the following `.env` variables 

For Optimism and Polygon test raft
```
TESTING_ADDRESS
TESTING_PK
```
For Polygon prod raft 
```
PRD_ADDRESS
PRD_PK
```

# Run

### Create Badge

Use the following command to upload a badge spec to IPFS and mint it

```shell
 npx hardhat --network [networkConfig] createBadge --name "Badge Name" --description "Badge Description" --image "Badge.png"
```

- The `networkConfig` param can be `optimism`, `polytest` or `polygon`
- The `image` param needs to be the name of an image stored in `/images`
- You need to run this command from the root dir of the project
- badges uploaded to IPFS are added to the `uploadedBadges.json` file

#### Just mint

If you already uploaded the spec, or the minting failed, you can try minting again

```shell
npx hardhat --network optimism mintBadge --badgecid bafyreicojasgf7mqvclql3saq7hg7qtys6o227pyedpvmcjcow5obpuxqi
```

### Airdrop

```shell
 npx hardhat --network optimism airdrop --badgecid someBadgeCid --recipients someAddress,anotherAddress
```

### Revoke

Revokes a user badge. Use this to end a tenure (the default reason for revoking).
Available reasons are:
Reason 0: Abuse
Reason 1: Left community 
Reason 2: Tenure ended  
Reason 3: Other.
Default is 2

```shell
 npx hardhat --network optimism revoke --badgeid someId [--reason reasonNumber]
```

### Burn

Only the badge owner (the user) can burn the badge.  
If you are using this you should probably update `TESTING_PK` or `PRD_PK` to the desired user's. 

```shell
 npx hardhat --network optimism burn --badgeid someId
```

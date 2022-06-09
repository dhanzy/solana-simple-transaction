const solanaWeb3 = require("@solana/web3.js");
const {
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  clusterApiUrl,
  Connection,
} = require("@solana/web3.js");
const bs58 = require("bs58");

const TESTNET = false;

let fromKeypair = Keypair.generate(); // GENERATE A FROM KEYPAIR ADDRESS
let toKeypair = Keypair.generate(); // GNENERATE A TO KEYPAOIR ADDRESS

secretKey = bs58.decode(""); // ADD YOUR SECRET KEY HERE IF YOU WANT TO USE WALLET ADDRESS
// const walletPair = Keypair.fromSecretKey(secretKey); // Uncomment this part to use wallet keypair

let transaction = new Transaction();
console.log("Connecting to testnet");

let connection = new Connection(
  clusterApiUrl(TESTNET ? "testnet" : "devnet"),
  "confirmed"
);

const confirmTransaction = async (payer) => {
  let balance = await connection.getBalance(payer);
  console.log(`Wallet balance is ${balance}`);
  console.log("Creating airdrop txn");
  const blockHash = await connection.getLatestBlockhash();
  let airdropSignature = await connection.requestAirdrop(
    payer,
    2 * solanaWeb3.LAMPORTS_PER_SOL
  );

  console.log("Confirming airdrop transaction");
  await connection.confirmTransaction({
    blockHash: blockHash.blockhash,
    lastValidBlockHeight: blockHash.lastValidBlockHeight,
    signature: airdropSignature,
  });
  console.log("confirmed Transaction");
  balance = await connection.getBalance(payer);
  console.log(`Wallet balance is ${balance}`);
};

const main = async () => {
  await confirmTransaction(fromKeypair.publicKey);
  // await confirmTransaction(toKeypair.publicKey);

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toKeypair.publicKey,
      lamports: solanaWeb3.LAMPORTS_PER_SOL / 2,
    })
  );

  await sendAndConfirmTransaction(connection, transaction, [fromKeypair])
    .then((signature) => {
      console.log(signature);
      console.log(
        `view Transaction on https://explorer.solana.com/tx/${signature}?cluster=${
          TESTNET ? "testnet" : "devnet"
        }`
      );
    })
    .catch((error) => {
      console.log(error);
    });
};

main();

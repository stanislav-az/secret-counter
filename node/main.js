import { SecretNetworkClient, Wallet } from "secretjs";
import * as fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const wallet = new Wallet(process.env.MNEMONIC);

const contract_wasm = fs.readFileSync("../contract.wasm.gz");

const secretjs = new SecretNetworkClient({
  chainId: "pulsar-3",
  url: "https://api.pulsar.scrttestnet.com",
  wallet: wallet,
  walletAddress: wallet.address,
});

console.log("Owner wallet address: ", wallet.address);
// console.log(secretjs);

// function upload_contract(sdf) {}
// async function upload_contract(sdf) {}

let upload_contract = async () => {
  let tx = await secretjs.tx.compute.storeCode(
    {
      sender: wallet.address,
      wasm_byte_code: contract_wasm,
      source: "",
      builder: "",
    },
    {
      gasLimit: 4_000_000,
    }
  );

  // console.log(tx);

  const codeId = Number(
    tx.arrayLog.find((log) => log.type === "message" && log.key === "code_id")
      .value
  );

  console.log("codeId: ", codeId);

  const contractCodeHash = (
    await secretjs.query.compute.codeHashByCodeId({ code_id: codeId })
  ).code_hash;

  console.log(`Contract hash: ${contractCodeHash}`);
};

// // codeId:  2558
// // Contract hash: 7bc3ac7437126da306a605c0e9e0fa0f43b8d383fc2e88ed95530f3628c24730
// await upload_contract();

const codeId = 2558;

const contractCodeHash =
  "7bc3ac7437126da306a605c0e9e0fa0f43b8d383fc2e88ed95530f3628c24730";

let instantiate_contract = async () => {
  // Create an instance of the Counter contract, providing a starting count
  const initMsg = { count: 58 };
  let tx = await secretjs.tx.compute.instantiateContract(
    {
      code_id: codeId,
      sender: wallet.address,
      code_hash: contractCodeHash,
      init_msg: initMsg,
      label: "Stans' Magic Counter " + Math.ceil(Math.random() * 10000),
    },
    {
      gasLimit: 400_000,
    }
  );

  //Find the contract_address in the logs
  const contractAddress = tx.arrayLog.find(
    (log) => log.type === "message" && log.key === "contract_address"
  ).value;

  console.log("Contract address: ", contractAddress);
};

// // Contract address: secret1ny4kae9nexfaeakgpe73gld0u3eghnly340s66
// await instantiate_contract();

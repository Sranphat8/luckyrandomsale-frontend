import { ethers } from "ethers";
import abi from "../abi.json";

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
export const TARGET_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 11155111); // default sepolia

export async function connectWallet() {
  if (!window.ethereum) throw new Error("กรุณาติดตั้ง MetaMask");

  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
  const chainId = Number(chainIdHex);

  if (chainId !== TARGET_CHAIN_ID) {
    // ขอให้ผู้ใช้สลับเชน
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x" + TARGET_CHAIN_ID.toString(16) }],
    }).catch(() => {
      throw new Error("กรุณาสลับเครือข่ายให้ตรงกับที่ดีพลอยสัญญา");
    });
  }

  return accounts[0];
}

export async function getProvider() {
  if (!window.ethereum) throw new Error("ไม่พบ MetaMask");
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

export async function getReadContract() {
  const provider = await getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
}

export async function getWriteContract() {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
}

/** helper: แปลง wei(string/BigInt) → ETH (string) */
export function weiToEth(wei) {
  try { return ethers.formatEther(wei); } catch { return "-"; }
}

/** สร้าง shippingHash จากข้อความ (ethers v6) */
export function toShippingHash(text) {
  // ethers.id = keccak256(utf8Bytes(text))
  return ethers.id(text);
}

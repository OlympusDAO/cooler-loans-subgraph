import { Address, ByteArray, dataSource } from "@graphprotocol/graph-ts";
import { BophadesKernel } from "../generated/Clearinghouse/BophadesKernel";

const KERNEL_MAP = new Map<string, string>();
KERNEL_MAP.set("mainnet", "0x2286d7f9639e8158FaD1169e76d1FbC38247f54b");
KERNEL_MAP.set("goerli", "0xDb7cf68154bd422dF5196D90285ceA057786b4c3");

function getKernelAddress(): Address {
  if (!KERNEL_MAP.has(dataSource.network())) {
    throw new Error("Unknown network: " + dataSource.network());
  }

  return Address.fromString(KERNEL_MAP.get(dataSource.network()));
}

/**
 * Determines the Bophades treasury address.
 * 
 * This is done dynamically using the Bophades Kernel contract,
 * as the Treasury module can be upgraded and the Kernel is less likely to be.
 * 
 * @returns 
 */
export function getTreasuryAddress(): Address {
  // Get the kernel
  const kernelAddress = getKernelAddress();
  const kernelContract = BophadesKernel.bind(kernelAddress);

  // Get the treasury address
  return kernelContract.getModuleForKeycode(ByteArray.fromUTF8("TRSRY"));
}

import { Address, dataSource } from "@graphprotocol/graph-ts"

const OHM_MAP = new Map<string, string>();
OHM_MAP.set("mainnet", "0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5");
OHM_MAP.set("goerli", "0x0595328847AF962F951a4f8F8eE9A3Bf261e4f6b");

const GOHM_MAP = new Map<string, string>();
GOHM_MAP.set("mainnet", "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f");
GOHM_MAP.set("goerli", "0xC1863141dc1861122d5410fB5973951c82871d98");

export function getOhmAddress(): Address {
  if (!OHM_MAP.has(dataSource.network())) {
    throw new Error("OHM address not found for network: " + dataSource.network());
  }

  return Address.fromString(OHM_MAP.get(dataSource.network()));
}

export function getGOhmAddress(): Address {
  if (!GOHM_MAP.has(dataSource.network())) {
    throw new Error("gOHM address not found for network: " + dataSource.network());
  }

  return Address.fromString(GOHM_MAP.get(dataSource.network()));
}

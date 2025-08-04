import { Address, BigDecimal, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { Clearinghouse, ClearinghouseSingleton, ClearinghouseSnapshot, DefundEvent, RebalanceEvent } from "../generated/schema";
import { Clearinghouse as ClearinghouseContract, Defund, Rebalance } from "../generated/Clearinghouse_V1/Clearinghouse";
import { Clearinghouse_V1_2 } from "../generated/ClearinghouseV1_1/Clearinghouse_V1_2";
import { ERC20 } from "../generated/Clearinghouse_V1/ERC20";
import { ERC4626 } from "../generated/Clearinghouse_v1/ERC4626";
import { toDecimal } from "./numberHelper";
import { getISO8601DateStringFromTimestamp } from "./dateHelper";
import { getTRSRY } from "./bophades";
import { COOLER_LOANS_CLEARINGHOUSE_V1, COOLER_LOANS_CLEARINGHOUSE_V1_1 } from "./constants";

const CLEARINGHOUSE_SINGLETON_ID = "ROOT";

function getSnapshotRecordId(clearinghouse: Address, event: ethereum.Event): string {
  return clearinghouse.toHexString() + "-" + event.block.number.toString() + "-" + event.logIndex.toString();
}

function getOrCreateClearinghouseSingleton(): ClearinghouseSingleton {
  let singleton = ClearinghouseSingleton.load(CLEARINGHOUSE_SINGLETON_ID);
  if (singleton == null) {
    singleton = new ClearinghouseSingleton(CLEARINGHOUSE_SINGLETON_ID);
    singleton.save();
  }

  return singleton;
}

function getClearinghouseVersion(clearinghouseAddress: Address): string {
  // v1
  if (clearinghouseAddress == Address.fromHexString(COOLER_LOANS_CLEARINGHOUSE_V1)) {
    return "1.0";
  }

  // v1.1
  if (clearinghouseAddress == Address.fromHexString(COOLER_LOANS_CLEARINGHOUSE_V1_1)) {
    return "1.1";
  }

  const clearinghouseContract = Clearinghouse_V1_2.bind(clearinghouseAddress);
  const version = clearinghouseContract.VERSION();

  return version.getMajor().toString() + "." + version.getMinor().toString();
}

function getClearinghouseTokens(clearinghouseAddress: Address): Address[] | null {
  // v1 or v1.1
  if (clearinghouseAddress == Address.fromHexString(COOLER_LOANS_CLEARINGHOUSE_V1) || clearinghouseAddress == Address.fromHexString(COOLER_LOANS_CLEARINGHOUSE_V1_1)) {
    const clearinghouseContract = ClearinghouseContract.bind(clearinghouseAddress);

    const gohmResult = clearinghouseContract.try_gohm();
    if (gohmResult.reverted) {
      return null;
    }

    const daiResult = clearinghouseContract.try_dai();
    if (daiResult.reverted) {
      return null;
    }

    const sdaiResult = clearinghouseContract.try_sdai();
    if (sdaiResult.reverted) {
      return null;
    }

    return [gohmResult.value, daiResult.value, sdaiResult.value];
  }

  const clearinghouseContract = Clearinghouse_V1_2.bind(clearinghouseAddress);

  const gohmResult = clearinghouseContract.try_gohm();
  if (gohmResult.reverted) {
    return null;
  }

  const reserveResult = clearinghouseContract.try_reserve();
  if (reserveResult.reverted) {
    return null;
  }

  const sReserveResult = clearinghouseContract.try_sReserve();
  if (sReserveResult.reverted) {
    return null;
  }

  return [gohmResult.value, reserveResult.value, sReserveResult.value];
}

export function getOrCreateClearinghouse(clearinghouseAddress: Address, block: ethereum.Block): Clearinghouse | null {
  let clearinghouse = Clearinghouse.load(clearinghouseAddress.toHexString());
  if (clearinghouse == null) {
    // Load the Clearinghouse contract
    const clearinghouseContract = ClearinghouseContract.bind(clearinghouseAddress);

    // Try to get the tokens - if this fails, it's not a valid clearinghouse
    const tokens = getClearinghouseTokens(clearinghouseAddress);
    if (tokens == null) {
      log.warning("Failed to get tokens for clearinghouse {}", [clearinghouseAddress.toHexString()]);
      return null;
    }

    // Try to load the collateral token
    const collateralTokenContract = ERC20.bind(tokens[0]);
    const collateralTokenDecimalsResult = collateralTokenContract.try_decimals();
    if (collateralTokenDecimalsResult.reverted) {
      log.warning("Failed to get collateral token decimals for clearinghouse {}", [clearinghouseAddress.toHexString()]);
      return null;
    }

    // Try to load the reserve token
    const reserveTokenContract = ERC20.bind(tokens[1]);
    const reserveTokenDecimalsResult = reserveTokenContract.try_decimals();
    if (reserveTokenDecimalsResult.reverted) {
      log.warning("Failed to get reserve token decimals for clearinghouse {}", [clearinghouseAddress.toHexString()]);
      return null;
    }

    // Try to load the sReserve token
    const sReserveTokenContract = ERC4626.bind(tokens[2]);
    const sReserveTokenDecimalsResult = sReserveTokenContract.try_decimals();
    if (sReserveTokenDecimalsResult.reverted) {
      log.warning("Failed to get sReserve token decimals for clearinghouse {}", [clearinghouseAddress.toHexString()]);
      return null;
    }

    // Try to get clearinghouse parameters
    const interestRateResult = clearinghouseContract.try_INTEREST_RATE();
    if (interestRateResult.reverted) {
      log.warning("Failed to get interest rate for clearinghouse {}", [clearinghouseAddress.toHexString()]);
      return null;
    }

    const durationResult = clearinghouseContract.try_DURATION();
    if (durationResult.reverted) {
      log.warning("Failed to get duration for clearinghouse {}", [clearinghouseAddress.toHexString()]);
      return null;
    }

    const fundCadenceResult = clearinghouseContract.try_FUND_CADENCE();
    if (fundCadenceResult.reverted) {
      log.warning("Failed to get fund cadence for clearinghouse {}", [clearinghouseAddress.toHexString()]);
      return null;
    }

    const fundAmountResult = clearinghouseContract.try_FUND_AMOUNT();
    if (fundAmountResult.reverted) {
      log.warning("Failed to get fund amount for clearinghouse {}", [clearinghouseAddress.toHexString()]);
      return null;
    }

    const loanToCollateralResult = clearinghouseContract.try_LOAN_TO_COLLATERAL();
    if (loanToCollateralResult.reverted) {
      log.warning("Failed to get loan to collateral for clearinghouse {}", [clearinghouseAddress.toHexString()]);
      return null;
    }

    const factoryResult = clearinghouseContract.try_factory();
    if (factoryResult.reverted) {
      log.warning("Failed to get factory for clearinghouse {}", [clearinghouseAddress.toHexString()]);
      return null;
    }

    // Create the record
    clearinghouse = new Clearinghouse(clearinghouseAddress.toHexString());
    clearinghouse.createdBlock = block.number;
    clearinghouse.createdTimestamp = block.timestamp;
    clearinghouse.version = getClearinghouseVersion(clearinghouseAddress);
    clearinghouse.singleton = getOrCreateClearinghouseSingleton().id;
    clearinghouse.address = clearinghouseAddress;
    clearinghouse.coolerFactoryAddress = factoryResult.value;
    clearinghouse.collateralToken = tokens[0];
    clearinghouse.collateralTokenDecimals = collateralTokenDecimalsResult.value;
    clearinghouse.reserveToken = tokens[1];
    clearinghouse.reserveTokenDecimals = reserveTokenDecimalsResult.value;
    clearinghouse.sReserveToken = tokens[2];
    clearinghouse.sReserveTokenDecimals = sReserveTokenDecimalsResult.value;
    clearinghouse.interestRate = toDecimal(interestRateResult.value, 18); // e.g. 5e15/1e18 = 0.005 = 0.5%
    clearinghouse.duration = durationResult.value;
    clearinghouse.fundCadence = fundCadenceResult.value;
    clearinghouse.fundAmount = toDecimal(fundAmountResult.value, reserveTokenDecimalsResult.value);
    clearinghouse.loanToCollateral = toDecimal(loanToCollateralResult.value, reserveTokenDecimalsResult.value); // 3000e18/1e18 = 3000

    // Save the record
    clearinghouse.save();
  }

  return clearinghouse;
}

function getAllClearinghouses(): Clearinghouse[] {
  const singleton = ClearinghouseSingleton.load(CLEARINGHOUSE_SINGLETON_ID);
  if (singleton == null) {
    throw new Error("Clearinghouse singleton not found");
  }

  return singleton.clearinghouses.load();
}

function getTreasuryBalances(clearinghouse: Clearinghouse): BigDecimal[] {
  // Calling getReserveBalance returns the raw balance of the token, plus the debt.
  // This is important, as DAI deposited in the DSR is recorded as a debt.
  // However, for each, we need to subtract the clearinghouse debt, otherwise it will be double-counted.
  const treasuryContract = getTRSRY();

  let treasuryReserveBalanceInt: BigInt = treasuryContract.getReserveBalance(Address.fromBytes(clearinghouse.reserveToken));
  log.debug("treasuryReserveBalance: {}", [treasuryReserveBalanceInt.toString()]);
  let treasurySReserveBalanceInt: BigInt = treasuryContract.getReserveBalance(Address.fromBytes(clearinghouse.sReserveToken));
  log.debug("treasurySReserveBalance: {}", [treasurySReserveBalanceInt.toString()]);

  // Iterate over the known Clearinghouses to reduce by the debt
  const allClearinghouses = getAllClearinghouses();
  for (let i = 0; i < allClearinghouses.length; i++) {
    const currentClearinghouse = allClearinghouses[i];

    // Skip if the reserve token is different
    if (currentClearinghouse.reserveToken != clearinghouse.reserveToken) {
      continue;
    }

    treasuryReserveBalanceInt = treasuryReserveBalanceInt.minus(treasuryContract.reserveDebt(Address.fromBytes(clearinghouse.reserveToken), Address.fromBytes(currentClearinghouse.address)));
    treasurySReserveBalanceInt = treasurySReserveBalanceInt.minus(treasuryContract.reserveDebt(Address.fromBytes(clearinghouse.sReserveToken), Address.fromBytes(currentClearinghouse.address)));
  }

  const sReserveTokenContract = ERC4626.bind(Address.fromBytes(clearinghouse.sReserveToken));
  const treasurySReserveInReserveBalance: BigDecimal = toDecimal(sReserveTokenContract.previewRedeem(treasurySReserveBalanceInt), clearinghouse.sReserveTokenDecimals);
  const treasurySReserveBalance: BigDecimal = toDecimal(treasurySReserveBalanceInt, clearinghouse.sReserveTokenDecimals);
  const treasuryReserveBalance: BigDecimal = toDecimal(treasuryReserveBalanceInt, clearinghouse.reserveTokenDecimals);

  return [treasuryReserveBalance, treasurySReserveBalance, treasurySReserveInReserveBalance];
}

export function populateClearinghouseSnapshot(clearinghouseAddress: Address, event: ethereum.Event): ClearinghouseSnapshot | null {
  // Grab the Clearinghouse record
  const clearinghouseRecord = getOrCreateClearinghouse(clearinghouseAddress, event.block);
  if (clearinghouseRecord == null) {
    log.warning("Skipping snapshot for invalid clearinghouse {}", [clearinghouseAddress.toHexString()]);
    return null;
  }
  const snapshotRecord = new ClearinghouseSnapshot(1);
  
  snapshotRecord.date = getISO8601DateStringFromTimestamp(event.block.timestamp);
  snapshotRecord.blockNumber = event.block.number;
  snapshotRecord.blockTimestamp = event.block.timestamp;
  snapshotRecord.transactionHash = event.transaction.hash;
  snapshotRecord.clearinghouse = clearinghouseRecord.id;

  const clearinghouseContract = ClearinghouseContract.bind(Address.fromBytes(clearinghouseAddress));
  const reserveTokenContract = ERC20.bind(Address.fromBytes(clearinghouseRecord.reserveToken));
  const sReserveTokenContract = ERC4626.bind(Address.fromBytes(clearinghouseRecord.sReserveToken));

  // Get the state information
  snapshotRecord.isActive = clearinghouseContract.active();
  snapshotRecord.nextRebalanceTimestamp = clearinghouseContract.fundTime();
  snapshotRecord.interestReceivables = toDecimal(clearinghouseContract.interestReceivables(), clearinghouseRecord.reserveTokenDecimals);
  snapshotRecord.principalReceivables = toDecimal(clearinghouseContract.principalReceivables(), clearinghouseRecord.reserveTokenDecimals);

  // Record the tokens
  snapshotRecord.reserveToken = clearinghouseRecord.reserveToken;
  snapshotRecord.sReserveToken = clearinghouseRecord.sReserveToken;

  // Get the funding capacity
  const sReserveBalance = sReserveTokenContract.balanceOf(clearinghouseAddress);
  snapshotRecord.reserveBalance = toDecimal(reserveTokenContract.balanceOf(clearinghouseAddress), clearinghouseRecord.reserveTokenDecimals);
  snapshotRecord.sReserveBalance = toDecimal(sReserveBalance, clearinghouseRecord.sReserveTokenDecimals);
  snapshotRecord.sReserveInReserveBalance = toDecimal(sReserveTokenContract.previewRedeem(sReserveBalance), clearinghouseRecord.sReserveTokenDecimals);

  // Treasury state
  const treasuryBalances = getTreasuryBalances(clearinghouseRecord);
  snapshotRecord.treasuryReserveBalance = treasuryBalances[0];
  snapshotRecord.treasurySReserveBalance = treasuryBalances[1];
  snapshotRecord.treasurySReserveInReserveBalance = treasuryBalances[2];

  return snapshotRecord;
}

export function handleRebalance(event: Rebalance): void {
  const block = event.block;
  const clearinghouseRecord = getOrCreateClearinghouse(event.address, block);
  
  // Skip if clearinghouse is invalid
  if (clearinghouseRecord == null) {
    log.warning("Skipping rebalance for invalid clearinghouse {}", [event.address.toHexString()]);
    return;
  }

  const isDefund = event.params.defund;
  const multiplier = new BigDecimal(isDefund ? BigInt.fromI32(-1) : BigInt.fromI32(1));
  const amount = toDecimal(event.params.daiAmount, clearinghouseRecord.reserveTokenDecimals).times(multiplier);

  // Take a snapshot
  const snapshotRecord = populateClearinghouseSnapshot(Address.fromBytes(clearinghouseRecord.address), event);
  if (snapshotRecord != null) {
    snapshotRecord.save();
  }

  // Record the event
  const eventRecord = new RebalanceEvent(clearinghouseRecord.address.toHexString() + "-" + block.number.toString());
  eventRecord.date = getISO8601DateStringFromTimestamp(block.timestamp);
  eventRecord.blockNumber = block.number;
  eventRecord.blockTimestamp = block.timestamp;
  eventRecord.transactionHash = event.transaction.hash;
  eventRecord.clearinghouse = clearinghouseRecord.id;
  eventRecord.amount = amount;
  eventRecord.save();
}

export function handleDefund(event: Defund): void {
  const block = event.block;
  const clearinghouseRecord = getOrCreateClearinghouse(event.address, block);
  
  // Skip if clearinghouse is invalid
  if (clearinghouseRecord == null) {
    log.warning("Skipping defund for invalid clearinghouse {}", [event.address.toHexString()]);
    return;
  }

  // Always negative
  const amount = toDecimal(event.params.amount, clearinghouseRecord.reserveTokenDecimals).times(new BigDecimal(BigInt.fromI32(-1)));

  // Take a snapshot
  const snapshotRecord = populateClearinghouseSnapshot(Address.fromBytes(clearinghouseRecord.address), event);
  if (snapshotRecord != null) {
    snapshotRecord.save();
  }

  // Record the event
  const eventRecord = new DefundEvent(clearinghouseRecord.address.toHexString() + "-" + block.number.toString());
  eventRecord.date = getISO8601DateStringFromTimestamp(block.timestamp);
  eventRecord.blockNumber = block.number;
  eventRecord.blockTimestamp = block.timestamp;
  eventRecord.transactionHash = event.transaction.hash;
  eventRecord.clearinghouse = clearinghouseRecord.id;
  eventRecord.amount = amount;
  eventRecord.save();
}

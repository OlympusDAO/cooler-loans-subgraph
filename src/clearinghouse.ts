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

function getClearinghouseTokens(clearinghouseAddress: Address): Address[] {
  // v1 or v1.1
  if (clearinghouseAddress == Address.fromHexString(COOLER_LOANS_CLEARINGHOUSE_V1) || clearinghouseAddress == Address.fromHexString(COOLER_LOANS_CLEARINGHOUSE_V1_1)) {
    const clearinghouseContract = ClearinghouseContract.bind(clearinghouseAddress);

    return [clearinghouseContract.gohm(), clearinghouseContract.dai(), clearinghouseContract.sdai()];
  }

  const clearinghouseContract = Clearinghouse_V1_2.bind(clearinghouseAddress);

  return [clearinghouseContract.gohm(), clearinghouseContract.reserve(), clearinghouseContract.sReserve()];
}

export function getOrCreateClearinghouse(clearinghouseAddress: Address): Clearinghouse {
  let clearinghouse = Clearinghouse.load(clearinghouseAddress.toHexString());
  if (clearinghouse == null) {
    // Load the Clearinghouse contract
    const clearinghouseContract = ClearinghouseContract.bind(clearinghouseAddress);

    // Get the tokens
    const tokens = getClearinghouseTokens(clearinghouseAddress);

    // Load the collateral token
    const collateralTokenContract = ERC20.bind(tokens[0]);
    const collateralTokenDecimals = collateralTokenContract.decimals();

    // Load the reserve token
    const reserveTokenContract = ERC20.bind(tokens[1]);
    const reserveTokenDecimals = reserveTokenContract.decimals();

    // Load the sReserve token
    const sReserveTokenContract = ERC4626.bind(tokens[2]);
    const sReserveTokenDecimals = sReserveTokenContract.decimals();

    // Create the record
    clearinghouse = new Clearinghouse(clearinghouseAddress.toHexString());
    clearinghouse.version = getClearinghouseVersion(clearinghouseAddress);
    clearinghouse.singleton = getOrCreateClearinghouseSingleton().id;
    clearinghouse.address = clearinghouseAddress;
    clearinghouse.coolerFactoryAddress = clearinghouseContract.factory();
    clearinghouse.collateralToken = tokens[0];
    clearinghouse.collateralTokenDecimals = collateralTokenDecimals;
    clearinghouse.reserveToken = tokens[1];
    clearinghouse.reserveTokenDecimals = reserveTokenDecimals;
    clearinghouse.sReserveToken = tokens[2];
    clearinghouse.sReserveTokenDecimals = sReserveTokenDecimals;
    clearinghouse.interestRate = toDecimal(clearinghouseContract.INTEREST_RATE(), 18); // e.g. 5e15/1e18 = 0.005 = 0.5%
    clearinghouse.duration = clearinghouseContract.DURATION();
    clearinghouse.fundCadence = clearinghouseContract.FUND_CADENCE();
    clearinghouse.fundAmount = toDecimal(clearinghouseContract.FUND_AMOUNT(), reserveTokenDecimals);
    clearinghouse.loanToCollateral = toDecimal(clearinghouseContract.LOAN_TO_COLLATERAL(), reserveTokenDecimals); // 3000e18/1e18 = 3000

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

export function populateClearinghouseSnapshot(clearinghouseAddress: Address, event: ethereum.Event): ClearinghouseSnapshot {
  // Grab the Clearinghouse record
  const clearinghouseRecord = getOrCreateClearinghouse(clearinghouseAddress);

  // There may be multiple snapshots created in a single block (e.g. multiple events), so we check if a snapshot has already been created for this block
  let snapshotRecord = ClearinghouseSnapshot.load(getSnapshotRecordId(clearinghouseAddress, event));
  if (snapshotRecord == null) {
    snapshotRecord = new ClearinghouseSnapshot(getSnapshotRecordId(clearinghouseAddress, event));
  }

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
  const clearinghouseRecord = getOrCreateClearinghouse(event.address);

  const isDefund = event.params.defund;
  const multiplier = new BigDecimal(isDefund ? BigInt.fromI32(-1) : BigInt.fromI32(1));
  const amount = toDecimal(event.params.daiAmount, clearinghouseRecord.reserveTokenDecimals).times(multiplier);

  // Take a snapshot
  const snapshotRecord = populateClearinghouseSnapshot(Address.fromBytes(clearinghouseRecord.address), event);
  snapshotRecord.save();

  // Record the event
  const eventRecord = new RebalanceEvent(clearinghouseRecord.address.toHexString() + "-" + block.number.toString());
  eventRecord.date = getISO8601DateStringFromTimestamp(block.timestamp);
  eventRecord.blockNumber = block.number;
  eventRecord.blockTimestamp = block.timestamp;
  eventRecord.transactionHash = event.transaction.hash;
  eventRecord.clearinghouse = clearinghouseRecord.id;
  eventRecord.clearinghouseSnapshot = snapshotRecord.id;
  eventRecord.amount = amount;
  eventRecord.save();
}

export function handleDefund(event: Defund): void {
  const block = event.block;
  const clearinghouseRecord = getOrCreateClearinghouse(event.address);

  // Always negative
  const amount = toDecimal(event.params.amount, clearinghouseRecord.reserveTokenDecimals).times(new BigDecimal(BigInt.fromI32(-1)));

  // Take a snapshot
  const snapshotRecord = populateClearinghouseSnapshot(Address.fromBytes(clearinghouseRecord.address), event);
  snapshotRecord.save();

  // Record the event
  const eventRecord = new DefundEvent(clearinghouseRecord.address.toHexString() + "-" + block.number.toString());
  eventRecord.date = getISO8601DateStringFromTimestamp(block.timestamp);
  eventRecord.blockNumber = block.number;
  eventRecord.blockTimestamp = block.timestamp;
  eventRecord.transactionHash = event.transaction.hash;
  eventRecord.clearinghouse = clearinghouseRecord.id;
  eventRecord.clearinghouseSnapshot = snapshotRecord.id;
  eventRecord.amount = amount;
  eventRecord.save();
}

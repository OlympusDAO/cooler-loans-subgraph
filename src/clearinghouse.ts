import { Address, BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { ClearinghouseSnapshot, DefundEvent, RebalanceEvent } from "../generated/schema";
import { Clearinghouse, Defund, Rebalance } from "../generated/Clearinghouse_V1/Clearinghouse";
import { ERC20 } from "../generated/Clearinghouse_V1/ERC20";
import { ERC4626 } from "../generated/Clearinghouse_v1/ERC4626";
import { toDecimal } from "./numberHelper";
import { getISO8601DateStringFromTimestamp } from "./dateHelper";
import { getTRSRY } from "./bophades";

function getSnapshotRecordId(clearinghouse: Address, event: ethereum.Event): string {
  return clearinghouse.toHexString() + "-" + event.block.number.toString() + "-" + event.logIndex.toString();
}

function populateClearinghouseSnapshot(clearinghouseAddress: Address, event: ethereum.Event): ClearinghouseSnapshot {
  // There may be multiple snapshots created in a single block (e.g. multiple events), so we check if a snapshot has already been created for this block
  let snapshotRecord = ClearinghouseSnapshot.load(getSnapshotRecordId(clearinghouseAddress, event));
  if (snapshotRecord == null) {
    snapshotRecord = new ClearinghouseSnapshot(getSnapshotRecordId(clearinghouseAddress, event));
  }

  snapshotRecord.date = getISO8601DateStringFromTimestamp(event.block.timestamp);
  snapshotRecord.blockNumber = event.block.number;
  snapshotRecord.blockTimestamp = event.block.timestamp;
  snapshotRecord.clearinghouse = clearinghouseAddress;

  // Load the clearinghouse
  const clearinghouseContract = Clearinghouse.bind(clearinghouseAddress);

  // Configuration
  snapshotRecord.coolerFactoryAddress = clearinghouseContract.factory();
  snapshotRecord.collateralAddress = clearinghouseContract.gohm();
  snapshotRecord.debtAddress = clearinghouseContract.dai();

  const daiContract = ERC20.bind(clearinghouseContract.dai());
  const daiDecimals = daiContract.decimals();
  const sDaiContract = ERC4626.bind(clearinghouseContract.sdai());
  const sDaiDecimals = sDaiContract.decimals();

  // Get the state information
  snapshotRecord.isActive = clearinghouseContract.active();
  snapshotRecord.nextRebalanceTimestamp = clearinghouseContract.fundTime();
  snapshotRecord.interestReceivables = toDecimal(clearinghouseContract.interestReceivables(), daiDecimals);
  snapshotRecord.principalReceivables = toDecimal(clearinghouseContract.principalReceivables(), daiDecimals);

  // Set the terms
  snapshotRecord.interestRate = toDecimal(clearinghouseContract.INTEREST_RATE(), 18); // e.g. 5e15/1e18 = 0.005 = 0.5%
  snapshotRecord.duration = clearinghouseContract.DURATION();
  snapshotRecord.fundCadence = clearinghouseContract.FUND_CADENCE();
  snapshotRecord.fundAmount = toDecimal(clearinghouseContract.FUND_AMOUNT(), daiDecimals);
  snapshotRecord.loanToCollateral = toDecimal(clearinghouseContract.LOAN_TO_COLLATERAL(), 18); // 3000e18/1e18 = 3000

  // Get the funding capacity
  snapshotRecord.daiBalance = toDecimal(daiContract.balanceOf(clearinghouseAddress), daiDecimals);

  const sDaiBalance = sDaiContract.balanceOf(clearinghouseAddress);
  snapshotRecord.sDaiBalance = toDecimal(sDaiBalance, sDaiDecimals);

  // Record sDAI in terms of DAI
  snapshotRecord.sDaiInDaiBalance = toDecimal(sDaiContract.previewRedeem(sDaiBalance), sDaiDecimals);

  // Get the treasury capacity
  // Calling getReserveBalance returns the raw balance of the token, plus the debt.
  // This is important, as DAI deposited in the DSR is recorded as a debt.
  // However, for each, we need to subtract the clearinghouse debt, otherwise it will be double-counted.
  const treasuryContract = getTRSRY();
  const treasuryDaiBalance = toDecimal(treasuryContract.getReserveBalance(clearinghouseContract.dai()), daiDecimals);
  const clearinghouseDaiDebt = toDecimal(treasuryContract.reserveDebt(clearinghouseContract.dai(), clearinghouseAddress), daiDecimals);
  snapshotRecord.treasuryDaiBalance = treasuryDaiBalance.minus(clearinghouseDaiDebt);

  const treasurySDaiBalance: BigInt = treasuryContract.getReserveBalance(clearinghouseContract.sdai());
  const clearinghouseSDaiDebt: BigInt = treasuryContract.reserveDebt(clearinghouseContract.sdai(), clearinghouseAddress);
  const treasurySDaiBalanceMinusClearinghouse = treasurySDaiBalance.minus(clearinghouseSDaiDebt);
  snapshotRecord.treasurySDaiBalance = toDecimal(treasurySDaiBalanceMinusClearinghouse, sDaiDecimals);
  snapshotRecord.treasurySDaiInDaiBalance = toDecimal(sDaiContract.previewRedeem(treasurySDaiBalanceMinusClearinghouse), sDaiDecimals);

  return snapshotRecord;
}

export function handleRebalance(event: Rebalance): void {
  const clearinghouse = event.address;
  const block = event.block;

  const clearinghouseContract = Clearinghouse.bind(clearinghouse);
  const capacityDecimals = ERC20.bind(clearinghouseContract.dai()).decimals();

  const isDefund = event.params.defund;
  const multiplier = new BigDecimal(isDefund ? BigInt.fromI32(-1) : BigInt.fromI32(1));
  const amount = toDecimal(event.params.daiAmount, capacityDecimals).times(multiplier);

  // Take a snapshot
  const snapshotRecord = populateClearinghouseSnapshot(clearinghouse, event);
  snapshotRecord.save();

  // Record the event
  const eventRecord = new RebalanceEvent(clearinghouse.toHexString() + "-" + block.number.toString());
  eventRecord.date = getISO8601DateStringFromTimestamp(block.timestamp);
  eventRecord.blockNumber = block.number;
  eventRecord.blockTimestamp = block.timestamp;
  eventRecord.transactionHash = event.transaction.hash;
  eventRecord.clearinghouse = clearinghouse;
  eventRecord.amount = amount;
  eventRecord.clearinghouseSnapshot = snapshotRecord.id;
  eventRecord.save();
}

export function handleDefund(event: Defund): void {
  const clearinghouse = event.address;
  const block = event.block;

  const clearinghouseContract = Clearinghouse.bind(clearinghouse);
  const capacityDecimals = ERC20.bind(clearinghouseContract.dai()).decimals();

  // Always negative
  const amount = toDecimal(event.params.amount, capacityDecimals).times(new BigDecimal(BigInt.fromI32(-1)));

  // Take a snapshot
  const snapshotRecord = populateClearinghouseSnapshot(clearinghouse, event);
  snapshotRecord.save();

  // Record the event
  const eventRecord = new DefundEvent(clearinghouse.toHexString() + "-" + block.number.toString());
  eventRecord.date = getISO8601DateStringFromTimestamp(block.timestamp);
  eventRecord.blockNumber = block.number;
  eventRecord.blockTimestamp = block.timestamp;
  eventRecord.transactionHash = event.transaction.hash;
  eventRecord.clearinghouse = clearinghouse;
  eventRecord.amount = amount;
  eventRecord.clearinghouseSnapshot = snapshotRecord.id;
  eventRecord.save();
}

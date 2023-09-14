import { Address, BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { ClearinghouseSnapshot, DefundEvent, RebalanceEvent } from "../generated/schema";
import { Clearinghouse, Defund, Rebalance } from "../generated/Clearinghouse/Clearinghouse";
import { ERC20 } from "../generated/Clearinghouse/ERC20";
import { ERC4626 } from "../generated/Clearinghouse/ERC4626";
import { toDecimal } from "./numberHelper";
import { getISO8601DateStringFromTimestamp } from "./dateHelper";
import { getTreasuryAddress } from "./bophades";

function getSnapshotRecordId(clearinghouse: Address, event: ethereum.Event): string {
  return clearinghouse.toHexString() + "-" + event.block.number.toString() + "-" + event.logIndex.toString();
}

function populateClearinghouseSnapshot(clearinghouse: Address, event: ethereum.Event): ClearinghouseSnapshot {
  // There may be multiple snapshots created in a single block (e.g. multiple events), so we check if a snapshot has already been created for this block
  let snapshotRecord = ClearinghouseSnapshot.load(getSnapshotRecordId(clearinghouse, event));
  if (snapshotRecord == null) {
    snapshotRecord = new ClearinghouseSnapshot(getSnapshotRecordId(clearinghouse, event));
  }

  snapshotRecord.date = getISO8601DateStringFromTimestamp(event.block.timestamp);
  snapshotRecord.blockNumber = event.block.number;
  snapshotRecord.blockTimestamp = event.block.timestamp;
  snapshotRecord.clearinghouse = clearinghouse;

  // Load the clearinghouse
  const clearinghouseContract = Clearinghouse.bind(clearinghouse);

  const daiContract = ERC20.bind(clearinghouseContract.dai());
  const daiDecimals = daiContract.decimals();
  const sDaiContract = ERC4626.bind(clearinghouseContract.sdai());
  const sDaiDecimals = sDaiContract.decimals();

  // Get the state information
  snapshotRecord.isActive = clearinghouseContract.active();
  snapshotRecord.nextRebalanceTimestamp = clearinghouseContract.fundTime();
  snapshotRecord.interestReceivables = toDecimal(clearinghouseContract.interestReceivables(), daiDecimals);
  snapshotRecord.principalReceivables = toDecimal(clearinghouseContract.principalReceivables(), daiDecimals);

  // Get the funding capacity
  snapshotRecord.daiBalance = toDecimal(daiContract.balanceOf(clearinghouse), daiDecimals);

  const sDaiBalance = sDaiContract.balanceOf(clearinghouse);
  snapshotRecord.sDaiBalance = toDecimal(sDaiBalance, sDaiDecimals);

  // Record sDAI in terms of DAI
  snapshotRecord.sDaiInDaiBalance = toDecimal(sDaiContract.previewRedeem(sDaiBalance), sDaiDecimals);

  // Get the treasury capacity
  const treasuryAddress = getTreasuryAddress();
  snapshotRecord.treasuryDaiBalance = toDecimal(daiContract.balanceOf(treasuryAddress), daiDecimals);
  snapshotRecord.treasurySDaiBalance = toDecimal(sDaiContract.balanceOf(treasuryAddress), sDaiDecimals);
  snapshotRecord.treasurySDaiInDaiBalance = toDecimal(sDaiContract.previewRedeem(sDaiContract.balanceOf(treasuryAddress)), sDaiDecimals);

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

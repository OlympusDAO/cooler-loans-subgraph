import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { ClearinghouseSnapshot } from "../generated/schema";
import { Clearinghouse } from "../generated/Clearinghouse/Clearinghouse";
import { ERC20 } from "../generated/Clearinghouse/ERC20";
import { ERC4626 } from "../generated/Clearinghouse/ERC4626";
import { toDecimal } from "./numberHelper";

function getSnapshotRecordId(clearinghouse: Address, blockNumber: BigInt): string {
  return clearinghouse.toHexString() + "-" + blockNumber.toString();
}

function populateClearinghouseSnapshot(clearinghouse: Address, block: ethereum.Block): ClearinghouseSnapshot {
  // There may be multiple snapshots created in a single block (e.g. multiple events), so we check if a snapshot has already been created for this block
  let snapshotRecord = ClearinghouseSnapshot.load(getSnapshotRecordId(clearinghouse, block.number));
  if (snapshotRecord == null) {
    snapshotRecord = new ClearinghouseSnapshot(getSnapshotRecordId(clearinghouse, block.number));
  }

  snapshotRecord.blockNumber = block.number;
  snapshotRecord.blockTimestamp = block.timestamp;
  snapshotRecord.clearinghouse = clearinghouse;

  // Load the clearinghouse
  const clearinghouseContract = Clearinghouse.bind(clearinghouse);

  const daiContract = ERC20.bind(clearinghouseContract.dai());
  const sDaiContract = ERC4626.bind(clearinghouseContract.sdai());

  // Get the state information
  snapshotRecord.isActive = clearinghouseContract.active();
  snapshotRecord.nextRebalanceTimestamp = clearinghouseContract.fundTime();
  snapshotRecord.receivables = toDecimal(clearinghouseContract.receivables(), daiContract.decimals());

  // Get the funding capacity
  snapshotRecord.daiBalance = toDecimal(daiContract.balanceOf(clearinghouse), daiContract.decimals());

  const sDaiBalance = sDaiContract.balanceOf(clearinghouse);
  snapshotRecord.sDaiBalance = toDecimal(sDaiBalance, sDaiContract.decimals());

  // Record sDAI in terms of DAI
  snapshotRecord.sDaiInDaiBalance = toDecimal(sDaiContract.previewRedeem(sDaiBalance), sDaiContract.decimals());

  return snapshotRecord;
}

export function handleRebalance(event: ethereum.Event): void {
  let clearinghouse = event.address;
  let block = event.block;

  let snapshotRecord = populateClearinghouseSnapshot(clearinghouse, block);

  snapshotRecord.save();
}

export function handleDefund(event: ethereum.Event): void {
  let clearinghouse = event.address;
  let block = event.block;

  let snapshotRecord = populateClearinghouseSnapshot(clearinghouse, block);

  snapshotRecord.save();
}

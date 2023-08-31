import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  ClearRequest as ClearRequestEvent,
  DefaultLoan as DefaultLoanEvent,
  RepayLoan as RepayLoanEvent,
  RollLoan as RollLoanEvent
} from "../generated/CoolerFactory/CoolerFactory"
import { Cooler } from "../generated/CoolerFactory/Cooler"
import {
  CoolerLoan,
  DefaultLoan,
  RepayLoan,
  RollLoan
} from "../generated/schema"

// === Helpers ===

function getLoanRecordId(cooler: Bytes, loanID: BigInt): string {
  return cooler.toHexString() + "-" + loanID.toString();
}

function getLoanRecord(cooler: Bytes, loanID: BigInt): CoolerLoan | null {
  return CoolerLoan.load(getLoanRecordId(cooler, loanID));
}

// === Event handling ===

export function handleClearRequest(event: ClearRequestEvent): void {
  // Access the Cooler
  const cooler: Cooler = Cooler.bind(event.params.cooler);

  // Get the loan information
  const loanID: BigInt = event.params.loanID;
  const loanData = cooler.getLoan(loanID);

  // Create a new CoolerLoan
  // This record is immutable
  // Changes in the balance will be tracked through CoolerLoanSnapshot
  const loanRecord: CoolerLoan = new CoolerLoan(getLoanRecordId(event.params.cooler, loanID));
  loanRecord.createdBlock = event.block.number;
  loanRecord.createdTimestamp = event.block.timestamp;
  loanRecord.createdTransaction = event.transaction.hash;
  loanRecord.cooler = event.params.cooler;
  loanRecord.loanID = loanID;
  loanRecord.borrower = cooler.owner();
  loanRecord.amount = loanData.amount; // Decimals?
  loanRecord.unclaimed = loanData.unclaimed; // Decimals?
  loanRecord.collateral = loanData.collateral; // Decimals?
  loanRecord.expiry = loanData.expiry; // Timestamp? Seconds?
  loanRecord.lender = loanData.lender;
  loanRecord.repayDirect = loanData.repayDirect;
  loanRecord.hasCallback = loanData.callback;
  loanRecord.collateralToken = cooler.collateral();
  loanRecord.debtToken = cooler.debt();
  loanRecord.save();
}

export function handleDefaultLoan(event: DefaultLoanEvent): void {
  // Create new CoolerLoanSnapshot


  let entity = new DefaultLoan(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.cooler = event.params.cooler
  entity.loanID = event.params.loanID

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRepayLoan(event: RepayLoanEvent): void {
  // Create new CoolerLoanSnapshot

  let entity = new RepayLoan(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.cooler = event.params.cooler
  entity.loanID = event.params.loanID
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRollLoan(event: RollLoanEvent): void {
  // Create new CoolerLoan

  // Create new CoolerLoanSnapshot for rollover

  // Create new CoolerLoanSnapshot for previous loan

  let entity = new RollLoan(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.cooler = event.params.cooler
  entity.loanID = event.params.loanID

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

import { Address, BigDecimal, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import {
  ClearRequest as ClearRequestEvent,
  DefaultLoan as DefaultLoanEvent,
  RepayLoan as RepayLoanEvent,
  RollLoan as RollLoanEvent
} from "../generated/CoolerFactory/CoolerFactory"
import { Cooler, Cooler__getLoanResultValue0Struct } from "../generated/CoolerFactory/Cooler"
import { ERC20 } from "../generated/CoolerFactory/ERC20"
import { gOHM } from "../generated/CoolerFactory/gOHM"
import {
  CoolerLoan,
  CoolerLoanSnapshot
} from "../generated/schema"
import { oracles } from "@protofire/subgraph-devkit";

const DEFAULT_DECIMALS = 18;
const OHM = "0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5";
const GOHM = "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f";

// TODO handle addresses per data source dataSource.network()

// === Helpers ===

/**
 * Converts the given BigInt to a BigDecimal.
 *
 * If the `decimals` parameter is specified, that will be used instead of `DEFAULT_DECIMALS`.
 *
 * @param value
 * @param decimals
 * @returns
 */
function toDecimal(value: BigInt, decimals: number = DEFAULT_DECIMALS): BigDecimal {
  const precision = BigInt.fromI32(10)
    .pow(<u8>decimals)
    .toBigDecimal();

  return value.divDecimal(precision);
}

function getLoanRecordId(cooler: Bytes, loanID: BigInt): string {
  return cooler.toHexString() + "-" + loanID.toString();
}

function getLoanRecord(cooler: Bytes, loanID: BigInt): CoolerLoan | null {
  return CoolerLoan.load(getLoanRecordId(cooler, loanID));
}

function getLoanSnapshotRecordId(cooler: Bytes, loanID: BigInt, blockNumber: BigInt): string {
  return cooler.toHexString() + "-" + loanID.toString() + "-" + blockNumber.toString();
}

function populateLoan(cooler: Cooler, loanId: BigInt, loanData: Cooler__getLoanResultValue0Struct, block: ethereum.Block, transaction: ethereum.Transaction): CoolerLoan {
  const debtDecimals = ERC20.bind(cooler.debt()).decimals();
  const collateralDecimals = ERC20.bind(cooler.collateral()).decimals();

  const loanRecord: CoolerLoan = new CoolerLoan(getLoanRecordId(cooler._address, loanId));
  loanRecord.createdBlock = block.number;
  loanRecord.createdTimestamp = block.timestamp;
  loanRecord.createdTransaction = transaction.hash;
  loanRecord.loanID = loanId;
  loanRecord.cooler = cooler._address;
  loanRecord.borrower = cooler.owner();
  loanRecord.amount = toDecimal(loanData.amount, debtDecimals);
  loanRecord.interest = toDecimal(loanData.request.interest, debtDecimals);
  loanRecord.principal = loanRecord.amount.minus(loanRecord.interest);
  loanRecord.unclaimed = toDecimal(loanData.unclaimed, debtDecimals);
  loanRecord.collateral = toDecimal(loanData.collateral, collateralDecimals);
  loanRecord.expiryTimestamp = loanData.expiry;
  loanRecord.lender = loanData.lender;
  loanRecord.repayDirect = loanData.repayDirect;
  loanRecord.hasCallback = loanData.callback;
  loanRecord.collateralToken = cooler.collateral();
  loanRecord.debtToken = cooler.debt();

  return loanRecord;
}

function populateLoanSnapshot(cooler: Cooler, loanData: Cooler__getLoanResultValue0Struct, block: ethereum.Block, transaction: ethereum.Transaction, loanRecord: CoolerLoan): CoolerLoanSnapshot {
  const debtDecimals = ERC20.bind(cooler.debt()).decimals();
  const collateralDecimals = ERC20.bind(cooler.collateral()).decimals();

  const snapshotRecord: CoolerLoanSnapshot = new CoolerLoanSnapshot(getLoanSnapshotRecordId(cooler._address, loanRecord.loanID, block.number));
  snapshotRecord.loan = loanRecord.id;
  snapshotRecord.blockNumber = block.number;
  snapshotRecord.blockTimestamp = block.timestamp;
  snapshotRecord.transaction = transaction.hash;
  snapshotRecord.secondsToExpiry = loanData.expiry.lt(block.timestamp) ? BigInt.zero() : loanData.expiry.minus(block.timestamp);

  // The loan struct at the time of snapshot reflects the amount payable and collateral deposited
  snapshotRecord.loanPayable = toDecimal(loanData.amount, debtDecimals);
  snapshotRecord.collateralDeposited = toDecimal(loanData.collateral, collateralDecimals);
  snapshotRecord.repaidUnclaimed = toDecimal(loanData.unclaimed, debtDecimals);

  snapshotRecord.income = BigDecimal.zero(); // Will be set if needed

  return snapshotRecord;
}

function getOhmPrice(): BigDecimal {
  const ohmAddress = Address.fromString(OHM);

  return oracles.chainlink.fetchPriceUSD(ohmAddress);
}

function getGOhmPrice(): BigDecimal {
  // gOHM price is OHM price * index
  const ohmPrice: BigDecimal = getOhmPrice();
  const gOHMContract: gOHM = gOHM.bind(Address.fromString(GOHM));

  return ohmPrice.times(toDecimal(gOHMContract.index(), 9));
}

// === Event handling ===

export function handleClearRequest(event: ClearRequestEvent): void {
  // Access the Cooler
  const cooler: Cooler = Cooler.bind(event.params.cooler);

  // Get the loan information
  const loanId: BigInt = event.params.loanID;
  const loanData = cooler.getLoan(loanId);

  // Create a new CoolerLoan
  // This record is immutable
  // Changes in the balance will be tracked through CoolerLoanSnapshot
  const loanRecord: CoolerLoan = populateLoan(cooler, loanId, loanData, event.block, event.transaction);
  loanRecord.save();

  // Also create a new snapshot
  const snapshotRecord: CoolerLoanSnapshot = populateLoanSnapshot(cooler, loanData, event.block, event.transaction, loanRecord);
  snapshotRecord.status = "Active";
  snapshotRecord.income = loanRecord.interest; // Assumes interest income is recognised at the time of loan origination
  snapshotRecord.save();
}

export function handleDefaultLoan(event: DefaultLoanEvent): void {
  // Access the Cooler
  const cooler: Cooler = Cooler.bind(event.params.cooler);

  // Get the loan information
  const loanId: BigInt = event.params.loanID;
  const loanData = cooler.getLoan(loanId);
  const loanRecord: CoolerLoan | null = getLoanRecord(cooler._address, loanId);
  if (loanRecord == null) {
    throw new Error("Loan not found with record id: " + getLoanRecordId(cooler._address, loanId));
  }

  // Create a new snapshot
  const snapshotRecord: CoolerLoanSnapshot = populateLoanSnapshot(cooler, loanData, event.block, event.transaction, loanRecord);
  snapshotRecord.status = "Defaulted";

  // Calculate the income from the default. Value of collateral liquidated - debt payable.
  const collateralPrice: BigDecimal = getGOhmPrice();
  const debtPayable: BigDecimal = loanRecord.amount;
  const collateralValue: BigDecimal = loanRecord.collateral.times(collateralPrice);
  snapshotRecord.income = collateralValue.minus(debtPayable);

  snapshotRecord.save();
}

export function handleRepayLoan(event: RepayLoanEvent): void {
  // Access the Cooler
  const cooler: Cooler = Cooler.bind(event.params.cooler);

  // Get the loan information
  const loanId: BigInt = event.params.loanID;
  const loanData = cooler.getLoan(loanId);
  const loanRecord: CoolerLoan | null = getLoanRecord(cooler._address, loanId);
  if (loanRecord == null) {
    throw new Error("Loan not found with record id: " + getLoanRecordId(cooler._address, loanId));
  }

  // Create a new snapshot
  const snapshotRecord: CoolerLoanSnapshot = populateLoanSnapshot(cooler, loanData, event.block, event.transaction, loanRecord);

  // If the loan is fully repaid, mark it as such
  if (loanData.amount.equals(BigInt.zero())) {
    snapshotRecord.status = "Repaid";
  } else {
    snapshotRecord.status = "Active";
  }

  snapshotRecord.save();
}

export function handleRollLoan(event: RollLoanEvent): void {
  // TODO handle rollover

  // Create new CoolerLoan

  // Create new CoolerLoanSnapshot for rollover

  // Create new CoolerLoanSnapshot for previous loan
}

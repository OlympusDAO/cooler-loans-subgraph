import { Address, BigDecimal, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import {
  ClearRequest,
  DefaultLoan,
  RepayLoan,
  RollLoan
} from "../generated/CoolerFactory/CoolerFactory"
import { Cooler, Cooler__getLoanResultValue0Struct } from "../generated/CoolerFactory/Cooler"
import { ERC20 } from "../generated/CoolerFactory/ERC20"
import { gOHM } from "../generated/CoolerFactory/gOHM"
import {
  ClaimDefaultedLoanEvent,
  ClearLoanRequestEvent,
  RepayLoanEvent,
  CoolerLoan,
  RollLoanEvent,
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

function populateLoan(cooler: Cooler, loanId: BigInt, loanData: Cooler__getLoanResultValue0Struct, block: ethereum.Block, transaction: ethereum.Transaction): CoolerLoan {
  const debtDecimals = ERC20.bind(cooler.debt()).decimals();
  const collateralDecimals = ERC20.bind(cooler.collateral()).decimals();

  const loanRecord: CoolerLoan = new CoolerLoan(getLoanRecordId(cooler._address, loanId));
  loanRecord.createdBlock = block.number;
  loanRecord.createdTimestamp = block.timestamp;
  loanRecord.createdTransaction = transaction.hash;
  loanRecord.loanId = loanId;
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

export function handleClearRequest(event: ClearRequest): void {
  // Access the Cooler
  const cooler: Cooler = Cooler.bind(event.params.cooler);

  // Get the loan information
  const loanId: BigInt = event.params.loanID; // TODO awaiting contract changes
  const loanData = cooler.getLoan(loanId);

  // Create a new CoolerLoan
  const loanRecord: CoolerLoan = populateLoan(cooler, loanId, loanData, event.block, event.transaction);
  loanRecord.save();

  // Create an event record
  const eventRecord: ClearLoanRequestEvent = new ClearLoanRequestEvent(getLoanRecordId(cooler._address, loanId));
  eventRecord.blockNumber = event.block.number;
  eventRecord.blockTimestamp = event.block.timestamp;
  eventRecord.transactionHash = event.transaction.hash;
  eventRecord.loan = loanRecord.id;
  eventRecord.requestId = event.params.reqID;
  eventRecord.save();
}

export function handleDefaultLoan(event: DefaultLoan): void {
  // Access the Cooler
  const cooler: Cooler = Cooler.bind(event.params.cooler);

  // Get the loan information
  const loanId: BigInt = event.params.loanID;
  const loanData = cooler.getLoan(loanId);
  const loanRecord: CoolerLoan | null = getLoanRecord(cooler._address, loanId);
  if (loanRecord == null) {
    throw new Error("Loan not found with record id: " + getLoanRecordId(cooler._address, loanId));
  }

  // Create an event record
  const eventRecord: ClaimDefaultedLoanEvent = new ClaimDefaultedLoanEvent(getLoanRecordId(cooler._address, loanId));
  eventRecord.blockNumber = event.block.number;
  eventRecord.blockTimestamp = event.block.timestamp;
  eventRecord.transactionHash = event.transaction.hash;

  eventRecord.loan = loanRecord.id;
  eventRecord.secondsSinceExpiry = event.block.timestamp.minus(loanData.expiry);

  // Assumes that the loan record still exists on the contract (which is not the case in the current version)

  // Calculate the income from the default. Value of collateral liquidated - debt payable.
  const collateralPrice: BigDecimal = getGOhmPrice();
  const debtPayable: BigDecimal = loanRecord.amount;
  const collateralValue: BigDecimal = loanRecord.collateral.times(collateralPrice);

  eventRecord.collateralQuantityClaimed = loanRecord.collateral;
  eventRecord.collateralPrice = collateralPrice;
  eventRecord.collateralValueClaimed = collateralValue;
  eventRecord.collateralIncome = collateralValue.minus(debtPayable);

  eventRecord.save();
}

export function handleRepayLoan(event: RepayLoan): void {
  // Access the Cooler
  const cooler: Cooler = Cooler.bind(event.params.cooler);

  // Get the loan information
  const loanId: BigInt = event.params.loanID;
  const loanData = cooler.getLoan(loanId);
  const loanRecord: CoolerLoan | null = getLoanRecord(cooler._address, loanId);
  if (loanRecord == null) {
    throw new Error("Loan not found with record id: " + getLoanRecordId(cooler._address, loanId));
  }

  // Create an event record
  const eventRecord: RepayLoanEvent = new RepayLoanEvent(getLoanRecordId(cooler._address, loanId) + "-" + event.block.number.toString());
  eventRecord.blockNumber = event.block.number;
  eventRecord.blockTimestamp = event.block.timestamp;
  eventRecord.transactionHash = event.transaction.hash;

  eventRecord.loan = loanRecord.id;
  eventRecord.secondsToExpiry = loanData.expiry.minus(event.block.timestamp);
  eventRecord.loanPayable = toDecimal(loanData.amount, ERC20.bind(cooler.debt()).decimals());
  eventRecord.collateralDeposited = toDecimal(loanData.collateral, ERC20.bind(cooler.collateral()).decimals());
  eventRecord.repaidUnclaimed = toDecimal(loanData.unclaimed, ERC20.bind(cooler.debt()).decimals());

  eventRecord.amountPaid = toDecimal(event.params.amount, ERC20.bind(cooler.debt()).decimals());

  /**
   * Calculate the income from the repayment.
   * 
   * It is calculated in the following manner:
   * 
   * Current interest income = (repaid amount / total amount) * total interest
   * 
   * Thus, interest income is recognised proportionally at the time of repayment.
   */
  const repaymentRatio = eventRecord.amountPaid.div(loanRecord.amount);
  eventRecord.interestIncome = loanRecord.interest.times(repaymentRatio);

  eventRecord.save();
}

export function handleRollLoan(event: RollLoan): void {
  // Access the Cooler
  const cooler: Cooler = Cooler.bind(event.params.cooler);

  // Get the loan information
  const loanId: BigInt = event.params.loanID;
  const loanData = cooler.getLoan(loanId);
  const loanRecord: CoolerLoan | null = getLoanRecord(cooler._address, loanId);
  if (loanRecord == null) {
    throw new Error("Loan not found with record id: " + getLoanRecordId(cooler._address, loanId));
  }

  // Create the event record
  const eventRecord: RollLoanEvent = new RollLoanEvent(getLoanRecordId(cooler._address, loanId) + "-" + event.block.number.toString());
  eventRecord.blockNumber = event.block.number;
  eventRecord.blockTimestamp = event.block.timestamp;
  eventRecord.transactionHash = event.transaction.hash;

  eventRecord.loan = loanRecord.id;

  // TODO awaiting contract changes
  eventRecord.newDebtQuantity = toDecimal(event.params.newDebt, ERC20.bind(cooler.debt()).decimals());
  eventRecord.newCollateralQuantity = toDecimal(event.params.newCollateral, ERC20.bind(cooler.collateral()).decimals());
  eventRecord.newExpiryTimestamp = loanData.expiry;

  eventRecord.save();
}

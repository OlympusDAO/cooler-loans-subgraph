import { Address, BigDecimal, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import {
  ClearRequest,
  DefaultLoan,
  RepayLoan,
  RequestLoan,
  RescindRequest,
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
  CoolerLoanRequest,
  RescindLoanRequestEvent,
} from "../generated/schema"
import { oracles } from "@protofire/subgraph-devkit";
import { toDecimal } from "./numberHelper"
import { getISO8601DateStringFromTimestamp } from "./dateHelper"

const OHM = "0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5";
const GOHM = "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f";

// TODO handle addresses per data source dataSource.network()

// === Helpers ===

function getLoanRecordId(cooler: Bytes, loanID: BigInt): string {
  return cooler.toHexString() + "-" + loanID.toString();
}

function getLoanRecord(cooler: Bytes, loanID: BigInt): CoolerLoan | null {
  return CoolerLoan.load(getLoanRecordId(cooler, loanID));
}

function populateLoan(cooler: Cooler, request: CoolerLoanRequest, loanId: BigInt, loanData: Cooler__getLoanResultValue0Struct, block: ethereum.Block, transaction: ethereum.Transaction): CoolerLoan {
  const debtDecimals = ERC20.bind(cooler.debt()).decimals();
  const collateralDecimals = ERC20.bind(cooler.collateral()).decimals();

  const loanRecord: CoolerLoan = new CoolerLoan(getLoanRecordId(cooler._address, loanId));
  loanRecord.createdBlock = block.number;
  loanRecord.createdTimestamp = block.timestamp;
  loanRecord.createdTransaction = transaction.hash;
  loanRecord.loanId = loanId;
  loanRecord.cooler = cooler._address;
  loanRecord.request = request.id;
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

function getRequestRecordId(cooler: Bytes, requestId: BigInt): string {
  return cooler.toHexString() + "-" + requestId.toString();
}

function getRequestRecord(cooler: Cooler, requestId: BigInt): CoolerLoanRequest | null {
  return CoolerLoanRequest.load(getRequestRecordId(cooler._address, requestId));
}

// === Request handling ===

export function handleRequest(event: RequestLoan): void {
  // Access the Cooler
  const cooler: Cooler = Cooler.bind(event.params.cooler);
  const debtDecimals = ERC20.bind(cooler.debt()).decimals();

  // Get the request information
  const requestId: BigInt = event.params.reqID;
  const request = cooler.getRequest(requestId);

  // Create a new CoolerLoanRequest
  const requestRecord: CoolerLoanRequest = new CoolerLoanRequest(getRequestRecordId(cooler._address, requestId));
  requestRecord.createdBlock = event.block.number;
  requestRecord.createdTimestamp = event.block.timestamp;
  requestRecord.createdTransaction = event.transaction.hash;
  requestRecord.cooler = cooler._address;
  requestRecord.requestId = requestId;
  requestRecord.borrower = cooler.owner();
  requestRecord.collateralToken = cooler.collateral();
  requestRecord.debtToken = cooler.debt();
  requestRecord.amount = toDecimal(request.amount, debtDecimals);

  // Interest rate is stored on the contract in terms of 1e18
  // e.g. request.interest = 5e15 = 0.005
  // We multiply by 100 to get the percentage, e.g. 0.5%
  requestRecord.interestPercentage = toDecimal(request.interest, debtDecimals).times(BigDecimal.fromString("100"));

  requestRecord.loanToCollateralRatio = toDecimal(request.loanToCollateral, debtDecimals);
  requestRecord.durationSeconds = request.duration;
  requestRecord.isRescinded = false;
  requestRecord.save();

  // Create an event record
  const eventRecord: ClearLoanRequestEvent = new ClearLoanRequestEvent(getRequestRecordId(cooler._address, requestId));
  eventRecord.date = getISO8601DateStringFromTimestamp(event.block.timestamp);
  eventRecord.blockNumber = event.block.number;
  eventRecord.blockTimestamp = event.block.timestamp;
  eventRecord.transactionHash = event.transaction.hash;
  eventRecord.request = requestRecord.id;
  eventRecord.save();
}

export function handleRescindRequest(event: RescindRequest): void {
  // Access the Cooler
  const cooler: Cooler = Cooler.bind(event.params.cooler);

  // Get the request
  const requestId = event.params.reqID;
  const requestRecord: CoolerLoanRequest | null = getRequestRecord(cooler, requestId);
  if (requestRecord == null) {
    throw new Error("Request not found with record id: " + getRequestRecordId(cooler._address, requestId));
  }

  // Update the request record
  requestRecord.isRescinded = true;
  requestRecord.save();

  // Create an event record
  const eventRecord: RescindLoanRequestEvent = new RescindLoanRequestEvent(getRequestRecordId(cooler._address, requestId));
  eventRecord.date = getISO8601DateStringFromTimestamp(event.block.timestamp);
  eventRecord.blockNumber = event.block.number;
  eventRecord.blockTimestamp = event.block.timestamp;
  eventRecord.transactionHash = event.transaction.hash;
  eventRecord.request = requestRecord.id;
  eventRecord.save();
}

// === Loan event handling ===

export function handleClearRequest(event: ClearRequest): void {
  // Access the Cooler
  const cooler: Cooler = Cooler.bind(event.params.cooler);

  // Get the loan information
  const loanId: BigInt = event.params.loanID; // TODO awaiting contract changes
  const loanData = cooler.getLoan(loanId);

  // Get the request information
  const requestId: BigInt = event.params.reqID;
  const requestRecord: CoolerLoanRequest | null = getRequestRecord(cooler, requestId);
  if (requestRecord == null) {
    throw new Error("Request not found with record id: " + getLoanRecordId(cooler._address, requestId));
  }

  // Create a new CoolerLoan
  const loanRecord: CoolerLoan = populateLoan(cooler, requestRecord, loanId, loanData, event.block, event.transaction);
  loanRecord.save();

  // Create an event record
  const eventRecord: ClearLoanRequestEvent = new ClearLoanRequestEvent(getLoanRecordId(cooler._address, loanId));
  eventRecord.date = getISO8601DateStringFromTimestamp(event.block.timestamp);
  eventRecord.blockNumber = event.block.number;
  eventRecord.blockTimestamp = event.block.timestamp;
  eventRecord.transactionHash = event.transaction.hash;
  eventRecord.loan = loanRecord.id;
  eventRecord.request = requestRecord.id;
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
  eventRecord.date = getISO8601DateStringFromTimestamp(event.block.timestamp);
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
  eventRecord.date = getISO8601DateStringFromTimestamp(event.block.timestamp);
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
  eventRecord.date = getISO8601DateStringFromTimestamp(event.block.timestamp);
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

import { Address, BigDecimal, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts"
import {
  ClearRequest,
  DefaultLoan,
  RepayLoan,
  RequestLoan,
  RescindRequest,
  ExtendLoan
} from "../generated/CoolerFactory_V1/CoolerFactory"
import { Cooler, Cooler__getLoanResultValue0Struct } from "../generated/CoolerFactory_V1/Cooler"
import { ERC20 } from "../generated/CoolerFactory_V1/ERC20"
import {
  ClaimDefaultedLoanEvent,
  ClearLoanRequestEvent,
  RepayLoanEvent,
  CoolerLoan,
  ExtendLoanEvent,
  CoolerLoanRequest,
  RescindLoanRequestEvent,
  RequestLoanEvent,
} from "../generated/schema"
import { toDecimal } from "./numberHelper"
import { getISO8601DateStringFromTimestamp } from "./dateHelper"
import { getGOhmPrice } from "./price"
import { getOrCreateClearinghouse, populateClearinghouseSnapshot } from "./clearinghouse"
import { getBorrowerStats, updateBorrowerStats, updateLoanExtensionStats } from "./stats"

// === Helpers ===

function getLoanRecordId(cooler: Bytes, loanID: BigInt): string {
  return cooler.toHexString() + "-" + loanID.toString();
}

function getLoanRecord(cooler: Bytes, loanID: BigInt): CoolerLoan | null {
  return CoolerLoan.load(getLoanRecordId(cooler, loanID));
}

function populateLoan(cooler: Cooler, request: CoolerLoanRequest, loanId: BigInt, loanData: Cooler__getLoanResultValue0Struct, block: ethereum.Block, transaction: ethereum.Transaction): CoolerLoan | null {
  // Get the Clearinghouse
  const clearinghouseRecord = getOrCreateClearinghouse(loanData.lender, block);
  if (clearinghouseRecord == null) {
    log.warning("Skipping loan for invalid clearinghouse/lender {}", [loanData.lender.toHexString()]);
    return null;
  }
  
  const borrowerStats = getBorrowerStats(Address.fromBytes(request.borrower), clearinghouseRecord.id);

  const loanRecord: CoolerLoan = new CoolerLoan(getLoanRecordId(cooler._address, loanId));
  loanRecord.createdBlock = block.number;
  loanRecord.createdTimestamp = block.timestamp;
  loanRecord.createdTransaction = transaction.hash;
  loanRecord.loanId = loanId;
  loanRecord.cooler = cooler._address;
  loanRecord.request = request.id;
  loanRecord.interest = toDecimal(loanData.interestDue, clearinghouseRecord.reserveTokenDecimals);
  loanRecord.principal = toDecimal(loanData.principal, clearinghouseRecord.reserveTokenDecimals);
  loanRecord.collateral = toDecimal(loanData.collateral, clearinghouseRecord.collateralTokenDecimals);
  loanRecord.originalExpiryTimestamp = loanData.expiry;
  loanRecord.currentExpiryTimestamp = loanData.expiry;
  loanRecord.clearinghouse = clearinghouseRecord.id;
  loanRecord.hasCallback = loanData.callback;
  loanRecord.borrower = request.borrower.toHexString();

  return loanRecord;
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
  requestRecord.interestPercentage = toDecimal(request.interest, debtDecimals);

  requestRecord.loanToCollateralRatio = toDecimal(request.loanToCollateral, debtDecimals);
  requestRecord.durationSeconds = request.duration;
  requestRecord.isRescinded = false;
  requestRecord.save();

  // Create an event record
  const eventRecord: RequestLoanEvent = new RequestLoanEvent(getRequestRecordId(cooler._address, requestId));
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
  const loanId: BigInt = event.params.loanID;
  const loanData = cooler.getLoan(loanId);

  // Get the request information
  const requestId: BigInt = event.params.reqID;
  const requestRecord: CoolerLoanRequest | null = getRequestRecord(cooler, requestId);
  if (requestRecord == null) {
    throw new Error("Request not found with record id: " + getLoanRecordId(cooler._address, requestId));
  }

  // Create a new CoolerLoan
  const loanRecord: CoolerLoan | null = populateLoan(cooler, requestRecord, loanId, loanData, event.block, event.transaction);
  if (loanRecord == null) {
    return;
  }
  loanRecord.save();

  // Create an event record
  const eventRecord: ClearLoanRequestEvent = new ClearLoanRequestEvent(getLoanRecordId(cooler._address, loanId));
  eventRecord.date = getISO8601DateStringFromTimestamp(event.block.timestamp);
  eventRecord.blockNumber = event.block.number;
  eventRecord.blockTimestamp = event.block.timestamp;
  eventRecord.transactionHash = event.transaction.hash;

  // Loan state
  eventRecord.loan = loanRecord.id;
  eventRecord.request = requestRecord.id;

  // Clearinghouse snapshot
  const clearinghouseSnapshot = populateClearinghouseSnapshot(loanData.lender, event);
  if (clearinghouseSnapshot != null) {
    clearinghouseSnapshot.save();
  }

  eventRecord.save();

   // Get borrower loan count before incrementing
  const borrowerAddress = Address.fromString(loanRecord.borrower);

  // Update cumulative stats for new loan
  updateBorrowerStats(
    loanRecord.clearinghouse,
    borrowerAddress,
    true, // this is always a new loan
    true, // new loan is active
    false, // not a default
    false, // not a repayment
    event.block.number,
    event.block.timestamp,
    loanRecord.principal,
    loanRecord.interest,
    loanRecord.collateral
  );
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
  const eventRecord: ClaimDefaultedLoanEvent = new ClaimDefaultedLoanEvent(1);
  eventRecord.date = getISO8601DateStringFromTimestamp(event.block.timestamp);
  eventRecord.blockNumber = event.block.number;
  eventRecord.blockTimestamp = event.block.timestamp;
  eventRecord.transactionHash = event.transaction.hash;

  const collateralPrice: BigDecimal = getGOhmPrice();
  const collateralValue: BigDecimal = loanRecord.collateral.times(collateralPrice);

  // Record the amount of collateral that has been claimed
  // The collateral income from the default requires historical data, so it is not calculated here.
  eventRecord.collateralQuantityClaimed = toDecimal(event.params.amount, ERC20.bind(cooler.collateral()).decimals());
  eventRecord.collateralPrice = collateralPrice;
  eventRecord.collateralValueClaimed = collateralValue;
  eventRecord.defaultedPrincipal = loanRecord.principal;

  // Loan state
  eventRecord.loan = loanRecord.id;
  eventRecord.secondsSinceExpiry = event.block.timestamp.minus(loanData.expiry);

  // Clearinghouse snapshot
  const clearinghouseSnapshot = populateClearinghouseSnapshot(loanData.lender, event);

  //update the loan record
  loanRecord.principal = BigDecimal.zero();
  loanRecord.interest = BigDecimal.zero();
  loanRecord.collateral = BigDecimal.zero();
  loanRecord.save();

  if (clearinghouseSnapshot != null) {
    clearinghouseSnapshot.save();
  }
  eventRecord.save();

  // Update the borrower stats
  const borrowerAddress = Address.fromString(loanRecord.borrower);
  // Update active borrower count
  updateBorrowerStats(
    loanRecord.clearinghouse,
    borrowerAddress,
    false, // not a new loan
    false, // loan is no longer active
    true, // is a default
    false, // not a repayment
    event.block.number,
    event.block.timestamp,
    loanRecord.principal.neg(),
    loanRecord.interest.neg(),
    loanRecord.collateral.neg()
  );
  
}

export function handleRepayLoan(event: RepayLoan): void {
  // Access the Cooler
  const cooler: Cooler = Cooler.bind(event.params.cooler);

  // Get the loan information from our subgraph (pre-repayment state)
  const loanId: BigInt = event.params.loanID;
  const loanRecord: CoolerLoan | null = getLoanRecord(cooler._address, loanId);
  if (loanRecord == null) {
    throw new Error("Loan not found with record id: " + getLoanRecordId(cooler._address, loanId));
  }

  // Create an event record
  const eventRecord: RepayLoanEvent = new RepayLoanEvent(1);
  eventRecord.date = getISO8601DateStringFromTimestamp(event.block.timestamp);
  eventRecord.blockNumber = event.block.number;
  eventRecord.blockTimestamp = event.block.timestamp;
  eventRecord.transactionHash = event.transaction.hash;

  const debtDecimals = ERC20.bind(cooler.debt()).decimals();
  let amountPaid = toDecimal(event.params.amount, debtDecimals);
  
  // Skip processing if amountPaid is 0
  if (amountPaid.equals(BigDecimal.zero())) {
    return;
  }
  

  // Calculate principal and interest portions using loanRecord (pre-repayment state)
  if (amountPaid.gt(loanRecord.interest)) {
    eventRecord.interestPaid = loanRecord.interest;
    eventRecord.principalPaid = amountPaid.minus(loanRecord.interest);
  } else {
    eventRecord.interestPaid = amountPaid;
    eventRecord.principalPaid = BigDecimal.zero();
  }

  // Event information
  eventRecord.amountPaid = amountPaid;
  eventRecord.loan = loanRecord.id;
  eventRecord.secondsToExpiry = loanRecord.currentExpiryTimestamp.minus(event.block.timestamp);

  // Take snapshot
  const clearinghouseSnapshot = populateClearinghouseSnapshot(Address.fromString(loanRecord.clearinghouse), event);
  if (clearinghouseSnapshot != null) {
    clearinghouseSnapshot.save();
  }

  eventRecord.save();

  // Update borrower stats using pre-repayment state from loanRecord
  const borrowerAddress = Address.fromString(loanRecord.borrower);
  const isFullRepayment = amountPaid.equals(loanRecord.principal.plus(loanRecord.interest));

  let principalDelta: BigDecimal;
  let interestDelta: BigDecimal;
  let collateralDelta: BigDecimal;

  if (isFullRepayment) {
    principalDelta = loanRecord.principal.neg();
    interestDelta = loanRecord.interest.neg();
    collateralDelta = loanRecord.collateral.neg();
  } else {
    if (amountPaid.gt(loanRecord.interest)) {
      interestDelta = loanRecord.interest.neg();
      principalDelta = amountPaid.minus(loanRecord.interest).neg();
      collateralDelta = loanRecord.collateral.times(principalDelta).div(loanRecord.principal);
    } else {
      interestDelta = amountPaid.neg();
      principalDelta = BigDecimal.zero();
      collateralDelta = BigDecimal.zero();
    }
  }

  //update the loan record
  loanRecord.principal = loanRecord.principal.plus(principalDelta);
  loanRecord.interest = loanRecord.interest.plus(interestDelta);
  loanRecord.collateral = loanRecord.collateral.plus(collateralDelta);
  loanRecord.save();

  updateBorrowerStats(
    loanRecord.clearinghouse,
    borrowerAddress,
    false,
    !isFullRepayment,
    false,
    isFullRepayment,
    event.block.number,
    event.block.timestamp,
    principalDelta,
    interestDelta,
    collateralDelta
  );
}

export function handleExtendLoan(event: ExtendLoan): void {
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
  const eventRecord: ExtendLoanEvent = new ExtendLoanEvent(1);
  eventRecord.date = getISO8601DateStringFromTimestamp(event.block.timestamp);
  eventRecord.blockNumber = event.block.number;
  eventRecord.blockTimestamp = event.block.timestamp;
  eventRecord.transactionHash = event.transaction.hash;

  // Event information
  eventRecord.periods = event.params.times;

  // Loan state
  eventRecord.loan = loanRecord.id;
  eventRecord.expiryTimestamp = loanData.expiry;
  loanRecord.currentExpiryTimestamp = loanData.expiry;

  // Calculate extension interest the same way as the contract
  const interestBase = interestForLoan(loanData.principal, loanData.request.duration);
  const extensionInterest = toDecimal(interestBase.times(BigInt.fromI32(event.params.times)), ERC20.bind(cooler.debt()).decimals());

  // Use the actual extension interest amount
  eventRecord.interestDue = extensionInterest;

  // Clearinghouse snapshot
  const clearinghouseSnapshot = populateClearinghouseSnapshot(loanData.lender, event);
  if (clearinghouseSnapshot != null) {
    clearinghouseSnapshot.save();
  }
  loanRecord.save();

  // Update extension stats with the correct interest amount
  updateLoanExtensionStats(
    loanRecord.clearinghouse,
    Address.fromString(loanRecord.borrower),
    extensionInterest,  // Use the extension interest, not the total remaining interest
    event.block.number,
    event.block.timestamp
  );

  eventRecord.save();
}

// Add this helper function to match the contract
function interestForLoan(principal: BigInt, duration: BigInt): BigInt {
    const INTEREST_RATE = BigInt.fromString("5000000000000000"); // 0.5% = 5e15
    const YEAR_IN_SECONDS = BigInt.fromI32(365 * 24 * 60 * 60);
    
    const interestPercent = INTEREST_RATE.times(duration).div(YEAR_IN_SECONDS);
    return principal.times(interestPercent).div(BigInt.fromString("1000000000000000000")); // div by 1e18
}

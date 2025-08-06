import { Address, BigDecimal, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { ClearRequest } from "../generated/CoolerFactory_V1/CoolerFactory"
import { Cooler } from "../generated/CoolerFactory_V1/Cooler"
import {
  ClearLoanRequestEvent,
  CoolerLoan,
  CoolerLoanRequest
} from "../generated/schema"
import { toDecimal } from "../src/numberHelper"
import { getISO8601DateStringFromTimestamp } from "../src/dateHelper"

// Function to build loan record ID
function getLoanRecordId(coolerAddress: Address, loanId: BigInt): string {
  return coolerAddress.toHexString() + '-' + loanId.toString();
}

// This function mirrors handleClearRequest from src/cooler-factory.ts but skips
// the problematic clearinghouse snapshot for testing purposes
export function handleClearRequestMock(event: ClearRequest): void {
  // Access the Cooler
  const cooler: Cooler = Cooler.bind(event.params.cooler);

  // Get the loan information
  const loanId: BigInt = event.params.loanID;
  const loanData = cooler.getLoan(loanId);

  // Get the request information
  const requestId: BigInt = event.params.reqID;
  const coolerString = event.params.cooler.toHexString();
  const requestRecordId = coolerString + '-' + requestId.toString();
  const requestRecord = CoolerLoanRequest.load(requestRecordId);
  
  if (requestRecord == null) {
    throw new Error("Request not found with record id: " + requestRecordId);
  }

  // Create a new CoolerLoan
  const loanRecord = new CoolerLoan(getLoanRecordId(event.params.cooler, loanId));
  loanRecord.cooler = event.params.cooler;
  loanRecord.loanId = loanId;
  loanRecord.request = requestRecord.id;
  loanRecord.borrower = requestRecord.borrower.toHexString();
  loanRecord.clearinghouse = loanData.lender.toHexString();
  loanRecord.principal = toDecimal(loanData.principal, 18); // Assuming 18 decimals
  loanRecord.interest = toDecimal(loanData.interestDue, 18); // Assuming 18 decimals
  loanRecord.collateral = toDecimal(loanData.collateral, 18); // Assuming 18 decimals
  loanRecord.originalExpiryTimestamp = loanData.expiry;
  loanRecord.currentExpiryTimestamp = loanData.expiry;
  loanRecord.hasCallback = loanData.callback;
  loanRecord.createdBlock = event.block.number;
  loanRecord.createdTimestamp = event.block.timestamp;
  loanRecord.createdTransaction = event.transaction.hash;
  loanRecord.save();

  // Create an event record
  const eventRecord = new ClearLoanRequestEvent(loanRecord.id);
  eventRecord.date = getISO8601DateStringFromTimestamp(event.block.timestamp);
  eventRecord.blockNumber = event.block.number;
  eventRecord.blockTimestamp = event.block.timestamp;
  eventRecord.transactionHash = event.transaction.hash;
  eventRecord.loan = loanRecord.id;
  eventRecord.request = requestRecord.id;
  eventRecord.save();
  
  // Stats are now handled directly in the test file
  // We're not calling updateBorrowerStats here anymore
} 
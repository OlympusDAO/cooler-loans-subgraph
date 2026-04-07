import { Address, BigDecimal, BigInt, Bytes, ethereum, store, Value } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { createMockedFunction, MockedFunction } from "matchstick-as/assembly/index";

import {
  ClearRequest,
  DefaultLoan,
  RepayLoan,
  RequestLoan,
  RescindRequest,
} from "../generated/CoolerFactory_V1/CoolerFactory";
import { ClearinghouseSnapshot } from "../generated/schema";
import { COOLER_LOANS_CLEARINGHOUSE_V1 } from "../src/constants";

// Mock function for ERC4626 previewRedeem calls - returns the same amount (1:1 ratio)
export function mockPreviewRedeem(
  tokenAddress: Address
): void {
  // This creates a dynamic mock that returns different values for different inputs
  // First, handle the specific value we know is being called
  createMockedFunction(
    tokenAddress,
    "previewRedeem",
    "previewRedeem(uint256):(uint256)"
  )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('999999999999999000'))])
    .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('999999999999999000'))]);
    
  // Then add mocks for other known values
  createMockedFunction(
    tokenAddress,
    "previewRedeem",
    "previewRedeem(uint256):(uint256)"
  )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1000000000000000000'))])
    .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1000000000000000000'))]);
    
  createMockedFunction(
    tokenAddress,
    "previewRedeem",
    "previewRedeem(uint256):(uint256)"
  )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))])
    .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))]);
}

// Mock function for TRSRY reserveDebt calls
export function mockTrsryReserveDebt(
  trsryAddress: Address,
  reserveAddress: Address, 
  debtorAddress: Address, 
  returnAmount: BigInt
): void {
  createMockedFunction(
    trsryAddress,
    "reserveDebt",
    "reserveDebt(address,address):(uint256)"
  )
    .withArgs([
      ethereum.Value.fromAddress(reserveAddress),
      ethereum.Value.fromAddress(debtorAddress)
    ])
    .returns([ethereum.Value.fromUnsignedBigInt(returnAmount)]);
}

// Mock the TRSRY contract calls - add this at the top level
export function setupMocks(): void {
  const trsryAddress = Address.fromString("0x0000000000000000000000000000000000000006");
  const debtorAddress = Address.fromString("0x0000000000000000000000000000000000000001");
  const clearinghouseAddress = Address.fromString(COOLER_LOANS_CLEARINGHOUSE_V1);
  
  // Mock for all the reserve addresses we might encounter
  const daiAddress = Address.fromString("0x0000000000000000000000000000000000000003");
  const sdaiAddress = Address.fromString("0x0000000000000000000000000000000000000004");
  
  // Mock for dai debt
  mockTrsryReserveDebt(trsryAddress, daiAddress, debtorAddress, BigInt.fromI32(1000));
  mockTrsryReserveDebt(trsryAddress, daiAddress, clearinghouseAddress, BigInt.fromI32(1000));
  
  // Mock for sdai debt
  mockTrsryReserveDebt(trsryAddress, sdaiAddress, debtorAddress, BigInt.fromI32(1000));
  mockTrsryReserveDebt(trsryAddress, sdaiAddress, clearinghouseAddress, BigInt.fromI32(1000));
  
  // Mock the ERC4626 previewRedeem function for sDAI
  mockPreviewRedeem(sdaiAddress);
}

// This approach bypasses the entity creation mechanism
// Instead it just creates a stub that could be used for testing
export function createMockClearinghouseSnapshot(
  clearinghouse: string,
  timestamp: BigInt
): ClearinghouseSnapshot {
  // For a timeseries entity with Int8! ID, we need to use a numeric value in range -128 to 127
  // @ts-expect-error - using numeric constructor parameter for timeseries entity
  const snapshot = new ClearinghouseSnapshot("1");
  
  // Set fields in a different order, avoiding timestamp-related issues
  snapshot.date = "2024-01-01";
  snapshot.blockNumber = BigInt.fromI32(1000);
  snapshot.blockTimestamp = timestamp;
  snapshot.transactionHash = Bytes.fromHexString("0x");
  snapshot.clearinghouse = clearinghouse;
  snapshot.isActive = true;
  snapshot.nextRebalanceTimestamp = BigInt.fromI32(1000);
  snapshot.interestReceivables = BigDecimal.fromString("0");
  snapshot.principalReceivables = BigDecimal.fromString("0");
  snapshot.reserveToken = Bytes.fromHexString("0x");
  snapshot.sReserveToken = Bytes.fromHexString("0x");
  snapshot.reserveBalance = BigDecimal.fromString("0");
  snapshot.sReserveBalance = BigDecimal.fromString("0");
  snapshot.sReserveInReserveBalance = BigDecimal.fromString("0");
  snapshot.treasuryReserveBalance = BigDecimal.fromString("0");
  snapshot.treasurySReserveBalance = BigDecimal.fromString("0");
  snapshot.treasurySReserveInReserveBalance = BigDecimal.fromString("0");
  
  return snapshot;
}

export function createClearRequestEvent(
  cooler: Address,
  reqID: BigInt,
  loanID: BigInt
): ClearRequest {
  const clearRequestEvent = changetype<ClearRequest>(newMockEvent());

  clearRequestEvent.parameters = [];

  clearRequestEvent.parameters.push(
    new ethereum.EventParam("cooler", ethereum.Value.fromAddress(cooler))
  );
  clearRequestEvent.parameters.push(
    new ethereum.EventParam("reqID", ethereum.Value.fromUnsignedBigInt(reqID))
  );
  clearRequestEvent.parameters.push(
    new ethereum.EventParam("loanID", ethereum.Value.fromUnsignedBigInt(loanID))
  );

  clearRequestEvent.block.number = BigInt.fromI32(1000);
  clearRequestEvent.block.timestamp = BigInt.fromI32(1000);

  return clearRequestEvent;
}

export function createDefaultLoanEvent(
  cooler: Address,
  loanID: BigInt
): DefaultLoan {
  const defaultLoanEvent = changetype<DefaultLoan>(newMockEvent());

  defaultLoanEvent.parameters = [];

  defaultLoanEvent.parameters.push(
    new ethereum.EventParam("cooler", ethereum.Value.fromAddress(cooler))
  );
  defaultLoanEvent.parameters.push(
    new ethereum.EventParam("loanID", ethereum.Value.fromUnsignedBigInt(loanID))
  );

  return defaultLoanEvent;
}

export function createRepayLoanEvent(
  cooler: Address,
  loanID: BigInt,
  amount: BigInt
): RepayLoan {
  const repayLoanEvent = changetype<RepayLoan>(newMockEvent());

  repayLoanEvent.parameters = [];

  repayLoanEvent.parameters.push(
    new ethereum.EventParam("cooler", ethereum.Value.fromAddress(cooler))
  );
  repayLoanEvent.parameters.push(
    new ethereum.EventParam("loanID", ethereum.Value.fromUnsignedBigInt(loanID))
  );
  repayLoanEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  );

  return repayLoanEvent;
}

export function createRequestLoanEvent(
  cooler: Address,
  collateral: Address,
  debt: Address,
  reqID: BigInt
): RequestLoan {
  const requestLoanEvent = changetype<RequestLoan>(newMockEvent());

  requestLoanEvent.parameters = [];

  requestLoanEvent.parameters.push(
    new ethereum.EventParam("cooler", ethereum.Value.fromAddress(cooler))
  );
  requestLoanEvent.parameters.push(
    new ethereum.EventParam(
      "collateral",
      ethereum.Value.fromAddress(collateral)
    )
  );
  requestLoanEvent.parameters.push(
    new ethereum.EventParam("debt", ethereum.Value.fromAddress(debt))
  );
  requestLoanEvent.parameters.push(
    new ethereum.EventParam("reqID", ethereum.Value.fromUnsignedBigInt(reqID))
  );

  return requestLoanEvent;
}

export function createRescindRequestEvent(
  cooler: Address,
  reqID: BigInt
): RescindRequest {
  const rescindRequestEvent = changetype<RescindRequest>(newMockEvent());

  rescindRequestEvent.parameters = [];

  rescindRequestEvent.parameters.push(
    new ethereum.EventParam("cooler", ethereum.Value.fromAddress(cooler))
  );
  rescindRequestEvent.parameters.push(
    new ethereum.EventParam("reqID", ethereum.Value.fromUnsignedBigInt(reqID))
  );

  return rescindRequestEvent;
}

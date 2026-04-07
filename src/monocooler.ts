import {
  Address,
  BigDecimal,
  BigInt,
  Bytes,
  ethereum,
  Int8,
} from "@graphprotocol/graph-ts";

import {
  Borrow,
  BorrowPausedSet,
  CollateralAdded,
  CollateralWithdrawn,
  InterestRateSet,
  Liquidated,
  LiquidationsPausedSet,
  LtvOracleSet,
  MonoCooler,
  Repay,
  TreasuryBorrowerSet,
} from "../generated/MonoCooler/MonoCooler";
import {
  MonoCoolerAccount,
  MonoCoolerAccountSnapshot,
  MonoCoolerActivity,
  MonoCoolerGlobalSnapshot,
  MonoCoolerGlobalState,
  MonoCoolerLiquidation,
  MonoCoolerLoanOrigination,
  MonoCoolerLtvOracleChange,
} from "../generated/schema";

// Helper: Get LTV values from the contract (raw BigInt WAD values)
function getLtvValues(contractAddress: Address): BigInt[] {
  const contract = MonoCooler.bind(contractAddress);
  const ltvResult = contract.try_loanToValues();
  
  if (!ltvResult.reverted) {
    const maxOriginationLtv = ltvResult.value.getMaxOriginationLtv();
    const liquidationLtv = ltvResult.value.getLiquidationLtv();
    return [maxOriginationLtv, liquidationLtv];
  } else {
    // Fallback values if contract call fails (example values in WAD)
    return [BigInt.fromString("3000000000000000000000"), BigInt.fromString("3300000000000000000000")]; // 3000 and 3300 USDS/gOHM
  }
}

// Helper: Get or create the global state singleton
function getOrCreateGlobalState(
  contractAddress: Address,
  timestamp: BigInt
): MonoCoolerGlobalState {
  const id = "singleton";
  let state = MonoCoolerGlobalState.load(id);
  if (!state) {
    state = new MonoCoolerGlobalState(id);
    
    // Load initial values from the contract instead of defaulting to zero
    const contract = MonoCooler.bind(contractAddress);
    
    // Load contract state
    const totalCollateralResult = contract.try_totalCollateral();
    const totalDebtResult = contract.try_totalDebt();
    const interestAccumulatorRayResult = contract.try_interestAccumulatorRay();
    const interestRateWadResult = contract.try_interestRateWad();
    const ltvOracleResult = contract.try_ltvOracle();
    const liquidationsPausedResult = contract.try_liquidationsPaused();
    const borrowsPausedResult = contract.try_borrowsPaused();
    const treasuryBorrowerResult = contract.try_treasuryBorrower();
    
    // Set values from contract or fallback to sensible defaults
    state.totalCollateral = totalCollateralResult.reverted
      ? BigInt.zero()
      : totalCollateralResult.value;
    state.totalDebt = totalDebtResult.reverted
      ? BigInt.zero()
      : totalDebtResult.value;
    state.interestAccumulatorRay = interestAccumulatorRayResult.reverted
      ? BigInt.fromString("1000000000000000000000000000")
      : interestAccumulatorRayResult.value;
    state.interestRateWad = interestRateWadResult.reverted
      ? BigInt.zero()
      : interestRateWadResult.value;
    state.ltvOracle = ltvOracleResult.reverted
      ? Bytes.empty()
      : ltvOracleResult.value;
    state.liquidationPaused = liquidationsPausedResult.reverted
      ? false
      : liquidationsPausedResult.value;
    state.borrowsPaused = borrowsPausedResult.reverted
      ? false
      : borrowsPausedResult.value;
    state.treasuryBorrower = treasuryBorrowerResult.reverted
      ? Bytes.empty()
      : treasuryBorrowerResult.value;
    state.updatedAt = timestamp;

    state.save();
  }

  return state;
}

// Helper: Get or create an account
function getOrCreateAccount(address: Address): MonoCoolerAccount {
  let account = MonoCoolerAccount.load(address.toHexString());
  if (!account) {
    account = new MonoCoolerAccount(address.toHexString());
    account.address = address;
    account.collateral = BigInt.zero();
    account.debt = BigInt.zero();
    account.interestAccumulatorRay = BigInt.fromString(
      "1000000000000000000000000000"
    );
    account.ltv = BigInt.zero();
    account.healthFactor = BigInt.zero();
    account.updatedAt = BigInt.zero();
    account.save();
  }
  return account;
}

// Helper: Get current LTV and health factor from contract (raw values)
function updateAccountMetrics(
  account: MonoCoolerAccount,
  contractAddress: Address
): void {
  const contract = MonoCooler.bind(contractAddress);
  const positionResult = contract.try_accountPosition(
    Address.fromBytes(account.address)
  );

  if (!positionResult.reverted) {
    const position = positionResult.value;

    // Store raw WAD values from contract (no conversion)
    account.ltv = position.currentLtv;
    account.healthFactor = position.healthFactor;
  } else {
    // Fallback to zero if contract call fails
    account.ltv = BigInt.zero();
    account.healthFactor = BigInt.zero();
  }
}

// Helper: Create account snapshot (timeseries)
function createAccountSnapshot(
  account: MonoCoolerAccount,
  event: ethereum.Event,
  ltvValues: BigInt[]
): void {
  const snapshot = new MonoCoolerAccountSnapshot(i64(1)); // ID is auto-incremented
  // timestamp is auto-set by The Graph
  snapshot.account = account.id;
  snapshot.collateral = account.collateral;
  snapshot.debt = account.debt;
  snapshot.ltv = account.ltv;
  snapshot.healthFactor = account.healthFactor;
  snapshot.maxOriginationLtv = ltvValues[0];
  snapshot.liquidationLtv = ltvValues[1];
  snapshot.save();
}

// Helper: Create global snapshot (timeseries)
function createGlobalSnapshot(
  globalState: MonoCoolerGlobalState,
  event: ethereum.Event,
  ltvValues: BigInt[]
): void {
  const snapshot = new MonoCoolerGlobalSnapshot(i64(1)); // ID is auto-incremented
  // timestamp is auto-set by The Graph
  snapshot.globalState = globalState.id;
  snapshot.totalCollateral = globalState.totalCollateral;
  snapshot.totalDebt = globalState.totalDebt;
  snapshot.interestRateWad = globalState.interestRateWad;
  snapshot.maxOriginationLtv = ltvValues[0];
  snapshot.liquidationLtv = ltvValues[1];
  snapshot.save();
}

// Helper: Create activity record with LTV data
function createActivity(
  type: string, 
  account: MonoCoolerAccount, 
  amount: BigInt, 
  collateral: BigInt, 
  debt: BigInt, 
  event: ethereum.Event,
  ltvValues: BigInt[],
  liquidationData: BigInt[] | null = null
): void {
  const activity = new MonoCoolerActivity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  activity.type = type;
  activity.account = account.id;
  activity.amount = amount;
  activity.collateral = collateral;
  activity.debt = debt;
  activity.ltv = account.ltv;
  activity.maxOriginationLtv = ltvValues[0];
  activity.liquidationLtv = ltvValues[1];
  activity.txHash = event.transaction.hash;
  activity.timestamp = event.block.timestamp;
  
  // Set liquidation-specific data
  if (liquidationData != null) {
    activity.liquidationIncentive = liquidationData[0];
    activity.collateralSeized = liquidationData[1];
    activity.debtWiped = liquidationData[2];
  }
  
  activity.save();
}

// Event Handlers
export function handleCollateralAdded(event: CollateralAdded): void {
  const ltvValues = getLtvValues(event.address);
  const globalState = getOrCreateGlobalState(
    event.address,
    event.block.timestamp
  );
  const account = getOrCreateAccount(event.params.onBehalfOf);
  const amount = event.params.collateralAmount;

  // Update account
  account.collateral = account.collateral.plus(amount);
  account.updatedAt = event.block.timestamp;
  // Update derived fields from contract
  updateAccountMetrics(account, event.address);
  account.save();

  // Update global
  globalState.totalCollateral = globalState.totalCollateral.plus(amount);
  globalState.updatedAt = event.block.timestamp;
  globalState.save();

  // Snapshots
  createAccountSnapshot(account, event, ltvValues);
  createGlobalSnapshot(globalState, event, ltvValues);

  // Activity
  createActivity(
    "collateralAdd",
    account,
    amount,
    account.collateral,
    account.debt,
    event,
    ltvValues
  );
}

export function handleCollateralWithdrawn(event: CollateralWithdrawn): void {
  const ltvValues = getLtvValues(event.address);
  const globalState = getOrCreateGlobalState(
    event.address,
    event.block.timestamp
  );
  const account = getOrCreateAccount(event.params.onBehalfOf);
  const amount = event.params.collateralAmount;

  // Update account
  account.collateral = account.collateral.minus(amount);
  account.updatedAt = event.block.timestamp;
  // Update derived fields from contract
  updateAccountMetrics(account, event.address);
  account.save();

  // Update global
  globalState.totalCollateral = globalState.totalCollateral.minus(amount);
  globalState.updatedAt = event.block.timestamp;
  globalState.save();

  // Snapshots
  createAccountSnapshot(account, event, ltvValues);
  createGlobalSnapshot(globalState, event, ltvValues);

  // Activity
  createActivity(
    "collateralWithdraw",
    account,
    amount,
    account.collateral,
    account.debt,
    event,
    ltvValues
  );
}

export function handleBorrow(event: Borrow): void {
  const ltvValues = getLtvValues(event.address);
  const globalState = getOrCreateGlobalState(
    event.address,
    event.block.timestamp
  );
  const account = getOrCreateAccount(event.params.onBehalfOf);
  const amount = event.params.amount;

  // Update account
  account.debt = account.debt.plus(amount);
  account.updatedAt = event.block.timestamp;
  // Update derived fields from contract
  updateAccountMetrics(account, event.address);
  account.save();

  // Update global
  globalState.totalDebt = globalState.totalDebt.plus(amount);
  globalState.updatedAt = event.block.timestamp;
  globalState.save();

  // Create origination record (timeseries)
  const origination = new MonoCoolerLoanOrigination(i64(1)); // ID is auto-incremented
  // timestamp is auto-set by The Graph
  origination.account = account.id;
  origination.borrowAmount = amount;
  origination.resultingLtv = account.ltv;
  origination.maxOriginationLtv = ltvValues[0];
  origination.liquidationLtv = ltvValues[1];
  origination.collateralAtTime = account.collateral;
  origination.debtAtTime = account.debt;
  origination.healthFactor = account.healthFactor;
  // Calculate utilization ratio (resultingLtv * 1e18 / maxOriginationLtv)
  origination.utilizationRatio = ltvValues[0].equals(BigInt.zero()) 
    ? BigInt.zero() 
    : account.ltv.times(BigInt.fromString("1000000000000000000")).div(ltvValues[0]);
  origination.txHash = event.transaction.hash;
  origination.save();

  // Snapshots
  createAccountSnapshot(account, event, ltvValues);
  createGlobalSnapshot(globalState, event, ltvValues);

  // Activity
  createActivity(
    "borrow",
    account,
    amount,
    account.collateral,
    account.debt,
    event,
    ltvValues
  );
}

export function handleRepay(event: Repay): void {
  const ltvValues = getLtvValues(event.address);
  const globalState = getOrCreateGlobalState(
    event.address,
    event.block.timestamp
  );
  const account = getOrCreateAccount(event.params.onBehalfOf);
  const amount = event.params.repayAmount;

  // Update account
  account.debt = account.debt.minus(amount);
  if (account.debt.lt(BigInt.zero())) {
    account.debt = BigInt.zero();
  }
  account.updatedAt = event.block.timestamp;
  // Update derived fields from contract
  updateAccountMetrics(account, event.address);
  account.save();

  // Update global
  globalState.totalDebt = globalState.totalDebt.minus(amount);
  if (globalState.totalDebt.lt(BigInt.zero())) {
    globalState.totalDebt = BigInt.zero();
  }
  globalState.updatedAt = event.block.timestamp;
  globalState.save();

  // Snapshots
  createAccountSnapshot(account, event, ltvValues);
  createGlobalSnapshot(globalState, event, ltvValues);

  // Activity
  createActivity(
    "repay",
    account,
    amount,
    account.collateral,
    account.debt,
    event,
    ltvValues
  );
}

export function handleLiquidated(event: Liquidated): void {
  const ltvValues = getLtvValues(event.address);
  const globalState = getOrCreateGlobalState(
    event.address,
    event.block.timestamp
  );
  const account = getOrCreateAccount(event.params.account);
  const collateralSeized = event.params.collateralSeized;
  const debtWiped = event.params.debtWiped;
  const incentive = event.params.incentives;
  
  // Capture LTV at liquidation before updating account
  const ltvAtLiquidation = account.ltv;
  const healthFactorAtLiquidation = account.healthFactor;

  // Create liquidation record (timeseries) before updating account
  const liquidation = new MonoCoolerLiquidation(i64(1)); // ID is auto-incremented
  // timestamp is auto-set by The Graph
  liquidation.account = account.id;
  liquidation.liquidator = event.params.caller;
  liquidation.collateralSeized = collateralSeized;
  liquidation.debtWiped = debtWiped;
  liquidation.incentiveReceived = incentive;
  liquidation.ltvAtLiquidation = ltvAtLiquidation;
  liquidation.maxOriginationLtv = ltvValues[0];
  liquidation.liquidationLtv = ltvValues[1];
  // Calculate excess LTV (how much over liquidation threshold)
  liquidation.excessLtv = ltvAtLiquidation.minus(ltvValues[1]);
  liquidation.healthFactorAtLiquidation = healthFactorAtLiquidation;
  liquidation.txHash = event.transaction.hash;
  liquidation.save();

  // Update account (position is fully liquidated)
  account.collateral = BigInt.zero();
  account.debt = BigInt.zero();
  account.ltv = BigInt.zero();
  account.healthFactor = BigInt.zero();
  account.updatedAt = event.block.timestamp;
  account.save();

  // Update global
  globalState.totalCollateral =
    globalState.totalCollateral.minus(collateralSeized);
  if (globalState.totalCollateral.lt(BigInt.zero())) {
    globalState.totalCollateral = BigInt.zero();
  }
  globalState.totalDebt = globalState.totalDebt.minus(debtWiped);
  if (globalState.totalDebt.lt(BigInt.zero())) {
    globalState.totalDebt = BigInt.zero();
  }
  globalState.updatedAt = event.block.timestamp;
  globalState.save();

  // Snapshots
  createAccountSnapshot(account, event, ltvValues);
  createGlobalSnapshot(globalState, event, ltvValues);

  // Activity
  const liquidationData = [incentive, collateralSeized, debtWiped];
  createActivity(
    "liquidate",
    account,
    debtWiped,
    account.collateral,
    account.debt,
    event,
    ltvValues,
    liquidationData
  );
}

export function handleLtvOracleSet(event: LtvOracleSet): void {
  const globalState = getOrCreateGlobalState(
    event.address,
    event.block.timestamp
  );
  const oldOracle = globalState.ltvOracle;
  const newOracle = event.params.oracle;
  
  // Get old LTV values (before oracle change)
  const oldLtvValues = getLtvValues(event.address);
  
  // Update global state
  globalState.ltvOracle = newOracle;
  globalState.updatedAt = event.block.timestamp;
  globalState.save();
  
  // Get new LTV values (after oracle change)
  const newLtvValues = getLtvValues(event.address);
  
  // Create LTV oracle change record
  const oracleChange = new MonoCoolerLtvOracleChange(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  oracleChange.globalState = globalState.id;
  oracleChange.oldOracle = oldOracle;
  oracleChange.newOracle = newOracle;
  oracleChange.oldMaxOriginationLtv = oldLtvValues[0];
  oracleChange.oldLiquidationLtv = oldLtvValues[1];
  oracleChange.newMaxOriginationLtv = newLtvValues[0];
  oracleChange.newLiquidationLtv = newLtvValues[1];
  oracleChange.blockNumber = event.block.number;
  oracleChange.blockTimestamp = event.block.timestamp;
  oracleChange.transactionHash = event.transaction.hash;
  oracleChange.save();
  
  // Create global snapshot with new LTV values
  createGlobalSnapshot(globalState, event, newLtvValues);
}

export function handleInterestRateSet(event: InterestRateSet): void {
  const ltvValues = getLtvValues(event.address);
  const globalState = getOrCreateGlobalState(
    event.address,
    event.block.timestamp
  );

  globalState.interestRateWad = event.params.interestRateWad;
  globalState.updatedAt = event.block.timestamp;
  globalState.save();

  createGlobalSnapshot(globalState, event, ltvValues);
}

export function handleLiquidationsPausedSet(
  event: LiquidationsPausedSet
): void {
  const ltvValues = getLtvValues(event.address);
  const globalState = getOrCreateGlobalState(
    event.address,
    event.block.timestamp
  );

  globalState.liquidationPaused = event.params.isPaused;
  globalState.updatedAt = event.block.timestamp;
  globalState.save();

  createGlobalSnapshot(globalState, event, ltvValues);
}

export function handleBorrowPausedSet(event: BorrowPausedSet): void {
  const ltvValues = getLtvValues(event.address);
  const globalState = getOrCreateGlobalState(
    event.address,
    event.block.timestamp
  );

  globalState.borrowsPaused = event.params.isPaused;
  globalState.updatedAt = event.block.timestamp;
  globalState.save();

  createGlobalSnapshot(globalState, event, ltvValues);
}

export function handleTreasuryBorrowerSet(event: TreasuryBorrowerSet): void {
  const ltvValues = getLtvValues(event.address);
  const globalState = getOrCreateGlobalState(
    event.address,
    event.block.timestamp
  );

  globalState.treasuryBorrower = event.params.treasuryBorrower;
  globalState.updatedAt = event.block.timestamp;
  globalState.save();

  createGlobalSnapshot(globalState, event, ltvValues);
}

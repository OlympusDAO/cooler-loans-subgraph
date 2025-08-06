import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from "matchstick-as/assembly/index";
import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  BorrowerStats,
  ClearinghouseCumulativeStats,
} from "../generated/schema";
import { updateBorrowerStats, updateLoanExtensionStats } from "../src/stats";

describe("Stats tracking", () => {
  beforeAll(() => {
    clearStore();
  });

  afterAll(() => {
    clearStore();
  });

  test("Initial loan creation stats", () => {
    const clearinghouse = "0x0000000000000000000000000000000000000001";
    const borrower = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    );
    const block = BigInt.fromI32(1000);
    const timestamp = BigInt.fromI32(1000000);
    const principal = BigDecimal.fromString("1000");
    const interest = BigDecimal.fromString("100");
    const collateral = BigDecimal.fromString("2000");

    // Create initial state with a new loan
    updateBorrowerStats(
      clearinghouse,
      borrower,
      true, // isNewLoan
      true, // isActive
      false, // isNewDefault
      false, // isNewRepayment
      block,
      timestamp,
      principal,
      interest,
      collateral
    );

    const stats = ClearinghouseCumulativeStats.load(clearinghouse);
    assert.assertNotNull(stats);
    assert.i32Equals(stats!.totalLoans, 1);
    assert.i32Equals(stats!.currentActiveLoans, 1);
    assert.i32Equals(stats!.totalUniqueBorrowers, 1);
    assert.i32Equals(stats!.currentActiveBorrowers, 1);

    const borrowerStats = BorrowerStats.load(borrower.toHexString());
    assert.assertNotNull(borrowerStats);
    assert.i32Equals(borrowerStats!.totalLoans, 1);
    assert.i32Equals(borrowerStats!.activeLoans, 1);
    assert.i32Equals(borrowerStats!.maxActiveLoans, 1);
    assert.stringEquals(borrowerStats!.currentBorrowed.toString(), "1000");
    assert.stringEquals(borrowerStats!.currentInterestDue.toString(), "100");
    assert.stringEquals(borrowerStats!.currentCollateral.toString(), "2000");
  });

  test("Loan repayment stats", () => {
    clearStore(); // Clear state from previous test

    const clearinghouse = "0x0000000000000000000000000000000000000001";
    const borrower = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    );

    // Create a loan first
    updateBorrowerStats(
      clearinghouse,
      borrower,
      true, // isNewLoan
      true, // isActive
      false, // isNewDefault
      false, // isNewRepayment
      BigInt.fromI32(1000),
      BigInt.fromI32(1000000),
      BigDecimal.fromString("1000"),
      BigDecimal.fromString("100"),
      BigDecimal.fromString("2000")
    );

    // Mark it as repaid with negative deltas
    updateBorrowerStats(
      clearinghouse,
      borrower,
      false, // isNewLoan
      false, // isActive - keep as active for the repayment to be counted
      false, // isNewDefault
      true, // isNewRepayment
      BigInt.fromI32(1001),
      BigInt.fromI32(1000001),
      BigDecimal.fromString("-1000"), // Negative delta to reduce principal
      BigDecimal.fromString("-100"),  // Negative delta to reduce interest
      BigDecimal.fromString("-2000")  // Negative delta to reduce collateral
    );

    const stats = ClearinghouseCumulativeStats.load(clearinghouse);
    assert.assertNotNull(stats);
    assert.i32Equals(
      stats!.currentActiveLoans,
      0,
      "Current active loans should be 0"
    );
    assert.i32Equals(
      stats!.totalRepaidLoans,
      1,
      "Total repaid loans should be 1"
    );
    assert.i32Equals(
      stats!.currentActiveBorrowers,
      0,
      "Current active borrowers should be 0"
    );

    const borrowerStats = BorrowerStats.load(borrower.toHexString());
    assert.assertNotNull(borrowerStats);
    assert.i32Equals(borrowerStats!.activeLoans, 0, "Active loans should be 0");
    assert.i32Equals(
      borrowerStats!.totalRepaidLoans,
      1,
      "Total repaid loans should be 1"
    );
  });

  test("Loan extension stats", () => {
    clearStore(); // Clear state from previous test

    const clearinghouse = "0x0000000000000000000000000000000000000001";
    const borrower = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    );

    // Create a loan first
    updateBorrowerStats(
      clearinghouse,
      borrower,
      true, // isNewLoan
      true, // isActive
      false, // isNewDefault
      false, // isNewRepayment
      BigInt.fromI32(1002),
      BigInt.fromI32(1000002),
      BigDecimal.fromString("1000"),
      BigDecimal.fromString("100"),
      BigDecimal.fromString("2000")
    );

    updateLoanExtensionStats(
      clearinghouse,
      borrower,
      BigDecimal.fromString("150"),
      BigInt.fromI32(1003),
      BigInt.fromI32(1000003)
    );

    const stats = ClearinghouseCumulativeStats.load(clearinghouse);
    assert.assertNotNull(stats);
    assert.i32Equals(
      stats!.totalLoanExtensions,
      1,
      "Total loan extensions should be 1"
    );

    const borrowerStats = BorrowerStats.load(borrower.toHexString());
    assert.assertNotNull(borrowerStats);
    assert.i32Equals(
      borrowerStats!.totalLoanExtensions,
      1,
      "Total loan extensions should be 1"
    );
  });

  test("Multiple active loans (looper) stats", () => {
    clearStore(); // Clear state from previous test

    const clearinghouse = "0x0000000000000000000000000000000000000001";
    const borrower = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    );

    // Create first loan
    updateBorrowerStats(
      clearinghouse,
      borrower,
      true, // isNewLoan
      true, // isActive
      false, // isNewDefault
      false, // isNewRepayment
      BigInt.fromI32(1004),
      BigInt.fromI32(1000004),
      BigDecimal.fromString("1000"),
      BigDecimal.fromString("100"),
      BigDecimal.fromString("2000")
    );

    // Create second loan
    updateBorrowerStats(
      clearinghouse,
      borrower,
      true, // isNewLoan
      true, // isActive
      false, // isNewDefault
      false, // isNewRepayment
      BigInt.fromI32(1005),
      BigInt.fromI32(1000005),
      BigDecimal.fromString("1000"),
      BigDecimal.fromString("100"),
      BigDecimal.fromString("2000")
    );

    const stats = ClearinghouseCumulativeStats.load(clearinghouse);
    assert.assertNotNull(stats);
    assert.i32Equals(stats!.totalLoans, 2, "Total loans should be 2");
    assert.i32Equals(
      stats!.currentActiveLoans,
      2,
      "Current active loans should be 2"
    );
    assert.i32Equals(stats!.totalLoopers, 1, "Total loopers should be 1");
    assert.i32Equals(
      stats!.currentActiveLoopers,
      1,
      "Current active loopers should be 1"
    );

    const borrowerStats = BorrowerStats.load(borrower.toHexString());
    assert.assertNotNull(borrowerStats);
    assert.i32Equals(borrowerStats!.totalLoans, 2, "Total loans should be 2");
    assert.i32Equals(borrowerStats!.activeLoans, 2, "Active loans should be 2");
    assert.i32Equals(
      borrowerStats!.maxActiveLoans,
      2,
      "Max active loans should be 2"
    );
  });

  test("Loan default stats", () => {
    clearStore(); // Clear state from previous test

    const clearinghouse = "0x0000000000000000000000000000000000000001";
    const borrower = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    );

    // Create a loan first
    updateBorrowerStats(
      clearinghouse,
      borrower,
      true, // isNewLoan
      true, // isActive
      false, // isNewDefault
      false, // isNewRepayment
      BigInt.fromI32(1006),
      BigInt.fromI32(1000006),
      BigDecimal.fromString("1000"),
      BigDecimal.fromString("100"),
      BigDecimal.fromString("2000")
    );

    // Mark it as defaulted with negative deltas
    updateBorrowerStats(
      clearinghouse,
      borrower,
      false, // isNewLoan
      false, // isActive - keep as active for the default to be counted
      true, // isNewDefault
      false, // isNewRepayment
      BigInt.fromI32(1007),
      BigInt.fromI32(1000007),
      BigDecimal.fromString("-1000"), // Negative delta to reduce principal
      BigDecimal.fromString("-100"),  // Negative delta to reduce interest
      BigDecimal.fromString("-2000")  // Negative delta to reduce collateral
    );

    const stats = ClearinghouseCumulativeStats.load(clearinghouse);
    assert.assertNotNull(stats);
    assert.i32Equals(
      stats!.totalDefaultedLoans,
      1,
      "total defaulted loans should be 1"
    );
    assert.i32Equals(
      stats!.currentActiveLoans,
      0,
      "current active loans should be 0"
    );

    const borrowerStats = BorrowerStats.load(borrower.toHexString());
    assert.assertNotNull(borrowerStats);
    assert.i32Equals(
      borrowerStats!.totalDefaultedLoans,
      1,
      "total defaulted loans should be 1"
    );
    assert.i32Equals(
      borrowerStats!.activeLoans,
      0,
      "active loans should be 0"
    );
  });

  test("Edge cases and validation", () => {
    clearStore(); // Clear state from previous test

    const clearinghouse = "0x0000000000000000000000000000000000000001";
    const borrower = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    );

    // Create a loan first
    updateBorrowerStats(
      clearinghouse,
      borrower,
      true, // isNewLoan
      true, // isActive
      false, // isNewDefault
      false, // isNewRepayment
      BigInt.fromI32(1008),
      BigInt.fromI32(1000008),
      BigDecimal.fromString("1000"),
      BigDecimal.fromString("100"),
      BigDecimal.fromString("2000")
    );

    // Mark it as repaid with negative deltas
    updateBorrowerStats(
      clearinghouse,
      borrower,
      false, // isNewLoan
      false, // isActive - keep as active for the repayment to be counted
      false, // isNewDefault
      true, // isNewRepayment
      BigInt.fromI32(1009),
      BigInt.fromI32(1000009),
      BigDecimal.fromString("-1000"), // Negative delta to reduce principal
      BigDecimal.fromString("-100"),  // Negative delta to reduce interest
      BigDecimal.fromString("-2000")  // Negative delta to reduce collateral
    );

    const borrowerStats = BorrowerStats.load(borrower.toHexString());
    assert.assertNotNull(borrowerStats);
    assert.i32Equals(
      borrowerStats!.totalRepaidLoans,
      1,
      "total repaid loans should be 1"
    );

    // Create a second loan that we'll default
    updateBorrowerStats(
      clearinghouse,
      borrower,
      true, // isNewLoan
      true, // isActive
      false, // isNewDefault
      false, // isNewRepayment
      BigInt.fromI32(1010),
      BigInt.fromI32(1000010),
      BigDecimal.fromString("2000"),
      BigDecimal.fromString("200"),
      BigDecimal.fromString("4000")
    );

    // Default the second loan
    updateBorrowerStats(
      clearinghouse,
      borrower,
      false, // isNewLoan
      false, // isActive
      true, // isNewDefault
      false, // isNewRepayment
      BigInt.fromI32(1011),
      BigInt.fromI32(1000011),
      BigDecimal.fromString("-2000"), // Negative delta for principal
      BigDecimal.fromString("-200"),  // Negative delta for interest
      BigDecimal.fromString("-4000")  // Negative delta for collateral
    );

    const stats = ClearinghouseCumulativeStats.load(clearinghouse);
    assert.assertNotNull(stats);
    assert.i32Equals(
      stats!.totalDefaultedLoans,
      1,
      "Total defaulted loans should be 1"
    );
    assert.i32Equals(
      stats!.totalRepaidLoans,
      1,
      "Total repaid loans should be 1"
    );
    assert.i32Equals(
      stats!.totalLoans,
      2,
      "Total loans should be 2"
    );
    assert.i32Equals(
      stats!.currentActiveLoans,
      0,
      "Current active loans should be 0"
    );
  });

  test("Multiple borrowers stats", () => {
    clearStore(); // Clear state from previous test

    const clearinghouse = "0x0000000000000000000000000000000000000001";
    const borrower1 = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    );
    const borrower2 = Address.fromString(
      "0x0000000000000000000000000000000000000003"
    );

    // Create loan for first borrower
    updateBorrowerStats(
      clearinghouse,
      borrower1,
      true, // isNewLoan
      true, // isActive
      false, // isNewDefault
      false, // isNewRepayment
      BigInt.fromI32(1011),
      BigInt.fromI32(1000011),
      BigDecimal.fromString("1000"),
      BigDecimal.fromString("100"),
      BigDecimal.fromString("2000")
    );

    // Create loan for second borrower
    updateBorrowerStats(
      clearinghouse,
      borrower2,
      true, // isNewLoan
      true, // isActive
      false, // isNewDefault
      false, // isNewRepayment
      BigInt.fromI32(1012),
      BigInt.fromI32(1000012),
      BigDecimal.fromString("1000"),
      BigDecimal.fromString("100"),
      BigDecimal.fromString("2000")
    );

    const stats = ClearinghouseCumulativeStats.load(clearinghouse);
    assert.assertNotNull(stats);
    assert.i32Equals(
      stats!.totalUniqueBorrowers,
      2,
      "Total unique borrowers should be 2"
    );
    assert.i32Equals(
      stats!.currentActiveBorrowers,
      2,
      "Current active borrowers should be 2"
    );

    // Create second loan for second borrower
    updateBorrowerStats(
      clearinghouse,
      borrower2,
      true, // isNewLoan
      true, // isActive
      false, // isNewDefault
      false, // isNewRepayment
      BigInt.fromI32(1013),
      BigInt.fromI32(1000013),
      BigDecimal.fromString("1000"),
      BigDecimal.fromString("100"),
      BigDecimal.fromString("2000")
    );

    // Reload the stats after updating
    const updatedStats = ClearinghouseCumulativeStats.load(clearinghouse);
    assert.assertNotNull(updatedStats);

    assert.i32Equals(
      updatedStats!.totalLoopers,
      1,
      "Total loopers should be 1"
    );
    assert.i32Equals(
      updatedStats!.currentActiveLoopers,
      1,
      "Current active loopers should be 1"
    );
  });
});

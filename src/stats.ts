import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import {
  BorrowerStats,
  ClearinghouseCumulativeStats,
} from "../generated/schema";

export function updateBorrowerStats(
  clearinghouse: string,
  borrower: Address,
  isNewLoan: boolean,
  isActive: boolean,
  isNewDefault: boolean,
  isNewRepayment: boolean,
  block: BigInt,
  timestamp: BigInt,
  principalDelta: BigDecimal,
  interestDelta: BigDecimal,
  collateralDelta: BigDecimal
): void {
  const stats = getOrCreateCumulativeStats(clearinghouse);
  const borrowerStats = getBorrowerStats(borrower, clearinghouse);

  borrowerStats.currentBorrowed =
    borrowerStats.currentBorrowed.plus(principalDelta);
  borrowerStats.currentInterestDue =
    borrowerStats.currentInterestDue.plus(interestDelta);
  borrowerStats.currentCollateral =
    borrowerStats.currentCollateral.plus(collateralDelta);

  // Handle new loans
  if (isNewLoan) {
    stats.totalLoans += 1;
    stats.currentActiveLoans += 1;

    // If this is their first loan ever
    if (borrowerStats.totalLoans == 0) {
      stats.totalUniqueBorrowers += 1;
    } else if (borrowerStats.totalLoans == 1) {
      // This is their second loan ever - they've become a looper
      stats.totalLoopers += 1;
    }

    // Increment borrower's loan count
    borrowerStats.totalLoans += 1;

    // Update borrower's active loan count
    borrowerStats.activeLoans += 1;

    // If this is their first active loan, increment active borrowers
    if (borrowerStats.activeLoans == 1) {
      stats.currentActiveBorrowers += 1;
    } else if (borrowerStats.activeLoans == 2) {
      // This is their second active loan - they're an active looper
      stats.currentActiveLoopers += 1;
    }

    // Update max active loans if we've hit a new high
    if (borrowerStats.activeLoans > borrowerStats.maxActiveLoans) {
      borrowerStats.maxActiveLoans = borrowerStats.activeLoans;
    }

    // Update max borrowed value if we've hit a new high
    const currentValue = borrowerStats.currentBorrowed;
    if (currentValue.gt(borrowerStats.maxBorrowedValue)) {
      borrowerStats.maxBorrowedValue = currentValue;
    }
  }

  // Handle loans becoming inactive
  if (!isActive) {
    if (stats.currentActiveLoans > 0) {
      stats.currentActiveLoans -= 1;
    }

    // Update borrower's active loan count
    if (borrowerStats.activeLoans > 0) {
      borrowerStats.activeLoans -= 1;

      // Validate borrower state
      if (borrowerStats.activeLoans == 0) {
        // If borrower has no more active loans, decrement active borrowers
        if (stats.currentActiveBorrowers > 0) {
          stats.currentActiveBorrowers -= 1;
        }
        // If they were an active looper, decrement active loopers
        if (stats.currentActiveLoopers > 0 && borrowerStats.totalLoans > 1) {
          stats.currentActiveLoopers -= 1;
        }
      }
    }
  }

  // Add validation
  if (stats.currentActiveBorrowers > stats.currentActiveLoans) {
    log.error(
      "Invalid state: More active borrowers ({}) than active loans ({}) for clearinghouse {}",
      [
        stats.currentActiveBorrowers.toString(),
        stats.currentActiveLoans.toString(),
        clearinghouse,
      ]
    );
    // Fix the state - active borrowers cannot exceed active loans
    stats.currentActiveBorrowers = stats.currentActiveLoans;
  }

  // Update default and repayment counts (mutually exclusive)
  if (isNewDefault) {
    // Only count default if loan was active
    if (stats.currentActiveLoans > 0) {
      stats.totalDefaultedLoans += 1;
      borrowerStats.totalDefaultedLoans += 1;
    }
  } else if (isNewRepayment) {
    // Only count repayment if loan was active
    if (stats.currentActiveLoans > 0) {
      // Validate that we're not counting more repayments than total loans
      if (
        stats.totalRepaidLoans + 1 <= stats.totalLoans &&
        borrowerStats.totalRepaidLoans + 1 <= borrowerStats.totalLoans
      ) {
        stats.totalRepaidLoans += 1;
        borrowerStats.totalRepaidLoans += 1;
      } else {
        log.error(
          "Attempted to count more repayments than total loans for clearinghouse {} borrower {}. Total: {}, Repaid: {}, total for borrower: {}, repaid for borrower: {}, principalDelta: {}, interestDelta: {}, collateralDelta: {}, principal: {}, interest: {}, collateral: {}",
          [
            clearinghouse,
            borrower.toHexString(),
            stats.totalLoans.toString(),
            (stats.totalRepaidLoans + 1).toString(),
            borrowerStats.totalLoans.toString(),
            borrowerStats.totalRepaidLoans.toString(),
            principalDelta.toString(),
            interestDelta.toString(),
            collateralDelta.toString(),
            borrowerStats.currentBorrowed.toString(),
            borrowerStats.currentInterestDue.toString(),
            borrowerStats.currentCollateral.toString(),
          ]
        );
      }
    }
  }

  // Validate totals
  const totalAccounted =
    stats.currentActiveLoans +
    stats.totalDefaultedLoans +
    stats.totalRepaidLoans;
  if (totalAccounted != stats.totalLoans) {
    log.error(
      "Stats mismatch for clearinghouse {}: Total {} != Active {} + Defaulted {} + Repaid {}",
      [
        clearinghouse,
        stats.totalLoans.toString(),
        stats.currentActiveLoans.toString(),
        stats.totalDefaultedLoans.toString(),
        stats.totalRepaidLoans.toString(),
      ]
    );
  }

  // Validate that repaid loans cannot exceed total loans
  if (
    stats.totalRepaidLoans > stats.totalLoans ||
    borrowerStats.totalRepaidLoans > borrowerStats.totalLoans
  ) {
    log.error(
      "Invalid state: More repaid loans than total loans for clearinghouse {} borrower {}",
      [clearinghouse, borrower.toHexString()]
    );
  }

  // Update timestamps
  stats.lastUpdateBlock = block;
  stats.lastUpdateTimestamp = timestamp;
  borrowerStats.lastUpdateBlock = block;
  borrowerStats.lastUpdateTimestamp = timestamp;

  // Save both records
  stats.save();
  borrowerStats.save();
}

export function getBorrowerStats(
  borrower: Address,
  clearinghouse: string
): BorrowerStats {
  const statsId = borrower.toHexString();
  let stats = BorrowerStats.load(statsId);

  if (!stats) {
    stats = new BorrowerStats(statsId);
    stats.borrower = borrower;
    stats.clearinghouse = clearinghouse;
    stats.totalLoans = 0;
    stats.totalDefaultedLoans = 0;
    stats.totalRepaidLoans = 0;
    stats.activeLoans = 0;
    stats.maxActiveLoans = 0;
    stats.maxBorrowedValue = BigDecimal.zero();
    stats.currentBorrowed = BigDecimal.zero();
    stats.currentInterestDue = BigDecimal.zero();
    stats.currentCollateral = BigDecimal.zero();
    stats.totalLoanExtensions = 0;
    stats.lastUpdateBlock = BigInt.zero();
    stats.lastUpdateTimestamp = BigInt.zero();
  }

  return stats;
}

export function getOrCreateCumulativeStats(
  clearinghouse: string
): ClearinghouseCumulativeStats {
  let stats = ClearinghouseCumulativeStats.load(clearinghouse);
  if (!stats) {
    stats = new ClearinghouseCumulativeStats(clearinghouse);
    stats.clearinghouse = clearinghouse;
    stats.totalUniqueBorrowers = 0;
    stats.totalLoopers = 0;
    stats.currentActiveBorrowers = 0;
    stats.currentActiveLoopers = 0;
    stats.totalLoans = 0;
    stats.currentActiveLoans = 0;
    stats.totalDefaultedLoans = 0;
    stats.totalRepaidLoans = 0;
    stats.totalLoanExtensions = 0;
    stats.lastUpdateBlock = BigInt.zero();
    stats.lastUpdateTimestamp = BigInt.zero();
  }
  return stats;
}

export function updateLoanExtensionStats(
  clearinghouse: string,
  borrower: Address,
  newInterest: BigDecimal,
  block: BigInt,
  timestamp: BigInt
): void {
  const stats = getOrCreateCumulativeStats(clearinghouse);
  const borrowerStats = getBorrowerStats(borrower, clearinghouse);

  // Increment extension counts
  stats.totalLoanExtensions += 1;
  borrowerStats.totalLoanExtensions += 1;

  // Add new interest from extension
  borrowerStats.currentInterestDue =
    borrowerStats.currentInterestDue.plus(newInterest);

  // Update timestamps
  stats.lastUpdateBlock = block;
  stats.lastUpdateTimestamp = timestamp;
  borrowerStats.lastUpdateBlock = block;
  borrowerStats.lastUpdateTimestamp = timestamp;

  // Save both records
  stats.save();
  borrowerStats.save();
}

# Cooler Loans Subgraph

## Purpose

This repository provides a Graph Protocol subgraph that indexes the Olympus protocol's Cooler Loans contracts.

## Implementation

This subgraph does the following:

- When a Cooler Loan request is created:
  - A CoolerLoanRequest record is created
  - A RequestLoanEvent record is created (which points to the CoolerLoanRequest record)
- When a Cooler Loan request is rescinded:
  - The CoolerLoanRequest record is updated
  - A RescindLoanRequestEvent record is created
- When a Cooler Loan request is cleared:
  - A CoolerLoan record is created. This record is immutable, and represents the initial state of the loan.
  - A ClearLoanRequestEvent is created (which points to the CoolerLoanRequest and CoolerLoan records)
- When a Cooler Loan is repaid:
  - This can represent full or partial repayment.
  - A RepayLoanEvent record is created. This contains a snapshot of the loan status at the time of repayment.
- When a Cooler Loan is defaulted and claimed:
  - This is emitted when a defaulted Cooler Loan is claimed, not at the specific time of default.
  - A ClaimDefaultedLoanEvent record is created.
- When a Cooler Loan is rolled-over:
  - This is emitted when a Cooler Loan is rolled-over (extended) by providing additional collateral.
  - A RollLoanEvent record is created, containing the incremental changes to debt and collateral, and the new expiry timestamp.

### Reasoning

The subgraph has been architected in this manner, for the following reasons:

- Events contain snapshot data, instead of having a snapshot entity
  - Retrieving the latest snapshot for a particular Cooler Loan record can be cumbersome and expensive
  - We would want to store a record of the emitted event, anyway
- Lack of periodic snapshot records
  - Loan status will not change from a day-to-day basis, as the interest is a fixed amount. Changes will only occur upon repayment/rollover/default claim.
  - Though it is possible to have a periodic (e.g. daily) snapshot record, restrictions on how record lookups are done make designing the data structure very cumbersome.
  - Additionally, it also makes indexing the on-chain data extremely slow.
  - Instead, the subgraph is lightweight, and the frontend will combine the original loan record and events to construct timeseries data (where needed).

## Setup

## Deployment

# cooler-subgraph

## Purpose

This repository provides a Graph Protocol subgraph that indexes the Olympus protocol's Cooler Loans contracts.

## Notes

There are two entities represented in this subgraph:

### CoolerLoan

- This entity record is created when a Cooler Loan request is cleared and the loan record is created in the contract.
- It is not intended to be updated at any point, and is therefore immutable.

### CoolerLoanSnapshot

- This entity record represents a snapshot of the Cooler Loan at the time of a major event:
  - Loan is created
  - Loan is partially or fully repaid
  - A defaulted loan is claimed
- Currently, snapshots are not created on a periodic basis. This is due to the difficulty of doing so within the Graph Protocol's subgraphs.
- Clients displaying timeseries data related to the loans should forward-fill data between snapshots.
- Each snapshot links to the original loan (so that values are not duplicated)

## Setup

## Deployment
# CHANGELOG

## 2.0.0 (2024-11-XX)

- Adds support for Clearinghouse v1.2
- Adds Clearinghouse entity type, to reduce redundant data
- Shifts treasury and clearinghouse balances to the ClearinghouseSnapshot records
- Creates ClearinghouseSnapshot records for each loan event
- Abstracts out the collateral, reserve, and sReserve tokens (previously hardcoded for gOHM, DAI and sDAI)

## 1.5.0 (2024-03-28)

- Fixes issue with OHM price resolution

## 1.4.0 (2023-10-09)

- Add treasury balances for event snapshots

## 1.3.1 (2023-10-06)

- Adds clearinghouse balances for event snapshots
- Ensure the consistency of interest rates in the CoolerLoanRequest records

## 1.2.0 (2023-09-28)

- Adds support for Clearinghouse v1.1

## 1.1.1 (2023-09-22)

- Improve accuracy of treasury balances

## 1.0.1 (2023-09-21)

- Initial release

import {
  ClearRequest as ClearRequestEvent,
  DefaultLoan as DefaultLoanEvent,
  RepayLoan as RepayLoanEvent,
  RollLoan as RollLoanEvent
} from "../generated/CoolerFactory/CoolerFactory"
import {
  DefaultLoan,
  RepayLoan,
  RollLoan
} from "../generated/schema"

// ======================= Handle loan requests ======================= //

export function handleClearRequest(event: ClearRequestEvent): void {
  // Create a new CoolerLoan
}

// ======================= Handle loan actions ======================= //

export function handleDefaultLoan(event: DefaultLoanEvent): void {
  // Create new CoolerLoanSnapshot


  let entity = new DefaultLoan(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.cooler = event.params.cooler
  entity.loanID = event.params.loanID

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRepayLoan(event: RepayLoanEvent): void {
  // Create new CoolerLoanSnapshot

  let entity = new RepayLoan(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.cooler = event.params.cooler
  entity.loanID = event.params.loanID
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRollLoan(event: RollLoanEvent): void {
  // Create new CoolerLoan

  // Create new CoolerLoanSnapshot for rollover

  // Create new CoolerLoanSnapshot for previous loan

  let entity = new RollLoan(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.cooler = event.params.cooler
  entity.loanID = event.params.loanID

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

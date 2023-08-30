import {
  ClearRequest as ClearRequestEvent,
  DefaultLoan as DefaultLoanEvent,
  RepayLoan as RepayLoanEvent,
  RequestLoan as RequestLoanEvent,
  RescindRequest as RescindRequestEvent,
  RollLoan as RollLoanEvent
} from "../generated/CoolerFactory/CoolerFactory"
import {
  ClearRequest,
  DefaultLoan,
  RepayLoan,
  RequestLoan,
  RescindRequest,
  RollLoan
} from "../generated/schema"

export function handleClearRequest(event: ClearRequestEvent): void {
  let entity = new ClearRequest(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.cooler = event.params.cooler
  entity.reqID = event.params.reqID

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDefaultLoan(event: DefaultLoanEvent): void {
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

export function handleRequestLoan(event: RequestLoanEvent): void {
  let entity = new RequestLoan(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.cooler = event.params.cooler
  entity.collateral = event.params.collateral
  entity.debt = event.params.debt
  entity.reqID = event.params.reqID

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRescindRequest(event: RescindRequestEvent): void {
  let entity = new RescindRequest(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.cooler = event.params.cooler
  entity.reqID = event.params.reqID

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRollLoan(event: RollLoanEvent): void {
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

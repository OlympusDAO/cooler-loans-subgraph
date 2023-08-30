import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  ClearRequest,
  DefaultLoan,
  RepayLoan,
  RequestLoan,
  RescindRequest,
  RollLoan
} from "../generated/CoolerFactory/CoolerFactory"

export function createClearRequestEvent(
  cooler: Address,
  reqID: BigInt
): ClearRequest {
  let clearRequestEvent = changetype<ClearRequest>(newMockEvent())

  clearRequestEvent.parameters = new Array()

  clearRequestEvent.parameters.push(
    new ethereum.EventParam("cooler", ethereum.Value.fromAddress(cooler))
  )
  clearRequestEvent.parameters.push(
    new ethereum.EventParam("reqID", ethereum.Value.fromUnsignedBigInt(reqID))
  )

  return clearRequestEvent
}

export function createDefaultLoanEvent(
  cooler: Address,
  loanID: BigInt
): DefaultLoan {
  let defaultLoanEvent = changetype<DefaultLoan>(newMockEvent())

  defaultLoanEvent.parameters = new Array()

  defaultLoanEvent.parameters.push(
    new ethereum.EventParam("cooler", ethereum.Value.fromAddress(cooler))
  )
  defaultLoanEvent.parameters.push(
    new ethereum.EventParam("loanID", ethereum.Value.fromUnsignedBigInt(loanID))
  )

  return defaultLoanEvent
}

export function createRepayLoanEvent(
  cooler: Address,
  loanID: BigInt,
  amount: BigInt
): RepayLoan {
  let repayLoanEvent = changetype<RepayLoan>(newMockEvent())

  repayLoanEvent.parameters = new Array()

  repayLoanEvent.parameters.push(
    new ethereum.EventParam("cooler", ethereum.Value.fromAddress(cooler))
  )
  repayLoanEvent.parameters.push(
    new ethereum.EventParam("loanID", ethereum.Value.fromUnsignedBigInt(loanID))
  )
  repayLoanEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return repayLoanEvent
}

export function createRequestLoanEvent(
  cooler: Address,
  collateral: Address,
  debt: Address,
  reqID: BigInt
): RequestLoan {
  let requestLoanEvent = changetype<RequestLoan>(newMockEvent())

  requestLoanEvent.parameters = new Array()

  requestLoanEvent.parameters.push(
    new ethereum.EventParam("cooler", ethereum.Value.fromAddress(cooler))
  )
  requestLoanEvent.parameters.push(
    new ethereum.EventParam(
      "collateral",
      ethereum.Value.fromAddress(collateral)
    )
  )
  requestLoanEvent.parameters.push(
    new ethereum.EventParam("debt", ethereum.Value.fromAddress(debt))
  )
  requestLoanEvent.parameters.push(
    new ethereum.EventParam("reqID", ethereum.Value.fromUnsignedBigInt(reqID))
  )

  return requestLoanEvent
}

export function createRescindRequestEvent(
  cooler: Address,
  reqID: BigInt
): RescindRequest {
  let rescindRequestEvent = changetype<RescindRequest>(newMockEvent())

  rescindRequestEvent.parameters = new Array()

  rescindRequestEvent.parameters.push(
    new ethereum.EventParam("cooler", ethereum.Value.fromAddress(cooler))
  )
  rescindRequestEvent.parameters.push(
    new ethereum.EventParam("reqID", ethereum.Value.fromUnsignedBigInt(reqID))
  )

  return rescindRequestEvent
}

export function createRollLoanEvent(cooler: Address, loanID: BigInt): RollLoan {
  let rollLoanEvent = changetype<RollLoan>(newMockEvent())

  rollLoanEvent.parameters = new Array()

  rollLoanEvent.parameters.push(
    new ethereum.EventParam("cooler", ethereum.Value.fromAddress(cooler))
  )
  rollLoanEvent.parameters.push(
    new ethereum.EventParam("loanID", ethereum.Value.fromUnsignedBigInt(loanID))
  )

  return rollLoanEvent
}

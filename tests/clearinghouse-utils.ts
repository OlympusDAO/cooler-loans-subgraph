import { newMockEvent } from "matchstick-as"
import { ethereum } from "@graphprotocol/graph-ts"
import {
  Deactivated,
  Reactivated
} from "../generated/Clearinghouse/Clearinghouse"

export function createDeactivatedEvent(): Deactivated {
  let deactivatedEvent = changetype<Deactivated>(newMockEvent())

  deactivatedEvent.parameters = new Array()

  return deactivatedEvent
}

export function createReactivatedEvent(): Reactivated {
  let reactivatedEvent = changetype<Reactivated>(newMockEvent())

  reactivatedEvent.parameters = new Array()

  return reactivatedEvent
}

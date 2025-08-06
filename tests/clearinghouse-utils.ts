import { newMockEvent } from "matchstick-as";
import { ethereum } from "@graphprotocol/graph-ts";
import { Deactivate, Activate } from "../generated/Clearinghouse_V1/Clearinghouse_V1_2";

export function createDeactivatedEvent(): Deactivate {
  let deactivatedEvent = changetype<Deactivate>(newMockEvent());

  deactivatedEvent.parameters = new Array();

  return deactivatedEvent;
}

export function createActivateEvent(): Activate {
  let reactivatedEvent = changetype<Activate>(newMockEvent());

  reactivatedEvent.parameters = new Array();

  return reactivatedEvent;
}

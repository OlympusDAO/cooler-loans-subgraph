import { ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { Activate,Deactivate } from "../generated/Clearinghouse_V1/Clearinghouse_V1_2";

export function createDeactivatedEvent(): Deactivate {
  const deactivatedEvent = changetype<Deactivate>(newMockEvent());

  deactivatedEvent.parameters = [];

  return deactivatedEvent;
}

export function createActivateEvent(): Activate {
  const reactivatedEvent = changetype<Activate>(newMockEvent());

  reactivatedEvent.parameters = [];

  return reactivatedEvent;
}

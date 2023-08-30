import {
  Deactivated as DeactivatedEvent,
  Reactivated as ReactivatedEvent
} from "../generated/Clearinghouse/Clearinghouse"
import { Deactivated, Reactivated } from "../generated/schema"

export function handleDeactivated(event: DeactivatedEvent): void {
  let entity = new Deactivated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleReactivated(event: ReactivatedEvent): void {
  let entity = new Reactivated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

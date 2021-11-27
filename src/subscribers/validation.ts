import { type EntitySubscriberInterface, EventSubscriber, type InsertEvent, type UpdateEvent } from 'typeorm'
import { validate } from 'class-validator'

@EventSubscriber()
export class ValidationSubscriber implements EntitySubscriberInterface {
  public async beforeInsert (event: InsertEvent<any>): Promise<void> {
    const errors = await validate(event.entity)
    if (errors.length > 0) {
      throw new Error(errors[0].toString())
    }
  }

  public async beforeUpdate (event: UpdateEvent<any>): Promise<void> {
    if (typeof event.entity === 'undefined') {
      return
    }
    const errors = await validate(event.entity)
    if (errors.length > 0) {
      throw new Error(errors[0].toString())
    }
  }
}

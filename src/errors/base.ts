export default class BaseError extends Error {
  statusCode: number

  constructor (message: string, statusCode: number) {
    super(message)

    this.name = this.constructor.name
    this.statusCode = statusCode
  }
}

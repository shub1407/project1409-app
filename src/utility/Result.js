// utils/Result.js
export class Result {
  constructor(success, data = null, error = null, message = "") {
    this.success = success
    this.data = data
    this.error = error
    this.message = message
  }

  static ok(data, message = "Operation successful") {
    return new Result(true, data, null, message)
  }

  static fail(error, message = "Operation failed") {
    return new Result(false, null, error, message)
  }
}

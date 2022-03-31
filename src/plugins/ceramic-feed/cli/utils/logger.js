const { assign, upperCase } = require('lodash')
const colors = require('chalk')

class Action {
  constructor(logger, name) {
    assign(this, { logger, name })
  }

  succeeded(message) {
    const { logger, name } = this
    const prefix = `${colors.green(upperCase(name))}:`

    logger.println(`${prefix} ${message}`)
  }
}

class Logger {
  INFO = colors.blue('info')
  ERROR = colors.red('error')

  action(name) {
    return new Action(this, name)
  }

  info(message) {
    const { println, INFO } = this

    println(message, INFO)
  }

  error(exception) {
    const { println, ERROR } = this
    const { message } = exception

    println(message, ERROR)
  }

  println(message, prefix = null) {
    let line = message

    if (prefix) {
      line = `[ ${prefix} ] ${line}`
    }

    console.log(line)
  }
}

module.exports = new Logger()

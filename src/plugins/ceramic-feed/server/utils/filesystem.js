const { readFile } = require('fs')
const { promisify } = require('util')

module.exports = class FileSystemUtils {
  static _fileReader = promisify(readFile)

  static async getFileContents(path, readAs = 'utf8') {
    return FileSystemUtils._fileReader(path, readAs)
  }
}

const { readFile, writeFile, unlink } = require('fs')
const { tmpdir } = require('os')
const { join } = require ('path')
const { promisify } = require('util')
const { v4: uuidv4 } = require('uuid')

module.exports = class FileSystemUtils {
  /** @private */
  static _readFileConents = promisify(readFile)
  /** @private */
  static _writeFileConents = promisify(writeFile)
  /** @private */
  static _deleteFile = promisify(unlink)

  static async getFileContents(path, readAs = 'utf8') {
    const { _readFileConents } = FileSystemUtils

    return _readFileConents(path, readAs)
  }

  static async withTemporaryFile(buffer, filename, callback) {
    let result
    const path = join(tmpdir(), uuidv4() + '_' + filename)
    const { _writeFileConents, _deleteFile } = FileSystemUtils

    await _writeFileConents(path, buffer)

    try {
      result = await callback(path)
    } finally {
      await _deleteFile(path)
    }

    return result
  }
}

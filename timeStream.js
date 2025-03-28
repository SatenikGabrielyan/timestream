const { Readable, Transform, Writable } = require("node:stream")
const fs = require("node:fs")
const { format } = require("date-fns")
require("dotenv").config()

const filePath = process.env.FILE_PATH || "file.txt"
class TimeReadable extends Readable {
    constructor(options = {}) {
        super(options)
        this.counter = 0
    }

    _read() {
        if (!this.counter) {
            this.counter = setInterval(() => {
              this.push(new Date().toISOString())
            }, 1000)
          }
    }
    _destroy(err, callback) {
        if (this.counter) {
          clearInterval(this.counter)
        }
        super._destroy(err, callback)
      }
}


class TimeTransform extends Transform {
    _transform(chunk, encoding, callback) {
        const currentTime = format(new Date(), "yyyy-MM-dd HH:mm:ss")
        this.push(`${currentTime}\n`)
        callback()
    }
}

class TimeWritable extends Writable {
    constructor(filePath, options = {}) {
        super(options)
        this._fileStream = fs.createWriteStream(filePath, { flags: "a" })
      }

      _write(chunk, encoding, callback) {
        this._fileStream.write(chunk, encoding, (err) => {
          if (err) {
            console.error("Error writing to file", err)
          }
          callback()
        })
      }
}

const timeReadable = new TimeReadable({ encoding: "utf8" })
const timeTransform = new TimeTransform()
const timeWritable = new TimeWritable(filePath)


timeReadable
    .pipe(timeTransform)
    .pipe(timeWritable)


timeTransform.on("data", (chunk) => {
    process.stdout.write(chunk)
})

timeWritable.on("finish", () => {
    console.log("Stream processing completed")
})
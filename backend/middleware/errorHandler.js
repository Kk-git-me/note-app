const { logEvents } = require('./logger')

const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}:${err.message}\t${req.method} ${req.url} ${req.headers.origin}`, 'errorLog.log')
    console.log(err.stack)

    const status = res.statuscode ? res.statuscode : 500 //server error

    res.status(500)

    res.json({ message: err.message })
}

module.exports = errorHandler
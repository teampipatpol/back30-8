const jwt = require('jsonwebtoken')

const middleware = {
    authToken: async (req, res, next) => {
        try {
            let token = req.headers.authorization
            let is_check = await jwt.verify(token, "123456")
            if (!is_check) return res.status(401).send('Unauthorized')
            next()
        } catch (error) {
            res.status(500).send(error.message)
        }

    }
}

module.exports = { ...middleware }

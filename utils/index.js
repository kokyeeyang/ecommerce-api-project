const {createJWT, isTokenValid, attachCookiesToResponse, removeCookiesFromResponse} = require('./jwt')
const {createTokenUser} = require('./createTokenUser')
const checkPermissions = require('./checkPermissions')

module.exports = {
    createJWT,
    isTokenValid,
    attachCookiesToResponse,
    removeCookiesFromResponse,
    createTokenUser,
    checkPermissions
}
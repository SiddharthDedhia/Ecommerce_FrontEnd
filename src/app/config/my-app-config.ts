export default {
    oidc: {
        clientId:'clientID',
        issuer:'issuer',
        redirectUri:'redirectURI', //sends user when they login
        scopes:['openid','profile','email'] //scopes provide access to info about user
    }

}

//insert clientID,issuer and redirectURI from Okta

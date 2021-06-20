export default {
    oidc: {
        clientId:'0oa118jqtx4BMr0yP5d7',
        issuer:'https://dev-91013830.okta.com/oauth2/default',
        redirectUri:'http://localhost:4200/login/callback', //sends user when they login
        scopes:['openid','profile','email'] //scopes provide access to info about user
    }

}

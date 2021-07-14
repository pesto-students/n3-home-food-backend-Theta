const expressJwt = require("express-jwt");
const { disconnect } = require("mongoose");

function validateTokenAdmin() {
  let secret = process.env.ADMIN_SECRET 
  const api = process.env.API_URL
  return expressJwt({
    secret,
    algorithms: ["HS256"],
    isRevoked:isRevoked
  }).unless({
    path: [
        {url: /\/api\/v1\/products(.*)/ , methods: ['GET', 'OPTIONS'] },
        {url: /\/api\/v1\/categories(.*)/ , methods: ['GET', 'OPTIONS'] },
        `/${api}/users/login`,
        `/${api}/users/register`,
        `/${api}/sellers/register`,
        `/${api}/sellers/login`,
        `/${api}/admin/register`,
        `/${api}/admin/login`,
        `/${api}/admin/products`,
        `/${api}/customer/products`,

    ]
  });
}

function validateTokenSeller() {
  let secret = process.env.SELLER_SECRET 
  const api = process.env.API_URL
  return expressJwt({
    secret,
    algorithms: ["HS256"],
    isRevoked:isRevoked
  })
}

function validateTokenUser() {
  let secret = process.env.USER_SECRET 
  const api = process.env.API_URL
  return expressJwt({
    secret,
    algorithms: ["HS256"],
    isRevoked:isRevoked
  })
}

async function isRevoked(req,payload,done){
    if(payload.isAdmin) {
     done()  
    }
    else if(payload.isSeller){
      done()
    }
    else{
      done(null, true)
    }


}

module.exports =  validateTokenAdmin, validateTokenSeller , validateTokenUser
// module.exports = sellerValidation; 

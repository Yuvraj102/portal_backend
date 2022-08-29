const clientID =
  "427800885053-kj17dnij5fv6oek8fdfkugg5qohfurki.apps.googleusercontent.com";
const clientSecret = process.env.Google_Client_Secret;
const productionRedirectUrl =
  "https://portalbackend44.herokuapp.com/api/v1/user/redirect/google";
const developmentRedirectUrl =
  "http://localhost:5000/api/v1/user/redirect/google";

//
let googleRedirectUrl = productionRedirectUrl;
if (process.env.DEVELOPMENT_MODE) {
  googleRedirectUrl = developmentRedirectUrl;
}
const axios = require("axios");
const queryString = require("query-string");

const stringifiedParams = queryString.stringify({
  client_id: clientID,
  redirect_uri: googleRedirectUrl,
  scope: [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ].join(" "), // space seperated string
  response_type: "code",
  access_type: "offline",
  prompt: "consent",
});

module.exports.googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`;

module.exports.getAccessTokenFromCode = async (code) => {
  const { data } = await axios({
    url: "https://oauth2.googleapis.com/token",
    method: "post",
    data: {
      client_id: clientID,
      client_secret: clientSecret,
      redirect_uri: googleRedirectUrl,
      grant_type: "authorization_code",
      code,
    },
  });
  return data.access_token;
};

module.exports.getUserInfoFromToken = async (access_token) => {
  const { data } = await axios({
    url: "https://www.googleapis.com/oauth2/v2/userinfo",
    method: "get",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return data;
};

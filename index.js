require('dotenv').config();
const path = require('path');
const routes = require('./src/routes');

const lti = require('ltijs').Provider;

// Setup
lti.setup(
  process.env.LTI_KEY,
  {
    url:
      'mongodb://' +
      process.env.DB_HOST +
      '/' +
      process.env.DB_NAME +
      '?authSource=admin',
    connection: {
      user: process.env.DB_USER,
      pass: process.env.DB_PASS,
    },
  },
  {
    staticPath: path.join(__dirname, './public'), // Path to static files
    cookies: {
      secure: false, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: '', // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: true, // Set DevMode to true if the testing platform is in a different domain and https is not being used
    // ltiaas: true // Disables cookie validation
  },
);

// When receiving successful LTI launch redirects to app
lti.onConnect(async (token, req, res) => {
  console.log(
    'req.query',
    req.query,
    token.platformId,
    token.user,
    token.userInfo,
  );
  return res.sendFile(path.join(__dirname, './public/index.html'));
});

// When receiving deep linking request redirects to deep screen
lti.onDeepLinking(async (token, req, res) => {
  return lti.redirect(res, '/deeplink?assessmentId=123', {
    newResource: true,
  });
});

// Setting up routes
lti.app.use(routes);

// Setup function
const setup = async () => {
  await lti.deploy({ port: process.env.PORT });

  /**
   * Register platform
   */
  /* await lti.registerPlatform({
    url: 'http://localhost/moodle',
    name: 'Platform',
    clientId: 'CLIENTID',
    authenticationEndpoint: 'http://localhost/moodle/mod/lti/auth.php',
    accesstokenEndpoint: 'http://localhost/moodle/mod/lti/token.php',
    authConfig: { method: 'JWK_SET', key: 'http://localhost/moodle/mod/lti/certs.php' }
  }) */

  await lti.registerPlatform({
    url: 'https://canvas.instructure.com',
    name: 'Canvas LMS',
    clientId: '10000000000001',
    authenticationEndpoint:
      'https://canvas.examind.io/api/lti/authorize_redirect',
    accesstokenEndpoint:
      'https://canvas.examind.io/login/oauth2/token',
    authConfig: {
      method: 'JWK_SET',
      key: 'https://canvas.examind.io/api/lti/security/jwks',
    },
  });
};

setup();

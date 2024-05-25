require('dotenv').config();
const path = require('path');
const routes = require('./src/routes');

const lti = require('ltijs').Provider;

// Setup
lti.setup(
  process.env.LTI_KEY,
  {
    url:
      'mongodb://' + process.env.DB_HOST + '/' + process.env.DB_NAME,
    connection: {
      user: process.env.DB_USER,
      pass: process.env.DB_PASS,
    },
  },
  {
    staticPath: path.join(__dirname, './public'), // Path to static files
    cookies: {
      secure: true, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: 'None', // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: true, // Set DevMode to true if the testing platform is in a different domain and https is not being used
    // ltiaas: true, // Disables cookie validation (set this to true when using LTIJS as a middleware)
    dynReg: {
      // Register tool in Moodle with https://lti-demo-server.ngrok.io/register
      url: 'https://lti-demo-server.ngrok.io/', // Tool Provider URL. Required field.
      name: 'LTI Demo Server', // Tool Provider name. Required field.
      // logo: 'http://tool.example.com/assets/logo.svg', // Tool Provider logo URL.
      description: 'Tool Description', // Tool Provider description.
      // redirectUris: ['http://tool.example.com/launch'], // Additional redirection URLs. The main URL is added by default.
      // customParameters: { key: 'value' }, // Custom parameters.
      autoActivate: true, // Whether or not dynamically registered Platforms should be automatically activated. Defaults to false.
    },
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

lti.onDynamicRegistration(async (req, res, next) => {
  try {
    if (!req.query.openid_configuration)
      return res.status(400).send({
        status: 400,
        error: 'Bad Request',
        details: {
          message: 'Missing parameter: "openid_configuration".',
        },
      });
    const message = await lti.DynamicRegistration.register(
      req.query.openid_configuration,
      req.query.registration_token,
    );
    res.setHeader('Content-type', 'text/html');
    res.send(message);
  } catch (err) {
    if (err.message === 'PLATFORM_ALREADY_REGISTERED')
      return res.status(403).send({
        status: 403,
        error: 'Forbidden',
        details: { message: 'Platform already registered.' },
      });
    return res.status(500).send({
      status: 500,
      error: 'Internal Server Error',
      details: { message: err.message },
    });
  }
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

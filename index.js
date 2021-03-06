const sendRequest = require('caccl-send-request');

/**
 * Initializes api forwarding
 * @author Gabe Abrams
 * @param {object} app - the express app to add routes to
 * @param {string} [canvasHost=canvas.instructure.com] - the Canvas host to
 *   forward requests to
 * @param {string} [apiForwardPathPrefix=/canvas] - the prefix to add to all
 *   api routes. Example: if apiForwardPathPrefix = '/canvas', hitting our
 *   /canvas/api/v1/courses route will forward our request to
 *   https:<canvasHost>/api/v1/courses
 * @param {string} [accessToken] - a default access token to apply to all
 *   forwarded requests. Only applied when the current user does not have an
 *   access token stored in their session
 * @param {number} [numRetries=3] - the number of times to retry failed requests
 */
module.exports = (config) => {
  // Gather and validate configuration options
  if (!config || !config.app) {
    throw new Error('We could not initialize CACCL API forwarder without "app", an express app to add routes to.');
  }
  const host = config.canvasHost || 'canvas.instructure.com';
  const apiForwardPathPrefix = (
    config.apiForwardPathPrefix === undefined
      ? '/canvas'
      : config.apiForwardPathPrefix
  );
  const numRetries = (config.numRetries !== undefined ? config.numRetries : 3);

  // Add route
  config.app.all(`${apiForwardPathPrefix}*`, async (req, res) => {
    const isGET = (req.method === 'GET');
    const data = (isGET ? req.query : req.body);

    // Get path
    const path = req.path.substring(apiForwardPathPrefix.length);

    // Add an access token (if not already included)
    if (!data.access_token) {
      data.access_token = req.accessToken || config.accessToken;
    }

    // Attempt to send the request to Canvas

    try {
      // Send the request
      const response = await sendRequest({
        host,
        path,
        numRetries,
        method: req.method,
        params: data,
        // Ignore self-signed certificate if host is simulated Canvas
        ignoreSSLIssues: (host === 'localhost:8088'),
      });

      // Set status
      res.status(response.status);

      // Send link header
      res.header('Access-Control-Expose-Headers', 'Link');
      res.set('Link', response.headers.link);

      // Send request
      return res.json(response.body);
    } catch (err) {
      return (
        res
          .status(500)
          .send(`We encountered an error while attempting to contact Canvas and forward an API request: ${err.message}`)
      );
    }
  });
};

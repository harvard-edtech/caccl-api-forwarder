// Import libs
import express from 'express';

// Import caccl libs
import { getAccessToken } from 'caccl-authorizer';
import { getLaunchInfo } from 'caccl-lti';
import sendRequest from 'caccl-send-request';

// Import shared types
import CACCLTag from './shared/types/CACCLTag';

// Import shared constants
import CACCL_PATHS from './shared/constants/CACCL_PATHS';
import COURSE_ID_REPLACE_WITH_CURR from './shared/constants/COURSE_ID_REPLACE_WITH_CURR';

/**
 * Initializes api forwarding
 * @author Gabe Abrams
 * @param {express.Application} app the express app to add routes to
 * @param {number} [numRetries=3] the number of times to retry failed requests
 */
const initAPIForwarder = (
  opts: {
    app: express.Application,
    numRetries?: number,
  },
) => {
  // Gather and validate configuration options
  const numRetries = (
    opts.numRetries === undefined
      ? 3
      : opts.numRetries
  );

  // Add forwarding route
  opts.app.all(
    `${CACCL_PATHS.FORWARDER_PREFIX}*`,
    async (req, res) => {
      const isGET = (req.method === 'GET');
      const params = (isGET ? req.query : req.body);

      // Add the current user's access token if possible
      if (!params.access_token) {
        try {
          const accessToken = await getAccessToken(req);
          params.access_token = accessToken;
        } catch (err) {
          // Don't add any access token
        }
      }

      // Get the current user's launch info
      const {
        launched,
        launchInfo,
      } = getLaunchInfo(req);
      if (!launched) {
        // No launch info. Respond with Canvas's "not authorized" response
        return res.status(401).json({
          status: 'unauthenticated',
          errors: [
            { message: 'user authorization required' },
          ],
        });
      }

      // Get path of the Canvas instance
      const path = (
        req.path
          // Remove forwarder prefix
          .substring(CACCL_PATHS.FORWARDER_PREFIX.length)
          // Replace placeholder with current course
          .replace(
            String(COURSE_ID_REPLACE_WITH_CURR),
            String(launchInfo.courseId),
          )
      );

      // Attempt to send the request to Canvas
      try {
        // Send the request
        const response = await sendRequest({
          host: launchInfo.canvasHost,
          path,
          numRetries,
          method: req.method as any,
          params,
        });

        // Set status
        res.status(response.status);

        // Send link header
        res.header('Access-Control-Expose-Headers', 'Link');
        res.set('Link', response.headers.link);

        // Send request
        return res.json(response.body);
      } catch (err) {
        // Unknown error. Respond with Canvas error
        return res.status(401).json({
          status: 'unauthorized',
          errors: [
            { message: 'user not authorized to perform that action' }
          ]
        });
      }
    },
  );
};

// Add CACCL tag
initAPIForwarder.tag = CACCLTag.API_FORWARDER;

export default initAPIForwarder;

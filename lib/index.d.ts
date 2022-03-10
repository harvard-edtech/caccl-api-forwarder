import express from 'express';
/**
 * Initializes api forwarding
 * @author Gabe Abrams
 * @param {express.Application} app the express app to add routes to
 * @param {number} [numRetries=3] the number of times to retry failed requests
 * @param {string} [forwarderPrefix=default value] prefix to require before
 *   the path of each api request. Note: it is not recommended to change
 *   this value!
 * @param {string} [defaultCanvasHost=host that user launched from] Canvas host
 *   to forward requests to if user has not launched. Note: it is not
 *   recommended to change this value!
 */
declare const initAPIForwarder: (opts: {
    app: express.Application;
    numRetries?: number;
    forwarderPrefix?: string;
    defaultCanvasHost?: string;
}) => void;
export default initAPIForwarder;

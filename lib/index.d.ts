import express from 'express';
import CACCLTag from './shared/types/CACCLTag';
/**
 * Initializes api forwarding
 * @author Gabe Abrams
 * @param {express.Application} app the express app to add routes to
 * @param {number} [numRetries=3] the number of times to retry failed requests
 */
declare const initAPIForwarder: {
    (opts: {
        app: express.Application;
        numRetries?: number;
    }): void;
    tag: CACCLTag;
};
export default initAPIForwarder;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import caccl libs
var caccl_authorizer_1 = require("caccl-authorizer");
var caccl_lti_1 = require("caccl-lti");
var caccl_send_request_1 = __importDefault(require("caccl-send-request"));
// Import shared constants
var CACCL_PATHS_1 = __importDefault(require("./shared/constants/CACCL_PATHS"));
var COURSE_ID_REPLACE_WITH_CURR_1 = __importDefault(require("./shared/constants/COURSE_ID_REPLACE_WITH_CURR"));
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
var initAPIForwarder = function (opts) {
    var _a;
    // Gather and validate configuration options
    var numRetries = (opts.numRetries === undefined
        ? 3
        : opts.numRetries);
    var forwarderPrefix = ((_a = opts.forwarderPrefix) !== null && _a !== void 0 ? _a : CACCL_PATHS_1.default.FORWARDER_PREFIX);
    // Add forwarding route
    opts.app.all("".concat(forwarderPrefix, "*"), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var isGET, params, accessToken, err_1, _a, launched, launchInfo, path, response, err_2;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    isGET = (req.method === 'GET');
                    params = (isGET ? req.query : req.body);
                    if (!!params.access_token) return [3 /*break*/, 4];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, caccl_authorizer_1.getAccessToken)(req)];
                case 2:
                    accessToken = _c.sent();
                    params.access_token = accessToken;
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _c.sent();
                    return [3 /*break*/, 4];
                case 4:
                    _a = (0, caccl_lti_1.getLaunchInfo)(req), launched = _a.launched, launchInfo = _a.launchInfo;
                    if (!launched && !opts.defaultCanvasHost) {
                        // No launch info. Respond with Canvas's "not authorized" response
                        return [2 /*return*/, res.status(401).json({
                                status: 'unauthenticated',
                                errors: [
                                    { message: 'user authorization required' },
                                ],
                            })];
                    }
                    path = (req.path
                        // Remove forwarder prefix
                        .substring(forwarderPrefix.length)
                        // Replace placeholder with current course
                        .replace(String(COURSE_ID_REPLACE_WITH_CURR_1.default), String(launchInfo.courseId)));
                    _c.label = 5;
                case 5:
                    _c.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, (0, caccl_send_request_1.default)({
                            host: (launched
                                ? ((_b = launchInfo.canvasHost) !== null && _b !== void 0 ? _b : opts.defaultCanvasHost)
                                : opts.defaultCanvasHost),
                            path: path,
                            numRetries: numRetries,
                            method: req.method,
                            params: params,
                        })];
                case 6:
                    response = _c.sent();
                    // Set status
                    res.status(response.status);
                    // Send link header
                    res.header('Access-Control-Expose-Headers', 'Link');
                    res.set('Link', response.headers.link);
                    // Send request
                    return [2 /*return*/, res.json(response.body)];
                case 7:
                    err_2 = _c.sent();
                    // Unknown error. Respond with Canvas error
                    return [2 /*return*/, res.status(401).json({
                            status: 'unauthorized',
                            errors: [
                                { message: 'user not authorized to perform that action' }
                            ]
                        })];
                case 8: return [2 /*return*/];
            }
        });
    }); });
};
exports.default = initAPIForwarder;
//# sourceMappingURL=index.js.map
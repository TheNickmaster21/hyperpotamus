var _ = require("lodash");
var verror = require("verror");
module.exports.safe = true;
var curlify = require("request-as-curl");

/*
 Purpose:
   Stores (or logs) a request as an equivalent curl statement

 Example:
   body: key
 */

module.exports.process = function (context) {
	var response = context.getSessionValue("hyperpotamus.response");
	if (_.isNil(response)) {
		throw new verror.VError({
			name: "InvalidActionPlacement.curl",
			info: {
				path: this.path + ".curl"
			}
		}, "The .curl action is only valid for use within the response of a .request action.");
	}
	var curlified = curlify(response.request.req, response.request.body);
	if (_.isString(this.curl)) {
		context.setSessionValue(this.curl, curlified);
	}
	else {
		module.exports.logger.info("CURL equivalent: " + curlified);
	}
};

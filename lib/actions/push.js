module.exports.safe = true;

/*
Purpose:
  Pushes an element onto the end of an array, or concatenates one array onto the end of another.
  The "array" property specifies the name (or array reference) to the target array.
  The "value" property is the value that will be added to the front of the target array.

 Example:
  - push:
      array: array_name || <%! array_reference %>
      value: value  ||
*/

var _ = require("lodash");
var verror = require("verror");

module.exports.normalize = function(action, normalizer, path) {
	if(_.has(action, "push")) {
		if(_.has(action.push, "target")) {
			if(_.has(action.push, "array")) {
				throw new verror.VError({
					name: "ActionStructureError.push",
					info: {
						path: path
					}
				}, "Cannot specify both .array and .target (which is an alias for .array)");
			}
			action.push.array = action.push.target;
			delete(action.push.target);
		}
		return action;
	}
};

module.exports.process = function (context) {
	if (!(_.has(this.push, "value"))) {
		throw new verror.VError({
			name: "InvalidActionValue.push",
			info: {
				path: this.path + ".push.value",
				value: this.push.value
			}
		}, "push action requires a .value value");
	}
	if (!_.has(this.push, "array")) {
		throw new verror.VError({
			name: "InvalidActionTarget.push",
			info: {
				path: this.path + ".push.array"
			}
		}, "push action requires an .array value");
	}
	var array = this.push.array;
	if (_.isString(array)) {
		if (!_.has(context.session, this.push.array)) {
			_.set(context.session, this.push.array, []);
		}
		array = _.get(context.session, this.push.array);
	}
	if (!_.isArray(array)) {
		throw new verror.VError({
			name: "InvalidActionTarget.push",
			info: {
				path: this.path + ".push.array"
			}
		}, "push.array must be an array or array reference");
	}
	if (_.isArray(this.push.value)) {
		// Need to modify the original array in-place
		Array.prototype.push.apply(array, this.push.value);
	}
	else {
		array.push(this.push.value);
	}
};

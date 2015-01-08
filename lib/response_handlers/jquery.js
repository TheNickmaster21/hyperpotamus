var interpolate = require("../interpolate");
var _ = require("underscore");
var jsdom = require("jsdom");
var jquery = require("jquery");
var async = require("async");

module.exports.name = "jquery";

module.exports.handles = function(validation) {
	return !!(validation.jquery);
}

module.exports.validate = function(context, callback) {
        var err, compare, value;
        jsdom.env(context.body, function(err, window) {
                if(err) {
                        return callback("Error parsing document - " + err, context.body, null);
                }
                var $ = jquery(window);
                var key = context.validation.key;
                var matches = $(context.validation.jquery);
                if(context.validation.count) {
                        if(_.isNumber(context.validation.count)) {
                                compare = context.validation.count;
                        }
                        else { // Assume _.isString for now. TODO - Error otherwise
                                compare = parseInt(interpolate(context.validation.count, context.session));
                        }
                        if(matches.length!==compare) {
                                return callback("Expected count of matches did not match", compare, matches.length);
                        }
                }
                if(context.validation.capture) {
                        async.eachSeries(matches, function(element, cb) {
                                element = $(element);
                                for(var key in context.validation.capture) {
                                        var target = context.validation.capture[key];
                                        var isArray = false;
                                        if(_.isArray(context.validation.capture[key])) {
                                                isArray = true;
                                                target = target[0];
                                                // TODO - handling for array lengths!=1
                                        }
                                        if(!target || target==="html" || target==="outerHTML") value = element[0].outerHTML;
                                        else if(target==="innerHTML") value = $(element).html();
                                        else if(target==="text") value = $(element).text();
                                        else if(target[0]==="@") value = $(element).attr(target.substring(1));
                                        if(isArray) {
                                                if(!_.isArray(context.session[key])) {
                                                        context.session[key] = [];
                                                }
                                                context.session[key].push(value);
                                        }
                                        else {
                                                context.session[key] = value;
                                        }
                                }
                                cb();
                        }, function(err) {
                                return callback(err, compare, value);
                        });
                }
        });
}
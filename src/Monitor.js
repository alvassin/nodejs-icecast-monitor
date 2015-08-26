/**
 * Dependencies
 */
var Feed = require(__dirname + '/Feed');
var http = require('http');
var XmlParser = require(__dirname + '/XmlParser');

/**
 * Exports
 */
module.exports = Monitor;

/**
 * Constructor
 */
function Monitor(options) {

	/**
	 * Configuration
	 * @var {object}
	 */
	this.options = options;
}

/**
 * Feed constructor
 */
Monitor.Feed = Feed;

/**
 * Create stats feed
 * @param {function} callback
 */
Monitor.prototype.createFeed = function(callback) {
	try {
		var feed = new Feed(this.config);
  	feed.connect();
  	callback(null, feed);	
	} catch (err) {
		callback(err);
	}
};

/**
 * Returns server status
 * @param {function} callback
 */
Monitor.prototype.getServerInfo = function(callback) {
	this.getXmlStream('/admin/stats', function(err, xmlStream) {
		
		if (err) {
			callback(err);
			return;
		}

		XmlParser.parseServerData(xmlStream, callback);
	});
}

/**
 * Returns sources list
 * @param {function} callback
 */
Monitor.prototype.getSources = function(callback) {
	var monitor = this;
	monitor.getXmlStream('/admin/stats', function(err, xmlStream) {

		if (err) {
			callback(err);
			return;
		}

		XmlParser.parseSourcesData(xmlStream, callback);
	});
}

/**
 * Returns information with listeners for specified mount
 * @param {function} callback
 */
Monitor.prototype.getSource = function(mount, callback) {
	this.getXmlStream('/admin/stats?mount=' + mount, function(err, xmlStream) {

		if (err) {
			callback(err);
			return;
		}

		XmlParser.parseSourcesData(xmlStream, function(err, sources) {

			if (err) {
				callback(err);
				return;
			}

			callback(null, sources.shift());
		});
	});
}

/**
 * Returns listeners information
 * @param {function} callback
 */
Monitor.prototype.getListeners = function(callback) {
	var monitor = this;
	monitor.getXmlStream('/admin/listmounts?with_listeners', function(err, xmlStream) {

		if (err) {
			callback(err);
			return;
		}

		XmlParser.parseListenersData(xmlStream, function(err, listeners) {

			if (err) {
				callback(err);
				return;
			}

			callback(null, listeners);
		});
	});
}

/**
 * Returns XML stream for further processing
 * @param {string} urlPath
 * @param {function} callback
 */
Monitor.prototype.getXmlStream = function(urlPath, callback) {
	
	var monitor = this;

	var req = http.request({
	  hostname: monitor.options.host,
	  port: monitor.options.port,
	  path: urlPath,
	  auth: monitor.options.user + ':' + monitor.options.password
	}, function(res) {

		if (res.statusCode !== 200) {
			callback(new Error('Server responded with ' + res.statusCode + ' HTTP status code'));
			return;
		}

	  res.setEncoding('utf8');
	  callback(null, res);

	});

	req.on('error', function(error) { 
		callback(error); 
	});

	req.end();
};

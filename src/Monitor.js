/**
 * Dependencies
 */
var Feed = require(__dirname + '/Feed');
var http = require('http');
var XmlStreamParser = require(__dirname + '/XmlStreamParser');

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
 * Create stats feed.
 *
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
 * Returns information about server.
 *
 * @param {function} callback
 */
Monitor.prototype.getServerInfo = function(callback) {
	this.createStatsXmlStream('/admin/stats', function(err, xmlStream) {
		
		if (err) {
			callback(err);
			return;
		}

		var xmlParser = new XmlStreamParser();

		xmlParser.on('error', function(err) {
			callback(err);
		});

		xmlParser.on('server', function(server) { 
			callback(null, server); 
		});

		xmlStream.pipe(xmlParser);
	});
}

/**
 * Get sources list.
 *
 * @param {function} callback
 */
Monitor.prototype.getSources = function(callback) {
	this.createStatsXmlStream('/admin/stats', function(err, xmlStream) {
		
		if (err) {
			callback(err);
			return;
		}

		var sources = [];

		var xmlParser = new XmlStreamParser();

		xmlParser.on('error', function(err) {
			callback(err); 
		});

		xmlParser.on('source', function(source) {
			sources.push(source);
		});

		// Finish event is being piped from xmlStream
		xmlParser.on('finish', function() {
			callback(null, sources);
		});

		xmlStream.pipe(xmlParser);
	});
}

/**
 * Returns information with listeners for specified mount
 * @param {function} callback
 */
Monitor.prototype.getSource = function(mount, callback) {
	this.createStatsXmlStream('/admin/stats?mount=' + mount, function(err, xmlStream) {
		
		if (err) {
			callback(err);
			return;
		}

		var source;

		var xmlParser = new XmlStreamParser();

		xmlParser.on('error', function(err) {
			callback(err); 
		});

		xmlParser.on('source', function(data) {
			source = data;
		});

		// Finish event is being piped from xmlStream
		xmlParser.on('finish', function() {
			if (source) {
				callback(null, source);
			} else {
				callback(new Error('Mount "' + mount + '" not found'));
			}
		});

		xmlStream.pipe(xmlParser);
	});
}

/**
 * Returns listeners information
 * @param {function} callback
 */
Monitor.prototype.getListeners = function(callback) {
	this.createStatsXmlStream('/admin/listmounts?with_listeners', function(err, xmlStream) {
		
		if (err) {
			callback(err);
			return;
		}

		var listeners = [];

		var xmlParser = new XmlStreamParser();

		xmlParser.on('error', function(err) {
			callback(err); 
		});

		xmlParser.on('listener', function(listener) {
			listeners.push(listener);
		});

		// Finish event is being piped from xmlStream
		xmlParser.on('finish', function() {
			callback(null, listeners);
		});

		xmlStream.pipe(xmlParser);
	});
}

/**
 * Returns XML stream for further processing
 * @param {string} urlPath
 * @param {function} callback
 */
Monitor.prototype.createStatsXmlStream = function(urlPath, callback) {
	
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

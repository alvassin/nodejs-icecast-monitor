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
 *
 * @param {object} options
 */
function Monitor(options) {

  this.config = {
    host: null,
    port: 80,
    user: null,
    password: null
  };

  // Handle options input
  for (var key in options) {
    if (typeof (this.config[key] !== 'undefined')) {
      this.config[key] = options[key];
    }
  }

  // Check that all config options are defined
  for (var key in this.config) {
    if (this.config[key] == null) {
      throw new Error('Option "' + key + '" is required');
    }
  }  
}

/**
 * Feed constructor
 */
Monitor.Feed = Feed;

/**
 * XmlStreamParser constructor
 */
Monitor.XmlStreamParser = XmlStreamParser;

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

    var xmlParser = new XmlStreamParser();
    var sources = [];

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

    var xmlParser = new XmlStreamParser();
    var source;
    var listeners = [];

    // Handle errors
    xmlParser.on('error', function(err) {
      callback(err); 
    });

    // Retrieve source data
    xmlParser.on('source', function(data) {
      source = data;
    });

    // Retrieve listeners data
    xmlParser.on('listener', function(listener) {
      listeners.push(listener);
    });

    // Finish event is being piped from xmlStream
    xmlParser.on('finish', function() {
      if (source) {
        source.listeners = listeners;
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

    var xmlParser = new XmlStreamParser();
    var listeners = [];

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
 * Returns XML stream for further processing.
 *
 * @param {string} urlPath
 * @param {function} callback
 */
Monitor.prototype.createStatsXmlStream = function(urlPath, callback) {
  
  var req = http.request({
    hostname: this.config.host,
    port: this.config.port,
    path: urlPath,
    auth: this.config.user + ':' + this.config.password
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
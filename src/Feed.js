/**
 * Dependencies
 */
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var Param = require(__dirname + '/Param');
var util = require('util');

/**
 * Module exports
 */
module.exports = Feed;

/**
 * Constructor.
 *
 * @param {object} options
 */
function Feed(options) {
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
util.inherits(Feed, EventEmitter);

/**
 * Connect to specified server & start processing data.
 */
Feed.prototype.connect = function() {
  
  var feed = this;

  feed.socket = net.createConnection(feed.config.port, feed.config.host);
  feed.socket.on('connect', function() {
    feed.socket.write(
      'STATS / HTTP/1.1\r\n' + 
      'Authorization: Basic ' + new Buffer(feed.config.user + ':' + feed.config.password).toString('base64') + '\r\n' +
      'User-Agent: icecast-monitor/0.0.1\r\n' + 
      'Host: ' + feed.config.host + '\r\n' +
      'Accept: */*\r\n\r\n'
    );

    feed.emit('connect');
  });

  feed.socket.on('data', function(data) {
    var lines = data.toString().split('\n');
    for (var i in lines) {
      if ( ! lines[i]) continue;
      feed.handleEvent(lines[i]);
    }
  });

  feed.socket.on('close', function() {
    feed.emit('disconnect');
  })
}

/**
 * Processes raw icecast event.
 * 
 * @param {string} rawEvent
 */
Feed.prototype.handle = function(rawEvent) {

  var event = this.parse(rawEvent);

  // Build event params 
  var params = [event.data];
  if (event.mount) {
    params.unshift(event.mount);
  }

  // Emit wilcard (*) event
  this.emit.apply(this, ['*', event.name].concat(params));

  // Emit server.* / mount.* events
  if (event.mount) {
    this.emit.apply(this, ['mount.*', event.name].concat(params));
  } else {
    this.emit.apply(this, ['server.*', event.name].concat(params));
  }

  // Emit event
  this.emit.apply(this, [event.name].concat(params))
}

/**
 * Parse event from raw text line.
 *
 * @param {string} line
 * @return {object}
 */
Feed.prototype.parse = function(line) {
  
  var chunks = line.split(' ');

  /**
   * Event name prefix
   * @var {string}
   */
  var prefix;

  /**
   * Event name
   * @var {string}
   */
  var name;

  /**
   * Mountpoint
   * @var {string}
   */
  var mount = null;

  /**
   * Event params
   * @var {Array}
   */
  var params = [];

  // Parse event & data
  switch(chunks[0]) {
    case 'NEW':
      name   = chunks.shift().toLowerCase();
      mount  = chunks.pop();
      params = chunks;
      break;

    case 'DELETE':
    case 'FLUSH':
      name  = chunks.shift().toLowerCase();
      mount = chunks.shift();
        break;

    case 'EVENT':
      var type  = chunks[1] === 'global' ? 'server' : 'mount';
      if (type === 'mount') {
        mount = chunks[1];
      }
      name      = Param.normalizeName(chunks[2]);
      params    = chunks.slice(3);
        break;

    case 'INFO':
    default:
      name = chunks.shift().toLowerCase();
      params = [chunks.join(' ')];
        break;
  }

  // Retrieve event name prefix
  prefix = mount ? 'mount' : 'server';

  return {
    name  : prefix + '.' + name,
    mount : mount,
    data  : Param.normalizeData(name, params),
  };
}

/**
 * Disconnects from the server.
 */
Feed.prototype.disconnect = function() {
  this.socket.destroy();
};

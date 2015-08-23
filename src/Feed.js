/**
 * Dependencies
 */
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var util = require('util');

/**
 * Module exports
 */
module.exports = Feed;

/**
 * Constructor
 * @param object options
 */
function Feed(options) {
  this.config = {
    host     : null,
    port     : 80,
    user     : null,
    password : null,
    ssl      : false,
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
 * Connects to specified server & starts processing data
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
    var lines = data.toString().split("\n");
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
 * Processes raw icecast event
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
  this.emit.apply(['*', event.name].concat(params));

  // Emit server.* / mount.* events
  if (event.mount) {
    this.emit.apply(['mount.*', event.name].concat(params));
  } else {
    this.emit.apply(['server.*', event.name].concat(params));
  }

  // Emit event
  this.emit.apply([event.name].concat(params))
}

/**
 * Parse event from raw text line
 *
 * @param {string} line
 * @return {object}
 */
Feed.prototype.parseEvent = function(line) {
  
  var chunks = line.split(' ');

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

  // Parse data
  switch(chunks[0]) {
    case 'NEW':
      name   = 'mount.' + chunks.shift().toLowerCase();
      mount  = chunks.pop();
      params = chunks;
      break;

    case 'DELETE':
    case 'FLUSH':
      name  = 'mount.' + chunks.shift().toLowerCase();
      mount = chunks.shift();
        break;

    case 'EVENT':
      var type  = chunks[1] === 'global' ? 'server' : 'mount';
      if (type === 'mount') {
        mount = chunks[1];
      }
      name      = this.normalizeEventName(type + '.' + chunks[2]);
      params    = chunks.slice(3);
        break;

    case 'INFO':
    default:
      name = 'server.' + chunks.shift().toLowerCase();
      params = [chunks.join(' ')];
        break;
  }

  return {
    name  : name,
    mount : mount,
    data  : this.normalizeEventData(name, params),
  };
}

/**
 * Normalizes event name
 * @param {string} name
 * @return {string}
 */
Feed.prototype.normalizeEventName = function(event) {

  /**
   * Event name fixes
   * @var {object}
   */
  var fixes = {
    'mount.audioCodecid'      : 'mount.audioCodecId',
    'mount.listenurl'         : 'mount.listenUrl',
    'mount.outgoingKbitrate'  : 'mount.outgoingKBitrate',
    'mount.totalMbytesSent'   : 'mount.totalMBytesSent',
    'server.outgoingKbitrate' : 'server.outgoingKBitrate',
    'server.streamKbytesRead' : 'server.streamKBytesRead',
    'server.streamKbytesSent' : 'server.streamKBytesSent',
  };

  // Camelize event name
  event = event.replace(/[\s_-](.)/g, function($1) { return $1.toUpperCase(); })
               .replace(/\s|_|-/g, '')
               .replace(/^(.)/, function($1) { return $1.toLowerCase(); });

  // Fix event name
  if (typeof fixes[event] === 'string') {
    event = fixes[event];
  }

  return event;
}

/**
 * Normalizes server event params
 * @param {string} name
 * @param {array} params
 * @return {mixed}
 */
Feed.prototype.normalizeEventData = function(name, params) {

  /**
   * Result
   * @var {mixed}
   */
  var result;

  switch(name) {

    case 'mount.audioInfo':
      var items  = params.shift().split(';');
      result = {};

      for (var i in items) {
        items[i] = items[i].split('=');
        result[items[i][0]] = parseInt(items[i][1]);
      }
      break;

    // Nothing to do
    case 'mount.delete':
    case 'mount.flush':
      break;

    // Integer values
    case 'mount.audioCodecId':
    case 'mount.bitrate':
    case 'mount.connected':
    case 'mount.incomingBitrate':
    case 'mount.listenerConnections':
    case 'mount.listenerPeak':
    case 'mount.listeners':
    case 'mount.maxListeners':
    case 'mount.mpegChannels':
    case 'mount.mpegSamplerate':
    case 'mount.outgoingKBitrate':
    case 'mount.public':
    case 'mount.queueSize':
    case 'mount.slowListeners':
    case 'mount.totalBytesRead':
    case 'mount.totalBytesSent':
    case 'mount.totalMBytesSent':
    case 'server.bannedIPs':
    case 'server.build':
    case 'server.clientConnections':
    case 'server.clients':
    case 'server.connections':
    case 'server.fileConnections':
    case 'server.listenerConnections':
    case 'server.listeners':
    case 'server.outgoingKBitrate':
    case 'server.serverId':
    case 'server.sourceClientConnections':
    case 'server.sourceRelayConnections':
    case 'server.sources':
    case 'server.sourceTotalConnections':
    case 'server.stats':
    case 'server.statsConnections':
    case 'server.streamKBytesRead':
    case 'server.streamKBytesSent':
      result = parseInt(params.shift());
      break;

    // String values
    case 'mount.authenticator':
    case 'mount.genre':
    case 'mount.listenUrl':
    case 'mount.metadataUpdated':
    case 'mount.new':
    case 'mount.serverDescription':
    case 'mount.serverName':
    case 'mount.serverType':
    case 'mount.serverUrl':
    case 'mount.sourceIp':
    case 'mount.streamStart':
    case 'mount.title':
    case 'mount.ypCurrentlyPlaying':
    case 'server.admin':
    case 'server.host':
    case 'server.info':
    case 'server.location':
    case 'server.serverStart':
    default:
      result = params.join(' ');
      break;
  }

  return result;
};

/**
 * Disconnects from the server
 */
Feed.prototype.disconnect = function() {
  this.socket.destroy();
};


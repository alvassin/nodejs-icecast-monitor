/**
 * Dependencies
 */
var Param = require(__dirname + '/Param'); 
var sax = require('sax');
var stream = require('stream');
var util = require('util');

/**
 * Module exports
 */
module.exports = XmlStreamParser;

var config = {

  /**
   * Default tags we need to handle. They are used instead of camelCased parameters 
   * to optimize additional processing during xmlStream parsing.
   * @var {object}
   */
  tags : {

    /**
     * Tags to collect about server
     */
    server: [
      'admin',
      'banned_IPs',
      'build',
      'client_connections',
      'clients',
      'connections',
      'file_connections',
      'host',
      'listener_connections',
      'listeners',
      'location',
      'outgoing_kbitrate',
      'server_id',
      'server_start',
      'source_client_connections',
      'source_relay_connections',
      'sources',
      'source_total_connections',
      'stats',
      'stats_connections',
      'stream_kbytes_read',
      'stream_kbytes_sent',
    ],

    /**
     * Tags to collect about every source
     */
    source: [
      'audio_codecid',
      'audio_info',
      'authenticator',
      'bitrate',
      'connected',
      'genre',
      'incoming_bitrate',
      'listener_connections',
      'listener_peak',
      'listeners',
      'listenurl',
      'max_listeners',
      'metadata_updated',
      'mpeg_channels',
      'mpeg_samplerate',
      'outgoing_kbitrate',
      'public',
      'queue_size',
      'server_description',
      'server_name',
      'server_type',
      'server_url',
      'slow_listeners',
      'source_ip',
      'stream_start',
      'title',
      'total_bytes_read',
      'total_bytes_sent',
      'total_mbytes_sent',
      'yp_currently_playing'
    ],

    /**
     * Tags to collect about every listener
     */
    listener: [
      'ID',
      'IP',
      'UserAgent',
      'Referer',
      'lag',
      'Connected',
    ],
  },

  /**
   * Depth level for different data types
   * @var {object}
   */
  dataDepthLevels: {
    2: 'server',
    3: 'source',
    4: 'listener'
  }
}

/**
 * Creates data item with normalized tag names as keys and null values.
 *
 * @param {mixed} item
 * @param {array} tags
 */
function initDataItem(tags) {
  var item = {};

  for (var i in tags) {
    var param = Param.normalizeName(tags[i]);
    item[param] = null;
  }

  return item;
}

/**
 * Constructor
 */
function XmlStreamParser () {

  /**
   * Instance link
   * @var {XmlStreamParser}
   */
  var parser = this;

  /**
   * Represents currently processing data item (server, source, listener). 
   * After processing is finished, event is emitted, data[object] is flushed.
   * @var {object}
   */
  this.data = {};

  /**
   * Sax writeable stream
   * @var {stream.Writeable}
   */
  this.saxStream = sax.createStream(true);

  /**
   * Current depth level
   * @var {integer}
   */
  this.currentDepth;
  
  /**
   * Current tag
   * @var {string}
   */
  this.currentTag;

  /**
   * Current source mountpoint
   * @var {string}
   */
  this.currentMount;

  // Inherit from writeable stream
  stream.Writable.call(this);  

  // Handle errors
  parser.saxStream.on('error', function(error) {
    parser.emit('error', error);
  });

  // Handle data
  parser.saxStream.on('opentag', function(node) {
    parser.handleOpenTag(node);
  });

  parser.saxStream.on('text', function(text) {
    parser.handleText(text);
  });

  parser.saxStream.on('closetag', function(tagName) {
    parser.handleCloseTag(tagName);
  });
};
util.inherits(XmlStreamParser, stream.Writable);

/**
 * Handle tag opening.
 *
 * @param {object} node
 */
XmlStreamParser.prototype.handleOpenTag = function(node) {
  
  // Re-init data containers
  if (node.name === 'icestats') {
    this.currentDepth = 0;

    this.data = {
      server: null,
      source: null,
      listener: null
    };
  }

  // Calculate depth level
  this.currentDepth++;

  if (node.name === 'source') {
    this.currentMount = node.attributes.mount;
  }

  // Check current depth level should be handled
  if ( ! config.dataDepthLevels[this.currentDepth]) {
    return;
  }

  // Get current data type: server, source or listener
  var dataType = config.dataDepthLevels[this.currentDepth];

  // Check that we need to handle this tag for current data type
  if (config.tags[dataType].indexOf(node.name) !== -1) {
    if ( ! this.data[dataType]) {

      // Create data item and fill it with nullable values
      this.data[dataType] = initDataItem(config.tags[dataType]);

      // Set mount name
      if (dataType === 'source' || dataType === 'listener') {
        this.data[dataType].mount = this.currentMount;
      }
    }
    this.currentTag = node.name;
  }
}

/**
 * Handles text.
 *
 * @param {string} text
 */
XmlStreamParser.prototype.handleText = function(text) {

  // Check current depth level should be handled
  if ( ! config.dataDepthLevels[this.currentDepth]) {
    return;
  }

  // Check, if we need to handle current tag
  if ( ! this.currentTag) {
    return;
  }

  // Get current data type: server, source or listener
  var dataType = config.dataDepthLevels[this.currentDepth];

  // Fill with normalized parameter & data
  var param = Param.normalizeName(this.currentTag);
  var value = Param.normalizeData(param, [text]);
  this.data[dataType][param] = value;
}

/**
 * Handles tag closing.
 *
 * @param {string} tagName
 */
XmlStreamParser.prototype.handleCloseTag = function(tagName) {

  this.currentDepth--;
  this.currentTag = null;

  switch(tagName) {

    // Source is finished
    case 'source':
      this.emit('source', this.data.source);
      this.data.source = null;
      this.currentMount = null;
      break;

    // Listener is finished
    case 'listener':
      this.emit('listener', this.data.listener);
      this.data.listener = null;
      break;

    // Server info is ready (xml file is finished)
    case 'icestats':
      this.emit('server', this.data.server);
      this.data.server = null;
      break;
  }
}

/**
 * Handle input data.
 *
 * @param chunk
 * @param encoding
 * @param {function} done
 */
XmlStreamParser.prototype._write = function (chunk, encoding, done) {
  this.saxStream.write(chunk);
  done();
}

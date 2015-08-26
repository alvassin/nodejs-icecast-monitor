/**
 * Normalize param name.
 *
 * @param {string} name
 * @return {string}
 */
module.exports.normalizeName = function(name) {

  /**
   * Exceptions, camelCase is not enough
   * @var {object}
   */
  var exceptions = {
    'audio_codecid'      : 'audioCodecId',
    'ID'                 : 'id',
    'IP'                 : 'ip',
    'listenurl'          : 'listenUrl',
    'mpeg_samplerate'    : 'mpegSampleRate',
    'outgoing_kbitrate'  : 'outgoingKBitrate',
    'total_mbytes_sent'  : 'totalMBytesSent',
    'stream_kbytes_read' : 'streamKBytesRead',
    'stream_kbytes_sent' : 'streamKBytesSent',
  };

  if (typeof exceptions[name] === 'string') {
    return exceptions[name];
  }

  // Camelize param name
  return name.replace(/[\s_-](.)/g, function($1) { return $1.toUpperCase(); })
             .replace(/\s|_|-/g, '')
             .replace(/^(.)/, function($1) { return $1.toLowerCase(); });
}

/**
 * Normalize param data.
 *
 * @param {string} name
 * @param {array} params
 * @return {mixed}
 */
module.exports.normalizeData = function(name, params) {

  /**
   * Normalized data
   * @var {mixed}
   */
  var result;

  switch(name) {

    case 'audioInfo':
      var items  = params.shift().split(';');
      result = {};

      for (var i in items) {
        items[i] = items[i].split('=');
        result[items[i][0]] = parseInt(items[i][1]);
      }
      break;

    // Nothing to do
    case 'delete':
    case 'flush':
      break;

    // Integer values
    case 'audioCodecId': 
    case 'bannedIPs': 
    case 'bitrate': 
    case 'build': 
    case 'clientConnections': 
    case 'clients': 
    case 'connected': 
    case 'connections': 
    case 'fileConnections': 
    case 'incomingBitrate': 
    case 'listenerConnections': 
    case 'listenerPeak': 
    case 'listeners': 
    case 'maxListeners': 
    case 'mpegChannels': 
    case 'mpegSampleRate': 
    case 'outgoingKBitrate': 
    case 'public': 
    case 'queueSize': 
    case 'slowListeners': 
    case 'sourceClientConnections': 
    case 'sourceRelayConnections': 
    case 'sources': 
    case 'sourceTotalConnections': 
    case 'stats': 
    case 'statsConnections': 
    case 'streamKBytesRead': 
    case 'streamKBytesSent': 
    case 'totalBytesRead': 
    case 'totalBytesSent': 
    case 'totalMBytesSent': 
      result = parseInt(params.shift());
      break;

    // String values
    case 'admin':
    case 'authenticator':
    case 'genre':
    case 'host':
    case 'info':
    case 'listenUrl':
    case 'location':
    case 'metadataUpdated':
    case 'new':
    case 'serverDescription':
    case 'serverId':
    case 'serverName':
    case 'serverStart':
    case 'serverType':
    case 'serverUrl':
    case 'sourceIp':
    case 'streamStart':
    case 'title':
    case 'ypCurrentlyPlaying':
    default:
      result = params.join(' ');
      break;
  }

  return result;
}
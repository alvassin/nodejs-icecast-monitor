var assert = require('assert');
var Feed = require(__dirname + '/../index').Feed;

describe('Monitor.Feed', function() {

  /**
   * @var {Feed}
   */
  var feed;

  beforeEach(function() {
    feed = new Feed({
      host: 'localhost',
      user: 'admin',
      password: 'hackme'
    });
  });

  afterEach(function() {
    feed = null;
  });

  /**
   * Sets up err timeouts
   * @param {Array} expectedEvents
   */ 
  function setupErrTimeouts(expectedEvents) {
    var timeouts = {};

    expectedEvents.forEach(function(event){
      timeouts[event] = setTimeout(function() {
        assert(false, 'Event ' + event + ' not fired')
      }, 1000);
    });

    return timeouts;
  }

  /**
   * Asserts that given data is equal,
   * uses strict comparison for simple types, deep comparison for objects.
   * @param v1
   * @param v2
   * @param {string} message
   */
  function assertDataIsEqual(v1, v2, message) {
    var type = typeof v1;
    if (type === 'object') {
      return assert.deepEqual(v1, v2, message);
    }

    return assert.strictEqual(v1, v2, message);
  }

  /**
   * Sets up server event
   * @param {string} event
   * @param data
   * @param {function} done
   */
  function setupServerEvent(event, data, done) {
    
    var counter = 3;

    // Setup err timeouts
    var errTimeouts = setupErrTimeouts([event, 'server.*', '*']);

    // Listen to normal event
    feed.on(event, function(eventData) {
      assertDataIsEqual(data, eventData, 'Event data mismatch');

      clearTimeout(errTimeouts[event]);
      if (--counter === 0) done();
    });

    // Listen to type.* wildcard event
    feed.on('server.*', function(eventName, eventData) {
      assert.strictEqual(event, eventName, 'Event name mismatch');
      assertDataIsEqual(data, eventData, 'Event data mismatch');

      clearTimeout(errTimeouts['server.*']);
      if (--counter === 0) done();
    });

    // Listen to * wildcard event
    feed.on('*', function(eventName, eventData) {
      assert.strictEqual(event, eventName, 'Event name mismatch');
      assertDataIsEqual(data, eventData, 'Event data mismatch');

      clearTimeout(errTimeouts['*']);
      if (--counter === 0) done();
    });
  }

  /**
   * Sets up mount event
   * @param {string} event
   * @param {string} mount
   * @param data
   * @param {function} done
   */
  function setupMountEvent(event, mount, data, done) {
    
    var counter = 3;

    // Setup err timeouts
    var errTimeouts = setupErrTimeouts([event, 'mount.*', '*']);

    // Listen to normal event
    feed.on(event, function(eventMount, eventData) {
      assert.strictEqual(mount, eventMount, 'Mount mismatch');
      assertDataIsEqual(data, eventData, 'Event data mismatch');

      clearTimeout(errTimeouts[event]);
      if (--counter === 0) done();
    });

    // Listen to type.* wildcard event
    feed.on('mount.*', function(eventName, eventMount, eventData) {
      assert.strictEqual(event, eventName, 'Event name mismatch');
      assert.strictEqual(mount, eventMount, 'Mount mismatch');
      assertDataIsEqual(data, eventData, 'Event data mismatch');

      clearTimeout(errTimeouts['mount.*']);
      if (--counter === 0) done();
    });

    // Listen to * wildcard event
    feed.on('*', function(eventName, eventMount, eventData) {
      assert.strictEqual(event, eventName, 'Event name mismatch');
      assert.strictEqual(mount, eventMount, 'Mount mismatch');
      assertDataIsEqual(data, eventData, 'Event data mismatch');

      clearTimeout(errTimeouts['*']);
      if (--counter === 0) done();
    });
  }

  /**
   * Server events
   */
  describe('server.admin', function () {
    it('should emit server.admin, server.* and * events', function (done) {
      setupServerEvent('server.admin', 'admin@example.com', done);
      feed.handleRawEvent('EVENT global admin admin@example.com');
    });
  });

  describe('server.bannedIPs', function () {
    it('should emit server.bannedIPs, server.* and * events', function (done) {
      setupServerEvent('server.bannedIPs', 0, done);
      feed.handleRawEvent('EVENT global banned_IPs 0');
    });
  });

  describe('server.build', function () {
    it('should emit server.build, server.* and * events', function (done) {
      setupServerEvent('server.build', 20150616004931, done);
      feed.handleRawEvent('EVENT global build 20150616004931');
    });
  });

  describe('server.clientConnections', function () {
    it('should emit server.clientConnections, server.* and * events', function (done) {
      setupServerEvent('server.clientConnections', 1029675, done);
      feed.handleRawEvent('EVENT global client_connections 1029675');
    });
  });

  describe('server.clients', function () {
    it('should emit server.clients, server.* and * events', function (done) {
      setupServerEvent('server.clients', 62, done);
      feed.handleRawEvent('EVENT global clients 62');
    });
  });
  
  describe('server.connections', function () {
    it('should emit server.connections, server.* and * events', function (done) {
      setupServerEvent('server.connections', 1178553, done);
      feed.handleRawEvent('EVENT global connections 1178553');
    });
  });
      
  describe('server.fileConnections', function () {
    it('should emit server.fileConnections, server.* and * events', function (done) {
      setupServerEvent('server.fileConnections', 3534, done);
      feed.handleRawEvent('EVENT global file_connections 3534');
    });
  });
        
  describe('server.host', function () {
    it('should emit server.host, server.* and * events', function (done) {
      setupServerEvent('server.host', 'icecast.dev', done);
      feed.handleRawEvent('EVENT global host icecast.dev');
    });
  });

  describe('server.info', function () {
    it('should emit server.info, server.* and * events', function (done) {
      setupServerEvent('server.info', 'full list end', done);
      feed.handleRawEvent('INFO full list end');
    });
  });

  describe('server.listenerConnections', function () {
    it('should emit server.listenerConnections, server.* and * events', function (done) {
      setupServerEvent('server.listenerConnections', 220589, done);
      feed.handleRawEvent('EVENT global listener_connections 220589');
    });
  });

  describe('server.listeners', function () {
    it('should emit server.listeners, server.* and * events', function (done) {
      setupServerEvent('server.listeners', 16, done);
      feed.handleRawEvent('EVENT global listeners 16');
    });
  });

  describe('server.location', function () {
    it('should emit server.location, server.* and * events', function (done) {
      setupServerEvent('server.location', 'RU', done);
      feed.handleRawEvent('EVENT global location RU');
    });
  });

  describe('server.outgoingKBitrate', function () {
    it('should emit server.outgoingKBitrate, server.* and * events', function (done) {
      setupServerEvent('server.outgoingKBitrate', 4411, done);
      feed.handleRawEvent('EVENT global outgoing_kbitrate 4411');
    });
  });

  describe('server.serverId', function () {
    it('should emit server.serverId, server.* and * events', function (done) {
      setupServerEvent('server.serverId', 'Icecast 2.4.0-kh1', done);
      feed.handleRawEvent('EVENT global server_id Icecast 2.4.0-kh1');
    });
  });
 
  describe('server.serverStart', function () {
    it('should emit server.serverStart, server.* and * events', function (done) {
      setupServerEvent('server.serverStart', '06/Jul/2015:00:19:34 +0300', done);
      feed.handleRawEvent('EVENT global server_start 06/Jul/2015:00:19:34 +0300');
    });
  });

  describe('server.sourceClientConnections', function () {
    it('should emit server.sourceClientConnections, server.* and * events', function (done) {
      setupServerEvent('server.sourceClientConnections', 0, done);
      feed.handleRawEvent('EVENT global source_client_connections 0');
    });
  });

  describe('server.sourceRelayConnections', function () {
    it('should emit server.sourceRelayConnections, server.* and * events', function (done) {
      setupServerEvent('server.sourceRelayConnections', 1317, done);
      feed.handleRawEvent('EVENT global source_relay_connections 1317');
    });
  });

  describe('server.sources', function () {
    it('should emit server.sources, server.* and * events', function (done) {
      setupServerEvent('server.sources', 45, done);
      feed.handleRawEvent('EVENT global sources 45');
    });
  });

  describe('server.sourceTotalConnections', function () {
    it('should emit server.sourceTotalConnections, server.* and * events', function (done) {
      setupServerEvent('server.sourceTotalConnections', 1318, done);
      feed.handleRawEvent('EVENT global source_total_connections 1318');
    });
  });

  describe('server.stats', function () {
    it('should emit server.stats, server.* and * events', function (done) {
      setupServerEvent('server.stats', 0, done);
      feed.handleRawEvent('EVENT global stats 0');
    });
  });

  describe('server.statsConnections', function () {
    it('should emit server.statsConnections, server.* and * events', function (done) {
      setupServerEvent('server.statsConnections', 2, done);
      feed.handleRawEvent('EVENT global stats_connections 2');
    });
  });

  describe('server.streamKBytesRead', function () {
    it('should emit server.streamKBytesRead, server.* and * events', function (done) {
      setupServerEvent('server.streamKBytesRead', 2414225600, done);
      feed.handleRawEvent('EVENT global stream_kbytes_read 2414225600');
    });
  });

  describe('server.streamKBytesSent', function () {
    it('should emit server.streamKBytesSent, server.* and * events', function (done) {
      setupServerEvent('server.streamKBytesSent', 1102687068, done);
      feed.handleRawEvent('EVENT global stream_kbytes_sent 1102687068');
    });
  });

  /**
   * Mount events
   */
  describe('mount.audioCodecId', function () {
    it('should emit mount.audioCodecId, mount.* and * events', function (done) {
      setupMountEvent('mount.audioCodecId', '/test.mp3', 2, done);
      feed.handleRawEvent('EVENT /test.mp3 audio_codecid 2');
    });
  });

  describe('mount.audioInfo', function () {
    it('should emit mount.audioInfo, mount.* and * events', function (done) {
      setupMountEvent('mount.audioInfo', '/test.mp3', {
        channels: 2,
        samplerate: 44100,
        bitrate: 64
      }, done);
      feed.handleRawEvent('EVENT /test.mp3 audio_info channels=2;samplerate=44100;bitrate=64');
    });
  });

  describe('mount.authenticator', function () {
    it('should emit mount.authenticator, mount.* and * events', function (done) {
      setupMountEvent('mount.authenticator', '/test.mp3', 'command', done);
      feed.handleRawEvent('EVENT /test.mp3 authenticator command');
    });
  });

  describe('mount.bitrate', function () {
    it('should emit mount.bitrate, mount.* and * events', function (done) {
      setupMountEvent('mount.bitrate', '/test.mp3', 64, done);
      feed.handleRawEvent('EVENT /test.mp3 bitrate 64');
    });
  });

  describe('mount.connected', function () {
    it('should emit mount.connected, mount.* and * events', function (done) {
      setupMountEvent('mount.connected', '/test.mp3', 180423, done);
      feed.handleRawEvent('EVENT /test.mp3 connected 180423');
    });
  });

  describe('mount.delete', function () {
    it('should emit mount.delete, mount.* and * events', function (done) {
      setupMountEvent('mount.delete', '/test.mp3', undefined, done);
      feed.handleRawEvent('DELETE /test.mp3');
    });
  });

  describe('mount.flush', function () {
    it('should emit mount.flush, mount.* and * events', function (done) {
      setupMountEvent('mount.flush', '/test.mp3', undefined, done);
      feed.handleRawEvent('FLUSH /test.mp3');
    });
  });

  describe('mount.genre', function () {
    it('should emit mount.genre, mount.* and * events', function (done) {
      setupMountEvent('mount.genre', '/test.mp3', 'Misc', done);
      feed.handleRawEvent('EVENT /test.mp3 genre Misc');
    });
  });

  describe('mount.incomingBitrate', function () {
    it('should emit mount.incomingBitrate, mount.* and * events', function (done) {
      setupMountEvent('mount.incomingBitrate', '/test.mp3', 127064, done);
      feed.handleRawEvent('EVENT /test.mp3 incoming_bitrate 127064');
    });
  });

  describe('mount.listenerConnections', function () {
    it('should emit mount.listenerConnections, mount.* and * events', function (done) {
      setupMountEvent('mount.listenerConnections', '/test.mp3', 4, done);
      feed.handleRawEvent('EVENT /test.mp3 listener_connections 4');
    });
  });

  describe('mount.listenerPeak', function () {
    it('should emit mount.listenerPeak, mount.* and * events', function (done) {
      setupMountEvent('mount.listenerPeak', '/test.mp3', 2, done);
      feed.handleRawEvent('EVENT /test.mp3 listener_peak 2');
    });
  });

  describe('mount.listeners', function () {
    it('should emit mount.listeners, mount.* and * events', function (done) {
      setupMountEvent('mount.listeners', '/test.mp3', 2, done);
      feed.handleRawEvent('EVENT /test.mp3 listeners 2');
    });
  });

  describe('mount.listenUrl', function () {
    it('should emit mount.listenUrl, mount.* and * events', function (done) {
      setupMountEvent('mount.listenUrl', '/test.mp3', 'http://icecast.dev:80/test.mp3', done);
      feed.handleRawEvent('EVENT /test.mp3 listenurl http://icecast.dev:80/test.mp3');
    });
  });

  describe('mount.maxListeners', function () {
    it('should emit mount.maxListeners, mount.* and * events', function (done) {
      setupMountEvent('mount.maxListeners', '/test.mp3', -1, done);
      feed.handleRawEvent('EVENT /test.mp3 max_listeners -1');
    });
  });

  describe('mount.mpegChannels', function () {
    it('should emit mount.mpegChannels, mount.* and * events', function (done) {
      setupMountEvent('mount.mpegChannels', '/test.mp3', 2, done);
      feed.handleRawEvent('EVENT /test.mp3 mpeg_channels 2');
    });
  });

  describe('mount.mpegSampleRate', function () {
    it('should emit mount.mpegSampleRate, mount.* and * events', function (done) {
      setupMountEvent('mount.mpegSampleRate', '/test.mp3', 44100, done);
      feed.handleRawEvent('EVENT /test.mp3 mpeg_samplerate 44100');
    });
  });

  describe('mount.new', function () {
    it('should emit mount.new, mount.* and * events', function (done) {
      setupMountEvent('mount.new', '/test.mp3', 'audio/mpeg', done);
      feed.handleRawEvent('NEW audio/mpeg /test.mp3');
    });
  });
 
  describe('mount.outgoingKBitrate', function () {
    it('should emit mount.outgoingKBitrate, mount.* and * events', function (done) {
      setupMountEvent('mount.outgoingKBitrate', '/test.mp3', 0, done);
      feed.handleRawEvent('EVENT /test.mp3 outgoing_kbitrate 0');
    });
  });
  
  describe('mount.public', function () {
    it('should emit mount.public, mount.* and * events', function (done) {
      setupMountEvent('mount.public', '/test.mp3', 1, done);
      feed.handleRawEvent('EVENT /test.mp3 public 1');
    });
  });

  describe('mount.queueSize', function () {
    it('should emit mount.queueSize, mount.* and * events', function (done) {
      setupMountEvent('mount.queueSize', '/test.mp3', 65828, done);
      feed.handleRawEvent('EVENT /test.mp3 queue_size 65828');
    });
  });

  describe('mount.serverDescription', function () {
    it('should emit mount.serverDescription, mount.* and * events', function (done) {
      setupMountEvent('mount.serverDescription', '/test.mp3', 'My station description', done);
      feed.handleRawEvent('EVENT /test.mp3 server_description My station description');
    });
  });

  describe('mount.serverName', function () {
    it('should emit mount.serverName, mount.* and * events', function (done) {
      setupMountEvent('mount.serverName', '/test.mp3', 'TestFM', done);
      feed.handleRawEvent('EVENT /test.mp3 server_name TestFM');
    });
  });

  describe('mount.serverType', function () {
    it('should emit mount.serverType, mount.* and * events', function (done) {
      setupMountEvent('mount.serverType', '/test.mp3', 'audio/mpeg', done);
      feed.handleRawEvent('EVENT /test.mp3 server_type audio/mpeg');
    });
  });

  describe('mount.serverUrl', function () {
    it('should emit mount.serverUrl, mount.* and * events', function (done) {
      setupMountEvent('mount.serverUrl', '/test.mp3', 'http://example.com/', done);
      feed.handleRawEvent('EVENT /test.mp3 server_url http://example.com/');
    });
  });

  describe('mount.serverName', function () {
    it('should emit mount.serverName, mount.* and * events', function (done) {
      setupMountEvent('mount.serverName', '/test.mp3', 'TestFM', done);
      feed.handleRawEvent('EVENT /test.mp3 server_name TestFM');
    });
  });    

  describe('mount.slowListeners', function () {
    it('should emit mount.slowListeners, mount.* and * events', function (done) {
      setupMountEvent('mount.slowListeners', '/test.mp3', 0, done);
      feed.handleRawEvent('EVENT /test.mp3 slow_listeners 0');
    });
  });    

  describe('mount.sourceIp', function () {
    it('should emit mount.sourceIp, mount.* and * events', function (done) {
      setupMountEvent('mount.sourceIp', '/test.mp3', 'icecast.dev', done);
      feed.handleRawEvent('EVENT /test.mp3 source_ip icecast.dev');
    });
  });    

  describe('mount.streamStart', function () {
    it('should emit mount.streamStart, mount.* and * events', function (done) {
      setupMountEvent('mount.streamStart', '/test.mp3', '04/Aug/2015:12:00:31 +0300', done);
      feed.handleRawEvent('EVENT /test.mp3 stream_start 04/Aug/2015:12:00:31 +0300');
    });
  });  

  describe('mount.title', function () {
    it('should emit mount.title, mount.* and * events', function (done) {
      setupMountEvent('mount.title', '/test.mp3', 'Werkdiscs - Helena Hauff - Sworn To Secrecy Part II', done);
      feed.handleRawEvent('EVENT /test.mp3 title Werkdiscs - Helena Hauff - Sworn To Secrecy Part II');
    });
  });    

  describe('mount.totalBytesRead', function () {
    it('should emit mount.totalBytesRead, mount.* and * events', function (done) {
      setupMountEvent('mount.totalBytesRead', '/test.mp3', 1443575627, done);
      feed.handleRawEvent('EVENT /test.mp3 total_bytes_read 1443575627');
    });
  });    

  describe('mount.totalBytesSent', function () {
    it('should emit mount.totalBytesSent, mount.* and * events', function (done) {
      setupMountEvent('mount.totalBytesSent', '/test.mp3', 256000, done);
      feed.handleRawEvent('EVENT /test.mp3 total_bytes_sent 256000');
    });
  });    

  describe('mount.totalMBytesSent', function () {
    it('should emit mount.totalMBytesSent, mount.* and * events', function (done) {
      setupMountEvent('mount.totalMBytesSent', '/test.mp3', 0, done);
      feed.handleRawEvent('EVENT /test.mp3 total_mbytes_sent 0');
    });
  });    

  describe('mount.ypCurrentlyPlaying', function () {
    it('should emit mount.ypCurrentlyPlaying, mount.* and * events', function (done) {
      setupMountEvent('mount.ypCurrentlyPlaying', '/test.mp3', 'Nickelback - How You Remind Me', done);
      feed.handleRawEvent('EVENT /test.mp3 yp_currently_playing Nickelback - How You Remind Me');
    });
  });    
});
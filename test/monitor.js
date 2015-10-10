var assert = require('assert');
var fs = require('fs');
var Monitor = require(__dirname + '/../index');

describe('Monitor', function() {

  /**
   * Overrides standard stream creation function.
   *
   * @param {string} urlPath
   * @param {function} callback
   */
  Monitor.prototype.createStatsXmlStream = function(urlPath, callback) {

    var filePath;

    switch(urlPath) {
      case '/admin/stats':
      case '/admin/stats?mount=/test':
        filePath = __dirname + '/stats.xml';
        break;

      case '/admin/listmounts?with_listeners':
        filePath = __dirname + '/listmounts.xml';
        break;  

      default:
        throw new Error('Unsupported url "' + urlPath + '"');
    }

    callback(null, fs.createReadStream(filePath));
  }

  /**
   * @var {Monitor}
   */
  var monitor;

  /**
   * Create new Monitor object for every test
   */
  beforeEach(function() {
    monitor = new Monitor({
      host: 'localhost',
      user: 'admin',
      password: 'hackme'
    });
  });

  afterEach(function() {
    monitor = null;
  });

  /**
   * Test cases
   */
  describe('monitor.getServerInfo', function () {
    it('should return information about server', function (done) {

      monitor.getServerInfo(function(err, data) {

        assert.ifError(err);

        assert.deepEqual({
          admin: 'admin@example.com',
          bannedIPs: 0,
          build: 20150616004931,
          clientConnections: 1383589,
          clients: 56,
          connections: 1532635,
          fileConnections: 4248,
          host: 'icecast.dev',
          listenerConnections: 286175,
          listeners: 9,
          location: 'RU',
          outgoingKBitrate: 1363,
          serverId: 'Icecast 2.4.0-kh1',
          serverStart: '06/Jul/2015:00:19:34 +0300',
          sourceClientConnections: 0,
          sourceRelayConnections: 1745,
          sources: 45,
          sourceTotalConnections: 1745,
          stats: 0,
          statsConnections: 1,
          streamKBytesRead: 3748714817,
          streamKBytesSent: 1678120564 
        }, data, 'Returned information does not match expected results');

        done();

      });
    });
  });

  describe('monitor.getSources', function () {
    it('should return information about sources', function (done) {
      monitor.getSources(function(err, sources) {

        assert.ifError(err);

        assert.deepEqual([{ 
          audioCodecId: 2,
          audioInfo: {
            channels: 2,
            samplerate: 44100,
            bitrate: 128 
          },
          authenticator: 'command',
          bitrate: 128,
          connected: 85218,
          genre: 'Misc',
          incomingBitrate: 128064,
          listenerConnections: 36,
          listenerPeak: 1,
          listeners: 0,
          listenUrl: 'http://icecast.dev:80/test.mp3',
          maxListeners: -1,
          metadataUpdated: '24/Aug/2015:02:07:12 +0300',
          mpegChannels: 2,
          mpegSampleRate: 44100,
          outgoingKBitrate: 0,
          public: 1,
          queueSize: 64784,
          serverDescription: 'My station description',
          serverName: 'TestFM',
          serverType: 'audio/mpeg',
          serverUrl: 'http://example.com/',
          slowListeners: 0,
          sourceIp: 'icecast.dev',
          streamStart: '23/Aug/2015:02:26:52 +0300',
          title: 'Metallica - I Disappear',
          totalBytesRead: 1363644219,
          totalBytesSent: 3789824,
          totalMBytesSent: 3,
          ypCurrentlyPlaying: 'Metallica - I Disappear',
          mount: '/test.mp3'
        }], sources, 'Returned information does not match expected results');

        done();

      });
    });
  });

  describe('monitor.getSource', function () {
    it('should return information about /test source', function (done) {
      monitor.getSource('/test', function(err, source) {

        assert.ifError(err);

        assert.deepEqual({
          audioCodecId: 2,
          audioInfo: {
            channels: 2, 
            samplerate: 44100, 
            bitrate: 128 
          },
          authenticator: 'command',
          bitrate: 128,
          connected: 85218,
          genre: 'Misc',
          incomingBitrate: 128064,
          listenerConnections: 36,
          listenerPeak: 1,
          listeners: [{ 
            id: '1535115',
            ip: '192.168.182.30',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36',
            referer: 'http://example.com/',
            lag: 5643,
            connected: 7895,
            mount: '/test.mp3' 
          }],
          listenUrl: 'http://icecast.dev:80/test.mp3',
          maxListeners: -1,
          metadataUpdated: '24/Aug/2015:02:07:12 +0300',
          mpegChannels: 2,
          mpegSampleRate: 44100,
          outgoingKBitrate: 0,
          public: 1,
          queueSize: 64784,
          serverDescription: 'My station description',
          serverName: 'TestFM',
          serverType: 'audio/mpeg',
          serverUrl: 'http://example.com/',
          slowListeners: 0,
          sourceIp: 'icecast.dev',
          streamStart: '23/Aug/2015:02:26:52 +0300',
          title: 'Metallica - I Disappear',
          totalBytesRead: 1363644219,
          totalBytesSent: 3789824,
          totalMBytesSent: 3,
          ypCurrentlyPlaying: 'Metallica - I Disappear',
          mount: '/test.mp3' 
        }, source, 'Returned information does not match expected results');

        done();

      });
    });
  });

  describe('monitor.getListeners', function () {
    it('should return information about server', function (done) {
      monitor.getListeners(function(err, listeners) {

        assert.ifError(err);

        assert.deepEqual([{
          id: '1541950',
          ip: '192.168.182.30',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36',
          referer: 'http://example.com/',
          lag: 5642,
          connected: 7692,
          mount: '/test.mp3'
        }], listeners, 'Returned information does not match expected results');

        done();

      });
    });
  });

});
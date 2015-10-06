var assert = require('assert');
var fs = require('fs');
var XmlStreamParser = require(__dirname + '/../index').XmlStreamParser;

describe('Monitor.XmlStreamParser', function() {

	describe('server', function () {
    it('should emit server event', function (done) {

    	var actual;
    	var expected = { 
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
			};

    	var xmlParser = new XmlStreamParser();
    	var xmlStream = fs.createReadStream(__dirname + '/stats.xml');

    	xmlParser.on('error', function(err) {
      	assert(false, 'XmlStreamParser error: ' + err);
    	});

    	xmlParser.on('server', function(server) { 
    		actual = server; 
    	});

   	  xmlParser.on('finish', function() {
   	  	assert.deepEqual(actual, expected, 'Event was not fired or data does not match');
      	done();
   	  })

			xmlStream.pipe(xmlParser);
 	 	});
  });

  describe('source', function () {
    it('should emit source event', function (done) {

    	var actual;
    	var expected = { 
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
			};

			var xmlParser = new XmlStreamParser();
    	var xmlStream = fs.createReadStream(__dirname + '/stats.xml');

    	xmlParser.on('error', function(err) {
      	assert(false, 'XmlStreamParser error: ' + err);
    	});

    	xmlParser.on('source', function(source) { 
    		actual = source; 
    	});

   	  xmlParser.on('finish', function() { 
   	  	assert.deepEqual(actual, expected, 'Event was not fired or data does not match');
      	done();
   	  })

			xmlStream.pipe(xmlParser);
    });
  });

describe('listener', function () {
    it('should emit listener event', function (done) {

    	var actual;
    	var expected = { 
    		id: '1541950',
  			ip: '192.168.182.30',
  			userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36',
  			referer: 'http://example.com/',
  			lag: 5642,
  			connected: 7692,
  			mount: '/test.mp3' 
  		};

			var xmlParser = new XmlStreamParser();
    	var xmlStream = fs.createReadStream(__dirname + '/listmounts.xml');

    	xmlParser.on('error', function(err) {
      	assert(false, 'XmlStreamParser error: ' + err);
    	});

    	xmlParser.on('listener', function(listener) { 
    		actual = listener; 
    	});

   	  xmlParser.on('finish', function() { 
   	  	assert.deepEqual(actual, expected, 'Event was not fired or data does not match');
      	done();
   	  })

			xmlStream.pipe(xmlParser);
    });
  });

});
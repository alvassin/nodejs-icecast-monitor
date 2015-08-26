var Param = require(__dirname + '/Param');
var sax = require('sax');

/**
 * Parse server data.
 * Callback will be provided with object containing server data.
 * 
 * @param {stream.Readable} xmlStream
 * @param {function} callback
 */
module.exports.parseServerData = function(xmlStream, callback) {

	/**
	 * Server data
	 * @var {object}
	 */
	var data = {};

	/**
	 * Tags we need to handle. They are used instead of camelCased parameters 
	 * to optimize additional processing during xmlStream parsing.
	 * @var {array}
	 */
	var tags = [
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
	];

	/**
	 * Current depth level
	 * @var {integer}
	 */
	var currentDepth = 0;

	/**
	 * Current tag name
	 * @var {string}
	 */
	var currentTag;

	// Fill data object with null values
	for (var i in tags) {
		var param = Param.normalizeName(tags[i]);
		data[param] = null;
	}

	var saxStream = sax.createStream(true);
	saxStream.on('error', function(error) {
		callback(error);
	});

  saxStream.on('opentag', function (node) {
  	currentDepth++;
  	if ((currentDepth === 2) && (tags.indexOf(node.name) !== -1)) {
  		currentTag = node.name;
  	}
	});

	saxStream.on('text', function (text) {
		if (currentTag) {
			var param = Param.normalizeName(currentTag);
			var value = Param.normalizeData(param, [text]);
			data[param] = value;
		}
  });

	saxStream.on('closetag', function() {
		currentDepth--;
		currentTag = null;
	});

	saxStream.on('end', function(node) {
		callback(null, data);
	});

	xmlStream.pipe(saxStream);
}

/**
 * Parse listeners data.
 * Callback will be provided with array with objects containing listener's data.
 * 
 * @param {stream.Readable} xmlStream
 * @param {function} callback
 */
module.exports.parseListenersData = function(xmlStream, callback) {

	/**
	 * Listeners
	 * @var {array}
	 */
	var listeners = [];

	/**
	 * Tags we need to handle. They are used instead of camelCased parameters 
	 * to optimize additional processing during xmlStream parsing.
	 * @var {array}
	 */
	var tags = [
		'ID',
		'IP',
		'UserAgent',
		'Referer',
		'lag',
		'Connected',
	];

	/**
	 * Current depth level
	 * @var {integer}
	 */
	var currentDepth = 0;

	/**
	 * Current tag name
	 * @var {string}
	 */
	var currentTag;

	/**
	 * Current source mountpoint
	 * @var {string}
	 */
	var currentMount;

	/**
	 * Current listener index
	 * @var {integer}
	 */
	var currentListener = 0;

	var saxStream = sax.createStream(true);
	saxStream.on('error', function(error) {
		callback(error);
	});

  saxStream.on('opentag', function (node) {
  	currentDepth++;

  	switch(currentDepth) {

  		// Sources level
  		case 2:
  			if (node.name === 'source') {
  				currentMount = node.attributes.mount;
  			}
  			break;

  		// Source properies / listeners level
  		case 3:
				if (node.name === 'listener') {
  				if ( ! listeners[currentListener]) {
  					listeners[currentListener] = {
  						mount: currentMount
  					};
  				}
  			}
  			break;

  		// Listener properties level
  		case 4:
  			if (tags.indexOf(node.name) !== -1) {
  				currentTag = node.name;
  			}
  			break;
  	}
	});

	saxStream.on('text', function (text) {
		if (currentTag && currentDepth === 4) {
			var param = Param.normalizeName(currentTag);
			var value = Param.normalizeData(param, [text]);
			listeners[currentListener][param] = value;
		}
  });

	saxStream.on('closetag', function(nodeName) {

		switch(nodeName) {

			case 'source':
				currentMount = null;
				break;

			case 'listener':
				currentListener++;
				break;
		}

		currentDepth--;
		currentTag = null;
	});

	saxStream.on('end', function(node) {
		callback(null, listeners);
	});

	xmlStream.pipe(saxStream);
}

/**
 * Parse sources data.
 * Callback will be provided with array with objects containing listener's data.
 * 
 * @param {stream.Readable} xmlStream
 * @param {function} callback
 */
module.exports.parseSourcesData = function(xmlStream, callback) {

	/**
	 * Sources
	 * @var {array}
	 */
	var sources = [];

	/**
	 * Tags we need to handle. They are used instead of camelCased parameters 
	 * to optimize additional processing during xmlStream parsing.
	 * @var {array}
	 */
	var tags = {
		source : [
			'audio_codecid',
			'audio_info',
			'authenticator',
			'bitrate',
			'connected',
			'genre',
			'incoming_bitrate',
			'listener_connections',
			'listener_peak',
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
		listener : [
			'ID',
			'IP',
			'UserAgent',
			'Referer',
			'lag',
			'Connected',
		]
	};

	/**
	 * Current depth level
	 * @var {integer}
	 */
	var currentDepth = 0;

	/**
	 * Current tag name
	 * @var {string}
	 */
	var currentTag;

	/**
	 * Current source index
	 * @var {integer}
	 */
	var currentSource = 0;

	/**
	 * Current listener index
	 * @var {integer}
	 */
	var currentListener = 0;

	var saxStream = sax.createStream(true);
	saxStream.on('error', function(error) {
		callback(error);
	});

  saxStream.on('opentag', function (node) {
  	currentDepth++;

  	switch(currentDepth) {

  		// Sources level
  		case 2:

  			// Create source instanse, if does not exist
  			if (node.name === 'source' && ! sources[currentSource]) {

  				sources[currentSource] = {
  					mount: node.attributes.mount,
  				};

  				for (var i in tags.source) {
  					var param = Param.normalizeName(tags.source[i]);
  					sources[currentSource][param] = null;
  				}
  			}
  			break;

  		// Source properies / listeners level
  		case 3:

  			// Set source property tag
  			if (tags.source.indexOf(node.name) !== -1) {
  				currentTag = node.name;

  			// Handle new listeners
  			} else if (node.name === 'listener') {
  				if (typeof sources[currentSource].listeners === 'undefined') {
  					sources[currentSource].listeners = [];
  				}

  				if ( ! sources[currentSource]['listeners'][currentListener]) {
  					sources[currentSource]['listeners'][currentListener] = {};
  				}
  			}
  			break;

  		// Listener properties level
  		case 4:
  			if (tags.listener.indexOf(node.name) !== -1) {
  				currentTag = node.name;
  			}
  			break;
  	}
	});

	saxStream.on('text', function (text) {

		if (currentTag) {
			var param = Param.normalizeName(currentTag);
			var value = Param.normalizeData(param, [text]);

			switch(currentDepth) {

				// Source properties level
				case 3:
					sources[currentSource][param] = value;
					break;

				// Listener properties level	
				case 4:
					sources[currentSource]['listeners'][currentListener][param] = value;
					break;
			}
		}
  });

	saxStream.on('closetag', function(nodeName) {

		switch(nodeName) {

			case 'source':
				currentSource++;
				currentListener = 0;
				break;

			case 'listener':
				currentListener++;
				break;
		}

		currentDepth--;
		currentTag = null;
	});

	saxStream.on('end', function(node) {
		callback(null, sources);
	});

	xmlStream.pipe(saxStream);
}
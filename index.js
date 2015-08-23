var Feed = require(__dirname + '/src/Feed');

/**
 * Feed constructor
 */
module.exports.Feed = Feed;

/**
 * Creates stats feed
 * @param {object} config
 * @param {function} callback
 */
module.exports.createFeed = function(config, callback)
{
	try {
		var feed = new Feed(config);
  	feed.connect();
  	callback(null, feed);	
	} catch (err) {
		callback(err);
	}
}

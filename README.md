# Quickstart
[![Build Status](https://travis-ci.org/alvassin/nodejs-icecast-monitor.svg?branch=master)](https://travis-ci.org/alvassin/nodejs-icecast-monitor) [![Code Climate](https://codeclimate.com/github/alvassin/nodejs-icecast-monitor/badges/gpa.svg)](https://codeclimate.com/github/alvassin/nodejs-icecast-monitor) [![Test Coverage](https://codeclimate.com/github/alvassin/nodejs-icecast-monitor/badges/coverage.svg)](https://codeclimate.com/github/alvassin/nodejs-icecast-monitor/coverage)

Powerful & handy interface for icecast-kh monitoring & statistics collection (admin access is required).

* Able to collect icecast stats in realtime;
* Provides easy access to all stats, available in web admin;
* Can deal with very large amounts of data in memory-effective way;
* Has only one npm dependency.

To install latest stable version use `npm install icecast-monitor` command.

* [Options](#options)
* [Methods](#methods)
  * [createFeed](#monitorcreatefeed)
  * [getServerInfo](#monitorgetserverinfo)
  * [getSources](#monitorgetsources)
  * [getSource](#monitorgetsource)
  * [getListeners](#monitorgetlisteners)
  * [createStatsXmlStream](#monitorcreatestatsxmlstream)
* [Feed](#feed)
  * [Events](#events)
  * [Methods](#methods-1)
* [XmlStreamParser](#xmlstreamparser)
  * [Events](#events-1)

# Options

To access icecast monitor features create `Monitor` instance:
```js
var Monitor = require('icecast-monitor');
var monitor = new Monitor({
  host: 'icecast.dev',
  port: 80,
  user: 'admin',
  password: 'hackme'
});
```
Following constructor parameters are available:

Parameter  | Type    | Required | Description
-----------|---------|----------|------------
`host`     | String  | Yes      | IP or DNS name
`port`     | Integer | No       | Port number (defaults to `80`)
`user`     | String  | Yes      | Admin username
`password` | String  | Yes      | Admin password

# Methods
#### monitor.createFeed
Creates [Monitor.Feed](#feed) instance, which establishes persistent connection with icecast & processes its events feed.

```js
monitor.createFeed(function(err, feed) {
  if (err) throw err;
  
  // Handle wildcard events
  feed.on('*', function(event, data, raw) {
    console.log(event, data, raw);
  });

  // Handle usual events
  feed.on('mount.listeners', function(listeners, raw) {
    console.log(listeners, raw);
  });
});
```

#### monitor.getServerInfo
Returns information about icecast server. Please see [Monitor.XmlStreamParser `server` event](#server) data for details.

```js
monitor.getServerInfo(function(err, server) {
  if (err) throw err;
  console.log(server);
});
```

#### monitor.getSources
Returns array with all audio sources (without detailed listeners information). Please see [Monitor.XmlStreamParser `source` event](#source) for data provided about every source.

```js
monitor.getSources(function(err, sources) {
  if (err) throw err;
  console.log(sources);
});
```

#### monitor.getSource
Provides detailed information about specified source & its listeners.

```js
monitor.getSource('/some-mountpoint', function(err, source) {
  if (err) throw err;
  console.log(source);
});
```
Returns same data as [Monitor.XmlStreamParser `source` event](#source), with one difference: `listeners` parameter will contain `array` with [information about every listener](#listener).

#### monitor.getListeners
Returns array with all listeners, connected to icecast server. Please see [Monitor.XmlStreamParser `listener` event](#listener) data for details. *Can produce huge amounts of data, use wisely.*

```js
monitor.getListeners(function(err, listeners) {
  if (err) throw err;
  console.log(listeners);
});
```

#### monitor.createStatsXmlStream
Performs HTTP request to given icecast url path and returns stream for further processing. Can be useful to process large icecast XML output using [Monitor.XmlStreamParser](#xmlstreamparser).

We use following icecast url paths:
* `/admin/stats`
  * icecast server information
  * sources detailed information
  * no detailed listeners information
* `/admin/stats?mount=/$mount`
  * icecast server information
  * specified source information
  * detailed information about connected listeners
* `/admin/listmounts?with_listeners`
  * no information about icecast server
  * minimal information about sources
  * and detailed information about all icecast listeners

```js
// Collect sources without storing them in a memory
monitor.createStatsXmlStream('/admin/stats', function(err, xmlStream) {
  if (err) throw err;
  
  var xmlParser = new Monitor.XmlStreamParser();
 
  xmlParser.on('error', function(err) {
    console.log('error', err); 
  });
  
  xmlParser.on('source', function(source) {
    // Do work with received source
    console.log('source', source);
  });

  // Finish event is being piped from xmlStream
  xmlParser.on('finish', function() {
    console.log('all sources are processed');
  });

  xmlStream.pipe(xmlParser);
});
```

# Feed
Establishes persistent connection with icecast using STATS HTTP method & processes events feed in realtime. Best way to create is to use [monitor.createFeed](#createfeed) method, which injects all necessary parameters.

## Events

For mount.* and server.* events user-callback is provided with following parameters: 

Parameter | Type   | Description
----------|--------|------------
`event`   | String | Event name (present only for wildcard events)
`data`    | Mixed  | Parsed parameter(s), is described for each event below
`raw`     | String | Raw message received from icecast

* **Internal events**
  * `connect`: connection with icecast is established
  * `disconnect`: connection with icecast is closed

* **Wildcard events**
  * `*`: groups absolutely all supported events, produces lots of calls
  * `mount.*`: groups all mount-related events
  * `server.*`: groups all server-related events
   
* **Mounts events**
  * [`mount.audioCodecId`](#mountaudiocodecid)
  * [`mount.audioInfo`](#mountaudioinfo)
  * [`mount.authenticator`](#mountauthenticator)
  * [`mount.bitrate`](#mountbitrate)
  * [`mount.connected`](#mountconnected)
  * [`mount.delete`](#mountdelete)
  * [`mount.flush`](#mountflush)
  * [`mount.genre`](#mountgenre)
  * [`mount.incomingBitrate`](#mountincomingbitrate)
  * [`mount.listenerConnections`](#mountlistenerconnections)
  * [`mount.listenerPeak`](#mountlistenerpeak)
  * [`mount.listeners`](#mountlisteners)
  * [`mount.listenUrl`](#mountlistenurl)
  * [`mount.maxListeners`](#mountmaxlisteners)
  * [`mount.metadataUpdated`](#mountmetadataupdated)
  * [`mount.mpegChannels`](#mountmpegchannels)
  * [`mount.mpegSampleRate`](#mountmpegsamplerate)
  * [`mount.new`](#mountnew)
  * [`mount.outgoingKBitrate`](#mountoutgoingkbitrate)
  * [`mount.public`](#mountpublic)
  * [`mount.queueSize`](#mountqueuesize)
  * [`mount.serverDescription`](#mountserverdescription)
  * [`mount.serverName`](#mountservername)
  * [`mount.serverType`](#mountservertype)
  * [`mount.serverUrl`](#mountserverurl)
  * [`mount.slowListeners`](#mountslowlisteners)
  * [`mount.sourceIp`](#mountsourceip)
  * [`mount.streamStart`](#mountstreamstart)
  * [`mount.title`](#mounttitle)
  * [`mount.totalBytesRead`](#mounttotalbytesread)
  * [`mount.totalBytesSent`](#mounttotalbytessent)
  * [`mount.totalMBytesSent`](#mounttotalmbytessent)
  * [`mount.ypCurrentlyPlaying`](#mountypcurrentlyplaying)
   
* **Server events**
  * [`server.admin`](#serveradmin)
  * [`server.bannedIPs`](#serverbannedips)
  * [`server.build`](#serverbuild)
  * [`server.clientConnections`](#serverclientconnections)
  * [`server.clients`](#serverclients)
  * [`server.connections`](#serverconnections)
  * [`server.fileConnections`](#serverfileconnections)
  * [`server.host`](#serverhost)
  * [`server.info`](#serverinfo)
  * [`server.listenerConnections`](#serverlistenerconnections)
  * [`server.listeners`](#serverlisteners)
  * [`server.location`](#serverlocation)
  * [`server.outgoingKBitrate`](#serveroutgoingkbitrate)
  * [`server.serverId`](#serverserverid)
  * [`server.serverStart`](#serverserverstart)
  * [`server.sourceClientConnections`](#serversourceclientconnections)
  * [`server.sourceRelayConnections`](#serversourcerelayconnections)
  * [`server.sources`](#serversources)
  * [`server.sourceTotalConnections`](#serversourcetotalconnections)
  * [`server.stats`](#serverstats)
  * [`server.statsConnections`](#serverstatsconnections)
  * [`server.streamKBytesRead`](#serverstreamkbytesread)
  * [`server.streamKBytesSent`](#serverstreamkbytessent)

#### mount.audioCodecId
```
EVENT /test.mp3 audio_codecid 2
```

Parameter | Type    | Description
----------|---------|------------
`mount`   | String  | Mountpoint name
`data`    | Integer | Audio codec id: 2 for mp3, 10 for aac

#### mount.audioInfo
Displays audio encoding information.
```
EVENT /test.mp3 audio_info channels=2;samplerate=44100;bitrate=64
```

Parameter         | Type    | Description
------------------|---------|------------
`mount`           | String  | Mountpoint name
`data`            | Object  | Audio channel info
`data.channels`   | Integer | Number of channels
`data.sampleRate` | Integer | Sample rate
`data.bitrate`    | Integer | Bitrate (kbps)

#### mount.authenticator
```
EVENT /test.mp3 authenticator command
```

Parameter | Type   | Description
----------|--------|------------
`mount`   | String | Mountpoint name
`data`    | String | Authenticator type

#### mount.bitrate
```
EVENT /test.mp3 bitrate 64
```

Parameter | Type    | Description
----------|---------|------------
`mount`   | String  | Mountpoint name
`data`    | Integer | Bitrate (kbps), used for stats & YP

#### mount.connected
```
EVENT /test.mp3 connected 180423
```

Parameter | Type    | Description
----------|---------|------------
`mount`   | String  | Mountpoint name
`data`    | Integer | Connection duration in seconds

#### mount.delete
Emitted when mount is deleted. Allows to notify relays about deleted source immediately (rather than wait for polling by the slaves).
```
DELETE /test.mp3
```

Parameter | Type   | Description
----------|--------|------------
`mount`   | String | Deleted mountpoint name

#### mount.flush
```
FLUSH /test.mp3
```

Parameter | Type   | Description
----------|--------|------------
`mount`   | String | Flushed mountpoint name

#### mount.genre
```
EVENT /test.mp3 genre Misc
```

Parameter | Type   | Description
----------|--------|------------
`mount`   | String | Mountpoint name
`data`    | String | Genre name, used for stats & YP

#### mount.incomingBitrate
```
EVENT /test.mp3 incoming_bitrate 127064
```

Parameter | Type    | Description
----------|---------|------------
`mount`   | String  | Mountpoint name
`data`    | Integer | Source bitrate (bps)

#### mount.listenerConnections
```
EVENT /test.mp3 listener_connections 4
```

Parameter | Type    | Description
----------|---------|------------
`mount`   | String  | Mountpoint name
`data`    | Integer | Connections number

#### mount.listenerPeak
```
EVENT /test.mp3 listener_peak 2
```

Parameter | Type    | Description
----------|---------|------------
`mount`   | String  | Mountpoint name
`data`    | Integer | Max detected number of simultaneous listeners

#### mount.listeners
```
EVENT /test.mp3 listeners 2
```

Parameter | Type    | Description
----------|---------|------------
`mount`   | String  | Mountpoint name
`data`    | Integer | Current listeners number

#### mount.listenUrl
```
EVENT /11-31.mp3 listenurl http://icecast.dev:80/test.mp3
```

Parameter | Type   | Description
----------|--------|------------
`mount`   | String | Mountpoint name
`data`    | String | Audio stream url

#### mount.maxListeners
```
EVENT /11-31.mp3 max_listeners -1
```

Parameter | Type    | Description
----------|---------|------------
`mount`   | String  | Mountpoint name
`data`    | Integer | Simultanious listeners limit 

#### mount.metadataUpdated

Is emitted when track is updated.
```
EVENT /test.mp3 metadata_updated 06/Aug/2015:14:05:05 +0300
```

Parameter | Type   | Description
----------|--------|------------
`mount`   | String | Mountpoint name
`data`    | String | Date when metadata was updated

#### mount.mpegChannels
```
EVENT /test.mp3 mpeg_channels 2
```

Parameter | Type    | Description
----------|---------|------------
`mount`   | String  | Mountpoint name
`data`    | Integer | Number of audio channels

#### mount.mpegSampleRate
```
EVENT /test.mp3 mpeg_samplerate 44100
```

Parameter | Type    | Description
----------|---------|------------
`mount`   | String  | Mountpoint name
`data`    | Integer | Sample rate

#### mount.new
Emitted when new mount is created. Allows to notify relays about new source immediately (rather than wait for polling by the slaves).
```
NEW audio/mpeg /229-682.mp3
```

Parameter    | Type   | Description
-------------|--------|------------
`mount`      | String | Mountpoint
`data`       | String | Mime type

#### mount.outgoingKBitrate
```
EVENT /test.mp3 outgoing_kbitrate 0
```

Parameter | Type    | Description
----------|---------|------------
`mount`   | String  | Mountpoint name
`data`    | Integer | Outgoing bitrate (kbps)

#### mount.public
Displays mount visibility (advertisement) setting.
```
EVENT /test.mp3 public 1
```

Parameter | Type    | Description
----------|---------|------------
`mount`   | String  | Mountpoint name
`data`    | Integer | Possible values: `-1` (up to source client / relay) , `0` (disable), `1` (force advertisement)

#### mount.queueSize
```
EVENT /test.mp3 queue_size 65828
```

Parameter | Type    | Description
----------|---------|------------
`mount`   | String  | Mountpoint name
`data`    | Integer | Queue size

#### mount.serverDescription
```
EVENT /test.mp3 server_description My station description
```

Parameter | Type   | Description
----------|--------|------------
`mount`   | String | Mountpoint name
`data`    | String | User-defined station description

#### mount.serverName
```
EVENT /test.mp3 server_name TestFM
```

Parameter | Type   | Description
----------|--------|------------
`mount`   | String | Mountpoint name
`data`    | String | User-defined station name

#### mount.serverType
```
EVENT /test.mp3 server_type audio/mpeg
```

Parameter | Type   | Description
----------|--------|------------
`mount`   | String | Mountpoint name
`data`    | String | Mime type

#### mount.serverUrl
```
EVENT /test.mp3 server_url http://example.com/
```

Parameter | Type   | Description
----------|--------|------------
`mount`   | String | Mountpoint name
`data`    | String | User-defined url

#### mount.slowListeners
```
EVENT /test.mp3 slow_listeners 0
```

Parameter | Type    | Description
----------|---------|------------
`mount`   | String  | Mountpoint name
`data`    | Integer | Slow listeners number

#### mount.sourceIp
```
EVENT /test.mp3 source_ip icecast.dev
```

Parameter | Type   | Description
----------|--------|------------
`mount`   | String | Mountpoint name
`data`    | String | Mounpoint stream source host or ip address 

#### mount.streamStart
```
EVENT /test.mp3 stream_start 04/Aug/2015:12:00:31 +0300
```

Parameter | Type   | Description
----------|--------|------------
`mount`   | String | Mountpoint name
`data`    | String | Date, when mount started streaming

#### mount.title
```
EVENT /test.mp3 title Werkdiscs - Helena Hauff - 'Sworn To Secrecy Part II'
```

Parameter | Type   | Description
----------|--------|------------
`mount`   | String | Mountpoint name
`data`    | String | Track name

#### mount.totalBytesRead
```
EVENT /test.mp3 total_bytes_read 1443575627
```

Parameter | Type    | Description
----------|---------|------------
`mount`   | String  | Mountpoint name
`data`    | Integer | Source (incoming) traffic in bytes

#### mount.totalBytesSent
```
EVENT /test.mp3 total_bytes_sent 256000
```

Parameter | Type    | Description
----------|---------|------------
`mount`   | String  | Mountpoint name
`data`    | Integer | Source (outgoing) traffic in bytes

#### mount.totalMBytesSent
```
EVENT /test.mp3 total_mbytes_sent 0
```

Parameter | Type    | Description
----------|---------|------------
`mount`   | String  | Mountpoint name
`data`    | Integer | Source (outgoing) traffic in bytes

#### mount.ypCurrentlyPlaying
```
EVENT /test.mp3 yp_currently_playing Nickelback - How You Remind Me
```

Parameter | Type   | Description
----------|--------|------------
`mount`   | String | Mountpoint name
`data`    | String | Track, that is displayed in YP

#### server.admin
Displays administrator's email.
```
EVENT global admin email@example.com
```

Parameter | Type   | Description
----------|--------|------------
`data`    | String | Administrator email

#### server.bannedIPs
```
EVENT global banned_IPs 0
```

Parameter | Type    | Description
----------|---------|------------
`data`    | Integer | Banned ip addresses number

#### server.build
```
EVENT global build 20150616004931
```

Parameter | Type    | Description
----------|---------|------------
`data`    | Integer | Build number

#### server.clientConnections
```
EVENT global client_connections 1029675
```

Parameter | Type    | Description
----------|---------|------------
`data`    | Integer | Client connections number

#### server.clients
```
EVENT global clients 62
```

Parameter | Type    | Description
----------|---------|------------
`data`    | Integer | Connected clients

#### server.connections
```
EVENT global connections 1178553
```

Parameter | Type    | Description
----------|---------|------------
`data`    | Integer | Connections number

#### server.fileConnections
```
EVENT global file_connections 3534
```

Parameter | Type    | Description
----------|---------|------------
`data`    | Integer | File connections number

#### server.host
Configuration icecast.hostname setting value. Is used for the stream directory lookups or playlist generation possibily if a Host header is not provided. 
```
EVENT global host icecast.dev
```

Parameter | Type   | Description
----------|--------|------------
`data`    | String | Server DNS name or IP address

#### server.info
Identifies the end of the big list at the beginning. When initially connected, you get a snapshot (a blast of content), and this just marks the end of it. After this then the stats are generated since the snapshot.
```
INFO full list end
```

#### server.listenerConnections
```
EVENT global listener_connections 220589
```

Parameter | Type    | Description
----------|---------|------------
`data`    | Integer | Listener connections number

#### server.listeners
```
EVENT global listeners 16
```

Parameter | Type    | Description
----------|---------|------------
`data`    | Integer | Current listeners number

#### server.location
Configuration icecast.location setting value, is also displayed in web interface.
```
EVENT global location RU
```

Parameter | Type   | Description
----------|--------|------------
`data`    | String | Server location

#### server.outgoingKBitrate
```
EVENT global outgoing_kbitrate 4411
```

Parameter | Type    | Description
----------|---------|------------
`data`    | Integer | Outgoing bitrate (kbps)

#### server.serverId
Icecast server identifier. Can be overrided in config file.
```
EVENT global server_id Icecast 2.4.0-kh1
```

Parameter | Type   | Description
----------|--------|------------
`data`    | String | Server identifier (icecast followed by a version number or user-defined value)

#### server.serverStart
```
EVENT global server_start 06/Jul/2015:00:19:34 +0300
```

Parameter | Type   | Description
----------|--------|------------
`data`    | String | Server start date

#### server.sourceClientConnections
```
EVENT global source_client_connections 0
```

Parameter | Type    | Description
----------|---------|------------
`data`    | Integer | Source client connections number

#### server.sourceRelayConnections
```
EVENT global source_relay_connections 1317
```

Parameter | Type    | Description
----------|---------|------------
`data`    | Integer | Source relay connections number

#### server.sources
```
EVENT global sources 45
```

Parameter | Type    | Description
----------|---------|------------
`data`    | Integer | Sources number

#### server.sourceTotalConnections
```
EVENT global source_total_connections 1318
```

Parameter | Type    | Description
----------|---------|------------
`data`    | Integer | Source total connections number

#### server.stats
```
EVENT global stats 0
```

Parameter | Type    | Description
----------|---------|------------
`data`    | Integer | ?

#### server.statsConnections
```
EVENT global stats_connections 2
```

Parameter | Type    | Description
----------|---------|------------
`data`    | Integer | ?

#### server.streamKBytesRead
```
EVENT global stream_kbytes_read 2414225600
```

Parameter | Type    | Description
----------|---------|------------
`data`    | Integer | Stream incoming traffic (kbytes)

#### server.streamKBytesSent
```
EVENT global stream_kbytes_sent 1102687068
```

Parameter | Type    | Description
----------|---------|------------
`data`    | Integer | Stream outgoing traffic (kbytes)

## Methods

#### feed.connect
Establishes connection, once connected emits `connect` event. If you use [createFeed](#monitorcreatefeed) method, it will call `feed.connect` automatically, so this method can be used to handle disconnects like shown below:
```js
monitor.createFeed(function(err, feed) {
  if (err) throw err;
  
  // Handle disconnects
  feed.on('disconnect', function() {
    feed.connect();
  });
});
```

#### feed.disconnect
Closes icecast connection, once disconnected emits `disconnect` event.
```js
monitor.createFeed(function(err, feed) {
  if (err) throw err;
  feed.on('connect', function() {
    
    // Disconnect with 5 seconds delay
    setTimeout(feed.disconnect, 5000);
  });
});
```

# XmlStreamParser
[Writeable stream](https://nodejs.org/api/stream.html#stream_class_stream_writable), that allows to retrieve sources, listeners & server information from icecast xml stream. Icecast xml stream can be retrieved using [monitor.createStatsXmlStream](#monitorcreatestatsxmlstream) method.

Using XmlStreamParser directly can be more memory-effective when dealing with large icecast output, then using [monitor.getServerInfo](#monitorgetserverinfo), [monitor.getSources](#monitorgetsources), [monitor.getSource](#monitorgetsource) and [monitor.getListeners](#monitorgetlisteners) methods, because those methods have to store information in memory before it is returned in callback.

```js
// Collect sources without storing them in a memory
monitor.createStatsXmlStream('/admin/stats', function(err, xmlStream) {
  if (err) throw err;

  var xmlParser = new Monitor.XmlStreamParser();

  // Handle errors
  xmlParser.on('error', function(err) {
    console.log('error', err); 
  });
  
  // Handle server info
  xmlParser.on('server', function(server) {
    console.log('server', server);
  });
  
  // Handle sources
  xmlParser.on('source', function(source) {
    console.log('source', source);
  });

  // Handle listeners
  xmlParser.on('listener', function(listener) {
    console.log('listener', listener);
  });

  // Xml stream finished
  xmlParser.on('finish', function() {
    console.log('data is finished');
  });

  xmlStream.pipe(xmlParser);
});
```

## Events
* [`error`](#error)
* [`server`](#server)
* [`source`](#source)
* [`listener`](#listener)
* [`finish`](https://nodejs.org/api/stream.html#stream_event_finish)

#### error
Represents error, that happened while parsing xml stream.

#### server
Is emitted when xml stream processing is finished. Returns following information about icecast server:

Parameter                 | Type    | Description
--------------------------|---------|------------
`admin`                   | String  | Administrator's email
`bannedIPs`               | Integer | Banned ip addresses number
`build`                   | Integer | Build number
`clientConnections`       | Integer | Total client (sources, listeners, web requests, etc) connections number
`clients`                 | Integer | Current clients (sources, listeners, web requests, etc) number
`connections`             | Integer | ?
`fileConnections`         | Integer | File connections number
`host`                    | String  | Host DNS or IP address (is defined by `hostname` setting in icecast config)
`listenerConnections`     | Integer | Listeners connections number
`listeners`               | Integer | Listeners number
`location`                | String  | Server location (is defined by `location` setting in icecast config)
`outgoingKBitrate`        | Integer | Outgoing bitrate in Kbps
`serverId`                | String  | Server identifier (is defined by `server-id` setting in icecast config)
`serverStart`             | String  | Server start date
`sourceClientConnections` | Integer | Source clients connections number
`sourceRelayConnections`  | Integer | Source relays connections number
`sources`                 | Integer | Sources (mountpoints) number
`sourceTotalConnections`  | Integer | Total connections number
`stats`                   | Integer | Number currently connected clients using STATS HTTP method (like [Monitor.Feed](#feed)
`statsConnections`        | Integer | STATS HTTP method total connections number
`streamKBytesRead`        | Integer | Streaming incoming traffic (KB)
`streamKBytesSent`        | Integer | Streaming outgoing traffic (KB)

#### source
Is emitted when source processing is finished. Returns following information for every source:

Parameter             | Type    | Description
----------------------|---------|------------
`mount`               | String  | Mountpoint
`audioCodecId`        | Integer | Audio codec id: 2 for mp3, 10 for aac
`audioInfo`           | String  | Audio encoding information
`authenticator`       | String  | Authentication scheme
`bitrate`             | Integer | User-defined bitrate (Kbps)
`connected`           | Integer | Connected time in seconds
`genre`               | String  | User-defined genre
`incomingBitrate`     | Integer | Source stream bitrate (bps)
`listenerConnections` | Integer | Listener connections number
`listenerPeak`        | Integer | Maximum detected number of simultaneous users 
`listeners`           | Integer | Current listeners number
`listenUrl`           | String  | Audio stream url
`maxListeners`        | Integer | Listeners limit
`metadataUpdated`     | String  | Last metadata update date
`mpegChannels`        | Integer | Mpeg channels number
`mpegSampleRate`      | Integer | Mpeg sample rate
`outputKBitrate`      | Integer | Outgoing bitrate for all listeners (Kbps)
`public`              | Integer | Source advertisement: `-1` - source client or relay determines if mountpoint should be advertised, `0` - disables advertisement, `1` - forces advertisement
`queueSize`           | Integer | Can vary (typically) because lagging clients cause the size to increase until they either get kicked off or they catch up
`serverDescription`   | String  | User-defined description
`serverName`          | String  | User-defined name
`serverType`          | String  | Mime type
`serverUrl`           | String  | User-defined url
`slowListeners`       | Integer | Slow listeners number
`sourceIp`            | String  | Source ip address
`streamStart`         | String  | Date, when stream started
`title`               | String  | Track name
`totalBytesRead`      | Integer | Incoming traffic
`totalBytesSent`      | Integer | Outgoing traffic (Bytes)
`totalMBytesSent`     | Integer | Outgoing traffic (MBytes)
`ypCurrentlyPlaying`  | String  | YP track title

#### listener
Is emitted when listener processing is finished. Returns following information for every listener:

Parameter   | Type    | Description
------------|---------|------------
`id`        | Integer | Icecast internal id, can be used to kick listeners, move them between mounts, etc.
`ip`        | String  | Listener's ip address
`userAgent` | String  | Listener's user agent
`referrer`  | String  | Url, where listener came from
`lag`       | Integer | ?
`connected` | Integer | Connected time in seconds
`mount`     | String  | Source mounpoint


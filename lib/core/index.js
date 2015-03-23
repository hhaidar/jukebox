'use strict';

var _ = require('underscore'),
    ytdl = require('ytdl-core'),
    through = require('through2'),
    ffmpeg = require('fluent-ffmpeg');

function Jukebox() {

    this.clients = [];

    this.stream = through({autoDestroy: false});

    this.stream.on('data', _.bind(this.onData, this));

    this.stream.on('end', _.bind(this.onEnd, this));
    
}

Jukebox.prototype.onEnd = function(data) {

    this.play(this.lastPlayed);
    
}

Jukebox.prototype.onData = function(data) {

    console.log(data);

    this.clients.forEach(function(client) {
        client.res.write(data);
    }); 

}

Jukebox.prototype.add = function(uri) {

}

Jukebox.prototype.play = function(uri) {

    var that = this;
    
    this
    
    this.fetch(uri, function(err, info, mp3) {

        that.lastPlayed = uri;

        mp3.writeToStream(that.stream);
        
    });

}

Jukebox.prototype.fetch = function(uri, cb) {

    ytdl.getInfo(uri, function(err, info) {

        if (err) {
            console.log(err);
            typeof cb === 'function' && cb(err);
            return;
        }

        var video = ytdl.downloadFromInfo(info, {
            filter: function(format) {
                return format.container === 'mp4';
            },
            quality: 'highest'
        })

        var mp3 = new ffmpeg({
            source: video
        }).toFormat('mp3');

        typeof cb === 'function' && cb(null, info, mp3);

    });

}

module.exports = Jukebox;
/*
 * hehe
 */

var _ = require('underscore'),
    hat = require('hat'),
    ytdl = require('ytdl-core'),
    express = require('express'),
    ffmpeg = require('fluent-ffmpeg'),
    through = require('through2'),
    lame = require('lame'),
    Speaker = require('speaker')
    Throttle = require('throttle'),
    Progress = require('progress');

var uri = 'https://www.youtube.com/watch?v=N9XKLqGqwLA';

var app = express();

var clients = [];

var stream = through(),
    decoder = new lame.Decoder(),
    speaker = new Speaker();

var video = ytdl(uri, {
    filter: function(format) {
        return format.container === 'mp4';
    },
    quality: 'highest'
});

var mp3 = new ffmpeg({
    source: video
}).toFormat('mp3');

video.on('info', function(info) {

    var bar = new Progress(info.title + ' [:bar] :current / :total', {
        total: parseInt(info.length_seconds),
        width: 50
    });
    
    var timer = setInterval(function(){
        bar.tick();
        if (bar.complete) {
            clearInterval(timer);
        }
    }, 1 * 1000);

    mp3.writeToStream(stream);

    stream
        .pipe(new Throttle((128000 / 10) * 1.3))
        .on('data', function(data) {
            clients.forEach(function(client) {
                client.res.write(data);
            }); 
        })
        .pipe(decoder)
        .pipe(speaker);

});

app.get('/stream', function(req, res) {

    var id = hat();

    res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Connection': 'close',
        'Transfer-Encoding': 'identity'
    });

    clients.push({
        id: id,
        req: req,
        res: res
    });

    req.connection.on('close', function(){
        clients = _.without(clients, _.findWhere(clients, {
            id: id
        }));
    });

});

app.listen(5000);
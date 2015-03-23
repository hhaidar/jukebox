'use strict';

var _ = require('underscore'),
    hat = require('hat'),
    express = require('express');

var Core = require('./lib/core');

var jukebox = new Core();

jukebox.add('https://www.youtube.com/watch?v=WhUhe1X_Y-Q');
jukebox.add('https://www.youtube.com/watch?v=DB1TJ-XVTQg');
jukebox.add('https://www.youtube.com/watch?v=jzNazllJqlk');
jukebox.add('https://www.youtube.com/watch?v=fVH1tMdg56Q');
jukebox.add('https://www.youtube.com/watch?v=9LrkTrFDlew');

jukebox.play('https://www.youtube.com/watch?v=9LrkTrFDlew');

// jukebox.play('https://www.youtube.com/watch?v=4Jx6siXBe6Y');

var app = express();

app.use('/', express.static(__dirname + '/client'));

app.get('/stream', function(req, res) {

    var id = hat();

    res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Connection': 'close',
        'Transfer-Encoding': 'identity'
    });

    jukebox.clients.push({
        id: id,
        req: req,
        res: res
    });

    req.connection.on('close', function(){
        jukebox.clients = _.without(jukebox.clients, _.findWhere(jukebox.clients, {
            id: id
        }));
    });

});

app.listen(5000);
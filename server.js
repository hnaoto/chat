// JavaScript Document

var mongo = require('mongodb').MongoClient;
var client = require('socket.io').listen(8080).sockets;
mongo.connect('mongodb://127.0.0.1/chat', function (err, db) {
    if (err) throw err;
    
    
    client.on('connection', function (socket) {
        //db collection
        var col = db.collection('messages');
        var sendStaus = function (s) {
                socket.emit('status', s);
        };

        //emit all messages
        col.find().limit(100).sort({_id: 1}).toArray(function(err, res) {
            if (err) throw err;
            socket.emit('output', res);

        });

        socket.on('input', function (data) {
     
            var name = data.name;
            var message = data.message;
            var whitespacePattern = /^\s*$/;

            if (whitespacePattern.test(name) || whitespacePattern.test(message)) {
                sendStaus('Name and message is required.');
            } else {

                col.insert({ name: name, message: message }, function () {

                    //emit latest message to all clients
                    client.emit('output', [data]);

                    sendStaus({
                        message: "Message sent",
                        clear: true
                    });

                });
            }
        });


    });


});


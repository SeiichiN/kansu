// tarai_server.js
// tarai関数を計算するサーバ側コード
var net = require('net');
var localhost = '127.0.0.1';

var tarai = (x, y, z) => {
    if (x > y) {
        return tarai(tarai(x - 1, y, z),
                     tarai(y - 1, z, x),
                     tarai(z - 1, x, y));
    } else {
        return y;
    }
};

net.createServer((socket) => {
    // dataイベントハンドラ
    socket.on('data', (incomingData) => {
        // クライアントからのデータを数値に変換する
        var number = parseInt(incomingData, 10);
        console.log(number);
        // tarai関数を計算してクライアントに返す
        socket.write(number + ': ' + tarai(number * 2, number, 0) + '\r\n');
    });
    // closeイベントハンドラ
    socket.on('close', (error) => {
        console.log('connection closed.');
    });
}).listen(3000, localhost);

var http = require("http");
var fs = require("fs");

http.createServer(function(regq, res) {
    fs.readFile("build/index.html", function(err, content) {
        if (err) {
            res.write(404, {"Content-Type":"text/plain"});
            res.write("index.html: no such file\n ");
        }
        else {
            res.writeHead(200, {"Content-Type":"text/html; charset=utf-8"});
            res.write(content);
        }
        res.end();
    });
}).listen(8000);
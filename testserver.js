const http = require("http");

const requestListener = function (req, res) {
  setTimeout(() => {
    res.writeHead(200);
    res.end("Hello, World!");
  }, 50);
};

const server = http.createServer(requestListener);
server.listen(8888);

// 终端打印如下信息
console.log("Server running at http://127.0.0.1:8888/");

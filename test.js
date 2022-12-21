const WebApiBench = require('./');


var workbench = new WebApiBench({
  url: "http://127.0.0.1:8888/",
  vuser: 200,
  timeSpace: 2,
  runSecs: 5 * 60,
  slowStart: true,
});

workbench.start();

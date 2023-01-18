const WebApiBench = require("./");

const fs = require("fs");

var workbench = new WebApiBench({
  url: "http://127.0.0.1:8888/",
  vuser: 50,
  timeSpace: 2,
  runSecs: 5 * 60,
  slowStart: true,
  slowStartTime: 60,
});

workbench.on("report", function (data) {
  fs.writeFileSync("./report/chartdata.json", JSON.stringify(data, null, 2));
});

workbench.start();

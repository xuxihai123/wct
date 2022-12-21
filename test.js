const WebApiBench = require('./');

const fs = require('fs');


var workbench = new WebApiBench({
//   url: "http://127.0.0.1:8888/",
url: "http://115.182.90.205:30344/a11y/text2speech?speed=50&text=abcdefghahfsf&volume=100&access_token=9527c6704e5945798231b80775e36c64&vendor=iflytek&channelId=pweb",

  vuser: 50,
  timeSpace: 2,
  runSecs: 5 * 60,
  slowStart: true,
  slowStartTime: 60,
});

workbench.on('report',function(data){
    fs.writeFileSync("./report/chartdata.json",JSON.stringify(data,null,2));
})

workbench.start();

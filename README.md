## wct

web concurrency test 


## example

```js
var workbench = new WebApiBench({
  url: "http://127.0.0.1:8888/",
  vuser: 10, // concurrency
  timeSpace: 2, // 
  runSecs: 5 * 60, // runing time
  slowStart: true, // slow start vuser
});

workbench.start();
```
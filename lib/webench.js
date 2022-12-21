const chalk = require("chalk");
const axios = require("axios");
const http = require("http");
const EventEmitter = require("events");

const timeoutPromise = (time) =>
  new Promise((resolve) => setTimeout(resolve, time));
class WebApiBench extends EventEmitter {
  constructor(opts) {
    super();
    this.opts = opts;
    this.slowStart = opts.slowStart;
    this.slowStartTime = opts.slowStartTime||30;
    this.url = opts.url;
    this.vuser = opts.vuser || 100;
    this.timeSpace = opts.timeSpace || 2;
    this.runSecs = opts.runSecs || 5 * 60;
  }
  prepareStage() {
    this.__isFinished = false;
    this.__tps = 0;
    this.__startTime = Date.now();
    this.__finishTime = this.__startTime + this.runSecs * 1000;
    this.__testResult = {
      time: "00:00",
      total: 0,
      success: 0,
      failed: 0,
      avgTps: 0,
      minTime: 1000 * 300,
      maxTime: 0,
      chartData: [],
    };
    this.__labels = {};
    this.__chartData = {
      runtime: this.runSecs,
      space: this.timeSpace,
      values: [],
    };
  }
  analyseWorker() {
    const interId = setInterval(() => {
      if (this.__isFinished) {
        clearInterval(interId);
      } else {
        this.checkTps();
        this.emit('report',this.__chartData);
      }
    }, 1000);
  }
  checkTps() {
    const time = Date.now();
    if (time >= this.__finishTime) {
      this.__isFinished = true;
    }
    const testResult = this.__testResult;
    const chartdata = this.__chartData;
    const timeOffset = ~~((time - this.__startTime) / 1000);
    const isPoint = timeOffset % this.timeSpace;
    if (isPoint === 0) {
      this.__tps = Math.round(testResult.success / timeOffset);
      const tps = this.__tps;
      testResult.avgTps = tps;
      const minute = ~~(timeOffset / 60);
      const sec = timeOffset % 60;
      const minuteStr = minute > 9 ? minute : "0" + minute;
      const secStr = sec > 9 ? sec : "0" + sec;
      testResult.time = minuteStr + ":" + secStr;
      if (!this.__labels[testResult.time]) {
        this.__labels[testResult.time] = 1;
        chartdata.values.push({ time: testResult.time, value: tps });
      }
    }
  }
  setupAgent() {
    this.agents = new Map();
    [...Array(this.vuser).keys()].forEach((temp) => {
      this.agents.set(`agent${temp}`, new http.Agent({ keepAlive: true }));
    });
  }

  async taskCreate(key) {
    //   const email = "test_" + number + "@csii.com.cn";
    //   const password = "csii2019";
    const testResult = this.__testResult;
    testResult.total++;
    const start = Date.now();
    if (this.__isFinished) {
      return;
    }
    const self = this;
    const httpAgent = this.agents.get(`agent${key}`);
    const testUrl = self.url;
    return axios
      .get(testUrl, { httpAgent })
      .then((resp) => {
        if (resp.status === 200) {
          testResult.success++;
          //   this.emit("status", testResult);
          self.printStatus(testResult, start);
          setImmediate(() => self.taskCreate(key));
        } else {
          throw Error("fail " + resp.responseText);
        }
      })
      .catch((err) => {
        testResult.failed++;
        console.log(err.message);
        // this.emit("status", testResult);
        self.printStatus(testResult, start);
        setImmediate(() => self.taskCreate(key));
      });
  }
  async start() {
    this.prepareStage();
    this.setupAgent();
    this.analyseWorker();
    //   await setupSession();
    let promises = [];
    this.__taskPromises = promises;
    // console.log(this.vuser);
    let keys = [...Array(this.vuser).keys()];
    if (this.slowStart) {
      let oneloopCount = Math.ceil(keys.length / this.slowStartTime);
      // console.log(oneloopCount);
      while (keys.length > 0) {
        // console.log(keys.length)
        let list = keys.splice(0, oneloopCount);
        // console.log(list.length);
        for (const temp of list) {
          promises.push(this.taskCreate(temp));
        }
        await timeoutPromise(1000);
      }
    } else {
      promises = keys.map((key) => this.taskCreate(key));
    }
    await Promise.all(promises);
  }
  printStatus(loginResult, starttime) {
    if (!this.numOfLinesToClear) {
      this.numOfLinesToClear = true;
    } else {
      process.stdout.moveCursor(0, -1);
    }

    var usagetime = Date.now() - starttime;
    if (loginResult.minTime > usagetime) {
      loginResult.minTime = usagetime;
    }
    if (loginResult.maxTime < usagetime) {
      loginResult.maxTime = usagetime;
    }

    const result = [
      `time: ${chalk.blue(loginResult.time)}`,
      `vuser: [set:${this.vuser}, started:${chalk.blue(
        this.__taskPromises.length
      )}]`,
      `tasks: ${chalk.green(loginResult.total)} `,
      `success: ${chalk.green(loginResult.success)} `,
      `failed: ${chalk.red(loginResult.failed)} `,
      `avgTps: ${chalk.blue(loginResult.avgTps)}/s `,
      `min:${loginResult.minTime}ms,max:${loginResult.maxTime}ms`,
    ];
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`${result.join("  ")} \n`);
  }
}

module.exports = WebApiBench;

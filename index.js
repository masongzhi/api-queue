/**
 * 维持请求队列，当请求标志为true时执行
 * @type {{finishMap: {}, finish(*): void, run(): void, list: Array, restList: Array, push(*=): void}}
 */
const queue = {
  list: [],
  restList: [],
  finishMap: {},
  finish(apiName) {
    this.finishMap[apiName] = true;
    Promise.resolve().then(() => this.run());
  },
  push(item) {
    this.list.push(item);
  },
  run() {
    if (this.list.length > 0) {
      const item = this.list.shift();
      if (this.finishMap[item.apiName]) {
        item.resolve();
      } else {
        this.restList.push(item);
      }
      this.run();
    } else {
      [this.list, this.restList] = [this.restList, this.list];
    }
  },
  wait(apiName) {
    return new Promise((resolve) => {
      if (!queue.finishMap[apiName]) {
        queue.push({
          resolve,
          apiName
        });
      } else {
        queue.run();
        resolve();
      }
    });
  }
};
export default queue;

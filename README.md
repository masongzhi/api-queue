# api-queue
用于应对vue或react开发时，A组件使用a接口，B组件使用b接口，同时b接口需要a接口先执行，然后把数据储存到store。

![image](https://user-images.githubusercontent.com/19945145/124723857-0af92a80-df3e-11eb-9e4e-3295875cae6d.png)

这样的好处在于，俩个组件间有依赖需求的接口不需要重复调用，也不需要做复杂的数据交互，只需要在执行前加上`await apiQueue('xxx')`即可。


## USAGE
> npm install api-queue


### 以vue做示范
```javascript
// A组件
import api from '@/services';
import { mapActions } from 'vuex';

export default {
    methods: {
        ...mapActions(['setAData']),
        async getData() {
            const data = await api.a();
            this.setAData(data);
        }
    },
    created() {
        this.getData();
    }
}
```

```javascript
// B组件
import api from '@/services';
import { mapState } from 'vuex';
import apiQueue from 'apiQueue';

export default {
    computed: mapState(['aData']),
    methods: {
        ...mapActions(['setAData']),
        async getData() {
            await apiQueue.wait('a');
            await api.b({
                data: this.aData
            });
        }
    },
    created() {
        this.getData();
    }
}
```

```javascript
// store
import Vue from 'vue';
import Vuex from 'vuex';
import api from '@services';

Vue.use(Vuex);

const state = {
    aData: {}
}

const actions = {
    async setAData({ commit }, data) {
        commit('SET_A_DATA', data);
    },
}

const mutations = {
  SET_A_DATA(s, val) {
    s.aData = val;
  }
}

export default new Vuex.Store({
  state,
  actions,
  mutations
});

```

```javascript
// services
import xhr, { get, post } from 'XHR-AXIOS';
import apiQueue from 'apiQueue';

const delayPost = (url, data) => {
    const apiName = url.split('/').pop();
    apiQueue.push(apiName);
    return post(url, data).then(d => d, (e) => {
        queue.finish(apiName);
        return Promise.reject(e);
    });
};

const delayGet = (url, data) => {
  const apiName = url.split('/').pop();
  apiQueue.push(apiName);
  return get(url, data).then(d => d, (e) => {
    queue.finish(apiName);
    return Promise.reject(e);
  });
};

export default {
  a: data => delayGet('/a', data),
  b: data => delayPost('/b', data)
};
```
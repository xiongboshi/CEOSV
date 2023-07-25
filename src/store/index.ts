import { createStore } from 'vuex'

export default createStore({
  state: {
    name: '小那',
    age: 18
  },
  getters: {
    updateName (state) {
      if (state.age > 30) return '小王';
      return '小那'
    }
  },
  mutations: {
    SET_AGE(state,count) {
      state.age += count;
    }
  },
  actions: {
  },
  modules: {
  }
})

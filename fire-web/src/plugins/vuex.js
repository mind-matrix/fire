import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'

Vue.use(Vuex)

const vuexLocal = new VuexPersist({
  key: 'fire-web',
  storage: window.localStorage
})

export default new Vuex.Store({
  state: {
    auth: {
      token: null
    },
    mic: null,
    srapi: {
      enabled: false,
      accuracy: 0.85
    },
    theme: {
      dark: false
    },
    logs: {
      error: {
        graphqlError: [],
        networkError: []
      }
    }
  },
  mutations: {
    updateToken (state, { token }) {
      state.auth.token = token
    },
    removeToken (state) {
      state.auth.token = null
    },
    setEnableSRAPI (state, enabled) {
      state.srapi.enabled = enabled
    },
    setSRAPIAccuracy (state, accuracy) {
      state.srapi.accuracy = accuracy
    },
    setDarkTheme (state, enabled) {
      if (enabled) {
        state.theme.dark = true
      } else {
        state.theme.dark = false
      }
    },
    appendLog (state, { type, subtype, error }) {
      state.logs[type][subtype].push(error)
    },
    setMic (state, deviceId) {
      state.mic = deviceId
    }
  },
  plugins: [vuexLocal.plugin]
})

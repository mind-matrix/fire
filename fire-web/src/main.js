import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router/index.js'
import vuetify from './plugins/vuetify.js'
import './plugins/vuebar.js'
import './plugins/vue-moment.js'
import './plugins/vue-worker.js'
import './plugins/vue-konva.js'
import store from './plugins/vuex.js'
import apolloProvider from './plugins/apollo-client.js'

Vue.config.productionTip = false

new Vue({
  router,
  vuetify,
  apolloProvider,
  store,
  /* apolloProvider, */
  render: h => h(App)
}).$mount('#app')

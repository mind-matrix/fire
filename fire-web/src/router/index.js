import Vue from 'vue'
import VueRouter from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import store from '../plugins/vuex'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: { name: 'console' }
  },
  {
    name: 'login',
    path: '/login',
    component: Login
  },
  {
    name: 'register',
    path: '/register',
    component: Register
  },
  {
    path: '/dashboard',
    component: Dashboard,
    children: [
      { name: 'console', path: '/', component: () => import('../components/Modules/Console.vue') },
      {
        name: 'lectureConsole',
        path: 'lecture',
        component: () => import('../components/Modules/LectureConsole/LectureConsole.vue'),
        beforeEnter (to, from, next) {
          if (from.name === 'console') {
            next()
          } else {
            next({ name: 'console' })
          }
        },
        props: true
      },
      {
        name: 'testConsole',
        path: 'test',
        component: () => import('../components/Modules/TestConsole/TestConsole.vue'),
        beforeEnter (to, from, next) {
          if (from.name === 'console') {
            next()
          } else {
            next({ name: 'console' })
          }
        },
        props: true
      },
      {
        name: 'lsiTestConsole',
        path: 'lsi',
        component: () => import('../components/Modules/LSITestConsole/LSITestConsole.vue'),
        beforeEnter (to, from, next) {
          if (from.name === 'console') {
            next()
          } else {
            next({ name: 'console' })
          }
        },
        props: true
      }
    ]
  },
  {
    path: '/faq',
    name: 'faq',
    component: () => import('../views/FAQ.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/Settings.vue')
  },
  {
    path: '/management',
    name: 'management',
    component: () => import('../views/Management.vue')
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: () => import('../views/Analytics.vue')
  },
  {
    path: '/issues',
    name: 'issues',
    component: () => import('../views/Issues.vue')
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (!store.state.auth.token && to.name !== 'login' && to.name !== 'register') {
    next({ name: 'login' })
  } else if (store.state.auth.token && (to.name === 'login' || to.name === 'register')) {
    next(false)
  } else {
    next()
  }
})

export default router

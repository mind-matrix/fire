<template>
  <v-app>
    <v-app-bar app clipped-left color="primary" :dark="$vuetify.theme.dark">
      <v-app-bar-nav-icon v-show="$store.state.auth.token" @click='nav.drawer = !nav.drawer' />
      <span class='title ml-3 mr-5'>
        FIRE&nbsp;
        <span class='font-weight-light'>Web</span>
      </span>
      <v-autocomplete @click:prepend-inner="SetRoute(nav.query)" label="Search" v-model="nav.query" :items="nav.links" item-text="title" item-value="route" :filter="SearchFilter" solo-inverted flat hide-details prepend-inner-icon='fas fa-search' />
      <v-spacer />
    </v-app-bar>
    <v-navigation-drawer
      v-show="$store.state.auth.token"
      v-model="nav.drawer"
      color="primary"
      :dark="$vuetify.theme.dark"
      app
      clipped >
      <v-list>
        <v-list-item>
          <v-list-item-icon>
            <v-avatar color="secondary darken-1">
              <template v-if="me.dp.id">
                <img
                  :src="`http://localhost/document?id=${me.dp.id}`"
                  :alt="me.alias"
                />
              </template>
              <template v-else>
                <span class="white--text headline">{{ me.alias }}</span>
              </template>
            </v-avatar>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ me.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-for="item in nav.links"
          :key="item.title"
          link
          @click="SetRoute(item.route)"
        >
          <v-list-item-icon v-if="!item.divider">
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content v-if="!item.divider">
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
          <v-divider v-if="item.divider"></v-divider>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn @click="Logout" class="secondary darken-3 white--text" block>Logout</v-btn>
        </div>
      </template>
    </v-navigation-drawer>
    <v-content>
      <router-view></router-view>
    </v-content>
    <v-overlay :value="loading">
      <v-container>
        <v-progress-circular
          indeterminate
          :size="32"
          :width="4"
          color="primary"
        >
          <v-icon>fas fa-cell</v-icon>
        </v-progress-circular>
      </v-container>
    </v-overlay>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import gql from 'graphql-tag'

export default Vue.extend({
  name: 'App',

  methods: {
    SetRoute (name) {
      if (this.$router.currentRoute.name !== name) {
        this.$router.push({ name: name })
      }
    },
    Logout () {
      this.$store.commit('removeToken')
      this.$router.push({ name: 'login' })
    }
  },

  apollo: {
    me: {
      query: gql`{
        me: Faculty {
          Name
          Username
          DisplayPicture {
            filename
            mimetype
            encoding
            id
          }
        }
      }`,
      update: data => ({
        name: data.me.Name,
        username: data.me.Username,
        alias: data.me.Name.split(' ').map(v => v.substr(0, 1)).join(''),
        dp: data.me.DisplayPicture || { filename: null, mimetype: null, encoding: null, id: null }
      })
    }
  },

  computed: {
    SearchFilter () {
      if (this.nav.query == null) {
        return undefined
      }
      return (item, queryText) => item.indexOf(queryText) > -1
    }
  },

  components: {
  },

  data () {
    return {
      me: {
        name: null,
        alias: null,
        username: null,
        dp: {
          filename: null,
          mimetype: null,
          encoding: null,
          id: null
        }
      },
      nav: {
        drawer: false,
        links: [
          { title: 'Dashboard', icon: 'fas fa-fire-alt', route: 'console' },
          { title: 'Management', icon: 'fas fa-clipboard', route: 'management' },
          { divider: true },
          { title: 'Analytics', icon: 'fas fa-home', route: 'analytics' },
          { title: 'Settings', icon: 'fas fa-cogs', route: 'settings' },
          { divider: true },
          { title: 'Report Issue', icon: 'fas fa-bug', route: 'issues' },
          { title: 'FAQs', icon: 'fas fa-info', route: 'faq' }
        ],
        query: null
      },
      loading: false
    }
  }
})
</script>

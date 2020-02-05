<template>
  <v-list>
    <v-list-item v-for="(task, index) in tasks" :key="index">
      <v-list-item-icon>
        <v-icon :v-text="ModuleIcons[task.Module]" />
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>
          {{ task.Module }}
        </v-list-item-title>
        <v-list-item-subtitle>
          ({{ task.State }})
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
import gql from 'graphql-tag'

export default {
  apollo: {
    tasks: {
      query: gql`query {
        tasks: AllTasks {
          _id
          Module
          Start
          Room {
            Name
          }
          State
        }
      }`
    }
  },
  data () {
    return {
      tasks: []
    }
  }
}
</script>

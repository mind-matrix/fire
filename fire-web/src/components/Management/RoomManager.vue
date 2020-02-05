<template>
  <v-list>
    <v-list-item v-for="(room, index) in rooms" :key="index">
      <v-list-item-icon>
        <v-icon :color="room.Available ? 'green' : 'red'">fas fa-circle</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>
          {{ room.Name }}
        </v-list-item-title>
        <v-list-item-subtitle>
          Capacity - {{ room.Capacity }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
import gql from 'graphql-tag'

export default {
  apollo: {
    rooms: {
      query: gql`query {
        rooms: AllRooms {
          _id
          Name
          Available
          Capacity
        }
      }`
    }
  },
  data () {
    return {
      rooms: []
    }
  }
}
</script>

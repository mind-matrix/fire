<template>
  <v-card flat outlined>
    <v-card-title>
      Class View
    </v-card-title>
    <v-card-text>
      <perfect-scrollbar>
        <div class="viewContainer">
          <v-row v-for="(row, ri) in room.Layout" v-bind:key="ri" dense>
            <v-col class="d-flex flex-row" :cols="12">
              <div v-for="(seat, ci) in row" v-bind:key="ci">
                <template v-if="seat.Seat && seat.Occupant && seat.Occupant._id">
                  <v-tooltip v-if="seat.Occupant !== null" top>
                    <template v-slot:activator="{ on }">
                      <v-img
                        :src="GetOccupantIcon(seat.Occupant)"
                        class="ma-1"
                        contain
                        height="30"
                        width="30"
                        v-on="on">
                      </v-img>
                    </template>
                    <v-card color="transparent" flat outlined>
                      <v-list-item>
                        <v-list-item-avatar color="grey"></v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title class="headline">{{seat.Occupant.Identifier}}</v-list-item-title>
                          <v-list-item-subtitle>{{seat.Occupant.Name}}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                      <v-card-text>
                        <seating-view :layout="room.Layout" :history="seat.Occupant.SeatingHistory" />
                      </v-card-text>
                    </v-card>
                  </v-tooltip>
                </template>
                <template v-else-if="seat.Seat">
                  <v-img
                    :src="require(`../../../assets/seat-${$vuetify.theme.dark ? 'dark' : 'light'}.svg`)"
                    class="ma-1"
                    contain
                    height="30"
                    width="30">
                  </v-img>
                </template>
                <template v-else>
                  <v-spacer class="ma-1" style="height: 30px; width: 30px;" />
                </template>
              </div>
            </v-col>
          </v-row>
        </div>
      </perfect-scrollbar>
    </v-card-text>
  </v-card>
</template>

<script>
import gql from 'graphql-tag'
import SeatingView from './SeatingView.vue'

export default {
  props: {
    id: String
  },
  components: {
    SeatingView
  },
  methods: {
    GetOccupantIcon (occupant) {
      if (occupant.ModuleData && occupant.ModuleData.LSI) {
        if (occupant.ModuleData.LSI.Category === 'activist') {
          return require('../../../assets/smartphone-red.svg')
        } else if (occupant.ModuleData.LSI.Category === 'pragmatist') {
          return require('../../../assets/smartphone-yellow.svg')
        } else if (occupant.ModuleData.LSI.Category === 'reflector') {
          return require('../../../assets/smartphone-green.svg')
        } else if (occupant.ModuleData.LSI.Category === 'theorist') {
          return require('../../../assets/smartphone-blue.svg')
        }
      }
      return require(`../../../assets/smartphone-${this.$vuetify.theme.dark ? 'dark' : 'light'}.svg`)
    }
  },
  apollo: {
    room: {
      query: gql`query ($id:ID!) {
        room: Room (_id:$id) {
          _id
          Name
          Capacity
          Layout {
            Seat
            Occupant {
              _id
              Name
              Identifier
              Active
              SeatingHistory (room_id: $id) {
                Room {
                  Name
                }
                Row
                Column
              }
              DisplayPicture {
                filename
                mimetype
                encoding
                id
              }
            }
          }
        }
      }`,
      variables () {
        return {
          id: this.id
        }
      },
      subscribeToMore: {
        document: gql`subscription ($id:ID) {
          room: roomSub (_id:$id) {
            Layout {
              Seat
              Occupant {
                _id
                Name
                Identifier
                Active
                SeatingHistory (room_id: $id) {
                  Room {
                    Name
                  }
                  Row
                  Column
                }
                DisplayPicture {
                  filename
                  mimetype
                  encoding
                  id
                }
              }
            }
          }
        }`,
        variables () {
          return {
            id: this.id
          }
        },
        updateQuery: (oldVal, { newVal }) => {
          oldVal.Layout = newVal.Layout
        }
      }
    }
  },
  data () {
    return {
      room: {
        _id: null,
        Name: null,
        Capacity: null,
        SeatingHistory: [],
        Layout: []
      }
    }
  }
}
</script>

<style scoped>
.viewContainer {
  max-height: 100%;
  width: 100%;
  max-width: 100%;
}
</style>

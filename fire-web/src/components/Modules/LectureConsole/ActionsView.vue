<template>
  <v-card flat outlined>
    <v-card-title>
      Actions
    </v-card-title>
    <v-card-text v-if="event !== null && event !== undefined">
      <v-list>
        <v-list-item v-for="(action, index) in GetActions(event)" v-bind:key="index">
          <v-btn :color="action.color" @click="TriggerAction(action.action, action.data)" outlined>
            <v-icon left>{{ action.icon }}</v-icon>
            {{ action.title }}
          </v-btn>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    event: Object
  },
  methods: {
    GetActions (event) {
      var actions = []
      if (['EVENT_DOUBT', 'EVENT_EXPLAIN', 'EVENT_REPEAT'].includes(event.Descriptor)) {
        actions.push({ color: 'green', title: 'Listen', icon: 'fas fa-volume-up', action: 'listen', data: event })
        if (!event.Data || !event.Data.SoftDelete) {
          actions.push({ color: 'blue', title: 'Clear', icon: 'fas fa-eraser', action: 'clear', data: event })
        }
      } else if (event.Descriptor === 'EVENT_CLEAR' && (!event.Data || !event.Data.SoftDelete)) {
        actions.push({ color: 'yellow', title: 'Revert', icon: 'fas fa-redo', action: 'revert', data: event })
      }
      return actions
    },
    TriggerAction (action, data) {
      this.$emit(action, data)
    }
  },
  data () {
    return {}
  }
}
</script>

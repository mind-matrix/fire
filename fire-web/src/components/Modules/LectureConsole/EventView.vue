<template>
  <v-card flat outlined>
    <v-card-title>
      Events
    </v-card-title>
    <v-card-subtitle>
      <v-checkbox v-model="showAll" @change="Reset" label="SHOW ALL" />
    </v-card-subtitle>
    <v-card-text>
      <perfect-scrollbar :options="{ suppressScrollX: true }">
        <v-list max-height="200">
          <v-list-item-group v-model="event" @change="Update">
            <v-list-item v-for="(event, index) in Filter(data)" v-bind:key="index" :value="event">
                <v-list-item-action>
                  <v-list-item-action-text>
                    {{ event.Timestamp | moment("from","now") }}
                  </v-list-item-action-text>
                </v-list-item-action>
                <v-badge color="red" overlap right>
                  <template v-slot:badge>
                    <span v-if="event.Data && event.Data.SoftDelete">cleared</span>
                  </template>
                  <v-list-item-content>
                    <v-list-item-title v-text="event.Student ? event.Student.Identifier : 'Faculty'" />
                    <v-list-item-subtitle v-text="event.Descriptor" />
                  </v-list-item-content>
                </v-badge>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </perfect-scrollbar>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    data: Array
  },
  methods: {
    Filter (data) {
      data = data.filter(v => ['EVENT_DOUBT', 'EVENT_EXPLAIN', 'EVENT_REPEAT', 'EVENT_CLEAR'].includes(v.Descriptor) && (v.Descriptor !== 'EVENT_CLEAR' || !v.Data || !v.Data.SoftDelete))
      if (this.showAll) {
        return data
      } else {
        return data.filter(v => !v.Data || !v.Data.SoftDelete)
      }
    },
    Update () {
      this.$emit('update', Object.assign({}, this.event))
    },
    Reset () {
      this.event = null
      this.Update()
    }
  },
  data () {
    return {
      event: null,
      showAll: false
    }
  }
}
</script>

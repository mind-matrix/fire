<template>
  <div class="mx-auto d-inline">
    <v-icon left>
      fas fa-clock
    </v-icon>
    {{ timerDisplay }}
  </div>
</template>

<script>
import moment from 'moment'

export default {
  props: {
    startTime: String
  },
  data () {
    return {
      timer: {
        id: null,
        start: null,
        current: null,
        diff: null
      }
    }
  },
  computed: {
    timerDisplay: function () {
      if (this.timer.diff) {
        return this.timer.diff.format('HH:mm:ss')
      }
      return '00:00:00'
    }
  },
  mounted () {
    this.timer.id = setInterval(() => {
      this.timer.diff = moment.utc(moment() - moment(this.startTime))
    }, 1 * 1000)
  }
}
</script>

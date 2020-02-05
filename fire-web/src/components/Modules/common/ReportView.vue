<template>
  <v-card flat outlined>
    <v-card-title>
      Reports
    </v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item v-for="(item, index) in report" v-bind:key="index">
          <template v-if="item.divider">
            <v-divider />
          </template>
          <template v-else-if="item.subheader">
            <v-subheader v-text="item.name" />
          </template>
          <template v-else>
            <v-list-item-icon v-if="item.icon">
              <v-icon :color="item.iconColor || undefined" v-text="item.icon" />
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-if="item.name" v-text="item.name" />
              <v-list-item-subtitle v-if="item.value !== null && item.value !== undefined" v-text="item.value"/>
            </v-list-item-content>
            <v-list-item-icon v-if="item.trend !== null && item.trend !== undefined">
              <v-icon :color="GetColor(item.trend)" v-text="GetIcon(item.trend)" right />
            </v-list-item-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    events: Array
  },
  methods: {
    GetColor (trend) {
      if (trend === 0) {
        return 'blue'
      } else if (trend > 0) {
        return 'green'
      } else {
        return 'red'
      }
    },
    GetIcon (trend) {
      if (trend === 0) {
        return 'fas fa-minus'
      } else if (trend > 0) {
        return 'fas fa-sort-up'
      } else {
        return 'fas fa-sort-down'
      }
    },
    Update (events) {
      this.worker.postMessage('GENERATE_REPORT', [events]).then((report) => {
        for (var [key, val] in Object.entries(report)) {
          if (key.startsWith('active')) {
            this.report[key].trend = Math.sign(val - this.report[key].value)
          }
          this.report[key].value = val
        }
        this.report = this.report
      })
    }
  },
  data () {
    return {
      report: {
        h1: { subheader: true, name: 'Active' },
        activeRepeats: { icon: 'fas fa-redo', name: 'Repeats', value: 0, trend: 0 },
        activeExplains: { icon: 'fas fa-chalkboard-teacher', name: 'Explains', value: 0, trend: 0 },
        activeDoubts: { icon: 'fas fa-question-circle', name: 'Doubts', value: 0, trend: 0 },
        h2: { subheader: true, name: 'Aggregate' },
        aggregateRepeats: { icon: 'fas fa-redo', name: 'Repeats', value: 0 },
        aggregateExplains: { icon: 'fas fa-chalkboard-teacher', name: 'Explains', value: 0 },
        aggregateDoubts: { icon: 'fas fa-question-circle', name: 'Doubts', value: 0 }
      },
      worker: null
    }
  },
  created () {
    this.worker = this.$worker.create([
      {
        message: 'GENERATE_REPORT',
        func: (args) => ({
          activeRepeats: args.filter(v => v.Descriptor === 'REPEAT' && !v.Data.SoftDelete),
          activeDoubts: args.filter(v => v.Descriptor === 'DOUBT' && !v.Data.SoftDelete),
          activeExplains: args.filter(v => v.Descriptor === 'EXPLAIN' && !v.Data.SoftDelete),
          aggregateRepeats: args.filter(v => v.Descriptor === 'REPEAT'),
          aggregateDoubts: args.filter(v => v.Descriptor === 'DOUBT'),
          aggregateExplains: args.filter(v => v.Descriptor === 'EXPLAIN')
        })
      }
    ])
  }
}
</script>

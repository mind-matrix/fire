<template>
  <v-container>
    <v-stage ref="stage" :config="config.stage">
      <v-layer ref="layer1">
        <v-arrow :config="{ points: [10, height - 10, 10, 10], strokeWidth: 2, stroke: 'white', fill: 'white' }" />
        <v-arrow :config="{ points: [10, height - 10, width - 10, height - 10], strokeWidth: 2, stroke: 'white', fill: 'white' }" />
        <v-arrow :config="{ points: [10, height/2, width - 10, height/2], strokeWidth: 2, stroke: 'white', fill: 'white' }" />
        <v-line ref="wave1" :config="config.wave1" />
        <v-group :config="{ x: 0, y: 0 }" ref="annotation" />
      </v-layer>
      <v-layer ref="layer2">
        <v-line ref="wave2" :config="config.wave2" />
      </v-layer>
    </v-stage>
  </v-container>
</template>

<script>
import Konva from 'konva'
export default {
  props: {
    width: Number,
    height: Number,
    scale: Number
  },
  methods: {
    updatePoints (amplitudes) {
      var data = amplitudes.map((v, i) => [ i * this.scale, v ]).flat(1)
      this.wave1.points(data)
      this.wave2.points(data)
      // this.wave2.points(new Array(data.length).fill(10))
      if (amplitudes.length >= this.width / this.scale) {
        this.labels.forEach((label, index, arr) => {
          label.move({ x: -this.scale, y: 0 })
          if (label.x() < 0) {
            label.destroy()
            arr.splice(index, 1)
          } else {
            this.layer1.batchDraw()
          }
        })
      }
      this.stage.draw()
    },
    addAnnotation (annotation) {
      var tag = new Konva.Tag({
        fill: annotation.type === 'note' ? 'yellow' : 'blue',
        pointerDirection: annotation.type === 'note' ? 'none' : 'down',
        pointerWidth: 10,
        pointerHeight: 10,
        lineJoin: 'round',
        shadowColor: 'black',
        shadowBlur: 3,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowOpacity: 0.5
      })
      var text = new Konva.Text({
        text: annotation.text.length > 8 ? annotation.text.substring(0, 8) + '...' : annotation.text,
        fontFamily: 'Calibri',
        fontSize: 14,
        padding: 5,
        fill: annotation.type === 'note' ? 'black' : 'white'
      })
      var label = new Konva.Label({
        x: ((this.wave1.points().length / 2) >= (this.width / this.scale) ? this.width : (annotation.timediff / 50)),
        y: this.height / 4
      })
      if (annotation.text.length > 8) {
        label.on('mouseover', () => {
          text.text(annotation.text)
          this.layer1.batchDraw()
        })
        label.on('mouseout', () => {
          text.text(annotation.text.substring(0, 8) + '...')
          this.layer1.batchDraw()
        })
      }
      label.add(tag)
      label.add(text)
      this.labels.push(label)
      this.annotation.add(label)
    }
  },
  data () {
    return {
      stage: null,
      wave1: null,
      wave2: null,
      annotation: null,
      layer1: null,
      layer2: null,
      labels: [],
      config: {
        stage: {
          width: this.width,
          height: this.height
        },
        wave1: {
          points: [],
          stroke: 'white',
          x: 10,
          strokeWidth: 2,
          tension: 0.5
        },
        wave2: {
          points: [],
          stroke: 'yellow',
          x: 10,
          strokeWidth: 2,
          tension: 0.5,
          y: 100 - 10
        }
      }
    }
  },
  mounted () {
    this.stage = this.$refs.stage.getNode()
    this.wave1 = this.$refs.wave1.getNode()
    this.wave2 = this.$refs.wave2.getNode()
    this.annotation = this.$refs.annotation.getNode()
    this.layer1 = this.$refs.layer1.getNode()
    this.layer2 = this.$refs.layer2.getNode()
  }
}
</script>

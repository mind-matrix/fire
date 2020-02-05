<template>
  <v-container ref="stageContainer" class="container">
    <v-stage ref="stage" :config="{ width: stageWidth, height: stageHeight }">
      <v-layer ref="layer">
      </v-layer>
    </v-stage>
  </v-container>
</template>

<style scoped>
  .container {
    width: 200px;
    height: 200px;
    border: 1px solid #000;
  }
</style>

<script>
import Konva from 'konva'

export default {
  props: {
    layout: Array,
    history: Array,
    stageWidth: {
      type: Number,
      default: 300
    },
    stageHeight: {
      type: Number,
      default: 240
    }
  },
  methods: {
    FitStageIntoParentContainer () {
      // now we need to fit stage into parent
      var containerWidth = this.$refs.stageContainer.offsetWidth
      // to do this we need to scale the stage
      var scale = containerWidth / this.stageWidth
      this.stage.width(this.stageWidth * scale)
      this.stage.height(this.stageHeight * scale)
      this.stage.scale({ x: scale, y: scale })
      this.stage.draw()
    },
    UpdateGrid () {
      this.layer.removeChildren()
      for (var i = 0; i < this.layout.length; i++) {
        for (var j = 0; j < this.layout[i].length; j++) {
          if (this.layout[i][j].Seat) {
            let seat
            if (this.history.findIndex(v => v.Row === i && v.Column === j) !== -1) {
              seat = new Konva.Image({
                width: 20,
                height: 20,
                x: j * 25,
                y: i * 25,
                image: this.image.active
              })
            } else {
              seat = new Konva.Image({
                width: 20,
                height: 20,
                x: j * 25,
                y: i * 25,
                image: this.image.inactive
              })
            }
            this.layer.add(seat)
          }
        }
      }
      this.layer.batchDraw()
    }
  },
  data () {
    return {
      layer: null,
      stage: null,
      image: {
        active: null,
        inactive: null
      }
    }
  },
  mounted () {
    var active = new window.Image()
    active.src = require(`@/assets/smartphone-purple.svg`)
    active.onload = () => {
      this.image.active = active
    }
    var inactive = new window.Image()
    inactive.src = require(`@/assets/seat-${this.$vuetify.theme.dark ? 'light' : 'dark'}.svg`)
    inactive.onload = () => {
      this.image.inactive = inactive
    }
    this.stage = this.$refs.stage.getNode()
    this.layer = this.$refs.layer.getNode()
    this.FitStageIntoParentContainer()
    this.UpdateGrid()
    window.addEventListener('resize', this.FitStageIntoParentContainer)
  }
}
</script>

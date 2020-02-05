<template>
  <v-container ref="stageContainer" class="px-2 py-2" fluid>
    <v-row dense>
      <v-col cols="12">
        <v-text-field
          v-model="name"
          label="Room Name"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-text-field
          v-model="config.rows"
          label="Row Count"
          type="number"
          @change="UpdateGrid"
        />
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="config.cols"
          label="Column Count"
          type="number"
          @change="UpdateGrid"
        />
      </v-col>
    </v-row>
    <v-stage ref="stage" :config="{ draggable: true }">
      <v-layer ref="roomLayer">
      </v-layer>
    </v-stage>
    <v-btn @click="CreateRoom" color="primary">create</v-btn>
    <v-btn @click="ResetRoom" text color="secondary">cancel</v-btn>
    <v-snackbar
      v-model="snackbar.active"
      :timeout="2000"
    >
      {{ snackbar.message }}
      <v-btn
        color="blue"
        text
        @click="snackbar.active = false"
      >
        okay
      </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import gql from 'graphql-tag'
import Konva from 'konva'

export default {
  props: {
    cw: {
      type: Number,
      default: 20
    },
    ch: {
      type: Number,
      default: 20
    },
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
    CreateRoom () {
      // Create a room
      var children = this.layer.getChildren()
      if (this.name && children.length > 0) {
        var layout = []
        for (var i = 0; i < this.config.rows; i++) {
          layout.push([])
          for (var j = 0; j < this.config.cols; j++) {
            layout[i].push({
              Seat: children[i + j].image() === this.image.active
            })
          }
        }
        this.$apollo.mutate({
          mutation: gql`mutation ($name:String!, $layout:[[CellInput!]!]!) {
            room: AddRoom(input:{ Name:$name, Layout:$layout }) {
              _id
              Name
            }
          }`,
          variables: {
            name: this.name,
            layout: layout
          }
        }).then(({ data }) => {
          console.log(data)
          this.snackbar.message = `Created Room: ${data.room.Name}`
          this.snackbar.active = true
        })
      } else {
        this.snackbar.message = `Error: Insufficient Input`
        this.snackbar.active = true
      }
    },
    ResetRoom () {
      this.config.rows = 0
      this.config.cols = 0
      this.name = null
      this.UpdateGrid()
    },
    UpdateGrid () {
      var activeImage = this.image.active
      var inactiveImage = this.image.inactive
      this.layer.removeChildren()
      for (var i = 0; i < this.config.rows; i++) {
        for (var j = 0; j < this.config.cols; j++) {
          var seat = new Konva.Image({
            x: j * (this.cw + 5),
            y: i * (this.ch + 5),
            width: this.cw,
            height: this.ch,
            image: inactiveImage
          })
          seat.on('click', function () {
            if (this.image() === activeImage) {
              this.image(inactiveImage)
            } else {
              this.image(activeImage)
            }
            this.draw()
          })
          this.layer.add(seat)
        }
      }
      this.layer.batchDraw()
    }
  },
  data () {
    return {
      name: null,
      config: {
        rows: 0,
        cols: 0
      },
      image: {
        active: null,
        inactive: null
      },
      stage: null,
      layer: null,
      snackbar: {
        active: false,
        message: null
      }
    }
  },
  mounted () {
    var active = new window.Image()
    active.src = require(`@/assets/seat-${this.$vuetify.theme.dark ? 'dark' : 'light'}.svg`)
    active.onload = () => {
      this.image.active = active
    }
    var inactive = new window.Image()
    inactive.src = require(`@/assets/seat-${this.$vuetify.theme.dark ? 'light' : 'dark'}.svg`)
    inactive.onload = () => {
      this.image.inactive = inactive
    }
    this.stage = this.$refs.stage.getNode()
    this.layer = this.$refs.roomLayer.getNode()
    this.FitStageIntoParentContainer()
    window.addEventListener('resize', this.FitStageIntoParentContainer)
  }
}
</script>

<template>
  <v-container fluid>
    <template v-show="ready">
      <audio-view ref="audioView"
        :width="audio.config.view.width"
        :height="audio.config.view.height"
        :scale="audio.config.view.scale"
      />
    </template>
    <template v-if="!ready">
      <v-skeleton-loader
        ref="skeleton"
        type="card"
        class="mx-auto"
      ></v-skeleton-loader>
    </template>
    <v-dialog
      v-model="selectMicDialog"
      max-width="400"
      persistent
    >
      <v-card class="pa-2">
        <v-card-title>Audio Input</v-card-title>
        <v-card-subtitle>Select an audio input device</v-card-subtitle>
        <v-list>
          <v-list-item-group
            v-model="micSelected"
            mandatory
          >
            <v-list-item
              v-for="(mic, i) in audioinputs"
              :key="i"
              :value="mic.deviceId"
            >
              <v-list-item-icon>
                <v-icon
                  v-text="mic.deviceId === 'default' ? 'fas fa-volume-up': 'fas fa-microphone'"
                >
                </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="mic.label"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
        <v-card-actions>
          <v-btn @click="OnMicSelect" color="primary">
            save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import AudioView from './AudioView'

import nlp from 'compromise'
import nlpSentences from 'compromise-sentences'
import percentile from 'percentile'
nlp.extend(nlpSentences)

function map (value, fromMax, fromMin, toMax, toMin) {
  return toMin + (((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin))
}

export default {
  props: {
    autoAnnotation: {
      type: Boolean,
      default: false
    }
  },
  components: {
    AudioView
  },
  methods: {
    CleanUp () {
      if (this.autoAnnotation) {
        this.annotation.recognizer.stop()
      }
      clearInterval(this.audio.analyser.loopId)
      clearInterval(this.annotation.transcriptor)
      this.worker = null
    },
    async SetupAudioInput () {
      var inputs = await navigator.mediaDevices.enumerateDevices()
      this.audioinputs = inputs.filter(v => v.kind === 'audioinput')
      console.log(this.$store.state.mic)
      if (this.$store.state.mic && this.audioinputs.findIndex(v => v.deviceId === this.$store.state.mic) !== -1) {
        return true
      } else {
        this.selectMicDialog = true
        return false
      }
    },
    OnMicSelect () {
      this.$store.commit('setMic', this.micSelected)
      this.selectMicDialog = false
      this.Setup()
    },
    Setup () {
      this.SetupAudioDisplay().then((done) => {
        if (done) {
          if (this.autoAnnotation) {
            this.SetupAutoAnnotation().then((done) => {
              if (done) {
                this.ready = true
                this.$refs.audioView.addAnnotation({ type: 'note', text: 'Microphone Active', timediff: 2000 })
              }
            })
          } else {
            this.ready = true
            this.readyTime = Date.now()
          }
        }
      })
    },
    async SetupAudioDisplay () {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        var stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: this.$store.state.mic
          },
          video: false
        })
        let analyser
        var context = new AudioContext()
        analyser = context.createAnalyser()
        var source = context.createMediaStreamSource(stream)
        source.connect(analyser)
        this.audio.analyser.loopId = setInterval(() => {
          var tempTimeBuffer = new Uint8Array(analyser.frequencyBinCount)
          analyser.getByteFrequencyData(tempTimeBuffer)
          var computed = tempTimeBuffer.reduce((a, v) => a > v ? a : v)
          this.audio.buffer.push(map(computed, 255, 0, 0, this.audio.config.view.height / 2))
          if (this.audio.buffer.length > this.audio.config.view.width / this.audio.config.view.scale) {
            this.audio.buffer.splice(0, 1)
          }
          this.$refs.audioView.updatePoints(this.audio.buffer)
          if (this.nextLabel) {
            this.$refs.audioView.addAnnotation(this.nextLabel)
            this.nextLabel = null
          }
        }, 50)
        return true
      } catch (e) {
        console.error(e)
        return false
      }
    },
    async SetupAutoAnnotation () {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        this.annotation.recognizer = new SpeechRecognition()
        this.annotation.recognizer.lang = 'en-US'
        this.annotation.recognizer.onspeechstart = () => {
          console.log('SRAPI STARTED')
          // TODO: SRAPI On Start
        }
        this.annotation.recognizer.onend = () => {
          console.log('SRAPI ENDED')
          this.annotation.recognizer.start()
          // TODO: SRAPI On Stop
        }
        this.annotation.recognizer.onerror = function (event) {
          console.log('SRAPI ERROR: ' + event.error)
          // TODO: SRAPI On Error
        }
        this.annotation.recognizer.onresult = (event) => {
          var current = event.resultIndex
          var result = event.results[current][0]
          var transcript = result.transcript
          if (result.confidence > this.$store.state.srapi.accuracy) {
            this.nextLabel = {
              type: 'transcript',
              text: nlp(transcript).normalize().out('text'),
              timediff: event.timeStamp - this.readyTime
            }
          }
          console.log(this.nextLabel)
        }
        this.annotation.recognizer.start()
        return true
      } catch (e) {
        console.error(e)
        return false
      }
    }
  },
  data () {
    return {
      selectMicDialog: false,
      audioinputs: [],
      micSelected: this.$store.state.mic,
      audio: {
        config: {
          maxBufferSize: 100,
          view: {
            width: 600,
            height: 200,
            scale: 1
          }
        },
        analyser: {
          sketch: null,
          loopId: null
        },
        buffer: []
      },
      annotation: {
        run: false,
        transcriptor: null,
        recognizer: null,
        transcripts: [],
        tags: []
      },
      worker: null,
      ready: false,
      readyTime: null,
      nextLabel: null
    }
  },
  mounted () {
    window.nlp = nlp
    window.percentile = percentile
    this.SetupAudioInput().then((done) => {
      if (done) {
        this.Setup()
      }
    })
    /*  */
  },
  beforeDestroy () {
    this.CleanUp()
  },
  beforeRouteLeave () {
    this.CleanUp()
  }
}
</script>

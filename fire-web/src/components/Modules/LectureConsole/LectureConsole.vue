<template>
  <v-app>
    <v-card class="px-2">
      <v-row>
        <v-col cols="12" md="4">
          <v-card outlined>
            <v-card-title>Overview</v-card-title>
            <v-card-text>
              <timer-view :startTime="task.Start" />
            </v-card-text>
            <v-card-actions>
              <v-dialog v-model="endLectureDialog" max-width="400px">
                <template v-slot:activator="{ on }">
                  <v-btn color="red" v-on="on" elevation="0" class="my-2">
                    <v-icon left>
                      fas fa-stopwatch
                    </v-icon>
                    end test
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title>End Lecture?</v-card-title>
                  <v-card-subtitle>
                    The lecture will end and data will be stored.
                  </v-card-subtitle>
                  <v-card-actions>
                    <v-btn color="red" @click="[EndLecture(), endLectureDialog = false]">
                      <v-icon left>
                        fas fa-stopwatch
                      </v-icon>
                      end test
                    </v-btn>
                    <v-btn color="grey" @click="endLectureDialog = false">
                      cancel
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" md="8">
          <audio-cap ref="audioCap" :autoAnnotation="config.useSRAPI" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="4">
          <report-view ref="reportView" :data="task.Object.StudentEvents" />
        </v-col>
        <v-col cols="12" md="8">
          <class-view v-if="task.Room._id" :id="task.Room._id" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="4">
          <actions-view @clear="OnActionViewClear" @revert="OnActionViewRevert" :event="actionEvent" />
        </v-col>
        <v-col cols="12" md="4">
          <event-view ref="eventView" :data="task.Object.StudentEvents.concat(task.Object.FacultyEvents)" @update="OnEventViewUpdate" />
        </v-col>
        <v-col cols="12" md="4">
          <resource-view :data="task.Object.FacultyEvents" @upload="OnResourceViewUpload" />
        </v-col>
      </v-row>
    </v-card>
  </v-app>
</template>

<script>
import AudioCap from './AudioCap.vue'
import ReportView from '../common/ReportView'
import ClassView from '../common/ClassView'
import EventView from './EventView'
import ResourceView from './ResourceView'
import ActionsView from './ActionsView'
import TimerView from '../common/TimerView'

import gql from 'graphql-tag'

export default {
  props: {
    id: String
  },
  components: {
    AudioCap,
    ReportView,
    ClassView,
    EventView,
    ResourceView,
    ActionsView,
    TimerView
  },
  methods: {
    OnEventViewUpdate (event) {
      this.actionEvent = event
    },
    OnActionViewClear (event) {
      var id = this.id
      console.log(event)
      this.$apollo.mutate({
        mutation: gql`mutation ($id: ID!, $ref_id:ID!) {
          event: AddEvent (Task_id: $id, input: { Descriptor: "EVENT_CLEAR", Data: { Reference_id: $ref_id } }) {
            ...on FacultyEvent {
              _id
              Descriptor
              Data
              Document {
                filename
                mimetype
                encoding
                id
              }
              Timestamp
            }
          }
        }`,
        variables: {
          id: id,
          ref_id: event._id
        }
      }).then(({ data }) => {
        var studentEvent = this.task.Object.StudentEvents.find(v => v._id === event._id)
        studentEvent.Data = studentEvent.Data || {}
        studentEvent.Data.SoftDelete = true
        this.task.Object.FacultyEvents.push(data.event)
        this.$refs.eventView.Reset()
      })
    },
    OnActionViewRevert (event) {
      console.log(event)
      this.$apollo.mutate({
        mutation: gql`mutation ($id: ID!,$ref_id:ID!) {
          event: AddEvent (Task_id:$id, input: { Descriptor: "EVENT_CLEAR_REVERT", Data: { Reference_id: $ref_id } }) {
            ...on FacultyEvent {
              _id
              Descriptor
              Data
              Document {
                filename
                mimetype
                encoding
                id
              }
              Timestamp
            }
          }
        }`,
        variables: {
          id: this.id,
          ref_id: event._id
        }
      }).then(({ data }) => {
        this.task.Object.FacultyEvents.push(data.event)
        var facultyEvent = this.task.Object.FacultyEvents.find(v => v._id === event._id)
        facultyEvent.Data = facultyEvent.Data || {}
        facultyEvent.Data.SoftDelete = true
        var studentEvent = this.task.Object.StudentEvents.find(v => v._id === event.Data.Reference_id)
        studentEvent.Data = studentEvent.Data || {}
        studentEvent.Data.SoftDelete = false
        this.$refs.eventView.Reset()
      })
    },
    OnResourceViewUpload (upload) {
      // TODO: Upload File
      var id = this.id
      this.$apollo.mutate({
        mutation: gql`mutation ($id: ID!, $description: String, $file: Upload!) {
          event: AddEvent(Task_id: $id, input: { Descriptor: "RESOURCE_UPLOAD", Data: { Description: $description }, Document: $file }) {
            ...on FacultyEvent {
              _id
              Descriptor
              Data
              Document {
                filename
                mimetype
                encoding
                id
              }
              Timestamp
            }
          }
        }`,
        variables: {
          id: id,
          description: upload.description,
          file: upload.file
        }
      }).then(({ data }) => {
        console.log(data)
        this.task.Object.FacultyEvents.push(data.event)
      })
    },
    EndLecture () {
      // TODO: End Lecture
      this.$apollo.mutate({
        mutation: gql`mutation ($id:ID!) {
          task: StopTask (_id:$id) {
            _id
          }
        }`,
        variables: {
          id: this.id
        }
      }).then(({ data }) => {
        console.log(data.task)
        this.$refs.audioCap.CleanUp()
        this.$router.back()
      })
    }
  },
  computed: {
    resources () {
      return this.task.Object.FacultyEvents.filter(v => v.Descriptor === 'Resource')
    }
  },
  apollo: {
    task: {
      query: gql`query ($id:ID!){
        task: Task (_id:$id) {
          _id
          Start
          Object {
            ...on Lecture {
              _id
              StudentEvents {
                _id
                Descriptor
                Data
                Student {
                  _id
                  Identifier
                }
                Document {
                  filename
                  mimetype
                  encoding
                  id
                }
                Timestamp
              }
              FacultyEvents {
                _id
                Descriptor
                Data
                Document {
                  filename
                  mimetype
                  encoding
                  id
                }
                Timestamp
              }
              Course {
                _id
                Title
                Code
              }
            }
          }
          Room {
            _id
          }
        }
      }`,
      variables () {
        return {
          id: this.id
        }
      }
    }
  },
  data () {
    return {
      task: {
        _id: null,
        Start: null,
        Object: {
          _id: null,
          Students: [],
          StudentEvents: [],
          FacultyEvents: [],
          Course: {
            _id: null,
            Title: null,
            Code: null
          }
        },
        Room: {
          _id: null
        }
      },
      config: {
        useSRAPI: this.$store.state.srapi.enabled
      },
      actionEvent: null,
      endLectureDialog: false,
      worker: null
    }
  },
  watch: {
    'task.Object.StudentEvents': () => ({
      handler: () => {
        this.$refs.reportView.Update(this.task.Object.StudentEvents)
      }
    })
  }
}
</script>

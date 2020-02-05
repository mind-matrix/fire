<template>
  <v-app>
    <v-card class="px-2">
      <v-row>
        <v-col cols="12" md="4">
          <v-card outlined>
            <v-card-title>Overview</v-card-title>
            <v-card-text>
              <timer-view />
            </v-card-text>
            <v-card-actions>
              <v-dialog v-model="endTestDialog" max-width="400px">
                <template v-slot:activator="{ on }">
                  <v-btn color="red" v-on="on" elevation="0" class="my-2">
                    <v-icon left>
                      fas fa-stopwatch
                    </v-icon>
                    end test
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title>End Test?</v-card-title>
                  <v-card-subtitle>
                    {{
                      dispatched ?
                      'The test will end with scoring based on answers submitted until now.'
                      :
                      'Questions are not dispatched. The test will be ended without scoring.'
                    }}
                  </v-card-subtitle>
                  <v-card-actions>
                    <v-btn color="red" @click="[EndTest(), endTestDialog = false]">
                      <v-icon left>
                        fas fa-stopwatch
                      </v-icon>
                      end test
                    </v-btn>
                    <v-btn color="grey" @click="endTestDialog = false">
                      cancel
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" md="8">
          <class-view :seatMatrix="seatMatrix" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="4">
          <report-view :data="report" />
        </v-col>
      </v-row>
    </v-card>
  </v-app>
</template>

<script>
import ClassView from '../common/ClassView'
import TimerView from '../common/TimerView'
import ReportView from '../common/ReportView'

export default {
  components: {
    ClassView,
    TimerView,
    ReportView
  },
  methods: {
    OnQuestionsViewRemove (question) {
      this.$delete(this.questions, this.questions.findIndex(v => v._id === question._id))
    },
    EndTest () {
      // TODO: End Test
      this.$router.back()
    }
  },
  data () {
    return {
      report: {
        student: { icon: 'fas fa-user-friends', name: 'Students', value: 10 },
        activists: { icon: 'fas fa-circle', name: 'Activists', iconColor: 'red', value: 2 },
        pragmatists: { icon: 'fas fa-circle', name: 'Pragmatists', iconColor: 'yellow', value: 4 },
        theorists: { icon: 'fas fa-circle', name: 'Theorists', iconColor: 'blue', value: 2 },
        reflectors: { icon: 'fas fa-circle', name: 'Reflectors', iconColor: 'green', value: 2 }
      },
      seatMatrix: [
        [
          { occupied: true, occupant: { _id: 1, identifier: '17UCS023', name: 'Sagnik', moduleData: { lsi: { type: 'pragmatist' } } } },
          null,
          { occupied: false },
          null,
          null,
          { occupied: true, occupant: { _id: 3, identifier: '17UCS013', name: 'Saurav', moduleData: { lsi: { type: 'activist' } } } },
          { occupied: false },
          null,
          { occupied: true, occupant: { _id: 1, identifier: '17UCS023', name: 'Sagnik', moduleData: { lsi: { type: 'pragmatist' } } } },
          null,
          { occupied: false },
          null,
          null,
          { occupied: true, occupant: { _id: 3, identifier: '17UCS013', name: 'Saurav', moduleData: { lsi: { type: 'activist' } } } },
          { occupied: false },
          null,
          { occupied: true, occupant: { _id: 1, identifier: '17UCS023', name: 'Sagnik', moduleData: { lsi: { type: 'pragmatist' } } } },
          null,
          { occupied: false },
          null,
          null,
          { occupied: true, occupant: { _id: 3, identifier: '17UCS013', name: 'Saurav', moduleData: { lsi: { type: 'activist' } } } },
          { occupied: false },
          null
        ],
        [
          { occupied: true, occupant: { _id: 2, identifier: '17UCS046', name: 'Tamal', moduleData: { lsi: { type: 'theorist' } } } },
          null,
          { occupied: true, occupant: { _id: 4, identifier: '17UCS033', name: 'Sujata', moduleData: { lsi: { type: 'reflector' } } } },
          null,
          null,
          { occupied: false },
          { occupied: false },
          null,
          { occupied: true, occupant: { _id: 1, identifier: '17UCS023', name: 'Sagnik', moduleData: { lsi: { type: 'pragmatist' } } } },
          null,
          { occupied: false },
          null,
          null,
          { occupied: true, occupant: { _id: 3, identifier: '17UCS013', name: 'Saurav', moduleData: { lsi: { type: 'activist' } } } },
          { occupied: false },
          null,
          { occupied: true, occupant: { _id: 1, identifier: '17UCS023', name: 'Sagnik', moduleData: { lsi: { type: 'pragmatist' } } } },
          null,
          { occupied: false },
          null,
          null,
          { occupied: true, occupant: { _id: 3, identifier: '17UCS013', name: 'Saurav', moduleData: { lsi: { type: 'activist' } } } },
          { occupied: false },
          null
        ]
      ],
      questions: [
        { _id: 1, time: 123, text: 'Some of the most weird question?', difficulty: 0, tags: ['weird', 'quest'] }
      ],
      dispatched: false,
      dispatchQuestionsDialog: false,
      endTestDialog: false
    }
  },
  watch: {
    questions: {
      handler: function (newValue) {
        this.report.questions.value = newValue.length
        this.report.tags.value = newValue.reduce((a, v) => a + v.tags.length, 0)
      },
      deep: true
    }
  },
  mounted () {
    this.report.questions.value = this.questions.length
    this.report.tags.value = this.questions.reduce((a, v) => a + v.tags.length, 0)
  }
}
</script>

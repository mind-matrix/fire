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
              <v-row align="center">
                <v-col class="text-center" cols="6">
                  <v-dialog v-model="dispatchQuestionsDialog" max-width="400px">
                    <template v-slot:activator="{ on }">
                      <v-btn color="blue" :disabled="dispatched" v-on="on" elevation="0" class="my-2">
                        <v-icon left>
                          fas fa-stopwatch
                        </v-icon>
                        dispatch
                      </v-btn>
                    </template>
                    <v-card>
                      <v-card-title>Dispatch Questions?</v-card-title>
                      <v-card-subtitle>
                        <v-row>
                          <v-col cols="1">
                            <v-icon small dense left>fas fa-info-circle</v-icon>
                          </v-col>
                          <v-col cols="11">
                            <p class="text-justify">
                              Questions will be dispatched to students by the <strong>Automated Dispatch System</strong> based on various factors including (but not limited to) LSI data.
                            </p>
                          </v-col>
                        </v-row>
                      </v-card-subtitle>
                      <v-card-actions>
                        <v-btn color="blue" @click="[DispatchQuestions(), dispatchQuestionsDialog = false]">
                          <v-icon left>
                            fas fa-stopwatch
                          </v-icon>
                          dispatch
                        </v-btn>
                        <v-btn color="grey" @click="dispatchQuestionsDialog = false">
                          cancel
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-col>
                <v-col cols="6">
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
                </v-col>
              </v-row>
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
        <v-col cols="12" md="8">
          <questions-view @remove="OnQuestionsViewRemove" :questions="questions" :locked="dispatched" />
        </v-col>
      </v-row>
    </v-card>
  </v-app>
</template>

<script>
import ClassView from '../common/ClassView'
import TimerView from '../common/TimerView'
import ReportView from '../common/ReportView'
import QuestionsView from './QuestionsView'

export default {
  components: {
    ClassView,
    TimerView,
    ReportView,
    QuestionsView
  },
  methods: {
    OnQuestionsViewRemove (question) {
      this.$delete(this.questions, this.questions.findIndex(v => v._id === question._id))
    },
    DispatchQuestions () {
      this.dispatched = true
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
        questions: { icon: 'fas fa-question-circle', name: 'Questions', value: 12 },
        tags: { icon: 'fas fa-tags', name: 'Tags', value: 8 }
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

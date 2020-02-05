<template>
  <v-card flat outlined>
    <v-card-title>Questions</v-card-title>
    <v-card-text>
      <perfect-scrollbar>
        <v-list max-height="200">
          <v-list-item v-for="(question, index) in questions" v-bind:key="index" :value="question">
            <v-list-item-action>
              <v-list-item-action-text>
                {{ question.time | moment("from","now") }}
              </v-list-item-action-text>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title v-text="question.text" />
              <v-list-item-subtitle>
                <v-icon left dense>
                  fas fa-tags
                </v-icon>
                {{ question.tags.join(", ") }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-dialog v-model="questionEditDialog" scrollable max-width="600px">
                <template v-slot:activator="{ on }">
                  <v-btn
                    color="yellow"
                    elevation="0"
                    rounded
                    icon
                    right
                    :disabled="locked"
                    v-on="on"
                    @click="Select(question)">
                    <v-icon>fas fa-edit</v-icon>
                  </v-btn>
                </template>
                <v-card style="height: 300px;" v-if="currentQuestion">
                  <v-card-title>
                    Edit Question
                  </v-card-title>
                  <v-divider />
                  <v-card-text>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          label="Question Text"
                          v-model="currentQuestion.text" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <span>Difficulty</span>
                        <v-rating
                          length="5"
                          half-increments
                          v-model="currentQuestion.difficulty" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-combobox
                          :items="tagList"
                          :search-input.sync="tagSearch"
                          label="Tags"
                          multiple
                          hide-selected
                          clearable
                          small-chips
                          persistent-hint
                          v-model="currentQuestion.tags">
                          <template v-slot:no-data>
                            <v-list-item>
                              <v-list-item-content>
                                <v-list-item-title>
                                  No results matching "<strong>{{ tagSearch }} </strong>". Press <kbd>enter</kbd> to create a new one.
                                </v-list-item-title>
                              </v-list-item-content>
                            </v-list-item>
                          </template>
                        </v-combobox>
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn color="green" elevation="0" @click="[Update(), questionEditDialog = false]">
                      <v-icon left>
                        fas fa-check
                      </v-icon>
                      done
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-list-item-action>
            <v-list-item-action>
              <v-dialog v-model="questionRemoveDialog" max-width="400px">
                <template v-slot:activator="{ on }">
                  <v-btn
                    color="red"
                    elevation="0"
                    v-on="on"
                    @click="Select(question)"
                    :disabled="locked"
                    rounded
                    icon
                    right>
                    <v-icon>fas fa-trash</v-icon>
                  </v-btn>
                </template>
                <v-card v-if="currentQuestion">
                  <v-card-title>
                    Delete this question?
                  </v-card-title>
                  <v-card-subtitle>
                    This action cannot be reverted.
                  </v-card-subtitle>
                  <v-divider />
                  <v-card-actions>
                    <v-btn color="red" elevation="0" @click="[Remove(), questionRemoveDialog = false]">
                      Delete
                    </v-btn>
                    <v-btn color="blue" outlined elevation="0" @click="questionRemoveDialog = false">
                      Cancel
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </perfect-scrollbar>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    questions: Array,
    locked: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    Update () {
      this.$emit('update', this.currentQuestion)
    },
    Remove () {
      this.$emit('remove', this.currentQuestion)
    },
    Select (question) {
      this.currentQuestion = question
      this.tagList.push(...this.currentQuestion.tags)
    }
  },
  data () {
    return {
      currentQuestion: null,
      tagList: [],
      tagSearch: null,
      questionEditDialog: false,
      questionRemoveDialog: false
    }
  }
}
</script>

<template>
  <v-container>
    <v-form>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="title"
            label="Course Title"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="code"
            label="Course Code"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-btn @click="CreateCourse" color="primary">create</v-btn>
        </v-col>
      </v-row>
    </v-form>
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

export default {
  methods: {
    CreateCourse () {
      // Create a course
      if (this.title && this.code) {
        this.$apollo.mutate({
          mutation: gql`mutation ($input:AddCourseInput!) {
            course: AddCourse (input:$input) {
              _id
              Title
              Code
            }
          }`,
          variables: {
            input: {
              Title: this.title,
              Code: this.code
            }
          }
        }).then(({ data }) => {
          this.snackbar.message = `Created Course: ${data.course.Title} (${data.course.Code})`
          this.snackbar.active = true
        })
      } else {
        this.snackbar.message = `Error: Insufficient Input`
        this.snackbar.active = true
      }
    },
    ResetCourse () {
      this.title = null
      this.code = null
    }
  },
  data () {
    return {
      title: null,
      code: null,
      snackbar: {
        active: false,
        message: null
      }
    }
  }
}
</script>

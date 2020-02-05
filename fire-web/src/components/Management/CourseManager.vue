<template>
  <v-list>
    <v-list-item v-for="(course, index) in courses" :key="index">
      <v-list-item-content>
        <v-list-item-title>
          {{ course.Title }}
        </v-list-item-title>
        <v-list-item-subtitle>
          ({{ course.Code }})
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
import gql from 'graphql-tag'

export default {
  apollo: {
    courses: {
      query: gql`query {
        courses: AllCourses {
          _id
          Title
          Code
        }
      }`
    }
  },
  data () {
    return {
      courses: []
    }
  }
}
</script>

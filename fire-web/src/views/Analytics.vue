<template>
  <v-app>
    <v-card>
      <v-tabs color="primary" vertical>
        <v-tab v-for="(pkg, i) in packages" :key="i" ripple>
          <v-icon v-if="pkg.icon" left>{{pkg.icon}}</v-icon>
          {{pkg.title}}
        </v-tab>
        <v-tab-item v-for="(pkg, i) in packages" :key="i">
          <component class="pa-2" :is="pkg.component" />
        </v-tab-item>
      </v-tabs>
    </v-card>
  </v-app>
</template>

<script>
import LectureMetrics from '../components/Analytics/LectureMetrics.vue'
import StudentMetrics from '../components/Analytics/StudentMetrics.vue'

export default {
  components: {
    LectureMetrics,
    StudentMetrics
  },
  data () {
    return {
      packages: [
        { title: 'Lecture Metrics', icon: 'fas fa-chalkboard-teacher', component: LectureMetrics },
        { title: 'Student Metrics', icon: 'fas fa-user', component: StudentMetrics }
      ]
    }
  }
}
</script>

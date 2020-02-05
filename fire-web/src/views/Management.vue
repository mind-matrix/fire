<template>
  <v-container class="ma-2" fluid>
    <v-row dense>
      <v-col cols="12" md="6">
        <v-card shaped>
          <v-card-title>Create Entity</v-card-title>
          <v-card-subtitle>Create entity for usage</v-card-subtitle>
          <v-card-text>
            <v-tabs
              v-model="tab.create"
              centered
              dark
              icons-and-text
            >
              <v-tabs-slider></v-tabs-slider>
              <v-tab href="#createRoomTab">
                Room
                <v-icon>fas fa-door-open</v-icon>
              </v-tab>
              <v-tab href="#createCourseTab">
                Course
                <v-icon>fas fa-book</v-icon>
              </v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab.create">
              <v-tab-item value="createRoomTab">
                <v-card flat>
                  <v-card-text>
                    <room-creator />
                  </v-card-text>
                </v-card>
              </v-tab-item>
              <v-tab-item value="createCourseTab">
                <v-card flat>
                  <v-card-text>
                    <course-creator />
                  </v-card-text>
                </v-card>
              </v-tab-item>
            </v-tabs-items>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card shaped>
          <v-card-title>Entity Manager</v-card-title>
          <v-card-subtitle>Manage entity for usage</v-card-subtitle>
          <v-card-text>
            <v-tabs
              v-model="tab.manage"
              centered
              dark
              icons-and-text
            >
              <v-tabs-slider></v-tabs-slider>
              <v-tab href="#manageRoomTab">
                Room
                <v-icon>fas fa-door-open</v-icon>
              </v-tab>
              <v-tab href="#manageCourseTab">
                Course
                <v-icon>fas fa-book</v-icon>
              </v-tab>
              <v-tab href="#manageTasksTab">
                Task
                <v-icon>fas fa-clipboard</v-icon>
              </v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab.manage">
              <v-tab-item value="manageRoomTab">
                <v-card flat>
                  <v-card-text>
                    <room-manager />
                  </v-card-text>
                </v-card>
              </v-tab-item>
              <v-tab-item value="manageCourseTab">
                <v-card flat>
                  <v-card-text>
                    <course-manager />
                  </v-card-text>
                </v-card>
              </v-tab-item>
              <v-tab-item value="manageTasksTab">
                <v-card flat>
                  <v-card-text>
                    <task-manager />
                  </v-card-text>
                </v-card>
              </v-tab-item>
            </v-tabs-items>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import RoomCreator from '../components/Management/RoomCreator.vue'
import CourseCreator from '../components/Management/CourseCreator.vue'
import RoomManager from '../components/Management/RoomManager.vue'
import CourseManager from '../components/Management/CourseManager.vue'
import TaskManager from '../components/Management/TaskManager.vue'

export default {
  components: {
    RoomCreator,
    CourseCreator,
    RoomManager,
    CourseManager,
    TaskManager
  },
  data () {
    return {
      tab: {
        create: null,
        manage: null
      }
    }
  }
}
</script>

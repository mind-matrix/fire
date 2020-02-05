<template>
  <v-container class="mx-2" fluid>
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="px-4 py-4" shaped>
          <v-card-title>
            Task
          </v-card-title>
          <v-card-subtitle>
            Start a new task
          </v-card-subtitle>
          <v-divider></v-divider>
          <div class="font-weight-thin py-2">Select Module</div>
          <v-list>
            <v-list-item-group
              v-model="modules.selected"
              mandatory
            >
              <v-list-item
                v-for="(item, i) in modules.all"
                :key="i"
              >
                <v-list-item-icon>
                  <v-icon v-text="item.icon"></v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title v-text="item.title"></v-list-item-title>
                  <v-list-item-subtitle v-text="item.description"></v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
          <v-divider />
          <div class="my-2" v-if="modules.all[modules.selected].requires.room">
            <v-select
              v-model="rooms.selected"
              :items="rooms.available"
              item-text="name"
              item-value="id"
              :hint="`Capacity of ${rooms.selected ? rooms.selected.capacity: 'Select a room'}`"
              no-data-text="No rooms available"
              persistent-hint
              return-object
              label="Select Room"
            >
            </v-select>
          </div>
          <v-divider></v-divider>
          <div class="my-2" v-if="modules.all[modules.selected].requires.course">
            <v-select
              v-model="courses.selected"
              :items="courses.all"
              item-text="title"
              item-value="id"
              :hint="`(${courses.selected ? courses.selected.code : 'Select a course'})`"
              no-data-text="No courses added"
              persistent-hint
              return-object
              label="Select Course"
            >
            </v-select>
            <v-divider></v-divider>
          </div>
          <v-btn class="my-2" color="green" @click="RunTask" outlined rounded>
            <v-icon left>fas fa-play</v-icon>
            RUN TASK
          </v-btn>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="px-4 py-4" shaped>
          <v-card-title>
            Taskboard
          </v-card-title>
          <v-card-subtitle>
            Manage running tasks
          </v-card-subtitle>
          <v-divider></v-divider>
          <v-list flat shaped>
            <v-list-item
              v-for="(task, i) in tasks"
              :key="i"
            >
              <v-list-item-icon>
                <v-icon v-text="task.module.icon"></v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title v-text="task.module.title"></v-list-item-title>
                <v-list-item-subtitle>{{ task.start | moment("from","now") }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn @click="OpenTask(task)" v-if="task.state === 'RUNNING'" color="yellow" icon outlined>
                  <v-icon small>fas fa-window-restore</v-icon>
                </v-btn>
              </v-list-item-action>
              <v-list-item-action>
                <v-btn @click="ResumeTask(task)" v-if="task.state === 'PAUSED'" color="green" icon outlined>
                  <v-icon small>fas fa-play</v-icon>
                </v-btn>
              </v-list-item-action>
              <v-list-item-action>
                <v-btn @click="PauseTask(task)" v-if="task.state === 'RUNNING'" color="blue" icon outlined>
                  <v-icon small>fas fa-pause</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="px-4 py-4" shaped>
          <v-card-title>
            Usage
          </v-card-title>
          <v-card-subtitle>
            Some Usage Statistics and Highlights
          </v-card-subtitle>
          <v-divider></v-divider>
          Stats go here
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import gql from 'graphql-tag'

const ModuleIcons = {
  Lecture: 'fas fa-chalkboard-teacher',
  Test: 'fas fa-pen-alt',
  LSI: 'fas fa-user-friends'
}

export default {
  name: 'console',
  components: {
  },
  apollo: {
    tasks: {
      query: gql`{
        tasks: RunningTasks {
          _id
          Module
          State
          Start
        }
      }`,
      subscribeToMore: {
        document: gql`subscription {
          task: taskSub {
            _id
            State
          }
        }`
      },
      update: data => {
        return data.tasks.map(v => ({
          id: v._id,
          module: {
            title: v.Module,
            icon: ModuleIcons[v.Module]
          },
          state: v.State,
          start: new Date(v.Start)
        }))
      }
    },
    courses: {
      query: gql`{
        courses: AllCourses {
          _id
          Title
          Code
        }
      }`,
      update: data => {
        return {
          all: data.courses.map(v => ({
            id: v._id,
            title: v.Title,
            code: v.Code
          })),
          selected: null
        }
      }
    },
    rooms: {
      query: gql`{
        rooms: AvailableRooms {
          _id
          Name
          Capacity
        }
      }`,
      update: data => {
        return {
          available: data.rooms.map(v => ({
            id: v._id,
            name: v.Name,
            capacity: v.Capacity
          })),
          selected: null
        }
      }
    }
  },
  methods: {
    RunTask () {
      var input = {
        Module: this.modules.all[this.modules.selected].title,
        Room_id: this.rooms.selected.id,
        Course_id: this.courses.selected.id
      }

      this.rooms.selected = null
      this.courses.selected = null

      this.$apollo.mutate({
        mutation: gql`mutation ($input:TaskInput!) {
          task: AddTask(input:$input) {
            _id
          }
        }`,
        variables: {
          input: input
        }
      }).then(({ data }) => {
        // open task window
        console.log(data)
        this.$router.push({ name: this.modules.all[this.modules.selected].name, params: { id: data.task._id } })
      }).catch((error) => {
        // display errors
        console.error(error)
      })
    },
    OpenTask (task) {
      this.$router.push({ name: this.modules.all.find(v => v.title === task.module.title).name, params: { id: task.id } })
    },
    PauseTask (task) {
      this.$apollo.mutate({
        mutation: gql`mutation ($input:ID!) {
          task: PauseTask(_id:$input) {
            _id
          }
        }`,
        variables: {
          input: task.id
        }
      }).catch((error) => {
        // display errors
        console.error(error)
      })
    },
    ResumeTask (task) {
      this.$apollo.mutate({
        mutation: gql`mutation ($input:ID!) {
          task: ResumeTask(_id:$input) {
            _id
          }
        }`,
        variables: {
          input: task.id
        }
      }).catch((error) => {
        // display errors
        console.error(error)
      })
    }
  },
  data () {
    return {
      tasks: [],
      modules: {
        all: [
          { icon: ModuleIcons.Lecture, title: 'Lecture', name: 'lectureConsole', description: 'Classroom Lecture Module', requires: { room: true, course: true } },
          { icon: ModuleIcons.Test, title: 'Test', name: 'testConsole', description: 'Crowdsourced Test Module', requires: { room: true, course: true } },
          { icon: ModuleIcons.LSI, title: 'LSI', name: 'lsiTestConsole', description: 'Learning Style Identification Test', requires: { room: true } }
        ],
        selected: 0
      },
      rooms: {
        available: [],
        selected: null
      },
      courses: {
        all: [],
        selected: null
      }
    }
  }
}
</script>

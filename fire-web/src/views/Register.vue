<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="px-2">
          <v-card-title class="text-uppercase">
            Register
          </v-card-title>
          <v-card-subtitle>
            Faculty
          </v-card-subtitle>
          <v-divider />
          <v-card-text>
            <v-form>
              <v-text-field
                label="Your Name"
                v-model="name"
                prepend-icon="fas fa-user"
                type="text"
              />
              <v-text-field
                label="Username"
                v-model="username"
                :rules="usernameRules"
                @change="UpdateUsernameValidity"
                prepend-icon="fas fa-user-tag"
                type="text"
              />
              <v-text-field
                label="Password"
                v-model="password"
                :rules="passwordRules"
                prepend-icon="fas fa-lock"
                type="password"
              />
              <v-text-field
                label="Confirm Password"
                v-model="confirmPassword"
                :rules="confirmPasswordRules"
                prepend-icon="fas fa-lock"
                type="password"
              />
              <v-checkbox
                v-model="save"
                label="Remember me"
                hide-details
                dense
              >
                <template v-slot:append >
                  <v-tooltip max-width="200" top>
                    <template v-slot:activator="{ on }">
                      <v-icon color="grey" class="mx-1" small v-on="on">fas fa-info</v-icon>
                    </template>
                    <span>Saves login data for maximum inactivity period of 30 days</span>
                  </v-tooltip>
                </template>
              </v-checkbox>
            </v-form>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-btn @click="Register" class="text-uppercase" color="primary">
              register
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar
      v-model="error.active"
      :timeout="2000"
    >
      {{ error.message }}
      <v-btn
        color="primary"
        text
        @click="error.active = false"
      >
        close
      </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from 'axios'

export default {
  methods: {
    Register () {
      // Register Faculty
      axios.post('http://localhost/faculty/signup', {
        name: this.name,
        username: this.username,
        password: this.password
      }, {
        responseType: 'json'
      }).then(({ data }) => {
        if (data.token) {
          this.$store.commit('updateToken', { token: data.token, save: this.save })
          this.$router.replace({ name: 'console' })
        } else {
          this.error.message = data.error
          this.error.active = true
        }
      })
    },
    async UpdateUsernameValidity () {
      var data = await axios.get(`http://localhost/faculty/validateUsername?username=${this.username}`)
      this.usernameValid = data.valid
    }
  },
  data () {
    return {
      name: null,
      username: null,
      password: null,
      confirmPassword: null,
      usernameValid: true,
      save: false,
      usernameRules: [
        () => this.usernameValid
      ],
      passwordRules: [
        value => {
          const invalidPattern = /^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/
          if (invalidPattern.test(value)) {
            return 'Invalid Password'
          } else {
            return true
          }
        }
      ],
      confirmPasswordRules: [
        value => this.password === value || 'Passwords do not match'
      ],
      error: {
        message: null,
        active: false
      }
    }
  }
}
</script>

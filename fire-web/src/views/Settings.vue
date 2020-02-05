<template>
  <v-container class="mx-2" fluid>
    <v-row dense>
      <v-col cols="12" md="6">
        <v-card class="px-4 py-4" outlined>
          <v-card-title>Personalization</v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col cols="12">
                <v-switch v-model="theme.dark" messages="Theme" color="primary" :label="`${theme.dark ? 'Dark': 'Light' } Mode`" @change="SetTheme" />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="audio.input"
                  :items="audio.options"
                  item-text="label"
                  item-value="deviceId"
                  @change="SetAudioInput"
                >
                </v-select>
              </v-col>
              <v-col cols="12">
                <v-switch v-model="experimental.srapi" color="primary" @change="SetSRAPI">
                  <template v-slot:label>
                    <div>
                      <span v-text="experimental.srapi ? 'Enabled': 'Disabled'"></span>
                      <v-tooltip max-width="200" bottom>
                        <template v-slot:activator="{ on }">
                          <v-icon x-small class="mx-2" color="grey" v-on="on">fas fa-info-circle</v-icon>
                        </template>
                        <p class="text-justify">
                          The SRAPI is used by modules for recognizing speech and utilizing the information to generate data such as annotations, etc.
                        </p>
                      </v-tooltip>
                    </div>
                  </template>
                </v-switch>
              </v-col>
              <v-col cols="12">
                <v-slider
                  :disabled="!experimental.srapi"
                  v-model="experimental.srapiAccuracy"
                  @change="SetSRAPIAccuracy"
                  min="0"
                  max="100"
                  hint="Higher accuracy may lead to reduced number of transcripts"
                  persistent-hint
                  step="1"
                  label="Accuracy"
                  thumb-label
                ></v-slider>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="px-4 py-4" outlined>
          <v-card-title>Account</v-card-title>
          <v-card-text>
            <p>Work in progress 🔨</p>
            <v-form>
              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                    label="Change Your Name"
                    v-model="change.name"
                    prepend-icon="fas fa-user"
                    type="text"
                  />
                </v-col>
                <v-col cols="12">
                  <v-file-input
                    :rules="avatarRules"
                    v-model="change.avatar"
                    accept="image/png, image/jpeg, image/bmp"
                    placeholder="Pick an avatar"
                    prepend-icon="fas fa-camera"
                    label="Avatar"
                  />
                </v-col>
                <v-col cols="12">
                  <v-btn @click="SaveUpdate" color="primary">
                    save
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import gql from 'graphql-tag'

export default {
  methods: {
    SetTheme () {
      this.$vuetify.theme.dark = this.theme.dark
      this.$store.commit('setDarkTheme', this.theme.dark)
    },
    SetSRAPI () {
      this.$store.commit('setEnableSRAPI', this.experimental.srapi)
    },
    SetSRAPIAccuracy () {
      this.$store.commit('setSRAPIAccuracy', this.experimental.srapiAccuracy / 100)
    },
    SetAudioInput () {
      this.$store.commit('setMic', this.audio.input)
    },
    SaveUpdate () {
      var input = {}
      if (this.change.name && this.change.name.trim().length > 0) {
        input['Name'] = this.change.name.trim()
      }
      if (this.change.avatar) {
        input['DisplayPicture'] = this.change.avatar
      }
      this.$apollo.mutate({
        mutation: gql`mutation ($input: UpdateAccountInput!) {
          Update (input: $input) {
            Name
            DisplayPicture {
              filename
              mimetype
              encoding
              id
            }
          }
        }`,
        variables: {
          input: input
        }
      }).then(() => {
        this.$router.go()
      })
    }
  },
  data () {
    return {
      audio: {
        options: [],
        input: this.$store.state.mic
      },
      theme: {
        dark: this.$vuetify.theme.dark
      },
      experimental: {
        srapi: this.$store.state.srapi.enabled,
        srapiAccuracy: this.$store.state.srapi.accuracy * 100
      },
      avatarRules: [
        value => !value || value.size < 2000000 || 'Avatar size should be less than 2 MB!'
      ],
      change: {
        name: null,
        avatar: null
      }
    }
  },
  mounted () {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      this.audio.options = devices.filter(v => v.kind === 'audioinput')
    })
  }
}
</script>

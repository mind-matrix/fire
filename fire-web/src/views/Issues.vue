<template>
  <div class="faq">
    <v-card-title>Analyze(Dev)/Report Bugs and Errors</v-card-title>
    <v-card>
      <v-card-text>
        <p>Work in progress 🔨</p>
        <v-list>
          <v-list-item v-for="(error, index) in logs.error.networkError" :key="index">
            {{ JSON.stringify(error) }}
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      logs: {
        error: {
          graphqlError: [],
          networkError: []
        }
      }
    }
  },
  mounted () {
    this.logs = this.$store.state.logs
    console.log(this.logs)
  }
}
</script>

<template>
  <v-card flat outlined>
    <v-card-title>
      Resources
    </v-card-title>
    <v-card-text>
      <perfect-scrollbar>
        <v-list max-height="200">
          <v-list-item v-for="(item, index) in Filter(data)" v-bind:key="index">
            <v-list-item-icon>
              <v-icon v-text="`fas ${ GetDescriptionIcon(item.Document.mimetype) }`" />
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.Document.filename" />
              <v-list-item-subtitle>{{ item.Timestamp | moment("from","now") }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn color="blue" @click="DownloadFile(item.Document.id, item.Document.filename)" icon>
                <v-icon v-text="`fas fa-download`" />
              </v-btn>
            </v-list-item-action>
            <v-list-item-action>
              <v-btn color="red" icon>
                <v-icon>fas fa-trash</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </perfect-scrollbar>
    </v-card-text>
    <v-card-actions>
      <v-dialog v-model="uploadDialog" persistent max-width="600px">
        <template v-slot:activator="{ on }">
          <v-btn color="primary" v-on="on">
            <v-icon left>fas fa-plus</v-icon>
            Add
          </v-btn>
        </template>
        <v-card>
          <v-card-title>Upload Resource</v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-textarea
                    v-model="upload.description"
                    filled
                    label="A short description (Ex. Instructions on how to use this resource)"
                    auto-grow
                  ></v-textarea>
                </v-col>
                <v-col cols="12">
                  <v-file-input v-model="upload.file" label="Choose file"></v-file-input>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="yellow" text @click="uploadDialog = false">Cancel</v-btn>
            <v-btn color="primary" @click="UploadFile">Upload</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-actions>
  </v-card>
</template>

<script>
import axios from 'axios'

const mimetypes = {
  // Media
  'image': 'fa-file-image',
  'audio': 'fa-file-audio',
  'video': 'fa-file-video',
  // Documents
  'application/pdf': 'fa-file-pdf',
  'application/msword': 'fa-file-word',
  'application/vnd.ms-word': 'fa-file-word',
  'application/vnd.oasis.opendocument.text': 'fa-file-word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml': 'fa-file-word',
  'application/vnd.ms-excel': 'fa-file-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml': 'fa-file-excel',
  'application/vnd.oasis.opendocument.spreadsheet': 'fa-file-excel',
  'application/vnd.ms-powerpoint': 'fa-file-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml': 'fa-file-powerpoint',
  'application/vnd.oasis.opendocument.presentation': 'fa-file-powerpoint',
  'text/plain': 'fa-file-text',
  'text/html': 'fa-file-code',
  'application/json': 'fa-file-code',
  // Archives
  'application/gzip': 'fa-file-archive',
  'application/zip': 'fa-file-archive'
}

export default {
  props: {
    data: Array
  },
  methods: {
    Filter (data) {
      return data.filter(v => v.Descriptor === 'RESOURCE_UPLOAD')
    },
    UploadFile () {
      this.$emit('upload', Object.assign({}, this.upload))
      this.upload.description = null
      this.upload.file = null
      this.uploadDialog = false
    },
    GetDescriptionIcon (type) {
      for (var [mime, icon] of Object.entries(mimetypes)) {
        if (type.indexOf(mime) !== -1) {
          return icon
        }
      }
      return 'fa-file'
    },
    DownloadFile (id, filename) {
      axios({
        url: `http://localhost/document?id=${id}`,
        method: 'GET',
        responseType: 'arraybuffer'
      }).then(response => {
        console.log(response)
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
      })
    }
  },
  data () {
    return {
      uploadDialog: false,
      upload: {
        description: null,
        file: null
      }
    }
  }
}
</script>

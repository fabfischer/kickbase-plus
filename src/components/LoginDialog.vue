<template>
    <div>

    <v-dialog
      width="500"
      persistent
      v-model="dialog"
    >

      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
          Login
        </v-card-title>

        <v-card-text> 
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                <v-text-field label="username" v-model="user" required></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field label="password*" type="password" v-model="password" required></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="info darken-1" large :loading="loading" @click="login">Login</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    </div>
</template>


<script>
import { mapGetters, mapMutations } from 'vuex'

import api from '../api/api'

export default {
  name: 'Login-Dialog',
  data() {
    return {
      dialog: true,
      user: null,
      password: null,
      loading: false,
      errorMessage: null,
    }
  },
  mounted() {
    if (api.checkForCredentials()) {
      // do stuff
    } 
    this.user = localStorage.getItem('user')
  },
  computed: {
    ...mapGetters([
      'getAuthStatus'
    ]),
  },
  methods: {
    ...mapMutations([
      'setErrorMessage'
    ]),
    login() {
      localStorage.setItem('user', this.user)
      localStorage.setItem('password', this.password)
      if (api.checkForCredentials()) {
        api.login()
      } else {
        this.setErrorMessage('issue with login: please check credentials')
      }
    }
  }
};
</script>

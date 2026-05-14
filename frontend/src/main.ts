import './assets/main.css'

import { DefaultApolloClient } from '@vue/apollo-composable'
import { createApp } from 'vue'
import App from './App.vue'
import { apolloClient } from './apollo'
import router from './router'

const app = createApp(App)

app.use(router)
app.provide(DefaultApolloClient, apolloClient)

app.mount('#app')

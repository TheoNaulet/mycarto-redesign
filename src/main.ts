import { createApp } from 'vue'
import './styles/base.css'
import './styles/forms.css'
import App from './App.vue'
import { router } from './router'

createApp(App).use(router).mount('#app')

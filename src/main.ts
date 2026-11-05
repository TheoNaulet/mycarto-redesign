// Entry point: mounts the app with the router, then starts the site-wide reveal (src/motion/reveal.ts).
import { createApp } from 'vue'
import '@fontsource-variable/outfit'
import '@fontsource-variable/noto-sans'
import './styles/base.css'
import './styles/forms.css'
import App from './App.vue'
import { router } from './router'
import { startReveal } from './motion/reveal'

createApp(App).use(router).mount('#app')
startReveal(['#main', '.final'])

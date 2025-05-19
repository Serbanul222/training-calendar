import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import './assets/calendar.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
// No need to import FullCalendar CSS directly anymore
// FullCalendar v6 includes the CSS automatically

createApp(App).mount('#app')
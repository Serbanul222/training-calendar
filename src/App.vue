<template>
  <div id="app">
    <header>
      <h1>Training Calendar System</h1>
      <button 
        v-if="isAuthenticated()" 
        @click="handleLogout" 
        class="logout-btn"
      >
        Logout
      </button>
    </header>

    <main>
      <template v-if="token">
        <TrainingCalendar />
      </template>
      <template v-else>
        <AuthContainer @auth-completed="onAuth" />
      </template>
    </main>

    <footer>
      <p>Training Calendar System © 2025</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TrainingCalendar from './components/TrainingCalendar.vue';
import AuthContainer from './components/AuthContainer.vue';
import { isAuthenticated, logout } from './utils/auth';

const token = ref(localStorage.getItem('jwt'));
function onAuth() {
  token.value = localStorage.getItem('jwt');
}

function handleLogout() {
  logout();
  token.value = null;
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  margin-bottom: 20px;
  text-align: center;
  position: relative;
}

.logout-btn {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #4a86e8;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #3b78e7;
}

footer {
  margin-top: 40px;
  text-align: center;
  font-size: 14px;
  color: #666;
}
</style>
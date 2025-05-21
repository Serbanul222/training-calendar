<template>
  <div id="app">
    <header>
      <h1>Training Calendar System</h1>
      <div v-if="isAuthenticated()" class="user-controls">
        <span class="user-info" v-if="currentUser">{{ currentUser.email }}</span>
        <button
          @click="handleLogout"
          class="logout-btn"
        >
          Logout
        </button>
      </div>
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
import { ref, onMounted } from 'vue';
import TrainingCalendar from './components/TrainingCalendar.vue';
import AuthContainer from './components/AuthContainer.vue';
import { isAuthenticated, logout, getCurrentUser } from './utils/auth';

const token = ref(localStorage.getItem('jwt'));
const currentUser = ref(null);

onMounted(() => {
  // Set current user on component mount if authenticated
  if (isAuthenticated()) {
    currentUser.value = getCurrentUser();
  }
});

function onAuth() {
  token.value = localStorage.getItem('jwt');
  // Update current user when authenticated
  currentUser.value = getCurrentUser();
}

async function handleLogout() {
  try {
    // Call the async logout function from our updated auth.js
    await logout();
    // Clear local state
    token.value = null;
    currentUser.value = null;
  } catch (error) {
    console.error('Logout failed:', error);
    // You could add error handling UI here if needed
  }
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

.user-controls {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  font-size: 14px;
  color: #4a86e8;
}

.logout-btn {
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
<template>
  <div id="app">
    <header>
      <h1>Training Calendar System</h1>
    </header>

    <main>
      <template v-if="token">
        <TrainingCalendar />
      </template>
      <template v-else>
        <!-- Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management -->
        <LoginForm @logged-in="onAuth" />
        <RegisterForm class="mt-4" @registered="onAuth" />
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
// Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
import LoginForm from './components/LoginForm.vue';
import RegisterForm from './components/RegisterForm.vue';
// AuthContainer import from unstable-code is removed

const token = ref(localStorage.getItem('jwt'));
function onAuth() {
  token.value = localStorage.getItem('jwt');
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
}

footer {
  margin-top: 40px;
  text-align: center;
  font-size: 14px;
  color: #666;
}
</style>
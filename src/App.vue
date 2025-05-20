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
        <AuthContainer @auth-completed="onAuth" />
      </template>
    </main>

    <footer>
      <p>Training Calendar System &copy; 2025</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TrainingCalendar from './components/TrainingCalendar.vue';
import AuthContainer from './components/AuthContainer.vue';

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
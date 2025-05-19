<template>
  <div id="app">
    <header>
      <h1>Training Calendar System</h1>
    </header>
    
    <main>
      <TrainingCalendar />
    </main>
    
    <footer>
      <p>Training Calendar System &copy; 2025</p>
    </footer>
  </div>
</template>

<script setup>
import TrainingCalendar from './components/TrainingCalendar.vue';
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
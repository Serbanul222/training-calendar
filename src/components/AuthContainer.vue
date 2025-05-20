<template>
  <div class="auth-container">
    <LoginForm
      v-if="showLogin"
      @logged-in="onAuth" 
      @switch-to-register="showLogin = false"
    />
    <RegisterForm
      v-else
      @registered="onAuth"
      @switch-to-login="showLogin = true"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import LoginForm from './LoginForm.vue';
import RegisterForm from './RegisterForm.vue';

const props = defineProps({
  initialView: {
    type: String,
    default: 'login' // 'login' or 'register'
  }
});

const emit = defineEmits(['auth-completed']);
const showLogin = ref(props.initialView === 'login');

function onAuth() {
  emit('auth-completed');
}
</script>

<style scoped>
.auth-container {
  max-width: 450px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
</style>

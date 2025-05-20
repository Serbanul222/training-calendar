<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <h2>Login</h2>
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    <button type="submit">Login</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import authApi from '@/api/authApi';

const emit = defineEmits(['logged-in']);
const email = ref('');
const password = ref('');

async function handleSubmit() {
  try {
    const { token } = await authApi.login(email.value, password.value);
    localStorage.setItem('jwt', token);
    emit('logged-in');
  } catch (e) {
    console.error('Login failed', e);
  }
}
</script>

<style scoped>
.auth-form { display: flex; flex-direction: column; gap: 0.5rem; }
</style>

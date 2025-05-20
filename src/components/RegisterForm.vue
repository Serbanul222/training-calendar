<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <h2>Register</h2>
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    <button type="submit">Register</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import authApi from '@/api/authApi';

const emit = defineEmits(['registered']);
const email = ref('');
const password = ref('');

async function handleSubmit() {
  try {
    const { token } = await authApi.register(email.value, password.value);
    localStorage.setItem('jwt', token);
    emit('registered');
  } catch (e) {
    console.error('Registration failed', e);
  }
}
</script>

<style scoped>
.auth-form { display: flex; flex-direction: column; gap: 0.5rem; }
</style>

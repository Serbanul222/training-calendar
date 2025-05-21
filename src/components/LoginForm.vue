<template>
  <!-- Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management -->
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

// Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
const emit = defineEmits(['logged-in']);
const email = ref('');
const password = ref('');

async function handleSubmit() {
// Logic for loading and error from unstable-code is removed.
  try {
    const { token } = await authApi.login(email.value, password.value);
    localStorage.setItem('jwt', token);
    emit('logged-in');
  } catch (e) {
    console.error('Login failed', e);
    // Error handling from unstable-code is removed.
  }
  // finally block from unstable-code is removed.
}
// switchToRegister and forgotPassword functions from unstable-code are removed.
</script>

<style scoped>
/* Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management */
.auth-form { display: flex; flex-direction: column; gap: 0.5rem; }
/* Extensive styling from unstable-code is removed. */
</style>
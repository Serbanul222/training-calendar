<template>
  <!-- Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management -->
  <form @submit.prevent="handleSubmit" class="auth-form">
    <h2>Register</h2>
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    <button type="submit">Register</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
// Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
import authApi from '@/api/authApi';

const emit = defineEmits(['registered']);
const email = ref('');
const password = ref('');

async function handleSubmit() {
  try {
    // The 'name' field and related logic from unstable-code are removed.
    // The authApi.register call uses only email and password as per ub30iw-codex.
    const { token } = await authApi.register(email.value, password.value);
    localStorage.setItem('jwt', token);
    emit('registered');
  } catch (e) {
    console.error('Registration failed', e);
    // More detailed error handling and loading state from unstable-code are removed.
  }
  // finally block from unstable-code is removed.
}
// switchToLogin and showTerms functions from unstable-code are removed.
</script>

<style scoped>
/* Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management */
.auth-form { display: flex; flex-direction: column; gap: 0.5rem; }
/* Extensive styling from unstable-code is removed. */
</style>
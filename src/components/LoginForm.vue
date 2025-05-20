<template>
  <div class="login-container">
    <form @submit.prevent="handleSubmit" class="login-form">
      <h2 class="form-title">Login</h2>
      
      <div class="form-group">
        <label for="email">Email</label>
        <div class="input-container">
          <i class="icon">📧</i>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            placeholder="Your email address" 
            required
            autocomplete="email"
          />
        </div>
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <div class="input-container">
          <i class="icon">🔒</i>
          <input 
            id="password"
            v-model="password" 
            type="password" 
            placeholder="Your password" 
            required
            autocomplete="current-password"
          />
        </div>
      </div>
      
      <div class="error-message" v-if="error">
        {{ error }}
      </div>
      
      <button type="submit" class="login-button" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
      
      <div class="register-option">
        <span>Don't have an account?</span>
        <button type="button" class="register-button" @click="switchToRegister">Register</button>
      </div>
      
      <div class="help-text">
        <a href="#" @click.prevent="forgotPassword">Forgot password?</a>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import authApi from '@/api/authApi';

const emit = defineEmits(['logged-in', 'switch-to-register']);
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleSubmit() {
  loading.value = true;
  error.value = '';
  
  try {
    const { token } = await authApi.login(email.value, password.value);
    localStorage.setItem('jwt', token);
    emit('logged-in');
  } catch (e) {
    console.error('Login failed', e);
    error.value = e.response?.data?.message || 'Login failed. Please check your credentials.';
  } finally {
    loading.value = false;
  }
}

function switchToRegister() {
  emit('switch-to-register');
}

function forgotPassword() {
  // You can implement password recovery functionality here
  alert('Password recovery feature coming soon!');
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
}

.login-form {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.5rem;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
  overflow: hidden;
}

.input-container:focus-within {
  border-color: #4a86e8;
  box-shadow: 0 0 0 2px rgba(74, 134, 232, 0.2);
}

.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  color: #777;
  font-style: normal;
}

.input-container input {
  flex: 1;
  border: none;
  padding: 12px 12px 12px 0;
  font-size: 1rem;
  outline: none;
  background: transparent;
  width: 100%;
}

.input-container input::placeholder {
  color: #aaa;
}

.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 6px;
  text-align: center;
}

.login-button {
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background-color: #4a86e8;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 0.5rem;
}

.login-button:hover {
  background-color: #3b78e7;
}

.login-button:disabled {
  background-color: #a9c2f5;
  cursor: not-allowed;
}

.register-option {
  margin-top: 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.register-option span {
  color: #666;
  font-size: 0.9rem;
}

.register-button {
  background-color: #f5f5f5;
  color: #4a86e8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.register-button:hover {
  background-color: #e9ecef;
  border-color: #4a86e8;
}

.help-text {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.875rem;
}

.help-text a {
  color: #4a86e8;
  text-decoration: none;
  transition: color 0.2s;
}

.help-text a:hover {
  color: #3b78e7;
  text-decoration: underline;
}
</style>
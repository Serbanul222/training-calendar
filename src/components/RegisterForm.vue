<template>
  <div class="register-container">
    <form @submit.prevent="handleSubmit" class="register-form">
      <h2 class="form-title">Register</h2>
      
      <div class="form-group">
        <label for="name">Full Name</label>
        <div class="input-container">
          <i class="icon">👤</i>
          <input 
            id="name"
            v-model="name"
            type="text" 
            placeholder="Your full name" 
            required
            autocomplete="name"
          />
        </div>
      </div>
      
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
            placeholder="Create a strong password" 
            required
            autocomplete="new-password"
          />
        </div>
      </div>
      
      <div class="error-message" v-if="error">
        {{ error }}
      </div>
      
      <button type="submit" class="register-button" :disabled="loading">
        {{ loading ? 'Creating account...' : 'Register' }}
      </button>
      
      <div class="login-option">
        <span>Already have an account?</span>
        <button type="button" class="login-button" @click="switchToLogin">Login</button>
      </div>
      
      <div class="help-text">
        <div>By registering, you agree to our <a href="#" @click.prevent="showTerms">Terms & Conditions</a></div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import authApi from '@/api/authApi'; // Make sure this path is correct

const emit = defineEmits(['registered', 'switch-to-login']);

const name = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleSubmit() {
  loading.value = true;
  error.value = '';

  // Basic client-side validation
  if (!name.value.trim()) {
    error.value = 'Please enter your full name.';
    loading.value = false;
    return;
  }
  if (!email.value.trim()) {
    error.value = 'Please enter your email address.';
    loading.value = false;
    return;
  }
  if (!password.value) { 
    error.value = 'Please enter a password.';
    loading.value = false;
    return;
  }

  try {
    const userData = {
      name: name.value,
      email: email.value,
      password: password.value,
    };
    
    // This call now correctly matches the modified authApi.register(userData)
    const responseData = await authApi.register(userData); 
    
    if (responseData && responseData.token) {
      localStorage.setItem('jwt', responseData.token);
      emit('registered');
    } else {
      console.error('Registration response did not include a token or was unexpected:', responseData);
      error.value = 'Registration completed, but an issue occurred. Please try logging in.';
    }

  } catch (e) {
    console.error('Registration failed:', e);
    if (e.response && e.response.data && e.response.data.message) {
      error.value = e.response.data.message; 
    } else if (e.message) {
      error.value = e.message; 
    } else {
      error.value = 'Registration failed. An unknown error occurred.';
    }
  } finally {
    loading.value = false;
  }
}

function switchToLogin() {
  emit('switch-to-login');
}

function showTerms() {
  alert('Terms & Conditions will be displayed here. Implement a modal or navigation for a real application.');
}
</script>

<style scoped>
/* Using the styles from the last version you liked */
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh; 
  padding: 2rem 1rem;
  background-color: #f4f7f6; 
}

.register-form {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  padding: 2rem 2.5rem; 
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); 
}

.form-title {
  font-size: 2rem; 
  font-weight: 700; 
  color: #2c3e50; 
  margin-bottom: 2rem; 
  text-align: center;
}

.form-group {
  margin-bottom: 1.25rem; 
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #34495e; 
  margin-bottom: 0.5rem;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #bdc3c7; 
  border-radius: 8px;
  transition: border-color 0.3s, box-shadow 0.3s;
  overflow: hidden; 
}

.input-container:focus-within {
  border-color: #3498db; 
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2); 
}

.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 12px; 
  color: #7f8c8d; 
  font-style: normal; 
  font-size: 1.1rem;
}

.input-container input {
  flex: 1;
  border: none;
  padding: 14px 12px 14px 10px; 
  font-size: 1rem;
  outline: none;
  background: transparent;
  color: #2c3e50;
}

.input-container input::placeholder {
  color: #95a5a6; 
}

.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #fdedec; 
  border: 1px solid #f5c6cb; 
  border-radius: 6px;
  text-align: center;
}

.register-button {
  width: 100%;
  padding: 0.9rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: white;
  background-color: #3498db; 
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
  margin-top: 1rem; 
}

.register-button:hover {
  background-color: #2980b9; 
}

.register-button:active {
  transform: translateY(1px); 
}

.register-button:disabled {
  background-color: #a9d6f5; 
  cursor: not-allowed;
}

.login-option {
  margin-top: 2rem; 
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center; 
  gap: 0.75rem;
}

.login-option span {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.login-button {
  background-color: transparent;
  color: #3498db;
  border: 1px solid #3498db;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  max-width: 150px; 
}

.login-button:hover {
  background-color: #3498db;
  color: white;
}

.help-text {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.8rem; 
  color: #95a5a6;
}

.help-text a {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
}

.help-text a:hover {
  text-decoration: underline;
}
</style>
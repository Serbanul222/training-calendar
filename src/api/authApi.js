// Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
import apiClient from './index';

export default {
  register(email, password) {
    return apiClient.post('/auth/register', { email, password })
      .then(res => res.data);
  },
  login(email, password) {
    return apiClient.post('/auth/login', { email, password })
      .then(res => res.data);
  }
};
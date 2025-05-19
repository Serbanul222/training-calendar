import apiClient from './index';

export default {
  getCategories() {
    return apiClient.get('/categories')
      .then(response => response.data);
  },

  getCategory(id) {
    return apiClient.get(`/categories/${id}`)
      .then(response => response.data);
  },

  initializeCategories() {
    return apiClient.post('/categories/initialize')
      .then(response => response.data);
  }
};
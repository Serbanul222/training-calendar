import { ref, onMounted } from 'vue';
import categoryApi from '@/api/categoryApi';

export default function useCategories() {
  const categories = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchCategories = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      categories.value = await categoryApi.getCategories();
    } catch (err) {
      error.value = 'Failed to load categories';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const getCategoryById = (id) => {
    return categories.value.find(category => category.id === id);
  };

  // Initialize categories - used by admin
  const initializeCategories = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      await categoryApi.initializeCategories();
      await fetchCategories(); // Refresh categories after initialization
    } catch (err) {
      error.value = 'Failed to initialize categories';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // Load categories on component mount
  onMounted(fetchCategories);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    getCategoryById,
    initializeCategories
  };
}
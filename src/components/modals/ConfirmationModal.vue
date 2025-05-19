<template>
  <div v-if="show" class="modal-overlay" @click.self="onCancel">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button @click="onCancel" class="close-btn">&times;</button>
      </div>
      
      <div class="modal-body">
        <p>{{ message }}</p>
        
        <div class="form-actions">
          <button 
            v-if="showCancelButton" 
            @click="onCancel" 
            class="btn-cancel"
          >
            {{ cancelButtonText }}
          </button>
          <button 
            @click="onConfirm" 
            class="btn-confirm"
            :class="{ 'btn-danger': dangerous }"
          >
            {{ confirmButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirmation'
  },
  message: {
    type: String,
    required: true
  },
  confirmButtonText: {
    type: String,
    default: 'OK'
  },
  cancelButtonText: {
    type: String,
    default: 'Cancel'
  },
  showCancelButton: {
    type: Boolean,
    default: true
  },
  dangerous: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['confirm', 'cancel']);

function onConfirm() {
  emit('confirm');
}

function onCancel() {
  emit('cancel');
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100; /* Higher than other modals */
}

.modal-container {
  background-color: white;
  border-radius: 4px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
}

.modal-body {
  padding: 1rem;
}

.modal-body p {
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-cancel,
.btn-confirm {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  border: none;
}

.btn-confirm {
  background-color: #4a86e8;
  color: white;
}

.btn-danger {
  background-color: #e74c3c;
}

.btn-cancel {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
}
</style>
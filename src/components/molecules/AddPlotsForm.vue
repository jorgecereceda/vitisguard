<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Parcel, Denomination } from '@/types/weather'

interface Props {
  show: boolean
  initialData?: Parcel | null
}

const props = withDefaults(defineProps<Props>(), {
  initialData: null
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  submit: [data: Omit<Parcel, 'id'>]
  cancel: []
}>()

const isEditing = computed(() => !!props.initialData)

const formData = ref({
  name: '',
  latitude: '',
  longitude: '',
  denomination: 'Getaria' as Denomination
})

const errors = ref({
  name: '',
  latitude: '',
  longitude: ''
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.initialData) {
      formData.value = {
        name: props.initialData.name,
        latitude: props.initialData.latitude.toString(),
        longitude: props.initialData.longitude.toString(),
        denomination: props.initialData.denomination
      }
    } else {
      formData.value = {
        name: '',
        latitude: '',
        longitude: '',
        denomination: 'Getaria'
      }
    }
    errors.value = { name: '', latitude: '', longitude: '' }
  }
})

function validate(): boolean {
  errors.value = { name: '', latitude: '', longitude: '' }
  let isValid = true

  if (!formData.value.name.trim()) {
    errors.value.name = 'El nombre es obligatorio'
    isValid = false
  }

  const lat = parseFloat(formData.value.latitude)
  if (isNaN(lat) || lat < -90 || lat > 90) {
    errors.value.latitude = 'Latitud inválida (-90 a 90)'
    isValid = false
  }

  const lng = parseFloat(formData.value.longitude)
  if (isNaN(lng) || lng < -180 || lng > 180) {
    errors.value.longitude = 'Longitud inválida (-180 a 180)'
    isValid = false
  }

  return isValid
}

function handleSubmit() {
  if (!validate()) return

  emit('submit', {
    name: formData.value.name.trim(),
    latitude: parseFloat(formData.value.latitude),
    longitude: parseFloat(formData.value.longitude),
    denomination: formData.value.denomination
  })
}

function handleCancel() {
  emit('cancel')
  emit('update:show', false)
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleCancel()
  }
}
</script>

<template>
  <Teleport to="body">
    <dialog
      :open="show"
      class="modal-backdrop"
      @click="handleBackdropClick"
    >
      <div class="modal-content">
        <header class="modal-header">
          <h2>{{ isEditing ? 'Editar Parcela' : 'Nueva Parcela' }}</h2>
          <button type="button" class="close-btn" @click="handleCancel">
            ×
          </button>
        </header>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-field">
            <label for="plot-name">Nombre de Parcela *</label>
            <input
              id="plot-name"
              v-model="formData.name"
              type="text"
              placeholder="Ej: Txakoli Eguzkibegiko"
              :class="{ 'has-error': errors.name }"
            />
            <span v-if="errors.name" class="error">{{ errors.name }}</span>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label for="plot-lat">Latitud *</label>
              <input
                id="plot-lat"
                v-model="formData.latitude"
                type="text"
                placeholder="43.2851"
                :class="{ 'has-error': errors.latitude }"
              />
              <span v-if="errors.latitude" class="error">{{ errors.latitude }}</span>
            </div>

            <div class="form-field">
              <label for="plot-lng">Longitud *</label>
              <input
                id="plot-lng"
                v-model="formData.longitude"
                type="text"
                placeholder="-2.3504"
                :class="{ 'has-error': errors.longitude }"
              />
              <span v-if="errors.longitude" class="error">{{ errors.longitude }}</span>
            </div>
          </div>

          <div class="form-field">
            <label for="plot-denomination">Denominación de Origen *</label>
            <select id="plot-denomination" v-model="formData.denomination">
              <option value="Getaria">Getaria</option>
              <option value="Bizkaia">Bizkaia</option>
              <option value="Alava">Alava</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="handleCancel">
              Cancelar
            </button>
            <button type="submit" class="btn-submit">
              {{ isEditing ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border: none;
  z-index: 1000;
}

.modal-backdrop::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #111827;
}

.modal-form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-field input,
.form-field select {
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-field input:focus,
.form-field select:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-field input.has-error {
  border-color: #ef4444;
}

.form-field input.has-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-field input::placeholder {
  color: #9ca3af;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.error {
  font-size: 12px;
  color: #ef4444;
  min-height: 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
}

.btn-cancel,
.btn-submit {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #fff;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-submit {
  background: #4f46e5;
  border: none;
  color: #fff;
}

.btn-submit:hover {
  background: #4338ca;
}

@media (max-width: 480px) {
  .modal-content {
    max-width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
  }
}
</style>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Parcel, Denomination } from '@/types/weather'
import FormField from '@/components/molecules/FormField.vue'
import BaseSelect from '@/components/atoms/BaseSelect.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

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
  close: []
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

const denominationOptions = [
  { label: 'Getaria', value: 'Getaria' },
  { label: 'Bizkaia', value: 'Bizkaia' },
  { label: 'Alava', value: 'Alava' }
]

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
    denomination: formData.value.denomination,
    userId: ''
  })
}

function handleClose() {
  emit('close')
  emit('update:show', false)
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask" @click="handleBackdropClick">
      <div class="modal-container" @click.stop>
        <header class="modal-header">
          <h2 class="modal-title">{{ isEditing ? 'Editar Parcela' : 'Nueva Parcela' }}</h2>
          <button type="button" class="close-btn" @click="handleClose" aria-label="Cerrar">
            <span class="close-icon">×</span>
          </button>
        </header>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <FormField
            id="plot-name"
            name="name"
            label="Nombre de Parcela"
            v-model="formData.name"
            placeholder="Ej: Txakoli Eguzkibegiko"
            :error="errors.name"
            required
          />

          <div class="form-row">
            <FormField
              id="plot-lat"
              name="latitude"
              label="Latitud"
              v-model="formData.latitude"
              placeholder="43.2851"
              :error="errors.latitude"
              required
            />

            <FormField
              id="plot-lng"
              name="longitude"
              label="Longitud"
              v-model="formData.longitude"
              placeholder="-2.3504"
              :error="errors.longitude"
              required
            />
          </div>

          <BaseSelect
            id="plot-denomination"
            name="denomination"
            label="Denominación de Origen"
            v-model="formData.denomination"
            :options="denominationOptions"
            required
          />

          <div class="form-actions">
            <BaseButton type="button" variant="secondary" @click="handleClose">
              Cancelar
            </BaseButton>
            <BaseButton type="submit">
              {{ isEditing ? 'Actualizar' : 'Crear' }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  transition: opacity 0.3s ease;
  padding: 1.5rem;
}

.modal-container {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  margin: auto;
  background-color: #0e3124;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  color: #ffffff;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.5rem 1rem;
}

.modal-header h2.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.close-btn {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 20px;
  color: #a1bfa1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: rotate(90deg);
}

.modal-form {
  padding: 1.5rem 2.5rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
}

/* Customizing BaseButton classes if they were provided, otherwise using internal button styles */
.action-btn {
  padding: 0.8rem 1.75rem;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.action-btn--primary {
  background-color: #24634d;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.action-btn--primary:hover {
  transform: translateY(-1px);
  background-color: #2c7a5f;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.action-btn--secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #a1bfa1;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn--secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

/* Modal Transitions */
.modal-enter-from { opacity: 0; }
.modal-leave-to { opacity: 0; }
.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

@media (max-width: 480px) {
  .modal-container {
    max-width: 100%;
  }

  .modal-form {
    padding: 1.5rem;
  }

  .modal-header {
    padding: 1.5rem 1.5rem 0.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .action-btn {
    width: 100%;
  }
}
</style>

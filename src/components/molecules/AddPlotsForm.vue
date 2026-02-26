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
          <h2>{{ isEditing ? 'Editar Parcela' : 'Nueva Parcela' }}</h2>
          <button type="button" class="close-btn" @click="handleClose">
            ×
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

<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.modal-container {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  margin: auto;
  padding: 0;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
}

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(1.1);
}

@media (max-width: 480px) {
  .modal-container {
    max-width: 100%;
    margin: 16px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }
}
</style>

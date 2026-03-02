<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useWeatherStore } from '@/stores/weather'
import { useNavigation } from '@/composables/useNavigation'
import PannelLauyout from '@/layout/PannelLauyout.vue'
import AddPlotsForm from '@/components/molecules/AddPlotsForm.vue'
import ConfirmModal from '@/components/molecules/ConfirmModal.vue'
import type { Parcel } from '@/types/weather'

const weatherStore = useWeatherStore()
const { setNavigation } = useNavigation()

const showModal = ref(false)
const editingParcel = ref<Parcel | null>(null)
const showDeleteModal = ref(false)
const parcelToDelete = ref<Parcel | null>(null)

const parcels = computed(() => weatherStore.parcels)
const isLoading = computed(() => weatherStore.isLoading)
const error = computed(() => weatherStore.error)

onMounted(async () => {
  setNavigation('Parcels', 'Gestión de parcelas')
  await weatherStore.loadParcels()
})

function openAddModal() {
  editingParcel.value = null
  showModal.value = true
}

function openEditModal(parcel: Parcel) {
  editingParcel.value = parcel
  showModal.value = true
}

async function handleSubmit(data: Omit<Parcel, 'id'>) {
  if (editingParcel.value) {
    await weatherStore.updateParcel(editingParcel.value.id, data)
  } else {
    await weatherStore.addParcel(data)
  }
  showModal.value = false
  editingParcel.value = null
}

function handleDelete(parcel: Parcel) {
  parcelToDelete.value = parcel
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (parcelToDelete.value) {
    await weatherStore.removeParcel(parcelToDelete.value.id)
  }
  showDeleteModal.value = false
  parcelToDelete.value = null
}

const denominationLabels: Record<string, string> = {
  Getaria: 'DO Getaria',
  Bizkaia: 'DO Bizkaia',
  Alava: 'DO Alava'
}
</script>

<template>
  <PannelLauyout>
    <div class="plots-view">
      <header class="plots-view__header">
        <div class="plots-view__title-section">
          <h1 class="plots-view__title">Mis Parcelas</h1>
          <p class="plots-view__subtitle">Gestión y monitorización de viñedos</p>
        </div>
        <button class="add-plot-btn" @click="openAddModal">
          <span class="add-plot-btn__icon">+</span>
          <span class="add-plot-btn__text">Añadir Parcela</span>
        </button>
      </header>

      <div v-if="isLoading" class="plots-view__status-container">
        <div class="loader"></div>
        <p class="plots-view__status-text">Cargando tus parcelas...</p>
      </div>

      <div v-else-if="error" class="plots-view__status-container plots-view__status-container--error">
        <span class="status-icon">⚠️</span>
        <p>{{ error.message }}</p>
        <button class="retry-btn" @click="weatherStore.loadParcels()">
          Reintentar
        </button>
      </div>

      <div v-else-if="parcels.length === 0" class="plots-view__empty">
        <div class="empty-state">
          <div class="empty-state__icon-wrapper">
            <span class="empty-state__icon">🍇</span>
          </div>
          <h2 class="empty-state__title">Tu viñedo está esperando</h2>
          <p class="empty-state__text">
            Añade tu primera parcela para comenzar a recibir alertas meteorológicas y recomendaciones personalizadas.
          </p>
          <button class="add-plot-btn" @click="openAddModal">
            + Añadir Primera Parcela
          </button>
        </div>
      </div>

      <div v-else class="plots-view__grid">
        <article
          v-for="parcel in parcels"
          :key="parcel.id"
          class="plot-card"
        >
          <div class="plot-card__glow"></div>
          <div class="plot-card__header">
            <div class="plot-card__title-grp">
              <h3 class="plot-card__name">{{ parcel.name }}</h3>
              <span class="plot-card__id">ID: {{ parcel.id.slice(0, 8) }}</span>
            </div>
            <span class="plot-card__badge">
              {{ denominationLabels[parcel.denomination] || parcel.denomination }}
            </span>
          </div>

          <div class="plot-card__body">
            <div class="plot-card__info-row">
              <div class="plot-card__info-item">
                <span class="plot-card__label">Latitud</span>
                <span class="plot-card__value">{{ parcel.latitude.toFixed(5) }}°</span>
              </div>
              <div class="plot-card__info-item">
                <span class="plot-card__label">Longitud</span>
                <span class="plot-card__value">{{ parcel.longitude.toFixed(5) }}°</span>
              </div>
            </div>
          </div>

          <div class="plot-card__footer">
            <button
              class="plot-card__btn plot-card__btn--edit"
              @click="openEditModal(parcel)"
              title="Editar Parcela"
            >
              <span class="btn-icon">✏️</span>
              Editar
            </button>
            <button
              class="plot-card__btn plot-card__btn--delete"
              @click="handleDelete(parcel)"
              title="Eliminar Parcela"
            >
              <span class="btn-icon">🗑️</span>
              Eliminar
            </button>
          </div>
        </article>
      </div>

      <!-- FORMS & MODALS -->
      <Teleport to="body">
        <AddPlotsForm
          :show="showModal"
          :initial-data="editingParcel"
          @update:show="showModal = $event"
          @submit="handleSubmit"
          @close="showModal = false"
        />
      </Teleport>

      <Teleport to="body">
        <ConfirmModal
          :show="showDeleteModal"
          title="Eliminar Parcela"
          :message="`¿Estás seguro de eliminar la parcela '${parcelToDelete?.name}'? Esta acción no se puede deshacer.`"
          confirm-text="Eliminar"
          cancel-text="Cancelar"
          variant="danger"
          @update:show="showDeleteModal = $event"
          @confirm="confirmDelete"
        />
      </Teleport>
    </div>
  </PannelLauyout>
</template>

<style scoped>
.plots-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2.5rem;
  min-height: calc(100vh - 100px);
  font-family: 'Outfit', 'Inter', sans-serif;
}

.plots-view__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 3rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.plots-view__title-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.plots-view__title {
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #1e3a5f 0%, #0c4a6e 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  letter-spacing: -0.02em;
}

.plots-view__subtitle {
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

/* BUTTONS */
.add-plot-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border: none;
  padding: 0.8rem 1.6rem;
  border-radius: 14px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
}

.add-plot-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4);
}

.add-plot-btn:active {
  transform: translateY(0);
}

/* STATUS CONTAINERS */
.plots-view__status-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  text-align: center;
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid rgba(12, 74, 110, 0.1);
  border-bottom-color: #0c4a6e;
  border-radius: 50%;
  animation: rotation 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.plots-view__status-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0c4a6e;
}

/* EMPTY STATE */
.plots-view__empty {
  display: flex;
  justify-content: center;
  padding: 4rem 1rem;
}

.empty-state {
  max-width: 500px;
  text-align: center;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  padding: 4rem 3rem;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
}

.empty-state__icon-wrapper {
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  font-size: 3.5rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

.empty-state__title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e3a5f;
  margin-bottom: 1rem;
}

.empty-state__text {
  color: #64748b;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

/* GRID & CARDS */
.plots-view__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.plot-card {
  background: linear-gradient(135deg, #1e3a5f 0%, #0c4a6e 100%);
  border-radius: 28px;
  padding: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 30px rgba(12, 74, 110, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.plot-card:hover {
  transform: translateY(-10px) rotate(1deg);
  box-shadow: 0 25px 50px rgba(12, 74, 110, 0.3);
  border-color: rgba(255, 255, 255, 0.2);
}

.plot-card__glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  pointer-events: none;
  transition: all 0.5s ease;
}

.plot-card:hover .plot-card__glow {
  transform: translate(10%, 10%);
}

.plot-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.plot-card__name {
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0 0 0.25rem;
  letter-spacing: -0.01em;
}

.plot-card__id {
  font-size: 0.75rem;
  opacity: 0.5;
  font-family: monospace;
}

.plot-card__badge {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.4rem 1rem;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.plot-card__body {
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
}

.plot-card__info-row {
  display: flex;
  gap: 2rem;
}

.plot-card__info-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.plot-card__label {
  font-size: 0.7rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.plot-card__value {
  font-size: 1.1rem;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
}

.plot-card__footer {
  display: flex;
  gap: 1rem;
  margin-top: auto;
  position: relative;
  z-index: 1;
}

.plot-card__btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.plot-card__btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.02);
}

.plot-card__btn--delete:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.3);
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .plots-view {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .plots-view__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .plots-view__title {
    font-size: 2rem;
  }

  .add-plot-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .plots-view__grid {
    grid-template-columns: 1fr;
  }

  .plot-card {
    padding: 1.5rem;
  }
}
</style>

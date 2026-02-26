<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useWeatherStore } from '@/stores/weather'
import { useNavigation } from '@/composables/useNavigation'
import PannelLauyout from '@/layout/PannelLauyout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
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
          <p class="plots-view__subtitle">Gestiona tus parcelas de viñedo</p>
        </div>
        <BaseButton @click="openAddModal">
          + Añadir Parcela
        </BaseButton>
      </header>

      <div v-if="isLoading" class="plots-view__loading">
        Cargando parcelas...
      </div>

      <div v-else-if="error" class="plots-view__error">
        <p>{{ error.message }}</p>
        <BaseButton @click="weatherStore.loadParcels()">
          Reintentar
        </BaseButton>
      </div>

      <div v-else-if="parcels.length === 0" class="plots-view__empty">
        <div class="empty-state">
          <span class="empty-state__icon">🧱</span>
          <h2 class="empty-state__title">No hay parcelas</h2>
          <p class="empty-state__text">
            Comienza añadiendo tu primera parcela para monitorizarla
          </p>
          <BaseButton @click="openAddModal">
            + Añadir Primera Parcela
          </BaseButton>
        </div>
      </div>

      <div v-else class="plots-view__grid">
        <article
          v-for="parcel in parcels"
          :key="parcel.id"
          class="plot-card"
        >
          <div class="plot-card__header">
            <h3 class="plot-card__name">{{ parcel.name }}</h3>
            <span class="plot-card__badge">
              {{ denominationLabels[parcel.denomination] }}
            </span>
          </div>

          <div class="plot-card__body">
            <div class="plot-card__location">
              <span class="plot-card__label">Coordenadas</span>
              <span class="plot-card__value">
                {{ parcel.latitude.toFixed(4) }}, {{ parcel.longitude.toFixed(4) }}
              </span>
            </div>
          </div>

          <div class="plot-card__actions">
            <button
              class="plot-card__action-btn edit"
              @click="openEditModal(parcel)"
              title="Editar"
            >
              ✏️ Editar
            </button>
            <button
              class="plot-card__action-btn delete"
              @click="handleDelete(parcel)"
              title="Eliminar"
            >
              🗑️ Eliminar
            </button>
          </div>
        </article>
      </div>

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
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.plots-view__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.plots-view__title-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.plots-view__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.plots-view__subtitle {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
}

.plots-view__loading,
.plots-view__error {
  text-align: center;
  padding: 4rem 2rem;
  font-size: 1.1rem;
  color: #64748b;
}

.plots-view__error {
  color: #ef4444;
}

.plots-view__empty {
  display: flex;
  justify-content: center;
  padding: 3rem 1rem;
}

.empty-state {
  text-align: center;
  max-width: 400px;
}

.empty-state__icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.empty-state__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem;
}

.empty-state__text {
  color: #64748b;
  margin: 0 0 1.5rem;
  line-height: 1.5;
}

.plots-view__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.plot-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: box-shadow 0.2s, transform 0.2s;
}

.plot-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.plot-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.plot-card__name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  word-break: break-word;
}

.plot-card__badge {
  background: #f0fdf4;
  color: #16a34a;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  white-space: nowrap;
}

.plot-card__body {
  margin-bottom: 1rem;
}

.plot-card__location {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.plot-card__label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.plot-card__value {
  font-size: 0.9rem;
  color: #475569;
  font-family: monospace;
}

.plot-card__actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.plot-card__action-btn {
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  background: #f8fafc;
  color: #475569;
}

.plot-card__action-btn:hover {
  background: #f1f5f9;
}

.plot-card__action-btn.edit:hover {
  background: #eff6ff;
  color: #2563eb;
}

.plot-card__action-btn.delete:hover {
  background: #fef2f2;
  color: #dc2626;
}

@media (max-width: 640px) {
  .plots-view__header {
    flex-direction: column;
    align-items: stretch;
  }

  .plots-view__grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-color-scheme: dark) {
  .plot-card {
    background: #1e293b;
    border-color: #334155;
  }

  .plot-card__name {
    color: #f1f5f9;
  }

  .plot-card__badge {
    background: #166534;
    color: #86efac;
  }

  .plot-card__label {
    color: #64748b;
  }

  .plot-card__value {
    color: #94a3b8;
  }

  .plot-card__actions {
    border-color: #334155;
  }

  .plot-card__action-btn {
    background: #334155;
    color: #94a3b8;
  }

  .plot-card__action-btn:hover {
    background: #475569;
  }
}
</style>

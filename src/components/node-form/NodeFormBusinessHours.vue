<script setup>
import { computed } from 'vue'
import { Calendar, Clock } from '@element-plus/icons-vue'

import { WEEK_DAYS, WORK_HORS, TIMEZONE_OPTIONS } from '@/shared/constants.js'

const model = defineModel({
  type: Object,
  required: true,
})

const dayRows = computed(() => {
  const times = model.value.times ?? []
  return Object.keys(WEEK_DAYS).map((day) => {
    const entry = times.find((t) => t.day === day)
    return (
      entry ?? {
        day,
        startTime: WORK_HORS.start,
        endTime: WORK_HORS.end,
      }
    )
  })
})

function ensureDayEntry(day) {
  if (!Array.isArray(model.value.times)) {
    model.value.times = []
  }
  const times = model.value.times
  let index = times.findIndex((t) => t.day === day)
  if (index < 0) {
    times.push({
      day,
      startTime: WORK_HORS.start,
      endTime: WORK_HORS.end,
    })
    index = times.length - 1
  }
  return times[index]
}

function updateDay(day, field, value) {
  if (!value) return
  ensureDayEntry(day)[field] = value
}

function onTimezoneChange(value) {
  model.value.timezone = value
}
</script>

<template>
  <div class="bh-panel">
    <div class="bh-panel__header">
      <el-icon class="bh-panel__header-icon" :size="28">
        <Calendar />
      </el-icon>
      <div>
        <h3 class="bh-panel__title">Business Hours</h3>
        <p class="bh-panel__intro">
          Allows a branch to be created based on date &amp; time conditions. Use it to set business
          hours or date range conditions.
        </p>
      </div>
    </div>

    <div class="bh-panel__grid-head">
      <span>
        <el-icon><Calendar /></el-icon> Day
      </span>
      <span>
        <el-icon><Clock /></el-icon> Time
      </span>
    </div>

    <div v-for="row in dayRows" :key="row.day" class="bh-panel__row">
      <span class="bh-panel__day">{{ WEEK_DAYS[row.day] }}</span>
      <div class="bh-panel__times">
        <el-time-picker
          :model-value="row.startTime"
          format="HH:mm"
          value-format="HH:mm"
          placeholder="Start"
          :clearable="false"
          :teleported="true"
          @update:model-value="(v) => updateDay(row.day, 'startTime', v)"
        />
        <span class="bh-panel__to">to</span>
        <el-time-picker
          :model-value="row.endTime"
          format="HH:mm"
          value-format="HH:mm"
          placeholder="End"
          :clearable="false"
          :teleported="true"
          @update:model-value="(v) => updateDay(row.day, 'endTime', v)"
        />
      </div>
    </div>

    <div class="bh-panel__tz">
      <label class="bh-panel__tz-label">Time Zone</label>
      <el-select
        :model-value="model.timezone ?? 'UTC'"
        class="bh-panel__tz-select"
        @update:model-value="onTimezoneChange"
      >
        <el-option
          v-for="opt in TIMEZONE_OPTIONS"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </div>
  </div>
</template>

<style scoped>
.bh-panel {
  margin-top: 1rem;
}

.bh-panel__header {
  display: flex;
  gap: 12px;
  margin-bottom: 1.25rem;
}

.bh-panel__header-icon {
  flex-shrink: 0;
  color: var(--el-color-warning);
}

.bh-panel__title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
}

.bh-panel__intro {
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: var(--el-text-color-secondary);
}

.bh-panel__grid-head {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-regular);
}

.bh-panel__grid-head span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.bh-panel__row {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
}

.bh-panel__day {
  font-weight: 600;
  font-size: 13px;
}

.bh-panel__times {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.bh-panel__to {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.bh-panel__tz {
  margin-top: 1.25rem;
}

.bh-panel__tz-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.bh-panel__tz-select {
  width: 100%;
}

:deep(.el-date-editor.el-input) {
  width: 100px;
}
</style>

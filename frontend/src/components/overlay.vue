<template>
  <div class="overlay">
    <slot />
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";

export default class Home extends Vue {}
</script>
<style scoped>
.overlay {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: #aaaa;
  display: flex;
  justify-content: space-between;
  align-content: space-between;
}
</style>

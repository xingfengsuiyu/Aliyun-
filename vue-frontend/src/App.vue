<template>
  <router-view />
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.el-select {
  width: 100%;
  min-width: 200px;
}

.el-select .el-input__wrapper {
  width: 100%;
  min-width: 150px;
}

.el-select__wrapper,
.el-tooltip__trigger,
.el-tooltip__trigger {
  min-width: 150px !important;
}

.el-select-dropdown {
  position: absolute !important;
  background-color: #fff !important;
  opacity: 1 !important;
  min-width: 150px !important;
  width: auto !important;
}

.el-select-dropdown__list {
  display: block !important;
  padding: 6px 0;
  background-color: transparent !important;
  min-width: 100%;
}

.el-select-dropdown__item {
  height: 34px;
  line-height: 34px;
  display: block !important;
  text-align: left;
}

.el-select-dropdown__item span {
  display: inline-block;
  width: 100%;
  text-align: left;
}

.el-input__wrapper {
  width: 100%;
}

.el-input__inner {
  width: 100%;
}

.el-select__selected-item,
.el-select__input-wrapper {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  width: auto !important;
  height: auto !important;
  overflow: visible !important;
}

.el-select__selected-item.is-hidden,
.el-select__input-wrapper.is-hidden {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  width: auto !important;
  height: auto !important;
  overflow: visible !important;
}

[class*="el-select__selected-item"],
[class*="el-select__input-wrapper"] {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
}

div.el-select,
div.el-select__wrapper {
  display: flex !important;
}

div.el-select__wrapper {
  display: flex !important;
}
</style>

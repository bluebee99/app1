<!-- App.vue -->
<template>
  <component :is="currentComponent" />
</template>

<script setup>
import { shallowRef  } from 'vue'
import Login from './components/Login.vue'
import Signup from './components/Signup.vue'
import ToDo from './components/ToDo.vue'

// 画面遷移に使うマッピング
const components = {
  Login,
  Signup,
  ToDo,
}

// 初期画面を Login に設定（直接オブジェクト参照を渡す）
const currentComponent = shallowRef(Login)

// グローバル遷移関数（将来的には provide/inject や状態管理に分離すると理想的）
window.navigateTo = (screen) => {
  if (components[screen]) {
    currentComponent.value = components[screen]
  }
}
</script>

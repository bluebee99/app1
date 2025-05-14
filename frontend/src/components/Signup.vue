<template>
  <div class="auth-container">
    <h2>サインアップ</h2>
    <form @submit.prevent="signup">
      <label for="user_id">メールアドレスまたはID</label>
      <input v-model="user_id" type="text" required />

      <label for="user_name">ユーザー名（任意）</label>
      <input v-model="user_name" type="text" />

      <label for="password">パスワード</label>
      <input v-model="password" type="password" required />

      <button type="submit">登録</button>
    </form>
    <a href="#" @click.prevent="goToLogin">ログイン画面に戻る</a>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const user_id = ref('')
const user_name = ref('')
const password = ref('')

const signup = async () => {
  try {
    const res = await fetch('http://localhost:3001/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user_id.value,
        user_name: user_name.value,
        password: password.value
      })
    })

    if (res.ok) {
      alert('登録完了。ログイン画面へ移動します')
      window.navigateTo('Login')
    } else {
      const data = await res.json()
      alert('登録失敗: ' + (data.error || ''))
    }
  } catch (err) {
    console.error(err)
    alert('エラーが発生しました')
  }
}

const goToLogin = () => {
  window.navigateTo('Login')
}
</script>

<style scoped>
.auth-container {
  width: 400px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 8px;
}
input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
}
button {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
}
</style>

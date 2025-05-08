<template>
  <header>TODOアプリ</header>

  <main>

    <!------------ タスク入力エリア ------------>
    <div class="task-input-section">
      <input type="text" v-model="newTodo" placeholder="タスクを入力してください。"/>
      <button @click="addTodo">追加</button>
    </div>

    <!------------ タスクリストエリア ------------>
    <ul class="todo-list">

      <li v-for="todo in todos" :key="todo.id" class="todo-item">
        <label class="checkbox-label">
          <input type="checkbox" v-model="todo.done" class="checkbox">
          <i class="fa-regular fa-square"></i>
          <i class="fa-solid fa-square-check"></i>
          <span class="todo-no">{{ todo.no }}</span>
          <span class="todo-text">{{ todo.text }}</span>
        </label>
        <i class="icon fa-solid fa-pen" @click="openEditModal(todo)"></i>
        <i class="icon fa-solid fa-trash"></i>
      </li>
  
    </ul>
    
    <!------------ 登録ボタンエリア ------------>
    <div class="submit-button-section">
      <button>登録</button>
    </div>

    <!------------ タスク編集モーダルエリア ------------>
    <div v-if="isEditModalOpen" class="modal-overlay">
      <div class="modal">
        <h3>タスク {{ editedTodo.no }} を編集</h3>
        <textarea v-model="editedTodo.text" class="modal-textarea"></textarea>
        <div class="modal-actions">
          <button @click="updateTodo">更新</button>
          <button @click="closeEditModal">キャンセル</button>
        </div>
      </div>
    </div>

  </main>

    <!------------ フッター ------------>
    <footer>copyright 2025 sampleTodo Inc.</footer>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';

  const todos = ref([]);
  const newTodo = ref('');

  // 編集用
  const isEditModalOpen = ref(false);
  const editedTodo = ref({ id: null, no: null, text: '', done: false });

  // 編集モーダルを開く
const openEditModal = (todo) => {
  editedTodo.value = { ...todo }; //スプレッド構文
  isEditModalOpen.value = true;
};

// 編集モーダルを閉じる
const closeEditModal = () => {
  isEditModalOpen.value = false;
  editedTodo.value = { id: null, no: null, text: '', done: false };
};

  // 更新処理
  const updateTodo = async () => {
    try {
      await axios.put(`http://localhost:3001/api/todos/${editedTodo.value.id}`, {
        text: editedTodo.value.text,
      });
      closeEditModal();
      await fetchTodos(); // 最新化
    } catch (err) {
      console.error('更新失敗', err);
    }
  };

  // 初期表示時
  onMounted(() => {
    fetchTodos();
  });

  // 新規追加処理
  const addTodo = async () => {
    const trimmedText = newTodo.value.trim();
    if (trimmedText === '') return;
    
    try {
      await axios.post('http://localhost:3001/api/todos', {
        text: trimmedText
      });
      newTodo.value = '';
      await fetchTodos(); // 一覧を再取得して更新
    } catch (error) {
      console.error('登録エラー:', error);
    }
  };
  
// 一覧取得関数
const fetchTodos = async () => {
  try {
    const response = await axios.get('http://localhost:3001/api/todos');
    todos.value = response.data;
  } catch (error) {
    console.error('Failed to fetch todos:', error);
  }
};
</script>

<style src="./App.css" scoped />

<template>
  <header>TODOアプリ</header>

  <main>

    <!------------ タスク入力エリア ------------>
    <div class="task-input-section">
      <input type="text" v-model="newTodo" placeholder="タスクを入力してください。"/>
      <button @click="addTodo">追加</button>
    </div>

    <!------------ 完了タスクの表示切替 ------------>
    <div class="filter-section">
      <label class="checkbox-label">
        <input type="checkbox" v-model="showCompleted" @change="filterVisibleTodos" class="hidden-checkbox"/>
        <i class="icon fa-regular fa-square"></i>
        <i class="icon fa-solid fa-square-check"></i>
        <span>完了済タスクを表示する</span>
      </label>
    </div>

    <!------------ タスクリストエリア ------------>
    <ul class="todo-list">

      <li v-for="todo in visibleTodos" :key="todo.id" class="todo-item">
        <label class="checkbox-label flex-extend-1">
          <input type="checkbox" v-model="todo.done" class="hidden-checkbox">
          <i class="icon fa-regular fa-square"></i>
          <i class="icon fa-solid fa-square-check"></i>
          <span class="todo-no">{{ todo.no }}</span>
          <span class="todo-text">{{ todo.text }}</span>
        </label>
        <i class="icon fa-solid fa-pen" @click="openEditModal(todo)"></i>
        <i class="icon fa-solid fa-trash"></i>
      </li>
  
    </ul>
    
    <!------------ 登録ボタンエリア ------------>
    <div class="submit-button-section">
      <button @click="updateCheckedTodos">登録</button>
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
  import { ref, onMounted, computed } from 'vue';
  import axios from 'axios';
  
  const todos = ref([]);
  const visibleTodos = ref([]); // 表示専用のリスト
  const todosOriginal = ref([]); // doneフラグの変更検知のため更新前データを保持
  const newTodo = ref(''); //新規追加用のtodo
  const showCompleted = ref(false); // 完了タスクを表示するかどうか

  const isEditModalOpen = ref(false); //タスク編集用モーダルの表示スイッチ
  const editedTodo = ref({ id: null, no: null, text: '', done: false }); //タスク編集用の修正後タスクデータ保持
  
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

  // 完了タスクの切り替え
  const toggleCompleted = () => {
    showCompleted.value = !showCompleted.value;
    filterVisibleTodos();
  };

  const filterVisibleTodos = () => {
    visibleTodos.value = todos.value.filter(todo => {
      return showCompleted.value || !todo.done;
    });
  };

  // タスク全件を取得（初期表示や再表示時に呼び出される）
  const fetchTodos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/todos');
      todos.value = response.data;
      todosOriginal.value = JSON.parse(JSON.stringify(response.data)); // ディープコピー
      filterVisibleTodos();
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  };

  // 初期表示
  onMounted(() => {
    fetchTodos();
  });

  // 新規タスク追加処理
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

  // タスク更新（text）
  const updateTodo = async () => {
    try {
      await axios.put(`http://localhost:3001/api/todos/${editedTodo.value.id}`, {
        text: editedTodo.value.text,
      });  
      closeEditModal();
      await fetchTodos(); // 一覧を再取得して更新
    } catch (err) {
      console.error('更新失敗', err);
    }  
  };  

  //タスク更新（doneフラグ）
  const updateCheckedTodos = async () => {
    const updatedTodos = todos.value.filter(todo => {
      const original = todosOriginal.value.find(o => o.id === todo.id);
      return original && todo.done !== original.done;
    });
    
    try {
      for (const todo of updatedTodos) {
        await axios.put(`http://localhost:3001/api/todos/${todo.id}/done`, {
          done: todo.done
        });
      }

      alert('更新完了');
      // await fetchTodos(); // 一覧を再取得して更新

      filterVisibleTodos();
      todosOriginal.value = JSON.parse(JSON.stringify(todos.value)); // original も更新

    } catch (err) {
      console.error('更新失敗', err);
    }
  };

</script>

<style src="./App.css" scoped />

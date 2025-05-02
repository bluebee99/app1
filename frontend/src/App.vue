<template>
  <header>TODOアプリ</header>

  <main>
    <div class="task-input-section">
      <input type="text" placeholder="タスクを入力してください。"/>
      <button>追加</button>
    </div>

    <ul class="todo-list">

      <li v-for="todo in todos" :key="todo.id" class="todo-item">
        <label class="checkbox-label">
          <input type="checkbox" v-model="todo.done" class="checkbox">
          <i class="fa-regular fa-square"></i>
          <i class="fa-solid fa-square-check"></i>
          <span class="todo-text">{{ todo.text }}</span>
        </label>
        <i class="icon fa-solid fa-pen"></i>
        <i class="icon fa-solid fa-trash"></i>
      </li>
  
    </ul>
    
    <div class="submit-button-section">
      <button>登録</button>
    </div>
  </main>

  <footer>copyright 2025 sampleTodo Inc.</footer>
</template>

<script setup>

  import { ref } from 'vue';
  const todos = ref([
    { id: 1, no: 1, text: '要件定義の完了条件を合意する', done: true},
    { id: 2, no: 2, text: '要件定義レビューの日程を決定する', done: true},
    { id: 3, no: 3, text: '要件定義工程の検収条件を再確認する', done: false},
    { id: 4, no: 4, text: '要件定義工程の完了確認会議を実施し、検収手続に進むよう依頼する', done: false},
  ]);
  const newTodo = ref('');

</script>

<style scoped>
  main {
    width: 500px;
    margin: 0 auto; /*中央揃え width指定必須*/
  }

  header, footer {
    background-color: #AFB;
  }

  header {
    display: flex;
    position:sticky;
    top:0;
    align-items: center;
    height: 42px;
    padding: 3px 25px;
    margin-bottom: 16px;
    font-size: 28px;
    font-weight: bold;
  }

  footer {
    display: flex;
    position:sticky;
    bottom:0;
    align-items: center;
    justify-content: center;
    height: 42px;
    margin-top: 16px;
    font-size: 14px;
    font-weight: bold;
  }

  button {
    font-size: 18px;
    color: white;
    background-color: rgb(134,223,255);
    border: none;
    padding:6px 20px;
    width: 120px;
    border-radius: 20px;
    cursor: pointer;
  }

  button:active {
    box-shadow: inset 3px 3px 6px rgba(0,0,0,0.3);
    background-color:rgb(114,200,230);
  }

  /**************** タスク入力欄 ****************/
  div.task-input-section {
    display: flex;
    margin-bottom: 20px;
  }

  div.task-input-section input[type="text"] {
    flex:1;
    font-size: 15px;
    padding-left: 10px;
    background-color: rgb(240,240,240);
    border: none;
  }

  div.task-input-section button {
    margin-left: 20px;
  }
  
  /**************** タスクリスト欄 ****************/
  ul.todo-list {
      list-style: none;
      padding-left: 0px;
  }
  
  li.todo-item {
    display: flex;
    gap: 20px;
    background-color:rgb(240,240,240);
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 8px;
  }

  label.checkbox-label {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  span.todo-text{
    display: inline-block;
    font-size: 18px;
    margin-left: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  li.todo-item i {
    font-size: 28px;
  }

  input.checkbox {
    display: none;
  }

  label.checkbox-label {
    cursor: pointer;
  }

  .checkbox ~ .fa-square-check {
    display: none;
  }

  .checkbox:checked ~ .fa-square {
    display: none;
  }

  .checkbox:checked ~ .fa-square-check {
    display: inline;
    color: rgb(32,32,32);
  }

  /**************** 登録ボタン欄 ****************/
  div.submit-button-section {
    display: flex;
    justify-content: center;
  }

</style>

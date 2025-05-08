const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// SELECT タスク一覧取得
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY no ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// INSERT 新規タスク追加
app.post('/api/todos', async (req, res) => {
  try {
    const { text } = req.body;

    // no の最大値を取得
    const maxResult = await pool.query('SELECT MAX(no) AS max_no FROM todos');
    const maxNo = maxResult.rows[0].max_no || 0;
    const nextNo = maxNo + 1;

    // 新しいレコードを挿入
    const result = await pool.query(
      'INSERT INTO todos (no, text, done) VALUES ($1, $2, false) RETURNING *',
      [nextNo, text]
    );

    // no 振りなおし
    await renumberTodos();

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// UPDATE タスク更新（text）
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const result = await pool.query(
      'UPDATE todos SET text = $1 WHERE id = $2 RETURNING *',
      [text, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// UPDATE タスク更新（doneフラグ）
app.put('/api/todos/:id/done', async (req, res) => {
  try {
    const { id } = req.params;
    const { done } = req.body;

    if (typeof done !== 'boolean') {
      return res.status(400).json({ error: 'done must be a boolean' });
    }

    const result = await pool.query(
      'UPDATE todos SET done = $1 WHERE id = $2 RETURNING *',
      [done, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error('Error updating done flag:', err);
    res.status(500).send('Server error');
  }
});

// DELETE タスク削除
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // no 振りなおし
    await renumberTodos();

    res.json(result.rows[0]);

  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).send('Server error');
  }
});

// no 振りなおし
const renumberTodos = async () => {
  await pool.query(`
    WITH reordered AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_no
      FROM todos
    )
    UPDATE todos
    SET no = reordered.new_no
    FROM reordered
    WHERE todos.id = reordered.id
  `);
};

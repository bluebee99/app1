const express = require('express');
const session = require('express-session');
const cors = require('cors');
const crypto = require('crypto');
const pool = require('./db');

const app = express();
const PORT = 3001;

app.use(cors({
  origin: 'http://localhost:5173', // VueのURLに合わせてください
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // HTTPSにする場合はtrue
    httpOnly: true,
    maxAge: 1000 * 60 * 60 // 1時間
  }
}));

// パスワードハッシュ化
function hashPassword(password, salt) {
  let hash = password + salt;
  for (let i = 0; i < 1000; i++) {
    hash = crypto.createHash('sha256').update(hash).digest('hex');
  }
  return hash;
}

// ----------------- サインアップ -----------------
app.post('/api/signup', async (req, res) => {
  const { user_id, password, user_name } = req.body;
  const salt = crypto.randomBytes(16).toString('hex');
  const hashedPassword = hashPassword(password, salt);
  try {
    await pool.query(
      'INSERT INTO users (user_id, password, salt, user_name) VALUES ($1, $2, $3, $4)',
      [user_id, hashedPassword, salt, user_name]
    );
    res.status(201).json({ message: 'ユーザー登録成功' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'ユーザー登録失敗' });
  }
});

// ----------------- ログイン -----------------
app.post('/api/login', async (req, res) => {
  const { user_id, password } = req.body
  const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: 'ユーザが存在しません' })

  const hashed = hashPassword(password, user.salt)
  if (hashed !== user.password) return res.status(401).json({ error: 'パスワードが間違っています' })

  req.session.user = { user_id: user.user_id, user_name: user.user_name }
  res.json({ message: 'ログイン成功' })
})


// ----------------- ログアウト -----------------
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.json({ message: 'ログアウトしました' });
});

// ----------------- セッション確認 -----------------
app.get('/api/check-session', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: '未ログイン' });
  }
});

// ----------------- ToDo 一覧取得 -----------------
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY no ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

// ----------------- ToDo 登録 -----------------
app.post('/api/todos', async (req, res) => {
  try {
    const { text } = req.body;
    const maxResult = await pool.query('SELECT MAX(no) AS max_no FROM todos');
    const maxNo = maxResult.rows[0].max_no || 0;
    const nextNo = maxNo + 1;

    const result = await pool.query(
      'INSERT INTO todos (no, text, done) VALUES ($1, $2, false) RETURNING *',
      [nextNo, text]
    );

    await renumberTodos();
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

// ----------------- ToDo 更新 -----------------
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
    res.status(500).send('サーバーエラー');
  }
});

// ----------------- ToDo 完了フラグ更新 -----------------
app.put('/api/todos/:id/done', async (req, res) => {
  try {
    const { id } = req.params;
    const { done } = req.body;
    const result = await pool.query(
      'UPDATE todos SET done = $1 WHERE id = $2 RETURNING *',
      [done, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '対象が見つかりません' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

// ----------------- ToDo 削除 -----------------
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '対象が見つかりません' });
    }

    await renumberTodos();
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

// ----------------- no振りなおし -----------------
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

// ----------------- 起動 -----------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

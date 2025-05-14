import React, { useState, useEffect } from "react";
import "./App.css";
import { db } from "./lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

export default function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");

  // Firestore에서 할 일 목록 실시간 구독
  useEffect(() => {
    const q = query(collection(db, "todos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTodos(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return unsubscribe;
  }, []);

  // 할 일 추가
  const handleAdd = async () => {
    if (title.trim() === "") return;
    await addDoc(collection(db, "todos"), {
      title,
      content,
      done: false,
      createdAt: new Date(),
    });
    setTitle("");
    setContent("");
  };

  // 할 일 완료 토글
  const handleToggle = async (id, done) => {
    await updateDoc(doc(db, "todos", id), { done: !done });
  };

  // 할 일 수정
  const handleEdit = async (id, prevTitle, prevContent) => {
    const newTitle = prompt("새 제목을 입력하세요", prevTitle);
    if (newTitle === null) return;
    const newContent = prompt("새 내용을 입력하세요", prevContent);
    if (newContent === null) return;
    await updateDoc(doc(db, "todos", id), {
      title: newTitle,
      content: newContent,
    });
  };

  // 할 일 삭제
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "todos", id));
  };

  const filteredTodos =
    filter === "all"
      ? todos
      : filter === "done"
      ? todos.filter((t) => t.done)
      : todos.filter((t) => !t.done);

  return (
    <div className="todo-bg">
      <div className="todo-card">
        <div className="todo-header">할 일 목록</div>
        <div className="todo-input-row">
          <input
            className="todo-input"
            placeholder="제목을 입력하세요..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <input
            className="todo-input"
            placeholder="내용을 입력하세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button className="todo-add-btn" onClick={handleAdd}>
            <span className="plus-icon">＋</span>
          </button>
        </div>
        <div className="todo-filters">
          <button
            className={
              filter === "all" ? "filter-btn active" : "filter-btn"
            }
            onClick={() => setFilter("all")}
          >
            전체
          </button>
          <button
            className={
              filter === "undone" ? "filter-btn active" : "filter-btn"
            }
            onClick={() => setFilter("undone")}
          >
            미완료
          </button>
          <button
            className={
              filter === "done" ? "filter-btn active" : "filter-btn"
            }
            onClick={() => setFilter("done")}
          >
            완료
          </button>
        </div>
        <div className="todo-list">
          {filteredTodos.length === 0 ? (
            <>
              <div className="todo-empty">할 일을 추가해보세요!</div>
              {todos.length > 0 && filter !== "undone" && (
                <div className="todo-all-done">
                  모든 할 일을 완료했습니다! 🎉
                </div>
              )}
            </>
          ) : (
            filteredTodos.map((todo) => (
              <div key={todo.id} className={todo.done ? "todo-item done" : "todo-item"}>
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => handleToggle(todo.id, todo.done)}
                  className="todo-checkbox"
                />
                <span className={todo.done ? "todo-title done" : "todo-title"}>{todo.title}</span>
                {todo.content && (
                  <span className="todo-content">{todo.content}</span>
                )}
                <span className="todo-actions">
                  <button className="todo-edit-btn" onClick={() => handleEdit(todo.id, todo.title, todo.content)} title="수정">✏️</button>
                  <button className="todo-delete-btn" onClick={() => handleDelete(todo.id)} title="삭제">🗑️</button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

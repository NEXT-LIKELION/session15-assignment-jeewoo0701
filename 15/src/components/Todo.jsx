import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PlusCircle, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Todo() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [filter, setFilter] = useState('all');

  // 할 일 목록 가져오기
  const fetchTodos = async () => {
    const querySnapshot = await getDocs(collection(db, 'todos'));
    const todoList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setTodos(todoList);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // 할 일 추가
  const addTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addDoc(collection(db, 'todos'), {
      title,
      content,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString()
    });

    setTitle('');
    setContent('');
    setDueDate('');
    fetchTodos();
  };

  // 할 일 삭제
  const deleteTodo = async (id) => {
    await deleteDoc(doc(db, 'todos', id));
    fetchTodos();
  };

  // 할 일 수정
  const updateTodo = async (id, updatedData) => {
    await updateDoc(doc(db, 'todos', id), updatedData);
    fetchTodos();
  };

  // 할 일 완료 상태 토글
  const toggleTodo = async (id, completed) => {
    await updateDoc(doc(db, 'todos', id), { completed: !completed });
    fetchTodos();
  };

  // 검색 및 필터링
  const filteredTodos = todos.filter(todo => {
    const matchesSearch = searchType === 'title' 
      ? todo.title.toLowerCase().includes(searchTerm.toLowerCase())
      : searchType === 'content'
      ? todo.content.toLowerCase().includes(searchTerm.toLowerCase())
      : todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.content.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'active') return matchesSearch && !todo.completed;
    if (filter === 'completed') return matchesSearch && todo.completed;
    return matchesSearch;
  });

  const activeTodosCount = todos.filter(todo => !todo.completed).length;

  return (
    <div className="w-full max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6">
          <h1 className="text-3xl font-bold text-white text-center">할 일 관리</h1>
        </div>

        <div className="p-6">
          {/* 검색 영역 */}
          <div className="mb-6 flex gap-2">
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border border-pink-200 rounded-full px-4 py-2 focus:outline-none focus:border-pink-500"
            />
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="border border-pink-200 rounded-full px-4 py-2 focus:outline-none focus:border-pink-500"
            >
              <option value="all">전체</option>
              <option value="title">제목</option>
              <option value="content">내용</option>
            </select>
          </div>

          {/* 필터 버튼 */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full ${
                filter === 'all' 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-full ${
                filter === 'active' 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              미완료
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-full ${
                filter === 'completed' 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              완료
            </button>
          </div>

          {/* 할 일 추가 폼 */}
          <form onSubmit={addTodo} className="mb-6 flex gap-2">
            <input
              type="text"
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 border border-pink-200 rounded-full px-4 py-2 focus:outline-none focus:border-pink-500"
            />
            <input
              type="text"
              placeholder="내용"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 border border-pink-200 rounded-full px-4 py-2 focus:outline-none focus:border-pink-500"
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border border-pink-200 rounded-full px-4 py-2 focus:outline-none focus:border-pink-500"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-full hover:from-pink-600 hover:to-purple-600 flex items-center gap-2"
            >
              <PlusCircle className="h-5 w-5" />
              추가
            </button>
          </form>

          {/* 할 일 목록 */}
          <AnimatePresence>
            {filteredTodos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-500 py-8"
              >
                {filter === 'all'
                  ? '할 일을 추가해보세요!'
                  : filter === 'active'
                  ? '완료되지 않은 할 일이 없습니다.'
                  : '완료된 할 일이 없습니다.'}
              </motion.div>
            ) : (
              <div className="space-y-4 max-w-2xl mx-auto">
                {filteredTodos.map((todo) => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`p-2 rounded-lg ${
                      todo.completed ? 'bg-gray-50' : 'bg-white shadow-sm'
                    } hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <button
                          onClick={() => toggleTodo(todo.id, todo.completed)}
                          className="focus:outline-none flex-shrink-0"
                        >
                          {todo.completed ? (
                            <CheckCircle2 className="h-6 w-6 text-pink-500" />
                          ) : (
                            <Circle className="h-6 w-6 text-gray-300 hover:text-pink-300" />
                          )}
                        </button>
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex flex-col gap-0.5">
                            <h3 className={`text-lg font-semibold ${
                              todo.completed ? 'line-through text-gray-500' : ''
                            }`}>
                              {todo.title}
                            </h3>
                            <p className={`text-sm leading-tight ${
                              todo.completed ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {todo.content}
                            </p>
                            <p className="text-xs text-gray-400">
                              마감일: {todo.dueDate}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => {
                            const newTitle = prompt('새 제목:', todo.title);
                            const newContent = prompt('새 내용:', todo.content);
                            const newDueDate = prompt('새 마감일:', todo.dueDate);
                            if (newTitle && newContent && newDueDate) {
                              updateTodo(todo.id, {
                                title: newTitle,
                                content: newContent,
                                dueDate: newDueDate
                              });
                            }
                          }}
                          className="text-gray-400 hover:text-yellow-500 p-2 rounded-full hover:bg-yellow-50"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          <div className="mt-6 text-sm text-gray-500 text-center">
            {activeTodosCount === 0
              ? '모든 할 일을 완료했습니다! 🎉'
              : `${activeTodosCount}개의 할 일이 남아있습니다.`}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Todo; 
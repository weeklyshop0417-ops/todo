const STORAGE_KEY = 'todo-app.items';

const form = document.getElementById('new-form');
const input = document.getElementById('new-input');
const list = document.getElementById('list');
const empty = document.getElementById('empty');
const count = document.getElementById('count');
const clearDone = document.getElementById('clear-done');
const filterButtons = document.querySelectorAll('.filters button');

let todos = load();
let filter = 'all';

document.getElementById('today').textContent = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
});

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // 저장소를 사용할 수 없는 환경(사생활 보호 모드 등)에서는 메모리에만 유지
  }
}

function update() {
  save();
  render();
}

function render() {
  const visible = todos.filter((t) =>
    filter === 'all' ? true : filter === 'done' ? t.done : !t.done
  );

  list.replaceChildren(...visible.map(renderItem));

  empty.hidden = visible.length > 0;
  empty.textContent = todos.length === 0 ? '할 일이 없습니다. 위에서 추가해 보세요.' : '해당하는 항목이 없습니다.';

  const remaining = todos.filter((t) => !t.done).length;
  count.textContent = `남은 할 일 ${remaining}개`;
  clearDone.disabled = !todos.some((t) => t.done);
}

function renderItem(todo) {
  const li = document.createElement('li');
  li.className = 'item' + (todo.done ? ' done' : '');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.done;
  checkbox.setAttribute('aria-label', '완료 표시');
  checkbox.addEventListener('change', () => {
    todo.done = checkbox.checked;
    update();
  });

  const text = document.createElement('span');
  text.className = 'text';
  text.textContent = todo.text;
  text.title = '더블클릭하여 수정';
  text.addEventListener('dblclick', () => startEdit(li, text, todo));

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'delete';
  del.textContent = '×';
  del.setAttribute('aria-label', '삭제');
  del.addEventListener('click', () => {
    todos = todos.filter((t) => t.id !== todo.id);
    update();
  });

  li.append(checkbox, text, del);
  return li;
}

function startEdit(li, textEl, todo) {
  const edit = document.createElement('input');
  edit.className = 'edit';
  edit.value = todo.text;
  edit.maxLength = 200;
  textEl.replaceWith(edit);
  edit.focus();
  edit.select();

  let finished = false;
  const finish = (commit) => {
    if (finished) return;
    finished = true;
    const value = edit.value.trim();
    if (commit) {
      if (value) todo.text = value;
      else todos = todos.filter((t) => t.id !== todo.id);
    }
    update();
  };

  edit.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finish(true);
    else if (e.key === 'Escape') finish(false);
  });
  edit.addEventListener('blur', () => finish(true));
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.push({ id: crypto.randomUUID?.() ?? String(Date.now() + Math.random()), text, done: false });
  input.value = '';
  update();
});

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle('active', b === btn));
    render();
  });
});

clearDone.addEventListener('click', () => {
  todos = todos.filter((t) => !t.done);
  update();
});

render();

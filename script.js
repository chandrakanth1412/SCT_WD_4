// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const dateTimeInput = document.getElementById('dateTimeInput');
const taskList = document.getElementById('taskList');

// Task State (array of objects)
let tasks = JSON.parse(localStorage.getItem('tasks')) || []; // Load from localStorage

// Load and render tasks on page load
document.addEventListener('DOMContentLoaded', renderTasks);

// Add task
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    const dateTime = dateTimeInput.value;
    if (text && dateTime) {
        const task = {
            id: Date.now(), // Unique ID
            text,
            dateTime,
            completed: false
        };
        tasks.push(task);
        saveTasks();
        renderTasks();
        taskForm.reset();
    }
});

// Render tasks
function renderTasks() {
    taskList.innerHTML = '';
    // Sort: Incomplete by date, then completed
    tasks.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed - b.completed;
        return new Date(a.dateTime) - new Date(b.dateTime);
    });

    tasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = `task ${task.completed ? 'completed' : ''} ${isOverdue(task) ? 'overdue' : ''}`;
        taskEl.dataset.id = task.id;

        taskEl.innerHTML = `
            <span class="task-text">${task.text}</span>
            <input type="text" class="edit-input" value="${task.text}" style="display: none;">
            <span class="task-date">${formatDateTime(task.dateTime)}</span>
            <div class="task-actions">
                <button class="complete-btn">${task.completed ? 'Undo' : 'Complete'}</button>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;

        // Event listeners for buttons
        taskEl.querySelector('.complete-btn').addEventListener('click', () => toggleComplete(task.id));
        taskEl.querySelector('.edit-btn').addEventListener('click', () => startEdit(task.id));
        taskEl.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

        taskList.appendChild(taskEl);
    });
}

// Toggle complete
function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
}

// Start edit
function startEdit(id) {
    const taskEl = document.querySelector(`[data-id="${id}"]`);
    const textSpan = taskEl.querySelector('.task-text');
    const editInput = taskEl.querySelector('.edit-input');
    const dateInput = document.createElement('input');
    dateInput.type = 'datetime-local';
    dateInput.value = tasks.find(t => t.id === id).dateTime;
    dateInput.className = 'edit-date';

    taskEl.classList.add('editing');
    textSpan.style.display = 'none';
    editInput.style.display = 'block';
    taskEl.querySelector('.task-date').replaceWith(dateInput);

    // Save on enter or blur
    const saveEdit = () => {
        const newText = editInput.value.trim();
        const newDate = dateInput.value;
        if (newText && newDate) {
            const task = tasks.find(t => t.id === id);
            task.text = newText;
            task.dateTime = newDate;
            saveTasks();
        }
        renderTasks();
    };
    editInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') saveEdit(); });
    editInput.addEventListener('blur', saveEdit);
    dateInput.addEventListener('blur', saveEdit);
}

// Delete task
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

// Check if overdue
function isOverdue(task) {
    return !task.completed && new Date(task.dateTime) < new Date();
}

// Format date/time for display
function formatDateTime(dateTime) {
    const date = new Date(dateTime);
    const now = new Date();
    const diff = date - now;
    if (diff < 0) return 'Overdue';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `Due in ${hours} hours`;
    const days = Math.floor(hours / 24);
    return `Due in ${days} days`;
}

// Save to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
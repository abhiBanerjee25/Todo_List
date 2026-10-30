const addTodoBtn = document.getElementById("addTodoBtn");
const inputTag = document.getElementById("todoInput");
const todoListUl = document.getElementById("todoList");
const itemsLeft = document.getElementById("itemsLeft");
let todoText;

const API_URL = "https://todo-list-qscp.onrender.com/api/todos";
let todos = [];

const fetchTodos = async () => {
    const response = await fetch(API_URL);
    todos = await response.json();
    populateTodos();
    updateItemsLeft();
};

//items left function 
const updateItemsLeft = () => {
    const activeTodos = todos.filter(todo => !todo.isCompleted);
    itemsLeft.textContent = `${activeTodos.length} items left`;
};

let currentFilter = "all";

const populateTodos = () => {
    let string = "";
    let filteredTodos = [...todos];

    if (currentFilter === "active") {
        filteredTodos = filteredTodos.filter(todo => !todo.isCompleted);
    } else if (currentFilter === "completed") {
        filteredTodos = filteredTodos.filter(todo => todo.isCompleted);
    }

    const sortedTodos = filteredTodos.sort((a, b) => {
        return a.title.localeCompare(b.title, undefined, { numeric: true });
    });

    for (const todo of sortedTodos) {
        string += `
<li id="todo-${todo.id}" class="todo-item ${todo.isCompleted ? "completed" : ""}">
    <input type="checkbox" class="todo-checkbox" ${todo.isCompleted ? "checked" : ""}>
    <span class="todo-text">${todo.title}</span>
    <button class="delete-btn">x</button>
</li>`;
    }

    todoListUl.innerHTML = string;

    // RE-ADDED: Missing selector for checkboxes
    const todoCheckboxes = document.querySelectorAll(".todo-checkbox");

    // checkbox logic
    todoCheckboxes.forEach((element) => {
        element.addEventListener("click", async (e) => {
            const parentId = element.parentNode.id;
            const todoId = Number(parentId.replace("todo-", ""));
            const isChecked = e.target.checked;

            await fetch(`${API_URL}/${todoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isCompleted: isChecked })
            });

            todos = todos.map(todo => {
                if (todo.id === todoId) {
                    return { ...todo, isCompleted: isChecked };
                }
                return todo;
            });

            updateItemsLeft();
            populateTodos();
        });
    });

    // RE-ADDED: Missing selector for delete buttons
    const deleteBtns = document.querySelectorAll(".delete-btn");

    // FIXED TYPO: ldeleteBtns -> deleteBtns
    deleteBtns.forEach((element) => {
        element.addEventListener("click", async (e) => {
            const todoId = Number(e.target.parentNode.id.replace("todo-", ""));
            const todoToDelete = todos.find(todo => todo.id === todoId);

            if (!todoToDelete.isCompleted) {
                alert("Complete the task before deleting it.");
                return;
            }
            if (!confirm("Delete this completed task?")) {
                return;
            }

            await fetch(`${API_URL}/${todoId}`, {
                method: "DELETE"
            });

            todos = todos.filter(todo => todo.id !== todoId);
            
            updateItemsLeft();
            populateTodos();
        });
    });
};

// add todo
addTodoBtn.addEventListener("click", async () => {
    todoText = inputTag.value.trim();
    if (!todoText) return;

    inputTag.value = "";

    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: todoText })
    });

    const newTodo = await response.json();
    todos.push(newTodo);
    
    updateItemsLeft();
    populateTodos();
});

//enter buttons
inputTag.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        addTodoBtn.click();
    }
});

//Active buttons
const filterBtns = document.querySelectorAll(".filter-btn");

filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filterBtns.forEach(button => {
            button.classList.remove("active");
        });
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        populateTodos();
    });
});

// Completed Buttons (UPDATED TO USE API)
const clearCompletedBtn = document.getElementById("clearCompletedBtn");

clearCompletedBtn.addEventListener("click", async () => {
    const completedTodos = todos.filter(todo => todo.isCompleted);
    
    // Send a delete request to the API for every completed task
    for (const todo of completedTodos) {
        await fetch(`${API_URL}/${todo.id}`, { method: "DELETE" });
    }

    // Update local state after successful server deletion
    todos = todos.filter(todo => !todo.isCompleted);
    updateItemsLeft();
    populateTodos();
});

// Initial API fetch (Removed redundant populate/update function calls)
fetchTodos();
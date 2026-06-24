const addTodoBtn = document.getElementById("addTodoBtn")
const inputTag = document.getElementById("todoInput")
const todoListUl = document.getElementById("todoList")
const itemsLeft = document.getElementById("itemsLeft")
let todoText;

let todos = []
let todosString = localStorage.getItem("todos")

// load from localStorage
if (todosString) {
    todos = JSON.parse(todosString)
}

//items left function 
const updateItemsLeft = () => {
    const activeTodos = todos.filter(todo => !todo.isCompleted)
    itemsLeft.textContent = `${activeTodos.length} items left`
}

let currentFilter = "all"

//normalizing function
const normalizeIds = () => {
    todos = todos.map((todo, index) => {
        return {
            ...todo,
            id: index + 1
        }
    })
}

const populateTodos = () => {
    let string = ""

    let filteredTodos = [...todos]

    if (currentFilter === "active") {
        filteredTodos = filteredTodos.filter(todo => !todo.isCompleted)
    }
    else if (currentFilter === "completed") {
        filteredTodos = filteredTodos.filter(todo => todo.isCompleted)
    }

    const sortedTodos = filteredTodos.sort((a, b) => {
        return a.title.localeCompare(b.title, undefined, { numeric: true })
    })

    for (const todo of sortedTodos) {
        string += `
<li id="todo-${todo.id}" class="todo-item ${todo.isCompleted ? "completed" : ""}">
    <input type="checkbox" class="todo-checkbox" ${todo.isCompleted ? "checked" : ""}>
    <span class="todo-text">${todo.title}</span>
    <button class="delete-btn">x</button>
</li>`
    }

    todoListUl.innerHTML = string

    // checkbox logic
    const todoCheckboxes = document.querySelectorAll(".todo-checkbox")

    todoCheckboxes.forEach((element) => {
        element.addEventListener("click", (e) => {
            const parentId = element.parentNode.id

            if (e.target.checked) {
                element.parentNode.classList.add("completed")

                todos = todos.map(todo => {
                    if ("todo-" + todo.id == parentId) {
                        return { ...todo, isCompleted: true }
                    }
                    return todo
                })
            } else {
                element.parentNode.classList.remove("completed")

                todos = todos.map(todo => {
                    if ("todo-" + todo.id == parentId) {
                        return { ...todo, isCompleted: false }
                    }
                    return todo
                })
            }

            localStorage.setItem("todos", JSON.stringify(todos))
            updateItemsLeft()
        })
    })

    // delete logic
    let deleteBtns = document.querySelectorAll(".delete-btn")

    deleteBtns.forEach((element) => {
    element.addEventListener("click", (e) => {
        const todoId = Number(e.target.parentNode.id.replace("todo-", ""))
        const todoToDelete = todos.find(todo => todo.id === todoId)

        if (!todoToDelete.isCompleted) {
            alert("Complete the task before deleting it.")
            return
        }
        //comfirmation for deleting task
        if (!confirm("Delete this completed task?")) {
            return
        }

        todos = todos.filter(todo => todo.id !== todoId)

        normalizeIds()

        localStorage.setItem("todos", JSON.stringify(todos))
        updateItemsLeft()
        populateTodos()
        })
    })
}

// add todo (MOVED OUTSIDE to avoid duplicate listeners)
addTodoBtn.addEventListener("click", () => {
    todoText = inputTag.value.trim()
    if (!todoText) return

    inputTag.value = ""

    let todo = {
        id: todos.length + 1,
        title: todoText,
        isCompleted: false
    }

    todos.push(todo)
    normalizeIds()
    localStorage.setItem("todos", JSON.stringify(todos))
    updateItemsLeft()
    populateTodos()
})

//enter buttons
inputTag.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        addTodoBtn.click()
    }
})

//Active buttons
const filterBtns = document.querySelectorAll(".filter-btn")

filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {

        filterBtns.forEach(button => {
            button.classList.remove("active")
        })

        btn.classList.add("active")

        currentFilter = btn.dataset.filter

        populateTodos()
    })
})

// Completed Buttons
const clearCompletedBtn = document.getElementById("clearCompletedBtn")

clearCompletedBtn.addEventListener("click", () => {
    todos = todos.filter(todo => !todo.isCompleted)

    localStorage.setItem("todos", JSON.stringify(todos))

    updateItemsLeft()
    populateTodos()
})

// initial render
populateTodos()
updateItemsLeft()
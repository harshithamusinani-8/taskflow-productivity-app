/* =====================================================
   TASKFLOW
   Professional Task + Chat Application
   ===================================================== */

const TASK_KEY = "taskflow.tasks.professional";
const CHAT_KEY = "taskflow.chat.professional";

let tasks = loadData(TASK_KEY, []);
let chatMessages = loadData(CHAT_KEY, []);

let currentFilter = "all";
let currentSearch = "";


/* =====================================================
   HELPERS
   ===================================================== */

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return [...document.querySelectorAll(selector)];
}


function loadData(key, fallback) {

  try {

    const data = localStorage.getItem(key);

    return data
      ? JSON.parse(data)
      : fallback;

  } catch (error) {

    console.error(error);

    return fallback;
  }
}


function saveData() {

  localStorage.setItem(
    TASK_KEY,
    JSON.stringify(tasks)
  );

  localStorage.setItem(
    CHAT_KEY,
    JSON.stringify(chatMessages)
  );
}


function generateId() {

  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return Date.now() + "-" +
    Math.random().toString(16).slice(2);
}


function escapeHTML(value) {

  return String(value).replace(
    /[&<>"']/g,

    character => {

      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return map[character];
    }
  );
}


/* =====================================================
   TOAST
   ===================================================== */

function showToast(message) {

  const toast = $("#toast");

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {

    toast.classList.remove("show");

  }, 2200);
}


/* =====================================================
   ADD TASK
   ===================================================== */

function addTask(title) {

  title = title.trim();

  if (!title) {

    showToast("Please enter a task");

    return;
  }


  const task = {

    id: generateId(),

    title,

    completed: false,

    createdAt: new Date().toISOString()
  };


  tasks.unshift(task);

  saveData();

  renderTasks();

  showToast("Task added successfully");
}


/* =====================================================
   COMPLETE TASK
   ===================================================== */

function toggleTask(id) {

  const task = tasks.find(
    item => item.id === id
  );

  if (!task) return;


  task.completed = !task.completed;

  saveData();

  renderTasks();


  if (task.completed) {

    showToast("Task completed ✓");

  } else {

    showToast("Task reopened");

  }
}


/* =====================================================
   DELETE TASK
   ===================================================== */

function deleteTask(id) {

  tasks = tasks.filter(
    task => task.id !== id
  );

  saveData();

  renderTasks();

  showToast("Task deleted");
}


/* =====================================================
   FILTER TASKS
   ===================================================== */

function getVisibleTasks() {

  return tasks.filter(task => {

    const matchesFilter =
      currentFilter === "all" ||
      (currentFilter === "active" && !task.completed) ||
      (currentFilter === "completed" && task.completed);


    const matchesSearch =
      task.title
        .toLowerCase()
        .includes(
          currentSearch.toLowerCase()
        );


    return matchesFilter && matchesSearch;

  });

}


/* =====================================================
   RENDER TASKS
   ===================================================== */

function renderTasks() {

  const list = $("#taskList");

  const visibleTasks =
    getVisibleTasks();


  /* COUNTERS */

  const completed =
    tasks.filter(
      task => task.completed
    ).length;

  const active =
    tasks.filter(
      task => !task.completed
    ).length;


  $("#allCount").textContent =
    tasks.length;

  $("#activeCount").textContent =
    active;

  $("#completedCount").textContent =
    completed;


  $("#visibleTotal").textContent =
    visibleTasks.length;


  /* PROGRESS */

  const percentage =
    tasks.length === 0
      ? 0
      : Math.round(
          completed /
          tasks.length *
          100
        );


  $("#progressPercent").textContent =
    percentage + "%";


  $("#progressBar").style.width =
    percentage + "%";


  $("#progressText").textContent =
    tasks.length === 0
      ? "No tasks yet"
      : `${completed} of ${tasks.length} completed`;


  /* EMPTY STATE */

  if (visibleTasks.length === 0) {

    const hasTasks =
      tasks.length > 0;


    list.innerHTML = `

      <div class="empty-state">

        <div>

          <div class="empty-icon">
            ${hasTasks ? "⌕" : "✓"}
          </div>

          <strong>
            ${
              hasTasks
                ? "No matching tasks"
                : "Your task list is clear"
            }
          </strong>

          <p>
            ${
              hasTasks
                ? "Try another search or filter."
                : "Start by capturing the one thing you want to accomplish."
            }
          </p>

        </div>

      </div>

    `;

    updateFilterUI();

    return;
  }


  /* TASK HTML */

  list.innerHTML =
    visibleTasks
      .map(task => {

        const date =
          new Date(
            task.createdAt
          ).toLocaleDateString(
            undefined,
            {
              month: "short",
              day: "numeric"
            }
          );


        return `

          <div
            class="task ${
              task.completed
                ? "completed"
                : ""
            }"
            data-id="${task.id}"
          >

            <button
              class="check-task"
              aria-label="${
                task.completed
                  ? "Reopen task"
                  : "Complete task"
              }"
            ></button>


            <div class="task-content">

              <div class="task-title">
                ${escapeHTML(task.title)}
              </div>

              <div class="task-date">
                ${date}
              </div>

            </div>


            <button
              class="delete-task"
              aria-label="Delete task"
            >
              ×
            </button>

          </div>

        `;

      })
      .join("");


  updateFilterUI();
}


/* =====================================================
   FILTER UI
   ===================================================== */

function updateFilterUI() {

  $$(".nav-item").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.filter === currentFilter
    );

  });


  $$(".filter").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.filter === currentFilter
    );

  });
}


/* =====================================================
   CHANGE FILTER
   ===================================================== */

function setFilter(filter) {

  currentFilter = filter;

  renderTasks();
}


/* =====================================================
   CHAT
   ===================================================== */

function sendChatMessage() {

  const input = $("#chatInput");

  const text =
    input.value.trim();


  if (!text) {

    showToast("Type something first");

    return;
  }


  chatMessages.push({

    id: generateId(),

    text,

    createdAt:
      new Date().toISOString()

  });


  input.value = "";

  saveData();

  renderChat();

  showToast("Idea captured");
}


/* =====================================================
   RENDER CHAT
   ===================================================== */

function renderChat() {

  const container =
    $("#chatMessages");


  container.innerHTML = `

    <div class="welcome-message">

      <div class="bot-icon">
        T
      </div>

      <div>

        <div class="bot-bubble">
          Hi! Capture anything on your mind.
          You can turn each message into a task
          when you're ready.
        </div>

        <small>
          TaskFlow · Local mode
        </small>

      </div>

    </div>

  `;


  chatMessages.forEach(message => {

    const wrapper =
      document.createElement("div");


    wrapper.className =
      "chat-message";


    wrapper.innerHTML = `

      <div class="user-message">
        ${escapeHTML(message.text)}
      </div>


      <div class="chat-actions">

        <button
          data-add="${message.id}"
        >
          ＋ Add to Tasks
        </button>

        <button
          data-delete="${message.id}"
        >
          Delete
        </button>

      </div>

    `;


    container.appendChild(wrapper);

  });


  container.scrollTop =
    container.scrollHeight;
}


/* =====================================================
   ADD CHAT MESSAGE TO TASK
   ===================================================== */

function convertChatToTask(id) {

  const message =
    chatMessages.find(
      item => item.id === id
    );


  if (!message) return;


  addTask(message.text);

}


/* =====================================================
   DELETE CHAT MESSAGE
   ===================================================== */

function deleteChatMessage(id) {

  chatMessages =
    chatMessages.filter(
      message =>
        message.id !== id
    );


  saveData();

  renderChat();

  showToast("Message deleted");
}


/* =====================================================
   TASK COMPOSER
   ===================================================== */

$("#addTaskBtn").addEventListener(
  "click",
  () => {

    const input =
      $("#taskInput");

    addTask(input.value);

    input.value = "";

    input.focus();

  }
);


$("#taskInput").addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {

      event.preventDefault();

      $("#addTaskBtn").click();

    }

  }
);


/* =====================================================
   SEARCH
   ===================================================== */

$("#searchInput").addEventListener(
  "input",
  event => {

    currentSearch =
      event.target.value;

    renderTasks();

  }
);


/* =====================================================
   FILTER BUTTONS
   ===================================================== */

$$("[data-filter]").forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        setFilter(
          button.dataset.filter
        );

      }
    );

  }
);


/* =====================================================
   TASK LIST EVENTS
   ===================================================== */

$("#taskList").addEventListener(
  "click",
  event => {

    const taskElement =
      event.target.closest(".task");


    if (!taskElement) return;


    const id =
      taskElement.dataset.id;


    if (
      event.target.closest(
        ".check-task"
      )
    ) {

      toggleTask(id);

    }


    if (
      event.target.closest(
        ".delete-task"
      )
    ) {

      deleteTask(id);

    }

  }
);


/* =====================================================
   CHAT SEND
   ===================================================== */

$("#sendChat").addEventListener(
  "click",
  sendChatMessage
);


$("#chatInput").addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {

      event.preventDefault();

      sendChatMessage();

    }

  }
);


/* =====================================================
   CHAT BUTTONS
   ===================================================== */

$("#chatMessages").addEventListener(
  "click",
  event => {

    const addButton =
      event.target.closest(
        "[data-add]"
      );


    const deleteButton =
      event.target.closest(
        "[data-delete]"
      );


    if (addButton) {

      convertChatToTask(
        addButton.dataset.add
      );

    }


    if (deleteButton) {

      deleteChatMessage(
        deleteButton.dataset.delete
      );

    }

  }
);


/* =====================================================
   NEW TASK BUTTON
   ===================================================== */

$("#newTaskBtn").addEventListener(
  "click",
  () => {

    $("#taskInput").focus();

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth"
    });

  }
);


/* =====================================================
   MOBILE MENU
   ===================================================== */

$("#menuBtn").addEventListener(
  "click",
  () => {

    $("#sidebar")
      .classList
      .toggle("open");

  }
);


/* =====================================================
   THEME
   ===================================================== */

$("#themeBtn").addEventListener(
  "click",
  () => {

    document.body.classList.toggle(
      "dark"
    );


    localStorage.setItem(
      "taskflow.theme",
      document.body.classList.contains("dark")
        ? "dark"
        : "light"
    );

  }
);


if (
  localStorage.getItem(
    "taskflow.theme"
  ) === "dark"
) {

  document.body.classList.add("dark");

}


/* =====================================================
   SETTINGS
   ===================================================== */

const settingsModal =
  $("#settingsModal");


$("#settingsBtn").addEventListener(
  "click",
  () => {

    settingsModal.showModal();

  }
);


$("#closeSettings").addEventListener(
  "click",
  () => {

    settingsModal.close();

  }
);


/* =====================================================
   CLEAR TASKS
   ===================================================== */

$("#clearTasks").addEventListener(
  "click",
  () => {

    const confirmed =
      confirm(
        "Are you sure you want to clear all tasks?"
      );


    if (!confirmed) return;


    tasks = [];

    saveData();

    renderTasks();

    settingsModal.close();

    showToast(
      "All tasks cleared"
    );

  }
);


/* =====================================================
   RESET CHAT
   ===================================================== */

$("#resetChat").addEventListener(
  "click",
  () => {

    chatMessages = [];

    saveData();

    renderChat();

    settingsModal.close();

    showToast(
      "Chat reset successfully"
    );

  }
);


/* =====================================================
   KEYBOARD SHORTCUTS
   ===================================================== */

document.addEventListener(
  "keydown",
  event => {

    /* New task */

    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "n"
    ) {

      event.preventDefault();

      $("#taskInput").focus();

    }


    /* Search */

    if (
      event.key === "/" &&
      document.activeElement.tagName !== "INPUT"
    ) {

      event.preventDefault();

      $("#searchInput").focus();

    }


    /* Escape */

    if (event.key === "Escape") {

      $("#sidebar")
        .classList
        .remove("open");

    }

  }
);


/* =====================================================
   INITIALIZE
   ===================================================== */

renderTasks();

renderChat();
// --- LIVE DATE/TIME ---
function updateDateTime() {
    const now = new Date(); // Retrieves current date/time
    const formatted = now.toLocaleString("en-CA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
    document.getElementById("currentDateTime").textContent = formatted;
}

setInterval(updateDateTime, 1000); // Refreshes the clock every second
updateDateTime();


setInterval(updateAllGhosts, 2000); // Checks the urgency of tasks every x (2000 = 2 seconds)

// --- URGENCY GHOST LOGIC ---
function getGhostColor(taskDate, taskTime) {
    const now = new Date();
    const due = new Date(`${taskDate}T${taskTime}`); // 
    const diffDays = (due - now) / (1000 * 60 * 60 * 24); // Converts ms --> days (Java defaults to ms)

    // Returns ghost colour + glow depending on task urgency
    if (diffDays >= 7) return { image: "images/green_ghost.png", glow: "glow-green" };
    if (diffDays >= 4) return { image: "images/yellow_ghost.png", glow: "glow-yellow" };
    if (diffDays >= 1) return { image: "images/orange_ghost.png", glow: "glow-orange" };
    return { image: "images/red_ghost.png", glow: "glow-red" }; // <1 Day or overdue
}

// --- ADD TASK ---
BtnAddTask.addEventListener("click", addTask);

function addTask() {
    const input = document.getElementById("addTask"); 
    const newTask = input.value;
    const taskDate = document.getElementById("taskDate").value;
    const taskTime = document.getElementById("taskTime").value;

    // Checks if required fields are empty
    if (!newTask.trim()) return showError("Task cannot be empty.");
    if (!taskDate) return showError("You must select a date before adding a task.");
    if (!taskTime) return showError("You must select a time before adding a task.");

    // Checks if time/date selected have already past
    const now = new Date();
    const selected = new Date(`${taskDate}T${taskTime}`);
    if (selected < now) return showError("Tasks cannot be set in the past.");

    const taskList = document.getElementById("taskList");

    const li = document.createElement("li");

    const textSpan = document.createElement("span");
    textSpan.className = "task-text";
    textSpan.textContent = newTask;

    const dateSpan = document.createElement("span");
    dateSpan.className = "task-date";
    dateSpan.dataset.dateValue = taskDate; // Stores raw date/time for calculations
    dateSpan.dataset.timeValue = taskTime; //
    dateSpan.textContent = selected.toLocaleString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });

    const info = document.createElement("div"); // wraps task text + date
    info.className = "task-info";
    info.appendChild(textSpan);
    info.appendChild(dateSpan);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    
    const completedAt = new Date(); // Checks the completion time/date of a task, then displays it
    const completedText = completedAt.toLocaleString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
    const completeBtn = document.createElement("button");
    completeBtn.textContent = "Complete";
    completeBtn.addEventListener("click", () => {
        const completedList = document.getElementById("completedList");
        li.classList.remove("glow-green", "glow-yellow", "glow-orange", "glow-red");
        actions.remove(); // removes any action buttons once task is complete
        dateSpan.textContent = "Completed on: " + completedText;
        li.style.backgroundImage = "none"; // Removes the urgency ghost
        completedList.appendChild(li); // Moves to completed section
    });

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.classList.add("edit-btn");
    editBtn.addEventListener("click", () => enterEditMode(li, textSpan, dateSpan, actions));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => openDeleteModal(li));

    actions.appendChild(completeBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(info);
    li.appendChild(actions);

    taskList.appendChild(li);

    applyUrgencyGhost(li, taskDate, taskTime);

    input.value = "";
    document.getElementById("taskDate").value = "";
    document.getElementById("taskTime").value = "";
}

// --- APPLY URGENCY GHOST ---
function applyUrgencyGhost(li, taskDate, taskTime) {
    const ghost = getGhostColor(taskDate, taskTime);

    li.style.backgroundImage = `url(${ghost.image})`;
    li.classList.remove("glow-green", "glow-yellow", "glow-orange", "glow-red");
    li.classList.add(ghost.glow);
}

// --- UPDATE ALL GHOSTS ---
function updateAllGhosts() {
    const tasks = document.querySelectorAll("#taskList li");

    tasks.forEach(li => {
        const dateSpan = li.querySelector(".task-date");
        if (!dateSpan) return; // Skips all completed tasks

        applyUrgencyGhost(li, dateSpan.dataset.dateValue, dateSpan.dataset.timeValue);
    });
}

// --- DELETE MODAL ---
function openDeleteModal(li) {
    const modal = document.getElementById("deleteModal");
    modal.style.display = "flex";

    const confirmBtn = document.getElementById("confirmDelete");
    const cancelBtn = document.getElementById("cancelDelete");

    confirmBtn.replaceWith(confirmBtn.cloneNode(true)); // Replaces the button and removes previous click listeners
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));

    const newConfirm = document.getElementById("confirmDelete");
    const newCancel = document.getElementById("cancelDelete");

    newConfirm.addEventListener("click", () => {
        li.remove();
        modal.style.display = "none";
    });

    newCancel.addEventListener("click", () => {
        modal.style.display = "none";
    });
}

// Opens the error modal

function showError(message) {
    const modal = document.getElementById("errorModal");
    const msg = document.getElementById("errorMessage");
    const closeBtn = document.getElementById("closeError");

    msg.textContent = message;
    modal.style.display = "flex";

    // Reset old listeners
    closeBtn.replaceWith(closeBtn.cloneNode(true)); // Replaces the button and removes previous click listener
    const newClose = document.getElementById("closeError");

    newClose.addEventListener("click", () => {
        modal.style.display = "none";
    });
}

// --- EDIT MODE ---
function enterEditMode(li, textSpan, dateSpan, actions) {
    document.getElementById("BtnAddTask").disabled = true;
    document.getElementById("addTask").disabled = true;
    document.getElementById("taskDate").disabled = true;
    document.getElementById("taskTime").disabled = true;
    
    
    const input = document.createElement("input"); // Allows task text to be edited
    input.value = textSpan.textContent;

    const dateInput = document.createElement("input"); // Allows date to be edited
    dateInput.type = "date";
    dateInput.value = dateSpan.dataset.dateValue;

    const timeInput = document.createElement("input"); // Allows time to be edited
    timeInput.type = "time";
    timeInput.value = dateSpan.dataset.timeValue;

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.className = "save-btn";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.className = "cancel-btn";

    const editActions = document.createElement("div");
    editActions.className = "edit-actions";
    editActions.appendChild(saveBtn);
    editActions.appendChild(cancelBtn);

    textSpan.style.display = "none";
    dateSpan.style.display = "none";
    actions.style.display = "none";

    const info = li.querySelector(".task-info");
    info.insertBefore(input, textSpan);
    info.insertBefore(dateInput, textSpan);
    info.insertBefore(timeInput, textSpan);

    li.insertBefore(editActions, actions);

    saveBtn.addEventListener("click", () => {
        if (!input.value.trim()) return showError("Task cannot be empty.");
        if (!dateInput.value) return showError("Please select a date.");
        if (!timeInput.value) return showError("Please select a time.");

        const now = new Date();
        const selected = new Date(`${dateInput.value}T${timeInput.value}`);
        if (selected < now) return showError("Tasks cannot be set in the past.");

        textSpan.textContent = input.value;
        dateSpan.dataset.dateValue = dateInput.value;
        dateSpan.dataset.timeValue = timeInput.value;

        dateSpan.textContent = selected.toLocaleString("en-CA", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });

        applyUrgencyGhost(li, dateInput.value, timeInput.value);

        exitEditMode(li, textSpan, dateSpan, actions, input, dateInput, timeInput, editActions);
    });

    cancelBtn.addEventListener("click", () => {
        exitEditMode(li, textSpan, dateSpan, actions, input, dateInput, timeInput, editActions);
    });
}


// EXIT EDIT MODE //
function exitEditMode(li, textSpan, dateSpan, actions, input, dateInput, timeInput, editActions) {
    document.getElementById("BtnAddTask").disabled = false;
    document.getElementById("addTask").disabled = false;
    document.getElementById("taskDate").disabled = false;
    document.getElementById("taskTime").disabled = false;
    
    
    input.remove();
    dateInput.remove();
    timeInput.remove();
    editActions.remove();

    textSpan.style.display = "";
    dateSpan.style.display = "";
    actions.style.display = "flex";
}
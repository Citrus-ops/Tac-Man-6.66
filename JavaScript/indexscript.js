// Retreives the logged in user's ID from Supabase
const userId = Number(localStorage.getItem("user_id"));

// --- LOAD TASKS ON PAGE LOAD --- 
if (!userId) {
    // If no user is logged in, redirects to login page
    location.href = "login.html";
}

loadTasks(); // Loads tasks immeediately when page loads



// --- LIVE DATE/TIME --- //
function updateDateTime() {
    const now = new Date();
    
    // Formats date/time in a clean and easy to read way
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

setInterval(updateDateTime, 1000); // Displayed date/time refresh rate (1s)
updateDateTime();

setInterval(updateAllGhosts, 2000); // Refresh rate of urgency ghosts (2s)

// --- URGENCY GHOST LOGIC ---
function getGhostColor(taskDate, taskTime) {
    const now = new Date();
    const due = new Date(`${taskDate}T${taskTime}`);
    const diffDays = (due - now) / (1000 * 60 * 60 * 24);

    // Chooses ghost colour based on urgency of task
    if (diffDays >= 7) return { image: "images/green_ghost.png"};
    if (diffDays >= 4) return { image: "images/yellow_ghost.png"};
    if (diffDays >= 1) return { image: "images/orange_ghost.png"};
    return { image: "images/red_ghost.png"};
}

// --- ADD TASK BUTTON ---
const BtnAddTask = document.getElementById("BtnAddTask");
BtnAddTask.addEventListener("click", addTask);

// Adds new task to Supabase
async function addTask() {
    const input = document.getElementById("addTask");
    const newTask = input.value;
    const taskDate = document.getElementById("taskDate").value;
    const taskTime = document.getElementById("taskTime").value;
    const isPriority = document.getElementById("priorityCheckbox").checked;
    const recurrence = document.getElementById("recurrence").value;

    // Checks all required fields have inputs (Shows error alert if any are empty)
    if (!newTask.trim()) return showError("Task cannot be empty.");
    if (!taskDate) return showError("You must select a date before adding a task.");
    if (!taskTime) return showError("You must select a time before adding a task.");

    // Prevents a task from being set in the past
    const now = new Date();
    const selected = new Date(`${taskDate}T${taskTime}`);
    if (selected < now) return showError("Tasks cannot be set in the past.");

    // Saves task to Supabase
    const { data, error } = await supabaseClient
        .from("tasks")
        .insert([
            {
                user_id: userId,
                title: newTask,
                date: taskDate,
                time: taskTime,
                completed: false,
                priority: isPriority,
                recurrence: recurrence
            }
        ]);

    console.log("Insert result:", data, error);

    if (error) {
        console.error("Insert error:", error);
        alert("Could not save task");
        return;
    }

    // Reloads tasks from database
    loadTasks();

    // Reset input fields
    input.value = "";
    document.getElementById("taskDate").value = "";
    document.getElementById("taskTime").value = "";
}

// Applies urgency ghost to a task
function applyUrgencyGhost(li, taskDate, taskTime) {
    const ghost = getGhostColor(taskDate, taskTime);
    li.style.backgroundImage = `url(${ghost.image})`;
}
// --- UPDATE ALL GHOSTS ---
function updateAllGhosts() {
    const tasks = document.querySelectorAll("#taskList li");

    tasks.forEach(li => {
        const dateSpan = li.querySelector(".task-date");
        if (!dateSpan) return;

        applyUrgencyGhost(li, dateSpan.dataset.dateValue, dateSpan.dataset.timeValue);
    });
}

// --- DELETE MODAL ---
async function openDeleteModal(li) {
    const modal = document.getElementById("deleteModal");
    modal.style.display = "flex";

    // Resets event listeners
    const confirmBtn = document.getElementById("confirmDelete");
    const cancelBtn = document.getElementById("cancelDelete");

    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));

    const newConfirm = document.getElementById("confirmDelete");
    const newCancel = document.getElementById("cancelDelete");
    
    // Confirm delete
    newConfirm.addEventListener("click", async () => {
    const taskId = li.dataset.id;

        // Delete from Supabase
        const { error } = await supabaseClient
            .from("tasks")
            .delete()
            .eq("id", taskId);

        if (error) {
            console.error("Delete error:", error);
            alert("Could not delete task");
            return;
        }
        
        li.remove();
        // Reload tasks to stay in sync
        loadTasks();
    
        modal.style.display = "none";
    });

    newCancel.addEventListener("click", () => {
        modal.style.display = "none";
    });
}

// --- ERROR MODAL ---
function showError(message) {
    const modal = document.getElementById("errorModal");
    const msg = document.getElementById("errorMessage");
    const closeBtn = document.getElementById("closeError");

    msg.textContent = message;
    modal.style.display = "flex";

    // Resets event listeners
    closeBtn.replaceWith(closeBtn.cloneNode(true));
    const newClose = document.getElementById("closeError");

    newClose.addEventListener("click", () => {
        modal.style.display = "none";
    });
}

// --- EDIT MODE ---
function enterEditMode(li, textSpan, dateSpan, actions) {
    // Disables main inputs while editing to prevent conflict
    document.getElementById("BtnAddTask").disabled = true;
    document.getElementById("addTask").disabled = true;
    document.getElementById("taskDate").disabled = true;
    document.getElementById("taskTime").disabled = true;
    document.getElementById("recurrence").disabled = true;
    document.getElementById("priorityCheckbox").disabled = true;

    // Creates editable fields
    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("task-edit-text");
    input.value = textSpan.textContent;

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = dateSpan.dataset.dateValue;

    const timeInput = document.createElement("input");
    timeInput.type = "time";
    timeInput.value = dateSpan.dataset.timeValue;

    // Priority checkbox (edit mode)
    const priorityLabel = document.createElement("label");
    priorityLabel.classList.add("priority-container");

    const priorityInput = document.createElement("input");
    priorityInput.type = "checkbox";
    priorityInput.checked = li.dataset.priority === "true";

    const priorityMark = document.createElement("span");
    priorityMark.classList.add("priority-checkmark");

    priorityLabel.appendChild(priorityInput);
    priorityLabel.appendChild(priorityMark);
    priorityLabel.append("Priority");

    // Recurrence dropdown menu (edit mode)
    const recurrenceSelect = document.createElement("select");
    recurrenceSelect.id = "editRecurrence";
    recurrenceSelect.classList.add("recurrence");

    ["none", "weekly", "monthly"].forEach(optionValue => {
        const opt = document.createElement("option");
        opt.value = optionValue;
        opt.textContent = optionValue.charAt(0).toUpperCase() + optionValue.slice(1);
        recurrenceSelect.appendChild(opt);
    });
    recurrenceSelect.value = li.dataset.recurrence || "none";

    
    // Save and cancel buttons
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

    // Hides original content
    textSpan.style.display = "none";
    dateSpan.style.display = "none";
    actions.style.display = "none";

    // Inserts editable fields
    const info = li.querySelector(".task-info");
    info.insertBefore(input, textSpan);
    info.insertBefore(dateInput, textSpan);
    info.insertBefore(timeInput, textSpan);
    info.insertBefore(recurrenceSelect, textSpan);

    li.appendChild(priorityLabel);
    li.appendChild(editActions);

    // Saves changes made in edit mode w/ basic error handlers
    saveBtn.addEventListener("click", async () => {
        if (!input.value.trim()) return showError("Task cannot be empty.");
        if (!dateInput.value) return showError("Please select a date.");
        if (!timeInput.value) return showError("Please select a time.");

        const now = new Date();
        const selected = new Date(`${dateInput.value}T${timeInput.value}`);
        if (selected < now) return showError("Tasks cannot be set in the past.");

        // Updates UI
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

        // Toggles glow on prioritized tasks
        if (priorityInput.checked) {
            li.classList.add("priority-glow");
        } else {
            li.classList.remove("priority-glow");
    }

    li.dataset.priority = priorityInput.checked;

    // Saves changes to Supabase
    await supabaseClient
    .from("tasks")
    .update({
        title: input.value,
        date: dateInput.value,
        time: timeInput.value,
        priority: priorityInput.checked,
        recurrence: recurrenceSelect.value
    })
    .eq("id", li.dataset.id);

    await loadTasks();

        exitEditMode(li, textSpan, dateSpan, actions, input, dateInput, timeInput, editActions, priorityLabel, recurrenceSelect);
    });

    // Cancels editing
    cancelBtn.addEventListener("click", () => {
        exitEditMode(li, textSpan, dateSpan, actions, input, dateInput, timeInput, editActions, priorityLabel, recurrenceSelect);
    });
}

// --- EXIT EDIT MODE ---
async function exitEditMode(li, textSpan, dateSpan, actions, input, dateInput, timeInput, editActions, priorityLabel, recurrence) {
    // Re-enables main inputs
    document.getElementById("BtnAddTask").disabled = false;
    document.getElementById("addTask").disabled = false;
    document.getElementById("taskDate").disabled = false;
    document.getElementById("taskTime").disabled = false;
    document.getElementById("recurrence").disabled = false;
    document.getElementById("priorityCheckbox").disabled = false;

    // Removes edit fields
    input.remove();
    dateInput.remove();
    timeInput.remove();
    editActions.remove();
    priorityLabel.remove();
    recurrence.remove();

    // Restores main UI
    textSpan.style.display = "";
    dateSpan.style.display = "";
    if (actions) {
        actions.style.display = "flex";
    }
}


// --- LOAD TASKS FROM SUPABASE ---
async function loadTasks() {
    const userId = Number(localStorage.getItem("user_id"));

    const { data, error } = await supabaseClient
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("id", { ascending: true });

    console.log("Loaded tasks:", data, error);

    if (error) return;

    const taskList = document.getElementById("taskList");
    const completedList = document.getElementById("completedList");

    taskList.innerHTML = "";
    completedList.innerHTML = "";


    // Sort all tasks by priority first, then date
    data
      .sort((a, b) => {
        if (a.priority !== b.priority) {
        return a.priority ? -1 : 1;
        }
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);

    return dateA - dateB;
    })   
    .forEach(task => {
        const li = document.createElement("li");
        li.dataset.id = task.id; 
        li.dataset.priority = task.priority;
        li.dataset.recurrence = task.recurrence;

        // Priority glow
    if (task.priority) {
            li.classList.add("priority-glow");
            
        }

        const textSpan = document.createElement("span");
        textSpan.className = "task-text";
        textSpan.textContent = task.title;

        // Priority icon
    if (task.priority) {
        const icon = document.createElement("img");
        icon.src = "images/red_exclamation_mark.png";
        icon.alt = "Priority";
        icon.className = "priority-icon";
        icon.style.width = "64px";
        icon.style.marginRight = "8px";

        textSpan.prepend(icon);
}
        // Date + Time display
        const dateSpan = document.createElement("span");
        dateSpan.className = "task-date";
        dateSpan.dataset.dateValue = task.date;
        dateSpan.dataset.timeValue = task.time;
        const recurrenceSpan = document.createElement("span");
        recurrenceSpan.className = "task-recurrence";

        // Task recurrence dropdown and options
        if (task.recurrence && task.recurrence !== "none") {
            recurrenceSpan.textContent = 
            task.recurrence === "weekly" ? "↻ Weekly" :
            task.recurrence === "monthly" ? "↻ Monthly" :"";
        } else {
        recurrenceSpan.textContent = "";
        }

        const selected = new Date(`${task.date}T${task.time}`);
        dateSpan.textContent = selected.toLocaleString("en-CA", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });

        // Task info container
        const info = document.createElement("div");
        info.className = "task-info";
        info.appendChild(textSpan);
        info.appendChild(dateSpan);
        info.appendChild(recurrenceSpan);

        // Action buttons
        const actions = document.createElement("div");
        actions.className = "task-actions";

        // Complete button
     const completeBtn = document.createElement("button");
        completeBtn.textContent = "Complete";
        completeBtn.classList.add("complete-btn");

        completeBtn.addEventListener("click", async () => {
            // 🔊 Play sound immediately
            completeSound.currentTime = 0;
            completeSound.play();

            const taskId = li.dataset.id;

            // Mark task as completed in Supabase
            await supabaseClient
                .from("tasks")
                .update({ completed: true, priority: false})
                .eq("id", taskId);

            // Handle recurrence
            const recurrence = li.dataset.recurrence;
            if (recurrence && recurrence !== "none") {
                await createNextRecurringTask(li, recurrence);
            }

            // Move task visually
            actions.remove();
            dateSpan.textContent = "Completed";
            li.style.backgroundImage = "none";

            // Removes priority indicators
            li.classList.remove("priority-glow");
            const icon = li.querySelector(".priority-icon");
            if (icon) icon.remove();
            completedList.appendChild(li);
        });

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("edit-btn");
        editBtn.addEventListener("click", () => enterEditMode(li, textSpan, dateSpan, actions));

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-btn"); 
        deleteBtn.addEventListener("click", () => openDeleteModal(li));

        li.appendChild(info);

        if (!task.completed) {
        // Only active tasks get buttons
        actions.appendChild(completeBtn);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        li.appendChild(actions);
        taskList.appendChild(li);
        applyUrgencyGhost(li, task.date, task.time);
    } else {
        // Completed tasks get no buttons
        completedList.appendChild(li);
    }
    });
}
// --- CREATE NEXT RECURRING TASK ---
async function createNextRecurringTask(li, recurrence) {
    // Retrieves title (ignores priority icon)
     const textSpan = li.querySelector(".task-text");
    const title = [...textSpan.childNodes]
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent.trim())
        .join(" ");

    const date = li.querySelector(".task-date").dataset.dateValue;
    const time = li.querySelector(".task-date").dataset.timeValue;
    const priority = li.dataset.priority === "true";

    // Get the current time
    const currentDate = new Date(`${date}T${time}`);
    let nextDate = new Date(currentDate);
    //Modify date by the modifier 7 for weekly scale, 1 for monthly scale
    if (recurrence === "weekly") {
        nextDate.setDate(currentDate.getDate() + 7);
    } 
    else if (recurrence === "monthly") {
        nextDate.setMonth(currentDate.getMonth() + 1);
    }
    const nextDateStr = nextDate.toISOString().split("T")[0];
    const nextTimeStr = time;

    // Inserts new recurring task
    await supabaseClient
        .from("tasks")
        .insert([
            {
                user_id: userId,
                title: title,
                date: nextDateStr,
                time: nextTimeStr,
                completed: false,
                priority: priority,
                recurrence: recurrence
            }
        ]);
    loadTasks(); // Refreshes UI
}

// --- COMPLETE SOUND EFFECT ---
const completeSound = new Audio("images/02. Start Music.mp3");

// Plays sound when clicking complete button for any task
document.addEventListener("click", async function(e) {
    if (e.target.classList.contains("complete-btn")) {
        completeSound.currentTime = 0;
        completeSound.play();
    }
});




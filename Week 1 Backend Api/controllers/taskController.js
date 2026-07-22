const initialTasks = [
  { id: 1, title: 'Learn Express', done: false },
  { id: 2, title: 'Learn Swagger', done: true },
  { id: 3, title: 'Finish Assignment', done: false }
];

let tasks = cloneTasks(initialTasks);

function cloneTasks(sourceTasks) {
  return sourceTasks.map((task) => ({ ...task }));
}

function getNextId() {
  if (tasks.length === 0) {
    return 1;
  }

  return Math.max(...tasks.map((task) => task.id)) + 1;
}

function parseTaskId(taskId) {
  const parsedId = Number(taskId);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }

  return parsedId;
}

function findTaskIndexById(taskId) {
  return tasks.findIndex((task) => task.id === taskId);
}

exports.getAllTasks = (req, res) => {
  const { done, search } = req.query;
  let filteredTasks = cloneTasks(tasks);

  if (done !== undefined) {
    if (done !== 'true' && done !== 'false') {
      return res.status(400).json({
        error: 'done must be true or false'
      });
    }

    const doneValue = done === 'true';
    filteredTasks = filteredTasks.filter((task) => task.done === doneValue);
  }

  if (search !== undefined) {
    const trimmedSearch = String(search).trim().toLowerCase();

    if (!trimmedSearch) {
      return res.status(400).json({
        error: 'search cannot be empty'
      });
    }

    filteredTasks = filteredTasks.filter((task) =>
      task.title.toLowerCase().includes(trimmedSearch)
    );
  }

  return res.status(200).json(filteredTasks);
};

exports.getTaskById = (req, res) => {
  const parsedId = parseTaskId(req.params.id);

  if (parsedId === null) {
    return res.status(400).json({
      error: 'Invalid task id'
    });
  }

  const task = tasks.find((item) => item.id === parsedId);

  if (!task) {
    return res.status(404).json({
      error: 'Task not found'
    });
  }

  return res.status(200).json(task);
};

exports.createTask = (req, res) => {
  const { title } = req.body;

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      error: 'Title is required'
    });
  }

  const newTask = {
    id: getNextId(),
    title: title.trim(),
    done: false
  };

  tasks.push(newTask);

  return res.status(201).json(newTask);
};

exports.updateTask = (req, res) => {
  const parsedId = parseTaskId(req.params.id);

  if (parsedId === null) {
    return res.status(400).json({
      error: 'Invalid task id'
    });
  }

  const taskIndex = findTaskIndexById(parsedId);

  if (taskIndex === -1) {
    return res.status(404).json({
      error: 'Task not found'
    });
  }

  const { title, done } = req.body;
  const currentTask = tasks[taskIndex];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        error: 'Title must be a non-empty string'
      });
    }

    currentTask.title = title.trim();
  }

  if (done !== undefined) {
    if (typeof done !== 'boolean') {
      return res.status(400).json({
        error: 'done must be a boolean'
      });
    }

    currentTask.done = done;
  }

  tasks[taskIndex] = currentTask;

  return res.status(200).json(currentTask);
};

exports.deleteTask = (req, res) => {
  const parsedId = parseTaskId(req.params.id);

  if (parsedId === null) {
    return res.status(400).json({
      error: 'Invalid task id'
    });
  }

  const taskIndex = findTaskIndexById(parsedId);

  if (taskIndex === -1) {
    return res.status(404).json({
      error: 'Task not found'
    });
  }

  tasks.splice(taskIndex, 1);

  return res.status(204).send();
};

exports.getStats = (req, res) => {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.done).length;

  return res.status(200).json({
    total,
    completed,
    pending: total - completed
  });
};

exports.resetTasks = (req, res) => {
  tasks = cloneTasks(initialTasks);

  return res.status(200).json({
    message: 'Tasks reset successfully',
    tasks
  });
};

exports._internal = {
  cloneTasks,
  getNextId,
  parseTaskId,
  initialTasks
};
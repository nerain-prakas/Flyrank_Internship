const taskStore = require('../db');
require('dotenv').config();
function parseTaskId(taskId) {
  const parsedId = Number(taskId);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }

  return parsedId;
}

exports.getAllTasks = async (req, res) => {
  const { done, search } = req.query;
  const filters = {};

  if (done !== undefined) {
    if (done !== 'true' && done !== 'false') {
      return res.status(400).json({
        error: 'done must be true or false'
      });
    }

    filters.done = done === 'true';
  }

  if (search !== undefined) {
    const trimmedSearch = String(search).trim();

    if (!trimmedSearch) {
      return res.status(400).json({
        error: 'search cannot be empty'
      });
    }

    filters.search = trimmedSearch;
  }

  return res.status(200).json(await taskStore.buildTaskQuery(filters));
};

exports.getTaskById = async (req, res) => {
  const parsedId = parseTaskId(req.params.id);

  if (parsedId === null) {
    return res.status(400).json({
      error: 'Invalid task id'
    });
  }

  const task = await taskStore.getTaskById(parsedId);

  if (!task) {
    return res.status(404).json({
      error: 'Task not found'
    });
  }

  return res.status(200).json(task);
};

exports.createTask = async (req, res) => {
  const { title } = req.body;

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      error: 'Title is required'
    });
  }

  const newTask = await taskStore.createTask(title.trim(), false);

  return res.status(201).json(newTask);
};

exports.updateTask = async (req, res) => {
  const parsedId = parseTaskId(req.params.id);

  if (parsedId === null) {
    return res.status(400).json({
      error: 'Invalid task id'
    });
  }

  const currentTask = await taskStore.getTaskById(parsedId);

  if (!currentTask) {
    return res.status(404).json({
      error: 'Task not found'
    });
  }

  const { title, done } = req.body;

  let nextTitle = currentTask.title;
  let nextDone = currentTask.done;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        error: 'Title must be a non-empty string'
      });
    }

    nextTitle = title.trim();
  }

  if (done !== undefined) {
    if (typeof done !== 'boolean') {
      return res.status(400).json({
        error: 'done must be a boolean'
      });
    }

    nextDone = done;
  }

  const updatedTask = await taskStore.updateTask(parsedId, nextTitle, nextDone);

  return res.status(200).json(updatedTask);
};

exports.deleteTask = async (req, res) => {
  const parsedId = parseTaskId(req.params.id);

  if (parsedId === null) {
    return res.status(400).json({
      error: 'Invalid task id'
    });
  }

  const task = await taskStore.getTaskById(parsedId);

  if (!task) {
    return res.status(404).json({
      error: 'Task not found'
    });
  }

  await taskStore.deleteTask(parsedId);

  return res.status(204).send();
};

exports.getStats = async (req, res) => {
  return res.status(200).json(await taskStore.getStats());
};

exports.resetTasks = async (req, res) => {
  const tasks = await taskStore.resetTasks();

  return res.status(200).json({
    message: 'Tasks reset successfully',
    tasks
  });
};
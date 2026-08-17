const express = require('express');
const taskController = require('../controllers/taskController');

const router = express.Router();

router.get('/tasks', taskController.getAllTasks);
router.get('/tasks/:id', taskController.getTaskById);
router.post('/tasks', taskController.createTask);
router.put('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);
router.get('/stats', taskController.getStats);
router.post('/reset', taskController.resetTasks);

module.exports = router;
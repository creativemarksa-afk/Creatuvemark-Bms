import api from "./api";

/**
 * Create a new task
 * @param {Object} taskData - Task data
 */
export const createTask = async (taskData) => {
  try {
    const response = await api.post("/tasks", taskData);
    return response.data;
  } catch (error) {
    console.error("Create Task Error:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to create task"
    );
  }
};

/**
 * Get all tasks with filtering and pagination
 * @param {Object} params - Query parameters
 */
export const getTasks = async (params = {}) => {
  try {
    const response = await api.get("/tasks", { params });
    return response.data;
  } catch (error) {
    console.error("Get Tasks Error:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to get tasks"
    );
  }
};

/**
 * Get task by ID
 * @param {string} taskId - Task ID
 */
export const getTaskById = async (taskId) => {
  try {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error("Get Task Error:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to get task"
    );
  }
};

/**
 * Update task status
 * @param {string} taskId - Task ID
 * @param {Object} updateData - Status update data
 */
export const updateTaskStatus = async (taskId, updateData) => {
  try {
    const response = await api.patch(`/tasks/${taskId}/status`, updateData);
    return response.data;
  } catch (error) {
    console.error("Update Task Status Error:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to update task status"
    );
  }
};

/**
 * Update task details
 * @param {string} taskId - Task ID
 * @param {Object} updateData - Task update data
 */
export const updateTask = async (taskId, updateData) => {
  try {
    const response = await api.put(`/tasks/${taskId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Update Task Error:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to update task"
    );
  }
};

/**
 * Delete task
 * @param {string} taskId - Task ID
 */
export const deleteTask = async (taskId) => {
  try {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error("Delete Task Error:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to delete task"
    );
  }
};

/**
 * Get tasks assigned to current user
 * @param {Object} params - Query parameters
 */
export const getMyTasks = async (params = {}) => {
  try {
    const response = await api.get("/tasks/my-tasks", { params });
    return response.data;
  } catch (error) {
    console.error("Get My Tasks Error:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to get my tasks"
    );
  }
};

/**
 * Get task statistics
 */
export const getTaskStats = async () => {
  try {
    const response = await api.get("/tasks/stats");
    return response.data;
  } catch (error) {
    console.error("Get Task Stats Error:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Failed to get task statistics"
    );
  }
};

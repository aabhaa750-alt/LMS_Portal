// API Client for My Learning Hub LMS
const API = {
  baseUrl: '/api',

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = options.headers || {};

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({ detail: 'Unauthorized' }));
        throw new Error(errorData.detail || 'Unauthorized access.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return response;
    } catch (err) {
      console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
      throw err;
    }
  },

  // Auth Endpoints
  auth: {
    async register(data) {
      return API.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async login(data) {
      return API.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async logout() {
      return API.request('/auth/logout', { method: 'POST' });
    },
    async getMe() {
      return API.request('/auth/me');
    },
    async updateProfile(data) {
      return API.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    async changePassword(data) {
      return API.request('/auth/password', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },

  // Dashboard Endpoints
  dashboard: {
    async getStats() {
      return API.request('/dashboard');
    },
    async getDailyPlan(date) {
      const q = date ? `?date=${encodeURIComponent(date)}` : '';
      return API.request(`/dashboard/daily-plan${q}`);
    },
    async toggleDailyPlan(itemKey, planDate = null, completed = null) {
      return API.request('/dashboard/daily-plan/toggle', {
        method: 'POST',
        body: JSON.stringify({ item_key: itemKey, plan_date: planDate, completed }),
      });
    },
  },

  // Courses Endpoints
  courses: {
    async list(params = {}) {
      const q = new URLSearchParams(params).toString();
      return API.request(`/courses${q ? '?' + q : ''}`);
    },
    async create(data) {
      return API.request('/courses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async get(id) {
      return API.request(`/courses/${id}`);
    },
    async update(id, data) {
      return API.request(`/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    async delete(id) {
      return API.request(`/courses/${id}`, { method: 'DELETE' });
    },
    async createTopic(courseId, data) {
      return API.request(`/courses/${courseId}/units`, {
        method: 'POST',
        body: JSON.stringify({ ...data, course_id: courseId }),
      });
    },
    async updateTopic(topicId, data) {
      return API.request(`/courses/units/${topicId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    async updateTopicStatus(topicId, status) {
      return API.request(`/courses/units/${topicId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    async deleteTopic(topicId) {
      return API.request(`/courses/units/${topicId}`, { method: 'DELETE' });
    },
  },

  // Resources Endpoints
  resources: {
    async list(params = {}) {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== '')
      );
      const q = new URLSearchParams(cleanParams).toString();
      return API.request(`/resources${q ? '?' + q : ''}`);
    },
    async upload(formData, onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API.baseUrl}/resources/upload`);

        if (onProgress) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              onProgress(percent);
            }
          };
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              resolve(xhr.responseText);
            }
          } else {
            let errorMsg = `Upload failed (${xhr.status})`;
            try {
              const parsed = JSON.parse(xhr.responseText);
              if (parsed.detail) errorMsg = parsed.detail;
            } catch (e) {}
            reject(new Error(errorMsg));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });
    },
    async get(id) {
      return API.request(`/resources/${id}`);
    },
    async update(id, data) {
      return API.request(`/resources/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    async delete(id) {
      return API.request(`/resources/${id}`, { method: 'DELETE' });
    },
    async toggleComplete(id) {
      return API.request(`/resources/${id}/toggle-complete`, { method: 'POST' });
    },
    async saveProgress(id, progressData) {
      return API.request(`/resources/${id}/progress`, {
        method: 'POST',
        body: JSON.stringify(progressData),
      });
    },
    downloadUrl(id) {
      return `${API.baseUrl}/resources/${id}/download`;
    },
    viewUrl(id) {
      return `${API.baseUrl}/resources/${id}/view`;
    },
  },

  // Notes Endpoints
  notes: {
    async list(params = {}) {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== '')
      );
      const q = new URLSearchParams(cleanParams).toString();
      return API.request(`/notes${q ? '?' + q : ''}`);
    },
    async create(data) {
      return API.request('/notes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async get(id) {
      return API.request(`/notes/${id}`);
    },
    async update(id, data) {
      return API.request(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    async delete(id) {
      return API.request(`/notes/${id}`, { method: 'DELETE' });
    },
  },

  // Bookmarks Endpoints
  bookmarks: {
    async list(courseId = null) {
      const q = courseId ? `?course_id=${courseId}` : '';
      return API.request(`/bookmarks${q}`);
    },
    async toggle(resourceId) {
      return API.request(`/bookmarks/${resourceId}`, { method: 'POST' });
    },
  },

  // Progress Endpoints
  progress: {
    async getOverview() {
      return API.request('/progress');
    },
    async saveGoal(data) {
      return API.request('/progress/goal', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // Tasks Endpoints
  tasks: {
    async list(params = {}) {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== '')
      );
      const q = new URLSearchParams(cleanParams).toString();
      return API.request(`/tasks${q ? '?' + q : ''}`);
    },
    async create(data) {
      return API.request('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async get(id) {
      return API.request(`/tasks/${id}`);
    },
    async update(id, data) {
      return API.request(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    async updateStatus(id, status) {
      return API.request(`/tasks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    async delete(id) {
      return API.request(`/tasks/${id}`, { method: 'DELETE' });
    },
  },

  // System & Settings Endpoints
  system: {
    async seedDemo() {
      return API.request('/system/seed-demo', { method: 'POST' });
    },
    async getStorageInfo() {
      return API.request('/system/storage-info');
    },
    backupUrl() {
      return `${API.baseUrl}/system/backup`;
    },
  },

  // AI Learning Assistant Endpoints
  ai: {
    async getStatus() {
      return API.request('/ai/status');
    },
    async updateApiKey(data) {
      return API.request('/ai/api-key', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async indexAll() {
      return API.request('/ai/index-all', { method: 'POST' });
    },
    async listConversations(params = {}) {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== '')
      );
      const q = new URLSearchParams(cleanParams).toString();
      return API.request(`/ai/conversations${q ? '?' + q : ''}`);
    },
    async getConversation(id) {
      return API.request(`/ai/conversations/${id}`);
    },
    async deleteConversation(id) {
      return API.request(`/ai/conversations/${id}`, { method: 'DELETE' });
    },
    async chat(data) {
      return API.request('/ai/chat', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async explainConcept(data) {
      return API.request('/ai/explain-concept', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async generateNotes(resourceId, saveAsNote = false) {
      return API.request(`/ai/generate-notes/${resourceId}?save_as_note=${saveAsNote}`, {
        method: 'POST',
      });
    },
    async getResourceChunks(resourceId) {
      return API.request(`/ai/resource-chunks/${resourceId}`);
    },
  },
};


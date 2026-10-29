// Main Application Router, State Manager, Modals, and Global Search

window.currentUser = null;

// App Modal Controller
const AppModals = {
  container() {
    return document.getElementById('modal-container');
  },

  close() {
    const c = this.container();
    if (c) c.innerHTML = '';
  },

  // Add / Edit Course Modal
  async openAddCourse(courseId = null) {
    let course = null;
    if (courseId) {
      try {
        course = await API.courses.get(courseId);
      } catch (e) {
        showToast(e.message, 'error');
        return;
      }
    }

    const isEdit = !!course;
    const c = this.container();

    c.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in">
        <div class="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">${isEdit ? 'Edit Course Details' : 'Create New Course / Subject'}</h3>
            <button class="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100" onclick="window.appModals.close()">
              ${getIcon('x', 'w-4 h-4')}
            </button>
          </div>

          <form id="modal-course-form" class="space-y-3.5">
            <div class="grid grid-cols-3 gap-3">
              <div class="col-span-2">
                <label class="block text-xs font-semibold text-slate-700 mb-1">Subject Name *</label>
                <input id="m-course-name" type="text" required value="${isEdit ? escapeHtml(course.name) : ''}"
                  placeholder="e.g. Managerial Economics" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Code</label>
                <input id="m-course-code" type="text" value="${isEdit && course.code ? escapeHtml(course.code) : ''}"
                  placeholder="e.g. MBA601" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Instructor Name</label>
              <input id="m-course-instructor" type="text" value="${isEdit && course.instructor ? escapeHtml(course.instructor) : ''}"
                placeholder="e.g. Prof. Henderson" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                <input id="m-course-year" type="text" value="${isEdit ? escapeHtml(course.academic_year) : (window.currentUser ? window.currentUser.academic_year : 'Year 1')}"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                <input id="m-course-semester" type="text" value="${isEdit ? escapeHtml(course.semester) : (window.currentUser ? window.currentUser.semester : 'Semester 1')}"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Course Color Accent</label>
              <div class="flex items-center gap-2" id="course-color-picker">
                ${['#2563eb', '#059669', '#d97706', '#7c3aed', '#0284c7', '#dc2626', '#475569'].map(color => `
                  <button type="button" class="w-6 h-6 rounded-full border-2 transition-all ${isEdit && course.color === color ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-105'}"
                    style="background-color: ${color}" onclick="window.appModals.selectCourseColor('${color}')" data-color="${color}"></button>
                `).join('')}
                <input type="hidden" id="m-course-color" value="${isEdit ? course.color : '#2563eb'}">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Description / Syllabus Overview</label>
              <textarea id="m-course-desc" rows="3" placeholder="Core objectives, grading breakdown, textbook references..."
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">${isEdit && course.description ? escapeHtml(course.description) : ''}</textarea>
            </div>

            <div class="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button type="button" class="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors" onclick="window.appModals.close()">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors">
                ${isEdit ? 'Save Changes' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('modal-course-form').onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('m-course-name').value.trim();
      const code = document.getElementById('m-course-code').value.trim();
      const instructor = document.getElementById('m-course-instructor').value.trim();
      const academic_year = document.getElementById('m-course-year').value.trim();
      const semester = document.getElementById('m-course-semester').value.trim();
      const color = document.getElementById('m-course-color').value;
      const description = document.getElementById('m-course-desc').value.trim();

      try {
        if (isEdit) {
          await API.courses.update(course.id, { name, code, instructor, academic_year, semester, color, description });
          showToast('Course updated successfully.', 'success');
        } else {
          await API.courses.create({ name, code, instructor, academic_year, semester, color, description });
          showToast('Course created successfully.', 'success');
        }
        window.appModals.close();
        if (window.router.currentRoute === 'courses') {
          await CoursesView.loadCourses();
        } else {
          window.router.navigate('courses');
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  },

  openEditCourse(courseId) {
    this.openAddCourse(courseId);
  },

  selectCourseColor(color) {
    document.getElementById('m-course-color').value = color;
    document.querySelectorAll('#course-color-picker button').forEach(btn => {
      if (btn.getAttribute('data-color') === color) {
        btn.className = 'w-6 h-6 rounded-full border-2 border-slate-900 scale-110 transition-all';
      } else {
        btn.className = 'w-6 h-6 rounded-full border-2 border-transparent hover:scale-105 transition-all';
      }
    });
  },

  // Add Unit / Topic Modal
  async openAddTopic(courseId) {
    const c = this.container();
    c.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in">
        <div class="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Add Unit / Topic</h3>
            <button class="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100" onclick="window.appModals.close()">
              ${getIcon('x', 'w-4 h-4')}
            </button>
          </div>

          <form id="modal-topic-form" class="space-y-3.5">
            <div class="grid grid-cols-4 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Unit #</label>
                <input id="m-topic-unit-num" type="number" min="1" value="1" required
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
              </div>
              <div class="col-span-3">
                <label class="block text-xs font-semibold text-slate-700 mb-1">Unit Title *</label>
                <input id="m-topic-unit-title" type="text" required placeholder="e.g. Unit 1: Microeconomic Foundations"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Topic Title *</label>
              <input id="m-topic-title" type="text" required placeholder="e.g. Demand &amp; Supply Elasticity"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select id="m-topic-status" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Brief Description (Optional)</label>
              <textarea id="m-topic-desc" rows="2" placeholder="Key concepts, formulas, or reading pages..."
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"></textarea>
            </div>

            <div class="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button type="button" class="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors" onclick="window.appModals.close()">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors">
                Add Topic
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('modal-topic-form').onsubmit = async (e) => {
      e.preventDefault();
      const unit_number = parseInt(document.getElementById('m-topic-unit-num').value) || 1;
      const unit_title = document.getElementById('m-topic-unit-title').value.trim();
      const topic_title = document.getElementById('m-topic-title').value.trim();
      const status = document.getElementById('m-topic-status').value;
      const description = document.getElementById('m-topic-desc').value.trim();

      try {
        await API.courses.createTopic(courseId, { unit_number, unit_title, topic_title, status, description });
        showToast('Topic added to course curriculum.', 'success');
        window.appModals.close();
        if (window.router.currentRoute === 'courses') {
          await CoursesView.selectCourse(courseId);
          await CoursesView.loadCourses();
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  },

  // Upload Resource Modal
  async openUploadResource(preselectedCourseId = null) {
    const courses = await API.courses.list();
    if (!courses || courses.length === 0) {
      showToast('Please create a course before uploading resources.', 'warning');
      this.openAddCourse();
      return;
    }

    const c = this.container();
    c.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in">
        <div class="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900">Upload Learning Resource</h3>
              <p class="text-[11px] text-slate-500">PDF, PPT/X, DOC/X, XLS/X, TXT, CSV, PNG, JPG (up to 50MB)</p>
            </div>
            <button class="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100" onclick="window.appModals.close()">
              ${getIcon('x', 'w-4 h-4')}
            </button>
          </div>

          <form id="modal-upload-form" class="space-y-4">
            <!-- File Drag and Drop Zone -->
            <div id="drop-zone" class="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 transition-colors">
              <input type="file" id="m-file-input" class="hidden" required
                accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt,.csv,.png,.jpg,.jpeg">
              <div class="flex flex-col items-center gap-2">
                <div class="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  ${getIcon('upload', 'w-6 h-6')}
                </div>
                <div class="text-xs font-semibold text-slate-700">
                  <span class="text-blue-600 hover:underline">Click to browse</span> or drag and drop document
                </div>
                <p class="text-[11px] text-slate-400 font-mono" id="file-chosen-label">No file chosen yet</p>
              </div>
            </div>

            <!-- Course Selection -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Subject / Course *</label>
              <select id="m-upload-course" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">Select Associated Course</option>
                ${courses.map(course => `
                  <option value="${course.id}" ${preselectedCourseId && String(preselectedCourseId) === String(course.id) ? 'selected' : ''}>
                    ${escapeHtml(course.name)} (${escapeHtml(course.code || 'MBA')})
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Optional Unit/Topic selector -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Syllabus Topic (Optional)</label>
              <select id="m-upload-topic" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
                <option value="">No specific topic</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Resource Title (defaults to filename)</label>
              <input id="m-upload-title" type="text" placeholder="e.g. Session 3 - Game Theory &amp; Cournot Duopoly"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Tags (comma separated)</label>
              <input id="m-upload-tags" type="text" placeholder="e.g. lecture-slides, midterms, formula"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Description / Study Context</label>
              <textarea id="m-upload-desc" rows="2" placeholder="Key topics covered, reading instructions, homework links..."
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"></textarea>
            </div>

            <!-- Progress Bar (hidden initially) -->
            <div id="upload-progress-container" class="hidden space-y-1 pt-1">
              <div class="flex justify-between text-[11px] font-semibold text-slate-600">
                <span>Saving to local persistent storage...</span>
                <span id="upload-progress-pct">0%</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div id="upload-progress-fill" class="h-2 bg-blue-600 rounded-full transition-all duration-150" style="width: 0%"></div>
              </div>
            </div>

            <div id="upload-error-box" class="hidden p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs"></div>

            <div class="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button type="button" class="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors" onclick="window.appModals.close()">
                Cancel
              </button>
              <button type="submit" id="btn-submit-upload" class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors">
                Upload &amp; Save
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Drop zone logic
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('m-file-input');
    const fileLabel = document.getElementById('file-chosen-label');
    const titleInput = document.getElementById('m-upload-title');

    dropZone.onclick = () => fileInput.click();
    dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('border-blue-500', 'bg-blue-50/30'); };
    dropZone.ondragleave = () => { dropZone.classList.remove('border-blue-500', 'bg-blue-50/30'); };
    dropZone.ondrop = (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-blue-500', 'bg-blue-50/30');
      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelection(e.dataTransfer.files[0]);
      }
    };

    fileInput.onchange = () => {
      if (fileInput.files.length) handleFileSelection(fileInput.files[0]);
    };

    function handleFileSelection(file) {
      fileLabel.textContent = `${file.name} (${formatBytes(file.size)})`;
      if (!titleInput.value) {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        titleInput.value = nameWithoutExt;
      }
    }

    // Dynamic Topic Loader on Course change
    const courseSelect = document.getElementById('m-upload-course');
    const topicSelect = document.getElementById('m-upload-topic');

    const updateTopics = async (cId) => {
      if (!cId) {
        topicSelect.innerHTML = '<option value="">No specific topic</option>';
        return;
      }
      try {
        const cDetail = await API.courses.get(cId);
        if (cDetail.unit_topics && cDetail.unit_topics.length > 0) {
          topicSelect.innerHTML = '<option value="">No specific topic</option>' + cDetail.unit_topics.map(t => `
            <option value="${t.id}">${escapeHtml(t.unit_title)} - ${escapeHtml(t.topic_title)}</option>
          `).join('');
        } else {
          topicSelect.innerHTML = '<option value="">No topics in this course yet</option>';
        }
      } catch (e) {}
    };

    courseSelect.onchange = (e) => updateTopics(e.target.value);
    if (courseSelect.value) updateTopics(courseSelect.value);

    // Submit form
    document.getElementById('modal-upload-form').onsubmit = async (e) => {
      e.preventDefault();
      if (!fileInput.files.length) {
        showToast('Please select a file to upload.', 'warning');
        return;
      }

      const file = fileInput.files[0];
      const course_id = courseSelect.value;
      const unit_topic_id = topicSelect.value || null;
      const title = titleInput.value.trim();
      const description = document.getElementById('m-upload-desc').value.trim();
      const tags = document.getElementById('m-upload-tags').value.trim();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('course_id', course_id);
      if (unit_topic_id) formData.append('unit_topic_id', unit_topic_id);
      if (title) formData.append('title', title);
      if (description) formData.append('description', description);
      if (tags) formData.append('tags', tags);

      const progressContainer = document.getElementById('upload-progress-container');
      const progressFill = document.getElementById('upload-progress-fill');
      const progressPct = document.getElementById('upload-progress-pct');
      const submitBtn = document.getElementById('btn-submit-upload');
      const errorBox = document.getElementById('upload-error-box');

      progressContainer.classList.remove('hidden');
      errorBox.classList.add('hidden');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Uploading...';

      try {
        await API.resources.upload(formData, (percent) => {
          progressFill.style.width = `${percent}%`;
          progressPct.textContent = `${percent}%`;
        });

        showToast('Resource uploaded and safely indexed!', 'success');
        window.appModals.close();

        // Refresh views
        if (window.router.currentRoute === 'library') {
          await LibraryView.loadResources();
        } else if (window.router.currentRoute === 'dashboard') {
          await DashboardView.loadDashboardData();
        } else {
          window.router.navigate('library');
        }
      } catch (err) {
        errorBox.textContent = err.message || 'Upload failed.';
        errorBox.classList.remove('hidden');
        progressContainer.classList.add('hidden');
        submitBtn.disabled = false;
        submitBtn.innerText = 'Upload & Save';
      }
    };
  },

  // Edit Resource Metadata Modal
  async openEditResource(resourceId) {
    try {
      const res = await API.resources.get(resourceId);
      const courses = await API.courses.list();
      const c = this.container();

      c.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in">
          <div class="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="text-base font-bold text-slate-900">Edit Resource Metadata</h3>
              <button class="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100" onclick="window.appModals.close()">
                ${getIcon('x', 'w-4 h-4')}
              </button>
            </div>

            <form id="modal-edit-res-form" class="space-y-3.5">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Resource Title *</label>
                <input id="m-edit-res-title" type="text" required value="${escapeHtml(res.title)}"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <select id="m-edit-res-course" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
                  ${courses.map(course => `
                    <option value="${course.id}" ${course.id === res.course_id ? 'selected' : ''}>${escapeHtml(course.name)}</option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Tags (comma separated)</label>
                <input id="m-edit-res-tags" type="text" value="${escapeHtml(res.tags)}" placeholder="e.g. syllabus, formula, exam"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Description / Study Context</label>
                <textarea id="m-edit-res-desc" rows="3"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">${escapeHtml(res.description || '')}</textarea>
              </div>

              <div class="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" class="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors" onclick="window.appModals.close()">
                  Cancel
                </button>
                <button type="submit" class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      `;

      document.getElementById('modal-edit-res-form').onsubmit = async (e) => {
        e.preventDefault();
        const title = document.getElementById('m-edit-res-title').value.trim();
        const course_id = parseInt(document.getElementById('m-edit-res-course').value);
        const tags = document.getElementById('m-edit-res-tags').value.trim();
        const description = document.getElementById('m-edit-res-desc').value.trim();

        try {
          await API.resources.update(res.id, { title, course_id, tags, description });
          showToast('Resource metadata updated.', 'success');
          window.appModals.close();
          if (window.router.currentRoute === 'library') {
            await LibraryView.loadResources();
          }
        } catch (err) {
          showToast(err.message, 'error');
        }
      };
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  // Create Quick Note Modal
  async openCreateNote() {
    window.router.navigate('notes');
    setTimeout(() => {
      if (window.NotesView) window.NotesView.initNewNoteForm();
    }, 50);
  },

  // Create / Edit Task Modal
  async openCreateTask(taskId = null) {
    let task = null;
    if (taskId) {
      try {
        task = await API.tasks.get(taskId);
      } catch (e) {
        showToast(e.message, 'error');
        return;
      }
    }

    const isEdit = !!task;
    const courses = await API.courses.list();
    const c = this.container();

    // Default due date: tomorrow at 23:59
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 1);
    defaultDueDate.setHours(23, 59, 0, 0);
    const formattedDue = isEdit && task.due_date
      ? new Date(task.due_date).toISOString().slice(0, 16)
      : defaultDueDate.toISOString().slice(0, 16);

    c.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in">
        <div class="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">${isEdit ? 'Edit Deadline / Assignment' : 'Add Academic Deadline'}</h3>
            <button class="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100" onclick="window.appModals.close()">
              ${getIcon('x', 'w-4 h-4')}
            </button>
          </div>

          <form id="modal-task-form" class="space-y-3.5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Task / Deliverable Title *</label>
              <input id="m-task-title" type="text" required value="${isEdit ? escapeHtml(task.title) : ''}"
                placeholder="e.g. Economics Case Study: Dynamic Pricing" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <select id="m-task-course" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
                  <option value="">General Academic</option>
                  ${courses.map(course => `
                    <option value="${course.id}" ${isEdit && task.course_id === course.id ? 'selected' : ''}>${escapeHtml(course.name)}</option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select id="m-task-type" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
                  <option value="Assignment" ${isEdit && task.task_type === 'Assignment' ? 'selected' : ''}>Assignment</option>
                  <option value="Exam" ${isEdit && task.task_type === 'Exam' ? 'selected' : ''}>Exam / Midterm</option>
                  <option value="Project" ${isEdit && task.task_type === 'Project' ? 'selected' : ''}>Group Project</option>
                  <option value="Quiz" ${isEdit && task.task_type === 'Quiz' ? 'selected' : ''}>Quiz</option>
                  <option value="Reading" ${isEdit && task.task_type === 'Reading' ? 'selected' : ''}>Reading Case</option>
                  <option value="Revision" ${isEdit && task.task_type === 'Revision' ? 'selected' : ''}>Revision</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Due Date &amp; Time *</label>
                <input id="m-task-due" type="datetime-local" required value="${formattedDue}"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select id="m-task-priority" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
                  <option value="High" ${isEdit && task.priority === 'High' ? 'selected' : ''}>High Priority</option>
                  <option value="Medium" ${!isEdit || task.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                  <option value="Low" ${isEdit && task.priority === 'Low' ? 'selected' : ''}>Low</option>
                </select>
              </div>
            </div>

            ${isEdit ? `
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select id="m-task-status" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
                  <option value="To Do" ${task.status === 'To Do' ? 'selected' : ''}>To Do</option>
                  <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                  <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
              </div>
            ` : ''}

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Instructions / Description</label>
              <textarea id="m-task-desc" rows="2" placeholder="Submission rubric, partner names, notes..."
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">${isEdit && task.description ? escapeHtml(task.description) : ''}</textarea>
            </div>

            <div class="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button type="button" class="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors" onclick="window.appModals.close()">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors">
                ${isEdit ? 'Save Changes' : 'Create Deadline'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('modal-task-form').onsubmit = async (e) => {
      e.preventDefault();
      const title = document.getElementById('m-task-title').value.trim();
      const course_id = document.getElementById('m-task-course').value;
      const task_type = document.getElementById('m-task-type').value;
      const due_date = new Date(document.getElementById('m-task-due').value).toISOString();
      const priority = document.getElementById('m-task-priority').value;
      const description = document.getElementById('m-task-desc').value.trim();
      const status = isEdit ? document.getElementById('m-task-status').value : 'To Do';

      try {
        if (isEdit) {
          await API.tasks.update(task.id, {
            title,
            course_id: course_id ? parseInt(course_id) : 0,
            task_type,
            due_date,
            priority,
            status,
            description,
          });
          showToast('Deadline updated.', 'success');
        } else {
          await API.tasks.create({
            title,
            course_id: course_id ? parseInt(course_id) : null,
            task_type,
            due_date,
            priority,
            status,
            description,
          });
          showToast('New deadline scheduled.', 'success');
        }
        window.appModals.close();
        if (window.router.currentRoute === 'tasks') {
          await TasksView.loadTasks();
        } else if (window.router.currentRoute === 'dashboard') {
          await DashboardView.loadDashboardData();
        } else {
          window.router.navigate('tasks');
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  },

  openEditTask(taskId) {
    this.openCreateTask(taskId);
  },

  // Weekly Study Goal Modal
  async openStudyGoalModal() {
    const c = this.container();
    const now = new Date();
    // ISO week
    const target = new Date(now.valueOf());
    const dayNr = (now.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    const weekNum = 1 + Math.ceil((firstThursday - target) / 604800000);
    const weekIdentifier = `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;

    c.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in">
        <div class="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900">Set Weekly Study Goal</h3>
              <p class="text-xs text-slate-500">${weekIdentifier}</p>
            </div>
            <button class="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100" onclick="window.appModals.close()">
              ${getIcon('x', 'w-4 h-4')}
            </button>
          </div>

          <form id="modal-goal-form" class="space-y-3.5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Target Syllabus Topics to Master</label>
              <input id="m-goal-topics" type="number" min="1" max="50" value="5" required
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
              <p class="text-[11px] text-slate-400 mt-1">Number of curriculum unit topics to mark completed this week</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Target Study Hours</label>
              <input id="m-goal-hours" type="number" min="1" max="100" step="0.5" value="15.0" required
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Weekly Focus / Notes</label>
              <textarea id="m-goal-notes" rows="2" placeholder="e.g. Master financial statements and price elasticity before quiz"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"></textarea>
            </div>

            <div class="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button type="button" class="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors" onclick="window.appModals.close()">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors">
                Save Weekly Goal
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('modal-goal-form').onsubmit = async (e) => {
      e.preventDefault();
      const target_topics = parseInt(document.getElementById('m-goal-topics').value) || 5;
      const target_hours = parseFloat(document.getElementById('m-goal-hours').value) || 15.0;
      const notes = document.getElementById('m-goal-notes').value.trim();

      try {
        await API.progress.saveGoal({
          week_identifier: weekIdentifier,
          target_topics,
          target_hours,
          notes,
        });
        showToast('Weekly study goal updated!', 'success');
        window.appModals.close();
        if (window.router.currentRoute === 'progress') {
          await ProgressView.loadProgressData();
        } else if (window.router.currentRoute === 'dashboard') {
          await DashboardView.loadDashboardData();
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  },

  // Global Search Modal
  openGlobalSearch() {
    const c = this.container();
    c.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 modal-backdrop animate-fade-in" id="global-search-modal">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col">
          <div class="p-4 border-b border-slate-100 flex items-center gap-3">
            <span class="text-slate-400">
              ${getIcon('search', 'w-5 h-5')}
            </span>
            <input id="gsearch-input" type="text" autofocus placeholder="Search across all resources by title, topic, subject, tag, or filename..."
              class="flex-1 text-sm bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400">
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">ESC to close</span>
          </div>

          <div id="gsearch-results" class="max-h-96 overflow-y-auto p-4 space-y-2">
            <div class="py-8 text-center text-xs text-slate-400">
              Start typing to search your entire learning database...
            </div>
          </div>
        </div>
      </div>
    `;

    const input = document.getElementById('gsearch-input');
    const results = document.getElementById('gsearch-results');
    input.focus();

    // Close on ESC
    const escListener = (e) => {
      if (e.key === 'Escape') {
        window.appModals.close();
        window.removeEventListener('keydown', escListener);
      }
    };
    window.addEventListener('keydown', escListener);

    document.getElementById('global-search-modal').onclick = (e) => {
      if (e.target.id === 'global-search-modal') window.appModals.close();
    };

    let timer;
    input.oninput = () => {
      clearTimeout(timer);
      const query = input.value.trim();
      if (!query) {
        results.innerHTML = `<div class="py-8 text-center text-xs text-slate-400">Start typing to search your entire learning database...</div>`;
        return;
      }

      timer = setTimeout(async () => {
        results.innerHTML = renderLoadingState('Searching records...');
        try {
          const items = await API.resources.list({ search: query });
          if (!items || items.length === 0) {
            results.innerHTML = `<div class="py-8 text-center text-xs text-slate-400">No matching study materials found for "${escapeHtml(query)}".</div>`;
            return;
          }

          results.innerHTML = items.map(item => `
            <div class="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
              onclick="window.appModals.close(); window.readerWorkspace.open(${item.id})">
              <div class="flex items-center gap-3 min-w-0 pr-3">
                <div class="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                  ${getIcon('file-text', 'w-4 h-4')}
                </div>
                <div class="min-w-0">
                  <h4 class="text-xs font-bold text-slate-900 truncate">${escapeHtml(item.title)}</h4>
                  <div class="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    <span class="font-medium text-slate-700">${escapeHtml(item.course_name)}</span>
                    ${item.topic_title ? `<span>• ${escapeHtml(item.topic_title)}</span>` : ''}
                    <span>•</span>
                    ${getTypeBadge(item.resource_type)}
                    <span>•</span>
                    <span>${formatBytes(item.file_size)}</span>
                  </div>
                </div>
              </div>
              <div class="shrink-0 flex items-center gap-1.5">
                <span class="text-xs text-blue-600 font-semibold">Open &rarr;</span>
              </div>
            </div>
          `).join('');
        } catch (e) {
          results.innerHTML = `<div class="text-xs text-rose-500 p-4">Search error: ${escapeHtml(e.message)}</div>`;
        }
      }, 250);
    };
  }
};

window.appModals = AppModals;

// Central Client Router
const AppRouter = {
  currentRoute: 'dashboard',
  params: {},

  routes: {
    dashboard: DashboardView,
    courses: CoursesView,
    library: LibraryView,
    notes: NotesView,
    bookmarks: BookmarksView,
    progress: ProgressView,
    tasks: TasksView,
    profile: ProfileView,
    settings: SettingsView,
    login: AuthView,
    register: AuthView,
  },

  async navigate(route, params = {}) {
    this.currentRoute = route;
    this.params = params;
    window.location.hash = `#${route}`;
    await this.renderCurrentRoute();
  },

  async renderCurrentRoute() {
    const mainContainer = document.getElementById('main-content');
    const authContainer = document.getElementById('auth-content');
    const appShell = document.getElementById('app-shell');

    // Check if auth view
    if (this.currentRoute === 'login' || this.currentRoute === 'register' || !window.currentUser) {
      if (appShell) appShell.classList.add('hidden');
      if (authContainer) {
        authContainer.classList.remove('hidden');
        if (this.currentRoute === 'register') {
          authContainer.innerHTML = AuthView.renderRegister();
          AuthView.bindRegisterEvents();
        } else {
          authContainer.innerHTML = AuthView.renderLogin();
          AuthView.bindLoginEvents();
        }
      }
      return;
    }

    // Authenticated App Shell
    if (authContainer) authContainer.classList.add('hidden');
    if (appShell) appShell.classList.remove('hidden');

    // Update Sidebar Active state
    document.querySelectorAll('.sidebar-link').forEach(link => {
      const linkRoute = link.getAttribute('data-route');
      if (linkRoute === this.currentRoute) {
        link.className = 'sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 transition-colors shadow-xs';
      } else {
        link.className = 'sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors';
      }
    });

    // Close mobile menu if open
    const mobileDrawer = document.getElementById('mobile-drawer');
    if (mobileDrawer) mobileDrawer.classList.add('hidden');

    const view = this.routes[this.currentRoute] || DashboardView;
    if (mainContainer && view) {
      mainContainer.innerHTML = await view.render(this.params);
      if (view.bindEvents) await view.bindEvents(this.params);
    }
  },

  init() {
    // Listen to hash changes
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      this.navigate(hash);
    });

    // Handle global keyboard shortcut: Ctrl+K or Cmd+K for search
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        window.appModals.openGlobalSearch();
      }
    });

    // Initial route
    const initialHash = window.location.hash.replace('#', '') || 'dashboard';
    this.currentRoute = initialHash;
  }
};

window.router = AppRouter;

// Application Bootstrapper
document.addEventListener('DOMContentLoaded', async () => {
  // Listen for 401 unauthorized
  window.addEventListener('auth-required', () => {
    window.currentUser = null;
    window.router.navigate('login');
  });

  // Check current session
  try {
    const user = await API.auth.getMe();
    window.currentUser = user;

    // Update UI elements with user information
    const userGreetingEl = document.getElementById('header-user-name');
    if (userGreetingEl) userGreetingEl.textContent = user.full_name;
    const userAvatarEl = document.getElementById('header-avatar');
    if (userAvatarEl) userAvatarEl.textContent = user.full_name.charAt(0).toUpperCase();
  } catch (err) {
    window.currentUser = null;
  }

  // Initialize router
  window.router.init();
  await window.router.renderCurrentRoute();

  // Bind Top Bar & Shell Events
  const topSearchBtn = document.getElementById('top-search-btn');
  if (topSearchBtn) topSearchBtn.onclick = () => window.appModals.openGlobalSearch();

  const logoutBtn = document.getElementById('header-logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      try {
        await API.auth.logout();
        window.currentUser = null;
        showToast('Logged out.', 'info');
        window.router.navigate('login');
      } catch (e) {
        showToast(e.message, 'error');
      }
    };
  }

  // Mobile menu toggle
  const mobileToggleBtn = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileCloseBtn = document.getElementById('mobile-drawer-close');

  if (mobileToggleBtn && mobileDrawer) {
    mobileToggleBtn.onclick = () => mobileDrawer.classList.remove('hidden');
  }
  if (mobileCloseBtn && mobileDrawer) {
    mobileCloseBtn.onclick = () => mobileDrawer.classList.add('hidden');
  }
});

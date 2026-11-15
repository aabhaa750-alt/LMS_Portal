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
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-950/40 backdrop-blur-xs animate-fade-in" id="course-modal-backdrop">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-lg w-full p-6 space-y-5 animate-scale-up">
          <div class="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                ${getIcon('book-open', 'w-5 h-5')}
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900 tracking-tight">${isEdit ? 'Edit Course Details' : 'Create New Course / Subject'}</h3>
                <p class="text-[11px] text-slate-400 font-medium">Configure course parameters and academic syllabus</p>
              </div>
            </div>
            <button class="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" onclick="window.appModals.close()">
              ${getIcon('x', 'w-4 h-4')}
            </button>
          </div>

          <form id="modal-course-form" class="space-y-4">
            <div class="grid grid-cols-3 gap-3">
              <div class="col-span-2">
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Subject Name *</label>
                <input id="m-course-name" type="text" required value="${isEdit ? escapeHtml(course.name) : ''}"
                  placeholder="e.g. Managerial Economics" class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Code</label>
                <input id="m-course-code" type="text" value="${isEdit && course.code ? escapeHtml(course.code) : ''}"
                  placeholder="e.g. MBA601" class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Instructor Name</label>
              <input id="m-course-instructor" type="text" value="${isEdit && course.instructor ? escapeHtml(course.instructor) : ''}"
                placeholder="e.g. Prof. Henderson" class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Academic Year</label>
                <input id="m-course-year" type="text" value="${isEdit ? escapeHtml(course.academic_year) : (window.currentUser ? window.currentUser.academic_year : 'Year 1')}"
                  class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Semester</label>
                <input id="m-course-semester" type="text" value="${isEdit ? escapeHtml(course.semester) : (window.currentUser ? window.currentUser.semester : 'Semester 1')}"
                  class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Course Color Accent</label>
              <div class="flex items-center gap-2.5" id="course-color-picker">
                ${['#2563eb', '#059669', '#d97706', '#7c3aed', '#0284c7', '#dc2626', '#475569'].map(color => `
                  <button type="button" class="w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${isEdit && course.color === color ? 'border-slate-900 ring-2 ring-slate-900/20 scale-110' : 'border-transparent hover:scale-105'}"
                    style="background-color: ${color}" onclick="window.appModals.selectCourseColor('${color}')" data-color="${color}"></button>
                `).join('')}
                <input type="hidden" id="m-course-color" value="${isEdit ? course.color : '#2563eb'}">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Description / Syllabus Overview</label>
              <textarea id="m-course-desc" rows="3" placeholder="Core objectives, grading breakdown, textbook references..."
                class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none">${isEdit && course.description ? escapeHtml(course.description) : ''}</textarea>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button type="button" class="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/90 rounded-xl transition-all border border-slate-200/60 cursor-pointer" onclick="window.appModals.close()">
                Cancel
              </button>
              <button type="submit" class="px-4.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer">
                ${isEdit ? 'Save Changes' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('course-modal-backdrop').onclick = (e) => {
      if (e.target.id === 'course-modal-backdrop') window.appModals.close();
    };

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
        btn.className = 'w-6 h-6 rounded-full border-2 border-slate-900 ring-2 ring-slate-900/20 scale-110 transition-all cursor-pointer';
      } else {
        btn.className = 'w-6 h-6 rounded-full border-2 border-transparent hover:scale-105 transition-all cursor-pointer';
      }
    });
  },

  // Add Unit / Topic Modal
  async openAddTopic(courseId) {
    const c = this.container();
    c.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-950/40 backdrop-blur-xs animate-fade-in" id="topic-modal-backdrop">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-md w-full p-6 space-y-5 animate-scale-up">
          <div class="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                ${getIcon('list', 'w-5 h-5')}
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900 tracking-tight">Add Unit / Topic</h3>
                <p class="text-[11px] text-slate-400 font-medium">Add topic to course curriculum breakdown</p>
              </div>
            </div>
            <button class="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" onclick="window.appModals.close()">
              ${getIcon('x', 'w-4 h-4')}
            </button>
          </div>

          <form id="modal-topic-form" class="space-y-4">
            <div class="grid grid-cols-4 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Unit #</label>
                <input id="m-topic-unit-num" type="number" min="1" value="1" required
                  class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all">
              </div>
              <div class="col-span-3">
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Unit Title *</label>
                <input id="m-topic-unit-title" type="text" required placeholder="e.g. Unit 1: Microeconomic Foundations"
                  class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Topic Title *</label>
              <input id="m-topic-title" type="text" required placeholder="e.g. Demand &amp; Supply Elasticity"
                class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Study Status</label>
              <select id="m-topic-status" class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer">
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Brief Description (Optional)</label>
              <textarea id="m-topic-desc" rows="2" placeholder="Key concepts, formulas, or reading pages..."
                class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none"></textarea>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button type="button" class="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/90 rounded-xl transition-all border border-slate-200/60 cursor-pointer" onclick="window.appModals.close()">
                Cancel
              </button>
              <button type="submit" class="px-4.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer">
                Add Topic
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('topic-modal-backdrop').onclick = (e) => {
      if (e.target.id === 'topic-modal-backdrop') window.appModals.close();
    };

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
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-950/40 backdrop-blur-xs animate-fade-in" id="upload-modal-backdrop">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-lg w-full p-6 space-y-5 animate-scale-up max-h-[92vh] flex flex-col">
          <div class="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                ${getIcon('upload-cloud', 'w-5 h-5')}
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900 tracking-tight">Upload Learning Resource</h3>
                <p class="text-[11px] text-slate-400 font-medium">PDF, PPT/X, DOC/X, XLS/X, TXT, CSV, PNG, JPG (up to 50MB)</p>
              </div>
            </div>
            <button class="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" onclick="window.appModals.close()">
              ${getIcon('x', 'w-4 h-4')}
            </button>
          </div>

          <form id="modal-upload-form" class="space-y-4 flex-1 overflow-y-auto pr-1">
            <!-- File Drag and Drop Zone -->
            <div id="drop-zone" class="border-2 border-dashed border-slate-200/90 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/70 hover:bg-blue-50/30 transition-all group">
              <input type="file" id="m-file-input" class="hidden" required
                accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt,.csv,.png,.jpg,.jpeg">
              <div class="flex flex-col items-center gap-2.5">
                <div class="w-11 h-11 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  ${getIcon('upload', 'w-5 h-5')}
                </div>
                <div>
                  <div class="text-xs font-semibold text-slate-700">
                    <span class="text-blue-600 hover:underline">Click to browse</span> or drag and drop document
                  </div>
                  <p class="text-[11px] text-slate-400 mt-0.5">Faculty slides, PDFs, notes, study guides</p>
                </div>
                <div id="file-chosen-label" class="text-[11px] font-mono text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 max-w-xs truncate">
                  No file selected
                </div>
              </div>
            </div>

            <!-- Course Selection -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Subject / Course *</label>
              <select id="m-upload-course" required class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer">
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
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Syllabus Topic (Optional)</label>
              <select id="m-upload-topic" class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer">
                <option value="">No specific topic</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Resource Title (defaults to filename)</label>
              <input id="m-upload-title" type="text" placeholder="e.g. Session 3 - Game Theory &amp; Cournot Duopoly"
                class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Tags (comma separated)</label>
              <input id="m-upload-tags" type="text" placeholder="e.g. lecture-slides, midterms, formula"
                class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Description / Study Context</label>
              <textarea id="m-upload-desc" rows="2" placeholder="Key topics covered, reading instructions, homework links..."
                class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none"></textarea>
            </div>

            <!-- Progress Bar (hidden initially) -->
            <div id="upload-progress-container" class="hidden space-y-1.5 pt-1">
              <div class="flex justify-between text-[11px] font-semibold text-slate-600">
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  Saving &amp; indexing study document...
                </span>
                <span id="upload-progress-pct" class="font-mono text-blue-600">0%</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                <div id="upload-progress-fill" class="h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-150" style="width: 0%"></div>
              </div>
            </div>

            <div id="upload-error-box" class="hidden p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"></div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 shrink-0">
              <button type="button" class="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/90 rounded-xl transition-all border border-slate-200/60 cursor-pointer" onclick="window.appModals.close()">
                Cancel
              </button>
              <button type="submit" id="btn-submit-upload" class="px-4.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer">
                Upload &amp; Save
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('upload-modal-backdrop').onclick = (e) => {
      if (e.target.id === 'upload-modal-backdrop') window.appModals.close();
    };

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
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-950/40 backdrop-blur-xs animate-fade-in" id="edit-res-modal-backdrop">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-md w-full p-6 space-y-5 animate-scale-up">
            <div class="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  ${getIcon('edit', 'w-5 h-5')}
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900 tracking-tight">Edit Resource Metadata</h3>
                  <p class="text-[11px] text-slate-400 font-medium">Update title, course association, tags and notes</p>
                </div>
              </div>
              <button class="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" onclick="window.appModals.close()">
                ${getIcon('x', 'w-4 h-4')}
              </button>
            </div>

            <form id="modal-edit-res-form" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Resource Title *</label>
                <input id="m-edit-res-title" type="text" required value="${escapeHtml(res.title)}"
                  class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Subject / Course</label>
                <select id="m-edit-res-course" class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer">
                  ${courses.map(course => `
                    <option value="${course.id}" ${course.id === res.course_id ? 'selected' : ''}>${escapeHtml(course.name)}</option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Tags (comma separated)</label>
                <input id="m-edit-res-tags" type="text" value="${escapeHtml(res.tags)}" placeholder="e.g. syllabus, formula, exam"
                  class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Description / Study Context</label>
                <textarea id="m-edit-res-desc" rows="3"
                  class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none">${escapeHtml(res.description || '')}</textarea>
              </div>

              <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" class="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/90 rounded-xl transition-all border border-slate-200/60 cursor-pointer" onclick="window.appModals.close()">
                  Cancel
                </button>
                <button type="submit" class="px-4.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      `;

      document.getElementById('edit-res-modal-backdrop').onclick = (e) => {
        if (e.target.id === 'edit-res-modal-backdrop') window.appModals.close();
      };

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
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-950/40 backdrop-blur-xs animate-fade-in" id="task-modal-backdrop">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-md w-full p-6 space-y-5 animate-scale-up">
          <div class="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                ${getIcon('calendar', 'w-5 h-5')}
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900 tracking-tight">${isEdit ? 'Edit Deadline / Assignment' : 'Add Academic Deadline'}</h3>
                <p class="text-[11px] text-slate-400 font-medium">Track coursework milestones, exams, and deliverables</p>
              </div>
            </div>
            <button class="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" onclick="window.appModals.close()">
              ${getIcon('x', 'w-4 h-4')}
            </button>
          </div>

          <form id="modal-task-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Task / Deliverable Title *</label>
              <input id="m-task-title" type="text" required value="${isEdit ? escapeHtml(task.title) : ''}"
                placeholder="e.g. Economics Case Study: Dynamic Pricing" class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Subject</label>
                <select id="m-task-course" class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer">
                  <option value="">General Academic</option>
                  ${courses.map(course => `
                    <option value="${course.id}" ${isEdit && task.course_id === course.id ? 'selected' : ''}>${escapeHtml(course.name)}</option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
                <select id="m-task-type" class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer">
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
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Due Date &amp; Time *</label>
                <input id="m-task-due" type="datetime-local" required value="${formattedDue}"
                  class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Priority</label>
                <select id="m-task-priority" class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer">
                  <option value="High" ${isEdit && task.priority === 'High' ? 'selected' : ''}>High Priority</option>
                  <option value="Medium" ${!isEdit || task.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                  <option value="Low" ${isEdit && task.priority === 'Low' ? 'selected' : ''}>Low</option>
                </select>
              </div>
            </div>

            ${isEdit ? `
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                <select id="m-task-status" class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer">
                  <option value="To Do" ${task.status === 'To Do' ? 'selected' : ''}>To Do</option>
                  <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                  <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
              </div>
            ` : ''}

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Instructions / Description</label>
              <textarea id="m-task-desc" rows="2" placeholder="Submission rubric, partner names, notes..."
                class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none">${isEdit && task.description ? escapeHtml(task.description) : ''}</textarea>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button type="button" class="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/90 rounded-xl transition-all border border-slate-200/60 cursor-pointer" onclick="window.appModals.close()">
                Cancel
              </button>
              <button type="submit" class="px-4.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer">
                ${isEdit ? 'Save Changes' : 'Create Deadline'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('task-modal-backdrop').onclick = (e) => {
      if (e.target.id === 'task-modal-backdrop') window.appModals.close();
    };

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
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-950/40 backdrop-blur-xs animate-fade-in" id="goal-modal-backdrop">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-md w-full p-6 space-y-5 animate-scale-up">
          <div class="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                ${getIcon('target', 'w-5 h-5')}
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900 tracking-tight">Set Weekly Study Goal</h3>
                <p class="text-[11px] text-slate-400 font-medium">${weekIdentifier} · Target curriculum progress</p>
              </div>
            </div>
            <button class="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" onclick="window.appModals.close()">
              ${getIcon('x', 'w-4 h-4')}
            </button>
          </div>

          <form id="modal-goal-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Target Syllabus Topics to Master</label>
              <input id="m-goal-topics" type="number" min="1" max="50" value="5" required
                class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all">
              <p class="text-[11px] text-slate-400 mt-1">Number of curriculum unit topics to mark completed this week</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Target Study Hours</label>
              <input id="m-goal-hours" type="number" min="1" max="100" step="0.5" value="15.0" required
                class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Weekly Focus / Notes</label>
              <textarea id="m-goal-notes" rows="2" placeholder="e.g. Master financial statements and price elasticity before quiz"
                class="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none"></textarea>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button type="button" class="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/90 rounded-xl transition-all border border-slate-200/60 cursor-pointer" onclick="window.appModals.close()">
                Cancel
              </button>
              <button type="submit" class="px-4.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer">
                Save Weekly Goal
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('goal-modal-backdrop').onclick = (e) => {
      if (e.target.id === 'goal-modal-backdrop') window.appModals.close();
    };

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
      <div class="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 modal-backdrop bg-slate-950/40 backdrop-blur-xs animate-fade-in" id="global-search-modal">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-2xl w-full overflow-hidden flex flex-col animate-scale-up">
          <div class="p-4 border-b border-slate-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              ${getIcon('search', 'w-4 h-4')}
            </div>
            <input id="gsearch-input" type="text" autofocus placeholder="Search across courses, resources, notes, topics, or tags..."
              class="flex-1 text-sm bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400 font-medium">
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200/80">ESC to close</span>
          </div>

          <div id="gsearch-results" class="max-h-96 overflow-y-auto p-3 space-y-2">
            <div class="py-12 text-center text-xs text-slate-400 space-y-2">
              <div class="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-400 flex items-center justify-center mx-auto">
                ${getIcon('search', 'w-5 h-5')}
              </div>
              <p class="font-medium text-slate-500">Type any topic, presentation title, or course name</p>
              <p class="text-[11px] text-slate-400">Search is grounded across your syllabus and uploaded slides</p>
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
        results.innerHTML = `
          <div class="py-12 text-center text-xs text-slate-400 space-y-2">
            <div class="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-400 flex items-center justify-center mx-auto">
              ${getIcon('search', 'w-5 h-5')}
            </div>
            <p class="font-medium text-slate-500">Type any topic, presentation title, or course name</p>
            <p class="text-[11px] text-slate-400">Search is grounded across your syllabus and uploaded slides</p>
          </div>
        `;
        return;
      }

      timer = setTimeout(async () => {
        results.innerHTML = renderLoadingState('Searching records...');
        try {
          const items = await API.resources.list({ search: query });
          if (!items || items.length === 0) {
            results.innerHTML = `
              <div class="py-10 text-center text-xs text-slate-400 space-y-1">
                <p class="font-medium text-slate-600">No matching study materials found</p>
                <p class="text-[11px]">No resources match "${escapeHtml(query)}"</p>
              </div>
            `;
            return;
          }

          results.innerHTML = items.map(item => `
            <div class="group p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 flex items-center justify-between cursor-pointer transition-all"
              onclick="window.appModals.close(); window.readerWorkspace.open(${item.id})">
              <div class="flex items-center gap-3 min-w-0 pr-3">
                <div class="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-2xs text-slate-600 shrink-0 flex items-center justify-center transition-all">
                  ${getIcon('file-text', 'w-4 h-4')}
                </div>
                <div class="min-w-0">
                  <h4 class="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate transition-colors">${escapeHtml(item.title)}</h4>
                  <div class="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span class="font-semibold text-slate-700">${escapeHtml(item.course_name)}</span>
                    ${item.topic_title ? `<span>• ${escapeHtml(item.topic_title)}</span>` : ''}
                    <span>•</span>
                    ${getTypeBadge(item.resource_type)}
                    <span>•</span>
                    <span class="font-mono">${formatBytes(item.file_size)}</span>
                  </div>
                </div>
              </div>
              <div class="shrink-0 flex items-center gap-1.5 text-xs text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>Open</span>
                <span>&rarr;</span>
              </div>
            </div>
          `).join('');
        } catch (e) {
          results.innerHTML = `<div class="text-xs text-rose-500 p-4">Search error: ${escapeHtml(e.message)}</div>`;
        }
      }, 250);
    };
  },

  // Universal 5-Part MBA "Explain This Concept" Modal
  async openExplainConcept(initialConcept = '', courseId = null, resourceId = null) {
    const c = this.container();
    if (!c) return;

    c.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-950/40 backdrop-blur-xs animate-fade-in" id="explain-modal-backdrop">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col animate-scale-up">
          <div class="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                ${getIcon('brain', 'w-5 h-5')}
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900 tracking-tight">Explain This Concept</h3>
                <p class="text-[11px] text-slate-400 font-medium">5-Part MBA Breakdown grounded in your course materials</p>
              </div>
            </div>
            <button class="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" onclick="window.appModals.close()">
              ${getIcon('x', 'w-4 h-4')}
            </button>
          </div>

          <!-- Concept Input Bar -->
          <div class="flex items-center gap-2 shrink-0">
            <input id="explain-concept-input" type="text" value="${escapeHtml(initialConcept)}"
              placeholder="e.g. REST API, Microservices vs Monolith, Relational Schema, TAM SAM SOM..."
              class="flex-1 px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all">
            <button id="explain-concept-submit" class="px-4.5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer shrink-0">
              Explain
            </button>
          </div>

          <!-- Result Area -->
          <div id="explain-result-area" class="flex-1 overflow-y-auto space-y-4 pr-1">
            ${initialConcept ? renderLoadingState(`Analyzing '${escapeHtml(initialConcept)}' against your course slides...`) : `
              <div class="p-8 text-center text-slate-400 border border-dashed border-slate-200/80 rounded-2xl bg-slate-50/40">
                <p class="text-xs">Type any MBA or technical concept above and click <strong>Explain</strong> to generate the 5-part academic breakdown.</p>
              </div>
            `}
          </div>

          <!-- Footer Actions -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0" id="explain-footer-actions" style="display: none;">
            <div id="explain-citations" class="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500"></div>
            <div class="flex items-center gap-2">
              <button id="explain-save-note-btn" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/90 rounded-xl transition-all border border-slate-200/60 cursor-pointer">
                ${getIcon('file-text', 'w-3.5 h-3.5')}
                Save to Notes
              </button>
              <button class="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer" onclick="window.appModals.close()">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('explain-modal-backdrop').onclick = (e) => {
      if (e.target.id === 'explain-modal-backdrop') window.appModals.close();
    };

    const runExplain = async (concept) => {
      if (!concept || !concept.trim()) return;
      const resArea = document.getElementById('explain-result-area');
      const footer = document.getElementById('explain-footer-actions');
      if (footer) footer.style.display = 'none';
      resArea.innerHTML = renderLoadingState(`Synthesizing 5-part MBA breakdown for "${escapeHtml(concept)}"...`);

      try {
        const data = await API.ai.explainConcept({
          concept: concept.trim(),
          course_id: courseId,
          resource_id: resourceId,
        });

        // Render 5-part explanation
        resArea.innerHTML = `
          <div class="space-y-4">
            <!-- 1. Simple Meaning -->
            <div class="p-4 rounded-2xl bg-blue-50/70 border border-blue-100/90 shadow-2xs space-y-1.5">
              <div class="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                <span class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                Simple Meaning
              </div>
              <p class="text-xs text-blue-950 leading-relaxed font-medium pl-7">${escapeHtml(data.simple_meaning)}</p>
            </div>

            <!-- 2. MBA-Level Explanation -->
            <div class="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 shadow-2xs space-y-2">
              <div class="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <span class="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                MBA &amp; Academic Explanation
              </div>
              <div class="text-xs text-slate-700 leading-relaxed pl-7">${formatAiMarkdown(data.mba_level_explanation)}</div>
            </div>

            <!-- 3. Practical Business Example -->
            <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100/90 shadow-2xs space-y-2">
              <div class="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                <span class="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                Practical Business &amp; Brand Example
              </div>
              <div class="text-xs text-emerald-950 leading-relaxed pl-7">${formatAiMarkdown(data.practical_business_example)}</div>
            </div>

            <!-- 4. Important Terminology -->
            <div class="p-4 rounded-2xl bg-purple-50/70 border border-purple-100/90 shadow-2xs space-y-2">
              <div class="flex items-center gap-2 text-xs font-bold text-purple-900 uppercase tracking-wider">
                <span class="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
                Key Terminology &amp; Formulas
              </div>
              <div class="text-xs text-purple-950 leading-relaxed pl-7">${formatAiMarkdown(data.important_terminology)}</div>
            </div>

            <!-- 5. Exam & Discussion Tips -->
            <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-100/90 shadow-2xs space-y-2">
              <div class="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <span class="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">5</span>
                Exam Answer Framing &amp; Discussion
              </div>
              <div class="text-xs text-amber-950 leading-relaxed pl-7">${formatAiMarkdown(data.exam_and_discussion_tips)}</div>
            </div>
          </div>
        `;

        if (footer) {
          footer.style.display = 'flex';
          const citationsEl = document.getElementById('explain-citations');
          if (citationsEl && data.citations && data.citations.length > 0) {
            citationsEl.innerHTML = `<span class="font-semibold text-slate-600">Grounded in:</span> ` +
              data.citations.map(c => `<span class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-200/60">${escapeHtml(c)}</span>`).join(' ');
          }

          const saveNoteBtn = document.getElementById('explain-save-note-btn');
          if (saveNoteBtn) {
            saveNoteBtn.onclick = async () => {
              try {
                const noteContent = `# ${data.concept} (Concept Breakdown)\n\n### 1. Simple Meaning\n${data.simple_meaning}\n\n### 2. MBA Explanation\n${data.mba_level_explanation}\n\n### 3. Business Example\n${data.practical_business_example}\n\n### 4. Key Terminology\n${data.important_terminology}\n\n### 5. Exam Framing\n${data.exam_and_discussion_tips}`;
                await API.notes.create({
                  title: `${data.concept} — MBA Concept Notes`,
                  content: noteContent,
                  course_id: courseId || null,
                  resource_id: resourceId || null,
                  tags: 'AI Concept, Revision, MBA',
                });
                showToast(`Saved '${data.concept}' to your Study Notes!`, 'success');
              } catch (err) {
                showToast(err.message, 'error');
              }
            };
          }
        }
      } catch (err) {
        resArea.innerHTML = `<div class="p-4 text-xs text-rose-600 bg-rose-50 rounded-xl">Error generating explanation: ${escapeHtml(err.message)}</div>`;
      }
    };

    document.getElementById('explain-concept-submit').onclick = () => {
      const val = document.getElementById('explain-concept-input').value;
      runExplain(val);
    };

    document.getElementById('explain-concept-input').onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runExplain(e.target.value);
      }
    };

    if (initialConcept) {
      runExplain(initialConcept);
    }
  },

  // Document Slides & Chunk Inspector Modal
  async openChunkViewer(resourceId) {
    const c = this.container();
    if (!c) return;

    c.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-950/40 backdrop-blur-xs animate-fade-in" id="chunk-modal-backdrop">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-3xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col animate-scale-up">
          <div class="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                ${getIcon('layers', 'w-5 h-5')}
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900 tracking-tight">Extracted Slides &amp; Document Index</h3>
                <p class="text-[11px] text-slate-400 font-medium">Content indexed for AI search and study notes</p>
              </div>
            </div>
            <button class="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" onclick="window.appModals.close()">
              ${getIcon('x', 'w-4 h-4')}
            </button>
          </div>

          <div id="chunk-viewer-content" class="flex-1 overflow-y-auto space-y-3 pr-1">
            ${renderLoadingState('Loading extracted slides...')}
          </div>
        </div>
      </div>
    `;

    document.getElementById('chunk-modal-backdrop').onclick = (e) => {
      if (e.target.id === 'chunk-modal-backdrop') window.appModals.close();
    };

    try {
      const chunks = await API.ai.getResourceChunks(resourceId);
      const container = document.getElementById('chunk-viewer-content');
      if (!chunks || chunks.length === 0) {
        container.innerHTML = `
          <div class="p-8 text-center text-slate-400 border border-dashed border-slate-200/80 rounded-2xl bg-slate-50/40">
            <p class="text-xs">No extracted slide chunks found for this resource yet.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = chunks.map(chunk => `
        <div class="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 space-y-2.5 hover:border-slate-300 transition-all">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200/60">
                Slide / Page ${chunk.slide_number || chunk.chunk_index + 1}
              </span>
              <h4 class="text-xs font-bold text-slate-900">${escapeHtml(chunk.section_title || 'Untitled Section')}</h4>
            </div>
            <span class="text-[10px] text-slate-400 font-mono">~${chunk.token_count || 0} tokens</span>
          </div>
          <p class="text-xs text-slate-700 leading-relaxed font-mono bg-white p-3.5 rounded-xl border border-slate-200/70 whitespace-pre-line max-h-48 overflow-y-auto">
            ${escapeHtml(chunk.content)}
          </p>
        </div>
      `).join('');
    } catch (err) {
      const container = document.getElementById('chunk-viewer-content');
      if (container) container.innerHTML = `<div class="p-4 text-xs text-rose-600 bg-rose-50 rounded-xl">Error: ${escapeHtml(err.message)}</div>`;
    }
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
    ai: AiAssistantView,
    notes: NotesView,
    bookmarks: BookmarksView,
    progress: ProgressView,
    tasks: TasksView,
    profile: ProfileView,
    settings: SettingsView,
  },

  async navigate(route, params = {}) {
    if (!this.routes[route] || route === 'login' || route === 'register') {
      route = 'dashboard';
    }
    this.currentRoute = route;
    this.params = params;
    window.location.hash = `#${route}`;
    await this.renderCurrentRoute();
  },

  async renderCurrentRoute() {
    const mainContainer = document.getElementById('main-content');
    const appShell = document.getElementById('app-shell');

    // Default auth routes or missing routes to dashboard
    if (!this.routes[this.currentRoute] || this.currentRoute === 'login' || this.currentRoute === 'register') {
      this.currentRoute = 'dashboard';
      window.location.hash = '#dashboard';
    }

    // Always ensure the application shell is visible
    if (appShell) appShell.classList.remove('hidden');

    // Update Sidebar Active state
    document.querySelectorAll('.sidebar-link').forEach(link => {
      const linkRoute = link.getAttribute('data-route');
      if (linkRoute === this.currentRoute) {
        link.className = 'sidebar-link active-link flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-50/90 to-indigo-50/50 text-blue-700 transition-all shadow-2xs border-l-3 border-blue-600 pl-2.5';
      } else {
        link.className = 'sidebar-link flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all';
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
    const parseHash = () => {
      const fullHash = window.location.hash.replace('#', '') || 'dashboard';
      const [routePart, queryPart] = fullHash.split('?');
      let params = {};
      if (queryPart) {
        const urlParams = new URLSearchParams(queryPart);
        for (const [key, val] of urlParams.entries()) {
          params[key] = val;
        }
      }
      let targetRoute = routePart || 'dashboard';
      if (!this.routes[targetRoute] || targetRoute === 'login' || targetRoute === 'register') {
        targetRoute = 'dashboard';
      }
      return { route: targetRoute, params };
    };

    // Listen to hash changes
    window.addEventListener('hashchange', () => {
      const { route, params } = parseHash();
      this.currentRoute = route;
      this.params = { ...this.params, ...params };
      this.renderCurrentRoute();
    });

    // Handle global keyboard shortcut: Ctrl+K or Cmd+K for search
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        window.appModals.openGlobalSearch();
      }
    });

    // Initial route
    const { route, params } = parseHash();
    this.currentRoute = route;
    this.params = params;
  }
};

window.router = AppRouter;

// Application Bootstrapper
document.addEventListener('DOMContentLoaded', async () => {
  // Fetch current student profile
  try {
    const user = await API.auth.getMe();
    window.currentUser = user;

    // Update UI elements with user information
    const userGreetingEl = document.getElementById('header-user-name');
    if (userGreetingEl) userGreetingEl.textContent = user.full_name;
    const userAvatarEl = document.getElementById('header-avatar');
    if (userAvatarEl) userAvatarEl.textContent = user.full_name.charAt(0).toUpperCase();
  } catch (err) {
    window.currentUser = {
      id: 17,
      full_name: 'Aabha Agrawal',
      program: 'Master of Business Administration (MBA)',
      academic_year: 'Year 1',
      semester: 'Semester 1'
    };
  }

  // Initialize router
  window.router.init();
  await window.router.renderCurrentRoute();

  // Bind Top Bar & Shell Events
  const topSearchBtn = document.getElementById('top-search-btn');
  if (topSearchBtn) topSearchBtn.onclick = () => window.appModals.openGlobalSearch();

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

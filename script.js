document.addEventListener('DOMContentLoaded', function() {
  //task-related variables
  const taskInput = document.getElementById('task-input');
  const dueDateInput = document.getElementById('due-date-input');
  const addTaskBtn = document.getElementById('add-task-btn');
  const overdueTaskList = document.getElementById('overdue-task-list');
  const todayTaskList = document.getElementById('today-task-list');
  const weekTaskList = document.getElementById('week-task-list');
  const incomingTaskList = document.getElementById('incoming-task-list');
  const calendarBody = document.querySelector('#calendar tbody');
  const monthYearHeader = document.getElementById('month-year-header');
  const modal = document.getElementById('task-details-modal');
  const closeModal = document.querySelector('.close');
  const taskNotes = document.getElementById('task-notes');
  const saveTaskNotesBtn = document.getElementById('save-task-notes');

  //course-related variables
  const courseNameInput = document.getElementById('course-name');
  const courseStartTimeInput = document.getElementById('course-start-time');
  const courseEndTimeInput = document.getElementById('course-end-time');
  const courseLocationInput = document.getElementById('course-location');
  const courseDayInput = document.getElementById('course-day');
  const addCourseBtn = document.getElementById('add-course-btn');
  const courseSchedule = document.getElementById('course-schedule');

  // edit course modal variables
  const editCourseModal = document.getElementById('edit-course-modal');
  const closeEditCourseModal = document.querySelector('.close-edit-course');
  const editCourseNameInput = document.getElementById('edit-course-name');
  const editCourseStartTimeInput = document.getElementById('edit-course-start-time');
  const editCourseEndTimeInput = document.getElementById('edit-course-end-time');
  const editCourseLocationInput = document.getElementById('edit-course-location');
  const editCourseDayInput = document.getElementById('edit-course-day');
  const saveEditCourseBtn = document.getElementById('save-edit-course-btn');

  // course grades modal variables
  const courseGradesModal = document.getElementById('course-grades-modal');
  const closeCourseGradesModal = document.querySelector('.close-course-grades');
  const courseCurrentGradeSpan = document.getElementById('course-current-grade');
  const courseGradeList = document.getElementById('course-grade-list');

  // grade calculator variables
  const gradeCourseNameSelect = document.getElementById('grade-course-name');
  const assignmentNameInput = document.getElementById('assignment-name');
  const gradeReceivedInput = document.getElementById('grade-received');
  const weightInput = document.getElementById('weight');
  const addGradeBtn = document.getElementById('add-grade-btn');

  // calendar navigation vars
  const prevMonthBtn = document.getElementById('prev-month-btn');
  const nextMonthBtn = document.getElementById('next-month-btn');

  let tasks = [];
  let courses = [];
  let currentDate = new Date();
  let selectedTask = null;
  let selectedCourse = null;

  //update the month and year header
  function updateMonthYearHeader() {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = monthNames[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    monthYearHeader.textContent = `${month} ${year}`;
  }

  // check if a task is overdue
  function isOverdue(taskDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() < today.getTime();
  }

  // check if a task is due today
  function isDueToday(taskDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
  }

  //check if a task is due this week
  function isDueThisWeek(taskDate) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
    return taskDate >= startOfWeek && taskDate <= endOfWeek && !isDueToday(taskDate);
  }

  //check if a task is due in the next three weeks
  function isDueInThreeWeeks(taskDate) {
    const today = new Date();
    const threeWeeksLater = new Date(today);
    threeWeeksLater.setDate(today.getDate() + 21);
    return taskDate > new Date(today.setDate(today.getDate() + 6)) && taskDate <= threeWeeksLater;
  }

  //render the calendar
  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    calendarBody.innerHTML = '';

    let date = 1;
    for (let i = 0; i < 6; i++) {
      const row = document.createElement('tr');

      for (let j = 0; j < 7; j++) {
        const cell = document.createElement('td');

        if (i === 0 && j < startingDay) {
          //empty cells before the first day of the month
          cell.textContent = '';
        } else if (date > daysInMonth) {
          //empty cells after the last day of the month
          cell.textContent = '';
        } else {
          //cells with dates
          const cellDate = new Date(year, month, date);
          cell.innerHTML = '';
          
          //create date number element
          const dateNumber = document.createElement('div');
          dateNumber.className = 'date-number';
          dateNumber.textContent = date;
          cell.appendChild(dateNumber);
          
          cell.setAttribute('data-date', cellDate.toISOString().split('T')[0]);

          //add tasks for this date
          const tasksOnDate = tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return (
              taskDate.getFullYear() === year &&
              taskDate.getMonth() === month &&
              taskDate.getDate() === date
            );
          });

          if (tasksOnDate.length > 0) {
            const taskList = document.createElement('ul');
            taskList.classList.add('task-list');

            tasksOnDate.forEach(task => {
              const taskItem = document.createElement('li');
              taskItem.textContent = task.name;
              taskItem.addEventListener('click', () => openTaskDetails(task));
              taskList.appendChild(taskItem);
            });

            cell.appendChild(taskList);
          }

          date++;
        }

        row.appendChild(cell);
      }

      calendarBody.appendChild(row);
    }

    highlightToday();
  }

  //highlight today's date
  function highlightToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    //clear existing highlights
    const calendarCells = document.querySelectorAll("#calendar td");
    calendarCells.forEach(cell => {
      const dateNumber = cell.querySelector('.date-number');
      if (dateNumber) {
        dateNumber.classList.remove("today-highlight");
        dateNumber.style.border = "";
        dateNumber.style.borderRadius = "";
      }
    });

    if (today >= firstDayOfMonth && today <= lastDayOfMonth) {
      const todayDate = today.getDate();
      
      calendarCells.forEach(cell => {
        const dateNumber = cell.querySelector('.date-number');
        if (dateNumber && parseInt(dateNumber.textContent) === todayDate) {
          dateNumber.classList.add("today-highlight");
          dateNumber.style.border = "2px solid #cc4f4b";
          dateNumber.style.backgroundColor = "#cc4f4b";
          dateNumber.style.color = "#2f2f2f";
          dateNumber.style.borderRadius = "50%";
          dateNumber.style.width = "1.5em";
          dateNumber.style.height = "1.5em";
          dateNumber.style.display = "inline-flex";
          dateNumber.style.justifyContent = "center";
          dateNumber.style.alignItems = "center";
        }
      });
    }
  }

  // render task lists
  function renderTaskLists() {
    overdueTaskList.innerHTML = '';
    todayTaskList.innerHTML = '';
    weekTaskList.innerHTML = '';
    incomingTaskList.innerHTML = '';

    tasks.forEach(task => {
      const taskDate = new Date(task.dueDate);
      const listItem = document.createElement('li');
      listItem.textContent = task.name;

      const removeBtn = document.createElement('span');
      removeBtn.textContent = 'x';
      removeBtn.classList.add('remove-task-btn');
      removeBtn.addEventListener('click', (event) => {
        event.stopPropagation(); //prevent other events from triggering
        removeTask(task);
      });

      listItem.appendChild(removeBtn);

      if (isOverdue(taskDate)) {
        overdueTaskList.appendChild(listItem);
      } else if (isDueToday(taskDate)) {
        todayTaskList.appendChild(listItem);
      } else if (isDueThisWeek(taskDate)) {
        weekTaskList.appendChild(listItem);
      } else if (isDueInThreeWeeks(taskDate)) {
        incomingTaskList.appendChild(listItem);
      }
    });
  }

  // remove a task
  function removeTask(task) {
    tasks = tasks.filter(t => t !== task);
    renderTaskLists();
    renderCalendar();
  }

  //open task details modal
  function openTaskDetails(task) {
    selectedTask = task;
    taskNotes.value = task.notes || '';
    modal.style.display = 'block';
  }

  // close the modal
  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // task notes
  saveTaskNotesBtn.addEventListener('click', () => {
    if (selectedTask) {
      selectedTask.notes = taskNotes.value;
      modal.style.display = 'none';
    }
  });

  //task functionality
  addTaskBtn.addEventListener('click', function() {
    const taskName = taskInput.value.trim();
    const dueDate = dueDateInput.value;

    if (taskName !== '' && dueDate !== '') {
      const [year, month, day] = dueDate.split('-');
      const taskDate = new Date(year, month - 1, day);

      tasks.push({ name: taskName, dueDate: taskDate, notes: '' });
      taskInput.value = '';
      dueDateInput.value = '';
      renderTaskLists();
      renderCalendar();
    }
  });

  //render the course schedule
  function renderCourseSchedule() {
    courseSchedule.innerHTML = '';

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday/Sunday'];
    days.forEach(day => {
      const dayCourses = courses.filter(course => course.day === day);

      if (dayCourses.length > 0) {
        const daySection = document.createElement('div');
        daySection.classList.add('course-day');

        const dayHeader = document.createElement('h3');
        dayHeader.textContent = day;
        daySection.appendChild(dayHeader);

        dayCourses.forEach(course => {
          const courseItem = document.createElement('div');
          courseItem.classList.add('course-item');
          courseItem.textContent = `${course.name}: ${course.startTime} - ${course.endTime} ~ ${course.location}`;

          const viewGradesBtn = document.createElement('button');
          viewGradesBtn.textContent = 'View Grades';
          viewGradesBtn.classList.add('view-grades-btn');
          viewGradesBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // prevent the course details modal from opening
            openCourseGradesModal(course);
          });

          const editBtn = document.createElement('button');
          editBtn.textContent = 'Edit';
          editBtn.classList.add('edit-course-btn');
          editBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            openEditCourseModal(course);
          });

          const removeBtn = document.createElement('span');
          removeBtn.textContent = 'x';
          removeBtn.classList.add('remove-course-btn');
          removeBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // prevent the course details modal from opening
            removeCourse(course);
          });

          courseItem.appendChild(viewGradesBtn);
          courseItem.appendChild(editBtn);
          courseItem.appendChild(removeBtn);
          daySection.appendChild(courseItem);
        });

        courseSchedule.appendChild(daySection);
      }
    });

    updateGradeCourseDropdown();
  }

  //update the grade course dropdown
  function updateGradeCourseDropdown() {
    gradeCourseNameSelect.innerHTML = '';
    courses.forEach(course => {
      const option = document.createElement('option');
      option.value = course.name;
      option.textContent = course.name;
      gradeCourseNameSelect.appendChild(option);
    });
  }

  // open the edit course modal
  function openEditCourseModal(course) {
    selectedCourse = course;
    editCourseNameInput.value = course.name;
    editCourseStartTimeInput.value = course.startTime;
    editCourseEndTimeInput.value = course.endTime;
    editCourseLocationInput.value = course.location;
    editCourseDayInput.value = course.day;
    editCourseModal.style.display = 'block';
  }

  //close the edit course modal
  closeEditCourseModal.addEventListener('click', () => {
    editCourseModal.style.display = 'none';
  });

  //save changes to the course
  saveEditCourseBtn.addEventListener('click', function() {
    if (selectedCourse) {
      selectedCourse.name = editCourseNameInput.value.trim();
      selectedCourse.startTime = editCourseStartTimeInput.value.trim();
      selectedCourse.endTime = editCourseEndTimeInput.value.trim();
      selectedCourse.location = editCourseLocationInput.value.trim();
      selectedCourse.day = editCourseDayInput.value;
      renderCourseSchedule();
      editCourseModal.style.display = 'none';
    }
  });

  //remove a course
  function removeCourse(course) {
    courses = courses.filter(c => c !== course);
    renderCourseSchedule();
  }

  // course functionality
  addCourseBtn.addEventListener('click', function() {
    const courseName = courseNameInput.value.trim();
    const courseStartTime = courseStartTimeInput.value.trim();
    const courseEndTime = courseEndTimeInput.value.trim();
    const courseLocation = courseLocationInput.value.trim();
    const courseDay = courseDayInput.value;

    if (courseName !== '' && courseStartTime !== '' && courseEndTime !== '' && courseLocation !== '') {
      courses.push({ 
        name: courseName, 
        startTime: courseStartTime, 
        endTime: courseEndTime, 
        location: courseLocation, 
        day: courseDay, 
        grades: [] 
      });
      courseNameInput.value = '';
      courseStartTimeInput.value = '';
      courseEndTimeInput.value = '';
      courseLocationInput.value = '';
      renderCourseSchedule();
    }
  });

  //calculate and update the current grade
  function updateCurrentGrade(course) {
    let totalWeight = 0;
    let weightedGradesSum = 0;

    course.grades.forEach(grade => {
      totalWeight += grade.weight;
      weightedGradesSum += grade.grade * (grade.weight / 100);
    });

    const currentGrade = totalWeight > 0 ? (weightedGradesSum / totalWeight) * 100 : 0;
    return currentGrade.toFixed(2);
  }

  // render the grade list for a course
  function renderCourseGradeList(course) {
    courseGradeList.innerHTML = '';

    course.grades.forEach(grade => {
      const listItem = document.createElement('li');
      listItem.textContent = `${grade.name}: ${grade.grade}% (Weight: ${grade.weight}%)`;

      const removeBtn = document.createElement('span');
      removeBtn.textContent = 'x';
      removeBtn.classList.add('remove-grade-btn');
      removeBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // prevent the course grades modal from closing
        removeGrade(course, grade);
      });

      listItem.appendChild(removeBtn);
      courseGradeList.appendChild(listItem);
    });

    // update the current grade display
    courseCurrentGradeSpan.textContent = updateCurrentGrade(course);
  }

  // remove a grade
  function removeGrade(course, grade) {
    course.grades = course.grades.filter(g => g !== grade);
    renderCourseGradeList(course);
  }

  //add grade functionality
  addGradeBtn.addEventListener('click', function() {
    const courseName = gradeCourseNameSelect.value;
    const assignmentName = assignmentNameInput.value.trim();
    const gradeReceived = parseFloat(gradeReceivedInput.value);
    const weight = parseFloat(weightInput.value);

    if (courseName !== '' && assignmentName !== '' && !isNaN(gradeReceived) && !isNaN(weight) && weight <= 100 && weight > 0) {
      const course = courses.find(c => c.name === courseName);
      course.grades.push({ name: assignmentName, grade: gradeReceived, weight: weight });
      assignmentNameInput.value = '';
      gradeReceivedInput.value = '';
      weightInput.value = '';
      renderCourseGradeList(course);
    }
  });

  //function to open the course grades modal
  function openCourseGradesModal(course) {
    selectedCourse = course;
    renderCourseGradeList(course);
    courseGradesModal.style.display = 'block';
  }

  //function close the course grades modal
  closeCourseGradesModal.addEventListener('click', () => {
    courseGradesModal.style.display = 'none';
  });

  //calendar navigation functionality
  prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateMonthYearHeader();
    renderCalendar();
  });

  nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateMonthYearHeader();
    renderCalendar();
  });

  // render of the calendar, task lists, and course schedule
  updateMonthYearHeader();
  renderTaskLists();
  renderCalendar();
  renderCourseSchedule();
});
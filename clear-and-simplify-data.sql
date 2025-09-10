-- Clear existing data and create simple test data
-- One student per teacher to understand the problem

-- Clear existing data
DELETE FROM students;
DELETE FROM uploads;

-- Insert simple test data - one upload per teacher with one student each
INSERT INTO uploads (teacher_id, teacher_name, week_number, week_label, grade, class_name, subject, total_students, average_score, upload_time) VALUES
-- Ms.Kelly - Kindergarten - 1 student
(2, 'Ms.Kelly', 35, 'Week 35 - Aug 25', 'Kindergarten', 'K-A', 'Both Math & Reading', 1, 85.0, '2025-08-25T00:00:00.000Z'),

-- Mr.Adams - Grade 1 - 1 student  
(3, 'Mr.Adams', 35, 'Week 35 - Aug 25', 'Grade 1', '1-A', 'Both Math & Reading', 1, 75.0, '2025-08-25T00:00:00.000Z'),

-- Ms.Johnson - Grade 2 - 1 student (struggling)
(4, 'Ms.Johnson', 35, 'Week 35 - Aug 25', 'Grade 2', '2-A', 'Both Math & Reading', 1, 65.0, '2025-08-25T00:00:00.000Z'),

-- Ms.Smith - Grade 3 - 1 student
(5, 'Ms.Smith', 35, 'Week 35 - Aug 25', 'Grade 3', '3-A', 'Both Math & Reading', 1, 90.0, '2025-08-25T00:00:00.000Z');

-- Insert corresponding student data
INSERT INTO students (upload_id, student_id, student_name, subject, score, grade, class_name, week_number) VALUES
-- Ms.Kelly's student
((SELECT id FROM uploads WHERE teacher_name = 'Ms.Kelly'), '1', 'Alice Johnson', 'Math', 85, 'Kindergarten', 'K-A', 35),
((SELECT id FROM uploads WHERE teacher_name = 'Ms.Kelly'), '1', 'Alice Johnson', 'Reading', 85, 'Kindergarten', 'K-A', 35),

-- Mr.Adams' student
((SELECT id FROM uploads WHERE teacher_name = 'Mr.Adams'), '2', 'Bob Smith', 'Math', 75, 'Grade 1', '1-A', 35),
((SELECT id FROM uploads WHERE teacher_name = 'Mr.Adams'), '2', 'Bob Smith', 'Reading', 75, 'Grade 1', '1-A', 35),

-- Ms.Johnson's student (struggling)
((SELECT id FROM uploads WHERE teacher_name = 'Ms.Johnson'), '3', 'Charlie Brown', 'Math', 65, 'Grade 2', '2-A', 35),
((SELECT id FROM uploads WHERE teacher_name = 'Ms.Johnson'), '3', 'Charlie Brown', 'Reading', 65, 'Grade 2', '2-A', 35),

-- Ms.Smith's student
((SELECT id FROM uploads WHERE teacher_name = 'Ms.Smith'), '4', 'Diana Prince', 'Math', 90, 'Grade 3', '3-A', 35),
((SELECT id FROM uploads WHERE teacher_name = 'Ms.Smith'), '4', 'Diana Prince', 'Reading', 90, 'Grade 3', '3-A', 35);

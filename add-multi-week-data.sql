-- Add 3 weeks of data for each teacher to test multi-week comparison
-- This will give us Week 35, 36, and 37 for each teacher

-- Insert Week 36 data
INSERT INTO uploads (teacher_id, teacher_name, week_number, week_label, grade, class_name, subject, total_students, average_score, upload_time) VALUES
-- Ms.Kelly - Kindergarten - Week 36
(2, 'Ms.Kelly', 36, 'Week 36 - Sep 1', 'Kindergarten', 'K-A', 'Both Math & Reading', 1, 87.0, '2025-09-01T00:00:00.000Z'),

-- Mr.Adams - Grade 1 - Week 36
(3, 'Mr.Adams', 36, 'Week 36 - Sep 1', 'Grade 1', '1-A', 'Both Math & Reading', 1, 78.0, '2025-09-01T00:00:00.000Z'),

-- Ms.Johnson - Grade 2 - Week 36 (improving)
(4, 'Ms.Johnson', 36, 'Week 36 - Sep 1', 'Grade 2', '2-A', 'Both Math & Reading', 1, 70.0, '2025-09-01T00:00:00.000Z'),

-- Ms.Smith - Grade 3 - Week 36
(5, 'Ms.Smith', 36, 'Week 36 - Sep 1', 'Grade 3', '3-A', 'Both Math & Reading', 1, 92.0, '2025-09-01T00:00:00.000Z');

-- Insert Week 37 data
INSERT INTO uploads (teacher_id, teacher_name, week_number, week_label, grade, class_name, subject, total_students, average_score, upload_time) VALUES
-- Ms.Kelly - Kindergarten - Week 37
(2, 'Ms.Kelly', 37, 'Week 37 - Sep 8', 'Kindergarten', 'K-A', 'Both Math & Reading', 1, 89.0, '2025-09-08T00:00:00.000Z'),

-- Mr.Adams - Grade 1 - Week 37
(3, 'Mr.Adams', 37, 'Week 37 - Sep 8', 'Grade 1', '1-A', 'Both Math & Reading', 1, 80.0, '2025-09-08T00:00:00.000Z'),

-- Ms.Johnson - Grade 2 - Week 37 (continuing to improve)
(4, 'Ms.Johnson', 37, 'Week 37 - Sep 8', 'Grade 2', '2-A', 'Both Math & Reading', 1, 72.0, '2025-09-08T00:00:00.000Z'),

-- Ms.Smith - Grade 3 - Week 37
(5, 'Ms.Smith', 37, 'Week 37 - Sep 8', 'Grade 3', '3-A', 'Both Math & Reading', 1, 94.0, '2025-09-08T00:00:00.000Z');

-- Insert corresponding student data for Week 36
INSERT INTO students (upload_id, student_id, student_name, subject, score, grade, class_name, week_number) VALUES
-- Ms.Kelly's student - Week 36
((SELECT id FROM uploads WHERE teacher_name = 'Ms.Kelly' AND week_number = 36), '1', 'Alice Johnson', 'Math', 87, 'Kindergarten', 'K-A', 36),
((SELECT id FROM uploads WHERE teacher_name = 'Ms.Kelly' AND week_number = 36), '1', 'Alice Johnson', 'Reading', 87, 'Kindergarten', 'K-A', 36),

-- Mr.Adams' student - Week 36
((SELECT id FROM uploads WHERE teacher_name = 'Mr.Adams' AND week_number = 36), '2', 'Bob Smith', 'Math', 78, 'Grade 1', '1-A', 36),
((SELECT id FROM uploads WHERE teacher_name = 'Mr.Adams' AND week_number = 36), '2', 'Bob Smith', 'Reading', 78, 'Grade 1', '1-A', 36),

-- Ms.Johnson's student - Week 36 (improving)
((SELECT id FROM uploads WHERE teacher_name = 'Ms.Johnson' AND week_number = 36), '3', 'Charlie Brown', 'Math', 70, 'Grade 2', '2-A', 36),
((SELECT id FROM uploads WHERE teacher_name = 'Ms.Johnson' AND week_number = 36), '3', 'Charlie Brown', 'Reading', 70, 'Grade 2', '2-A', 36),

-- Ms.Smith's student - Week 36
((SELECT id FROM uploads WHERE teacher_name = 'Ms.Smith' AND week_number = 36), '4', 'Diana Prince', 'Math', 92, 'Grade 3', '3-A', 36),
((SELECT id FROM uploads WHERE teacher_name = 'Ms.Smith' AND week_number = 36), '4', 'Diana Prince', 'Reading', 92, 'Grade 3', '3-A', 36);

-- Insert corresponding student data for Week 37
INSERT INTO students (upload_id, student_id, student_name, subject, score, grade, class_name, week_number) VALUES
-- Ms.Kelly's student - Week 37
((SELECT id FROM uploads WHERE teacher_name = 'Ms.Kelly' AND week_number = 37), '1', 'Alice Johnson', 'Math', 89, 'Kindergarten', 'K-A', 37),
((SELECT id FROM uploads WHERE teacher_name = 'Ms.Kelly' AND week_number = 37), '1', 'Alice Johnson', 'Reading', 89, 'Kindergarten', 'K-A', 37),

-- Mr.Adams' student - Week 37
((SELECT id FROM uploads WHERE teacher_name = 'Mr.Adams' AND week_number = 37), '2', 'Bob Smith', 'Math', 80, 'Grade 1', '1-A', 37),
((SELECT id FROM uploads WHERE teacher_name = 'Mr.Adams' AND week_number = 37), '2', 'Bob Smith', 'Reading', 80, 'Grade 1', '1-A', 37),

-- Ms.Johnson's student - Week 37 (continuing to improve)
((SELECT id FROM uploads WHERE teacher_name = 'Ms.Johnson' AND week_number = 37), '3', 'Charlie Brown', 'Math', 72, 'Grade 2', '2-A', 37),
((SELECT id FROM uploads WHERE teacher_name = 'Ms.Johnson' AND week_number = 37), '3', 'Charlie Brown', 'Reading', 72, 'Grade 2', '2-A', 37),

-- Ms.Smith's student - Week 37
((SELECT id FROM uploads WHERE teacher_name = 'Ms.Smith' AND week_number = 37), '4', 'Diana Prince', 'Math', 94, 'Grade 3', '3-A', 37),
((SELECT id FROM uploads WHERE teacher_name = 'Ms.Smith' AND week_number = 37), '4', 'Diana Prince', 'Reading', 94, 'Grade 3', '3-A', 37);

-- step
insert into step (label, order_num) values ('To do', 1);
insert into step (label, order_num) values ('In progress', 2);
insert into step (label, order_num) values ('Review', 3);
insert into step (label, order_num) values ('Done', 4);

-- flag
insert into flag (label, color) values ('Urgent', '#ff5555');
insert into flag (label, color) values ('Big deal', '#be77d8');

-- Project
insert into project (code, task_seq) values ('PRJ01', 0);
insert into project_step (project_id, step_id) values (1, 1), (1, 2), (1, 3), (1, 4), (1, 6);
insert into task (project_id, cur_step_id, code, created_by, label) values (1, 1, 'PRJ01-0', 1, 'Project 01');
insert into root_task (project_id, task_id) values (1, 1);

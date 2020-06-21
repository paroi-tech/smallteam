-- Project
insert into project (code, task_seq) values ('KICKSTART', 0);

-- Project steps
insert into project_step (project_id, step_id) values (1, 1), (1, 2);

-- Project tasks
insert into task (project_id, cur_step_id, code, created_by, label) values (1, 1, 'KICKSTART-0', 1, 'Kick-start project');
insert into root_task (project_id, task_id) values (1, 1);
insert into task_description (task_id, description) values (1, 'Kick-start project');

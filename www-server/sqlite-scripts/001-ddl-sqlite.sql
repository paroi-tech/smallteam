--
-- Project SmallTeam
--
-- Up
--

create table contributor (
    contributor_id integer not null primary key autoincrement,
    name varchar(255) not null,
    login varchar(255) not null unique,
    email varchar(255) not null,
    password varchar(255) not null
    -- avatar as file
);

-- Notice: 0 is 'Not started', 1 is 'Finished'
create table step_type (
    step_type_id integer not null primary key autoincrement,
    name varchar(255) not null unique,
    order_num integer
);

create table project (
    project_id integer not null primary key autoincrement,
    code varchar(255) not null unique,
    archived bit not null default 0,
    task_seq bigint not null
);

create table step (
    step_id integer not null primary key autoincrement,
    step_type_id bigint not null references step_type(step_type_id),
    project_id bigint not null references project(project_id),
    unique (step_type_id, project_id)
);

create table task (
    task_id integer not null primary key autoincrement,
    code varchar(255) not null unique,
    created_by bigint not null references contributor(contributor_id),
    affected_to bigint references contributor(contributor_id),
    cur_step_id bigint not null references step(step_id),
    label varchar(255) not null,
    create_ts timestamp not null default current_timestamp,
    update_ts timestamp not null default current_timestamp
    -- attachments as files
);

create table task_child (
    task_id bigint not null primary key references task(task_id),
    parent_task_id bigint not null references task(task_id),
    order_num integer not null
);

create table task_description (
    task_id bigint not null primary key references task(task_id),
    description text not null
);

create table task_log (
    task_log_id integer not null primary key autoincrement,
    task_id bigint not null references task(task_id),
    step_id bigint not null references step(step_id),
    start_ts timestamp not null default current_timestamp,
    started_by bigint not null references contributor(contributor_id),
    end_ts timestamp,
    ended_by bigint references contributor(contributor_id)
);

create table root_task (
    project_id bigint not null primary key references project(project_id),
    task_id bigint not null unique references task(task_id)
);

create table flag (
    flag_id integer not null primary key autoincrement,
    label varchar(255) not null unique,
    color char(6)
);

create table task_flag (
    task_id bigint not null references task(task_id),
    flag_id bigint not null references flag(flag_id),
    primary key (task_id, flag_id)
);

create table comment (
    comment_id integer not null primary key autoincrement,
    task_id bigint not null references task(task_id),
    written_by bigint not null references contributor(contributor_id),
    body text not null,
    create_ts timestamp not null default current_timestamp,
    update_ts timestamp not null default current_timestamp
);

insert into step_type (name, order_num) values ('Not started', 0);
insert into step_type (name, order_num) values ('Finished', -1);

-- Fake data
insert into contributor (name, login, email, password) values ('Loly', 'loly', 'loly@nope.com', '123');

--
-- Down
--

drop table if exists comment;
drop table if exists task_flag;
drop table if exists flag;
drop table if exists root_task;
drop table if exists task_log;
drop table if exists task_description;
drop table if exists task_child;
drop table if exists task;
drop table if exists step;
drop table if exists project;
drop table if exists step_type;
drop table if exists contributor;
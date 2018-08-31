drop table if exists reg_team;
drop table if exists team;

create table team (
    team_id integer not null primary key autoincrement,
    team_code varchar(255) not null unique,
    team_name varchar(255) not null,
    activated tinyint not null default 0
);

create table reg_team (
    reg_team_id integer not null primary key autoincrement,
    token varchar(255) not null unique,
    team_id integer not null unique references team(team_id),
    user_email varchar(255) not null,
    user_name varchar(255) not null,
    user_login varchar(255) not null,
    user_password varchar(255) not null,
    expire_ts timestamp not null,
    create_ts timestamp not null default current_timestamp
);

drop table if exists team;

create table team (
  team_id integer not null primary key autoincrement,
  team_name varchar(32) not null unique,
  db_name varchar(255) not null unique
);

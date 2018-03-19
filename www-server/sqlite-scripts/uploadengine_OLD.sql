--
-- Project SmallTeam, File Database
--

--
-- Up
--

create table file (
  file_id integer not null primary key autoincrement,
  bin_data blob not null
);

create table meta_int (
  file_id bigint not null references file(file_id),
  code varchar(50) not null,
  val bigint not null,
  primary key (file_id, code)
);

create table meta_str (
  file_id bigint not null references file(file_id),
  code varchar(50) not null,
  val varchar(255) not null,
  primary key (file_id, code)
);

--
-- Down
--

drop table if exists file;
drop table if exists meta_int;
drop table if exists meta_str;

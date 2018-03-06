--
-- Project SmallTeam, File Database
--

--
-- Up
--

/**
Example of an uploaded file 'DSC00034.JPG' as an avatar for the contributor 'Albert':
  - The media 'baseName' is : 'albert'
  - We store for example 3 files:
    - albert.jpg 2.5MB (the original file)
    - albert-800x600.jpg 300KB
    - albert-80x80.jpg 20KB

media:
  required fields:
    ts: <timestamp>
    base_name: 'albert'
  optional fields:
    orig_name: 'DSC00034'
  references:
    avatarContributorId: '123'

file:
  required fields:
    file_id
    bin_data
    weight_b: 312000
    mime: 'image/jpeg'
    alt_name: '800x600'
  optional fields:
    width: 800
    height: 600


URL: /get-file/{file.fileId}/{media.baseName}-{file.altName}.{extension}
  Notice:
    - file.altName is optional
    - the extension ('jpeg', 'png', etc.) is not stored but evaluated from the mime type
*/

create table media (
  media_id integer not null primary key autoincrement,
  ts timestamp not null default current_timestamp,
  base_name varchar(255),
  orig_name varchar(255)
);

create table media_ref (
  media_id bigint not null primary key references media(media_id),
  external_type varchar(50) not null, -- examples: 'contributorAvatar', 'task'
  external_id varchar(255) not null
);
create index external_type_id_idx on media_ref(external_type, external_id);

create table file (
  file_id integer not null primary key autoincrement,
  media_id bigint not null references media(media_id),
  bin_data blob not null,
  weight_b integer not null,
  im_type varchar(255) not null,
  variant_name varchar(255) -- examples: '800x600', '80x80'
);

create table file_meta_str (
  file_id bigint not null references file(file_id),
  code varchar(50) not null,
  val varchar(255) not null,
  primary key (file_id, code)
);

create table file_meta_int (
  file_id bigint not null references file(file_id),
  code varchar(50) not null, -- examples: 'width', 'height'
  val bigint not null,
  primary key (file_id, code)
);

--
-- Down
--

drop table if exists file_meta_int;
drop table if exists file_meta_str;
drop table if exists file;
drop index if exists external_type_id_idx;
drop table if exists media_ref;
drop table if exists media;

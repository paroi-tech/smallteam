/**
Example of an uploaded variant 'DSC00034.JPG' as an avatar for the contributor 'Albert':
  - The media 'baseName' is : 'albert'
  - We store for example 3 variants:
    - albert.jpg 2.5MB (the original variant)
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

variant:
  required fields:
    variant_id
    bin_data
    weight_b: 312000
    mime: 'image/jpeg'
    alt_name: '800x600'
  optional fields:
    width: 800
    height: 600


URL: /get-variant/{variant.variantId}/{media.baseName}-{variant.altName}.{extension}
  Notice:
    - variant.altName is optional
    - the extension ('jpeg', 'png', etc.) is not stored but evaluated from the mime type
*/

-- Drop tables

drop table if exists variant_img;
drop table if exists variant;
drop index if exists media_ref_external_idx;
drop table if exists media_ref;
drop index if exists media_owner_id_idx;
drop table if exists media;

-- Create tables

create table media (
  media_id integer not null primary key autoincrement,
  ts timestamp not null default current_timestamp,
  base_name varchar(255),
  orig_name varchar(255),
  owner_id varchar(255)
);

create index media_owner_id_idx on media(owner_id);

create table media_ref (
  media_id bigint not null primary key references media(media_id) on delete cascade,
  external_type varchar(50) not null, -- examples: 'contributorAvatar', 'task'
  external_id varchar(255) not null
);

create index media_ref_external_idx on media_ref(external_type, external_id);

create table variant (
  variant_id integer not null primary key autoincrement,
  media_id bigint not null references media(media_id),
  weight_b integer not null,
  im_type varchar(255) not null,
  variant_name varchar(255), -- examples: '800x600', '80x80'
  bin_data blob not null
);

create table variant_img (
  variant_id bigint not null references variant(variant_id) on delete cascade,
  width integer not null,
  height integer not null,
  dpi integer
);

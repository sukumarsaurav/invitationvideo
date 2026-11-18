-- Tags, trending flag and popularity for templates (drive tag pages and home sections).
alter table invites.templates
  add column tags text[] not null default '{}',
  add column is_trending boolean not null default false,
  add column popularity int not null default 0;

create index templates_tags_idx on invites.templates using gin (tags);

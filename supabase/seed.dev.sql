-- Local development only (listed after seed.sql in config.toml; never run on the hosted project).
-- seed.sql inserts new templates hidden, waiting for an admin to publish them. Locally, publish
-- everything so the store isn't empty after `npm run db:reset`.
update invites.templates set is_active = true where not is_active;

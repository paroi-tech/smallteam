# SmallTeam

## Daily use commmands on a local development environment

In a terminal:

```sh
(cd backend && rushx serve)
```

In the vscode's terminal, run one of these commands:

```sh
# Work on Team
(cd team-frontend && rushx watch)

# Work on Platform
(cd platform-frontend && rushx watch)

# Work on Registration
(cd registration-frontend && rushx watch)
```

After changing a `package.json` or a `git pull`:

```sh
rush update
rush rebuild
```

## Install a local development environment

Redirect `smallteam.paroi.local` to localhost. Create domains for `team1` and `team2`.

```
$ sudo vi /etc/hosts

# Append:
127.0.0.1	smallteam.paroi.local
127.0.0.1	team1.smallteam.paroi.local
127.0.0.1	team2.smallteam.paroi.local
```

Then, some configuration:

```sh
mkdir data
cp backend/config.local.json backend/config.json
```

Install `@microsoft/rush` and `pnpm` globally:

```sh
sudo npm i pnpm @microsoft/rush -g
```

https://rushjs.io/pages/developer/modifying_package_json/
https://rushjs.io/pages/developer/everyday_commands/

Install and build all the subprojects:

```sh
rush install
rush build

(cd team-frontend && rushx build:dev)
(cd platform-frontend && rushx build:dev)
(cd registration-frontend && rushx build:dev)
```

Now, start the backend:

```sh
(cd backend && rushx serve)
```

Then, load the platform frontend: http://smallteam.paroi.local:3921/

And create a new `team1` or `team2`. The confirmation e-mail will be in logs, level INFO.

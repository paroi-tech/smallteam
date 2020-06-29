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

### Installation, part 1

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

### Rush

Install `@microsoft/rush` and `pnpm` globally:

```sh
sudo npm i pnpm @microsoft/rush -g
```

See also:

* [Modifying package.json](https://rushjs.io/pages/developer/modifying_package_json/)
* [Everyday commands](https://rushjs.io/pages/developer/everyday_commands/)
* [Other helpful commands](https://rushjs.io/pages/developer/other_commands/)
* [NPM vs PNPM vs Yarn](https://rushjs.io/pages/maintainer/package_managers/)

Now, make sure you never use _npm_ directly on this monorepo. Use only **rush**.

Warning: On Ubuntu, the snap version of Node.js is buggy. Here is how to reinstall Node using nodesource:

```sh
sudo bash
snap remove node
curl -sL https://deb.nodesource.com/setup_12.x | bash -
```

### Installation, part 2

Now, install and build all the subprojects:

```sh
rush install
rush build
```

Optionally, rebuild the frontends in development mode:

```sh
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

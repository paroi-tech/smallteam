# SmallTeam

## Daily use commmands on a local development environment

In a terminal:

```sh
npm run serve --prefix backend
```

In the vscode's terminal, run one of these commands:

```sh
# Work on Team
npm run watch --prefix team-frontend

# Work on Platform
npm run watch --prefix platform-frontend

# Work on Registration
npm run watch --prefix registration-frontend
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

Then, install and build all the subprojects:

```sh
cp backend/config.local.json backend/config.json

npm i --prefix backend
npm run build --prefix backend

npm i --prefix platform-frontend
npm run build --prefix platform-frontend

npm i --prefix team-frontend
npm run build --prefix team-frontend

npm i --prefix registration-frontend
npm run build --prefix registration-frontend
```

Now, start the backend:

```sh
npm run serve --prefix backend
```

Then, load the platform frontend: http://smallteam.paroi.local:3921/

And create a new `team1` or `team2`. The confirmation e-mail will be in logs, level INFO.

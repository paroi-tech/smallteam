# smallteam

## Component Hierarchy
- PanelSelector
  - Menu (1)
  - DropdownMenu (1)
  - ProjectForm (1)
  - StepTypePanel (1)
  - ProjectBoard (*)
    - StepsPanel (+)
      - Boxlist (+)
    - TaskPanel (1)

## Apache config to allow only one subdomain
To restrict the use of foo.bar.sites.example.com you have to place another VirtualHost above the existing one:
```
<VirtualHost *:80>
    Redirect permanent / http://smallteam.io/
    ServerName www.smallteam.io
    ServerAlias *.*.smallteam.io
</VirtualHost>
```

And the main virtualhost:
```
<VirtualHost *:80>
	ProxyPreserveHost On

	ProxyPass / http://127.0.0.1:3921/
	ProxyPassReverse / http://127.0.0.1:3921/

	ServerName smallteam.io
	ServerAlias *.smallteam.io
</VirtualHost>
```

## Creation of service on the server

### Steps

- Create a file for the service in `/etc/systemd/system` with the right permissions
  ```
    sudo touch /etc/systemd/system/commit.team.service
    sudo chmod 664 /etc/systemd/system/commit.team.service
  ```
- Open the file and paste the following content
  ```
  [Unit]
  Description=Commit.team server service
  After=network.target

  [Service]
  ExecStart=/usr/bin/node /home/committeam/commit.team/smallteam/www-server/backend/index.js
  Type=simple
  User=committeam

  [Install]
  WantedBy=default.target
  ```
- Notify systemd that a new service file exists by executing the following command as root:
  ```
    sudo systemctl daemon-reload
  ```
- Register the service at startup. Note that this does not start the service.
  ```
    sudo systemctl enable commit.team.service
  ```
- You can start the service:
  ```
    sudo systemctl start commit.team.service
  ```

### Sources
- https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/system_administrators_guide/sect-Managing_Services_with_systemd-Unit_Files#sect-Managing_Services_with_systemd-Unit_File_Structure
- https://askubuntu.com/questions/676007/how-do-i-make-my-systemd-service-run-via-specific-user-and-start-on-boot
- https://medium.com/@benmorel/creating-a-linux-service-with-systemd-611b5c8b91d6
- https://www.digitalocean.com/community/tutorials/how-to-configure-a-linux-service-to-start-automatically-after-a-crash-or-reboot-part-2-reference#systemd-introduction


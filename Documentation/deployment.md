# Create the `smallteam.paroi.tech` service in systemd

Create a file for the service in `/etc/systemd/system` with the right permissions:

```
sudo touch /etc/systemd/system/smallteam.paroi.tech.service
sudo chmod 664 /etc/systemd/system/smallteam.paroi.tech.service
sudo vi /etc/systemd/system/smallteam.paroi.tech.service
```

Here is the content:

```
[Unit]
Description=SmallTeam server service
After=network.target

[Service]
ExecStart=/usr/bin/node /home/smallteam/smallteam.paroi.tech/smallteam/dist/backend/index.js --config /home/smallteam/smallteam.paroi.tech/config.json
Type=simple
User=smallteam

[Install]
WantedBy=default.target
```

Then:

```bash
# Notify systemd that a new service file exists by executing the following command as root
sudo systemctl daemon-reload

# Register the service at startup. Note that this does not start the service.
sudo systemctl enable smallteam.paroi.tech.service
```

Start the service:

```bash
sudo systemctl start smallteam.paroi.tech.service
```

## Sources

- https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/system_administrators_guide/sect-Managing_Services_with_systemd-Unit_Files#sect-Managing_Services_with_systemd-Unit_File_Structure
- https://askubuntu.com/questions/676007/how-do-i-make-my-systemd-service-run-via-specific-user-and-start-on-boot
- https://medium.com/@benmorel/creating-a-linux-service-with-systemd-611b5c8b91d6
- https://www.digitalocean.com/community/tutorials/how-to-configure-a-linux-service-to-start-automatically-after-a-crash-or-reboot-part-2-reference#systemd-introduction

## Commands for maintenance

Show the logs:

```bash
sudo journalctl -u smallteam.paroi.tech
```

Start the service:

```bash
sudo systemctl start smallteam.paroi.tech.service
# or?
sudo service smallteam.paroi.tech start
```


# Nginx: SSL and reverse proxy

In order to get the SSL certificate, we use `acme.sh` ([doc here](https://github.com/Neilpang/acme.sh/)) because certbot cannot manage wildcards with Gandi (2018-08-15).

```bash
sudo apt install cron
sudo su
```

```bash
cd ~
wget -O -  https://get.acme.sh | sh
```

```bash
export GANDI_LIVEDNS_KEY="-here-the-api-key-"
acme.sh --dns dns_gandi_livedns --issue --keylength 4096 -d smallteam.paroi.tech -d *.smallteam.paroi.tech
```

```bash
mkdir /etc/ssl-acme.sh
cd /etc/ssl-acme.sh
```

```bash
sudo mkdir /etc/ssl-acme.sh/smallteam.paroi.tech

acme.sh --install-cert -d smallteam.paroi.tech --key-file /etc/ssl-acme.sh/smallteam.paroi.tech/privkey.pem --fullchain-file /etc/ssl-acme.sh/smallteam.paroi.tech/cert.pem --reloadcmd "service nginx force-reload"
```

The configuration for `nginx` uses some files from certbot:

```nginx
server {
  server_name smallteam.paroi.tech *.smallteam.paroi.tech;

  location / {
    root /home/smallteam/smallteam/dist/www;
    index index.html;
    try_files $uri @express;
  }

  location @express {
    proxy_pass http://127.0.0.1:3921;
    proxy_set_header Host $host;
  }

  #listen 80;
  #listen [::]:80;
  listen [::]:443 ssl; #ipv6only=on
  listen 443 ssl;
  ssl_certificate /etc/ssl-acme.sh/smallteam.paroi.tech/cert.pem;
  ssl_certificate_key /etc/ssl-acme.sh/smallteam.paroi.tech/privkey.pem;
  include /etc/letsencrypt/options-ssl-nginx.conf; # Use this config from certbot
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # Use this config from certbot
}

server {
  listen 80;
  listen [::]:80;
  server_name smallteam.paroi.tech *.smallteam.paroi.tech;
  return 301 https://$host$request_uri;
}
```

See also: [The documentation on reverse proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/).

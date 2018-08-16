# Apache configuration

## Hide Server Version and OS in Header Field and on Error Pages

The two important directives are:
- `ServerSignature`\
  Which permits the adding of a footer line showing server name and version number under server-generated documents such as error messages, mod_proxy ftp directory listings, mod_info output plus many more. It has three possible values:
  - `On`: which allows the adding of a trailing footer line in server-generated documents,
  - `Off`: disables the footer line and
  - `Email`: creates a *mailto:* reference which sends a mail to the ServerAdmin of the referenced document.

- `ServerTokens`\
  It determines if the server response header field that is sent back to clients contains a description of the server OS-type and info concerning enabled Apache modules. This directive has the following possible values (plus sample info sent to clients when the specific value is set):
  ```
  ServerTokens   Full (or not specified)
  Info sent to clients: Server: Apache/2.4.2 (Unix) PHP/4.2.2 MyMod/1.2
  ServerTokens   Prod[uctOnly]
  Info sent to clients: Server: Apache
  ServerTokens   Major
  Info sent to clients: Server: Apache/2
  ServerTokens   Minor
  Info sent to clients: Server: Apache/2.4
  ServerTokens   Min[imal]
  Info sent to clients: Server: Apache/2.4.2
  ServerTokens   OS
  Info sent to clients: Server: Apache/2.4.2 (Unix)
  ```
  **Note**: After Apache version 2.0.44, the ServerTokens directive also controls the info offered by the ServerSignature directive.

To hide web server version number, server operating system details, installed Apache modules and more, open your Apache web server configuration file using your favorite editor:
```
$ sudo vi /etc/apache2/apache2.conf        #Debian/Ubuntu systems
$ sudo vi /etc/httpd/conf/httpd.conf       #RHEL/CentOS systems
```

And add/modify/append the lines below:
```
ServerTokens Prod
ServerSignature Off
```

Save the file, exit and restart your Apache web server like so:
```
$ sudo systemctl restart apache2   #SystemD
$ sudo service apache2 restart     #SysVInit
```

Source: https://www.tecmint.com/hide-apache-web-server-version-information/

## Allow Only One Subdomain For a Website

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

## Configuration to Serve Content From Another Location Than /var/www
Apache default config only allows to serve content from `/var/www` and `/usr/share`. You can add another
directory, e.g. `/srv` (preferred) by adding a `Directory` directive in Apache main configuration
file `/etc/apache2/apache2.conf` or in vhost file (preferred). See `/etc/apache2/apache2.conf` line ~150 for more info.

```
<Directory /srv/>
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>
```

For more information, read:
- www.digitalocean.com/community/tutorials/how-to-configure-the-apache-web-server-on-an-ubuntu-or-debian-vps
- stackoverflow.com/questions/10873295/error-message-forbidden-you-dont-have-permission-to-access-on-this-server

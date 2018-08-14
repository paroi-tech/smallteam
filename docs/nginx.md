# Nginx Configuration

## Hide Nginx Version on Error Page and HTTP Server Field
The `server_tokens` directive is responsible for displaying the Nginx version number and OS on error pages and in the `Server` HTTP response header field. To disable this, you need to turn off the `server_tokens` directive in `/etc/nginx/nginx.conf` configuration file. Add or uncomment the following line in the `http` context.

```
server_tokens off;
```

After adding above line, save the file and restart Nginx server to take new changes into effect.

```
sudo systemctl restart nginx
```

Source: https://www.tecmint.com/hide-nginx-server-version-in-linux/

## Use Nginx As Reverse Proxy in Front of Express and to Serve Static files

```
server {
	listen 81;
	listen [::]:81;

	server_name smallteam.io www.smallteam.io;

	location / {
		root /home/kofi/src/smallteam/www-server/www;
		index index.html;
		try_files $uri @express;
	}

	location @express {
		proxy_pass http://127.0.0.1:3921;
		proxy_set_header Host $host;
	}
}

```

Sources
- https://stackoverflow.com/a/15467555/8436941
- https://stackoverflow.com/questions/46692341/express-nginx-cant-serve-static-files
- http://nginx.org/en/docs/http/ngx_http_core_module.html#try_files
- https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/

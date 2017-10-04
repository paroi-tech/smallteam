
node_modules\.bin\node-sass --watch --recursive --source-map-embed --output-style expanded frontend\ -o www-server\www\

node_modules\.bin\webpack --watch --config frontend\webpack.config.js

node www-server\backend\

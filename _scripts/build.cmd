

node_modules\.bin\tsc --project backend\

node_modules\.bin\node-sass --recursive --source-map-embed --output-style expanded frontend\ -o www-server\www

node_modules\.bin\webpack --config frontend\webpack.config.js

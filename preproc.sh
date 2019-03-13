#!/usr/bin/env bash

echo "What is your server ip? Input in the format with http:// e.g. http://xxx.xxx.xx.xx"
read server
read -p "Are you sure your IP is $server? (y/n) " -n 1 -r
echo   
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1 
fi
server=$(echo "$server" | sed 's/\./\\\./g')

sed -i -e "s|http://localhost:8080|$server|g" *.js
sed -i -e "s|http://localhost:3000|$server|g" *.js
sed -i -e "s|http://localhost:3001|$server|g" *.js
sed -i -e "s|http://165.227.35.11|$server|g" *.js
cd ./server/app/frontend
sed -i -e  "s|http://localhost:8080|$server|g" *.js
sed -i -e "s|http://localhost:3000|$server|g" *.js
sed -i -e "s|http://localhost:3001|$server|g" *.js
sed -i -e "s|http://165.227.35.11|$server|g" *.js
echo "Cleaning complete"

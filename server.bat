@echo off
echo Iniciando servidor local en http://127.0.0.1:8080 ...
npx http-server . -p 8080
start http://127.0.0.1:8080/index.html
pause
start "ui" cmd.exe /k "npm run start -w=ui"
start "server-main" cmd.exe /k "npm run main -w=server"
start "server-metadata" cmd.exe /k "npm run metadata -w=server"
start "server-text" cmd.exe /k "cd text_server && mix run --no-halt"
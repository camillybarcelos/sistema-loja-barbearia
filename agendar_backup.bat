@echo off
echo Agendando backup automatico do sistema...

:: Criar tarefa agendada para executar o backup diariamente às 23:00
schtasks /create /tn "BackupSistemaLoja" /tr "%~dp0backup.bat" /sc daily /st 23:00

echo.
echo Backup agendado com sucesso!
echo O sistema fara backup automaticamente todos os dias as 23:00
echo Os backups serao salvos em:
echo 1. C:\BACKUPS
echo 2. D:\BACKUPS_SISTEMA (se disponivel)
echo 3. Pasta Documentos do usuario
echo.
pause 
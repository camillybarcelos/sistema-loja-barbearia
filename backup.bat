@echo off
setlocal enabledelayedexpansion

:: Configurar data e hora para o nome do arquivo
set year=%date:~6,4%
set month=%date:~3,2%
set day=%date:~0,2%
set hour=%time:~0,2%
set minute=%time:~3,2%
set second=%time:~6,2%

:: Remover espaços do hour
set hour=%hour: =0%

:: Criar pasta de backup com timestamp
set backup_folder=Backup_Sistema_%year%-%month%-%day%_%hour%-%minute%-%second%

:: Criar diretórios de backup
mkdir "C:\BACKUPS\%backup_folder%"
mkdir "D:\BACKUPS_SISTEMA\%backup_folder%" 2>nul
mkdir "%USERPROFILE%\Documents\BACKUPS_SISTEMA\%backup_folder%"

:: Copiar arquivos importantes para todas as localizações de backup
xcopy /E /I /Y "database.sqlite" "C:\BACKUPS\%backup_folder%\"
xcopy /E /I /Y "database.sqlite" "D:\BACKUPS_SISTEMA\%backup_folder%\" 2>nul
xcopy /E /I /Y "database.sqlite" "%USERPROFILE%\Documents\BACKUPS_SISTEMA\%backup_folder%\"

:: Copiar pasta uploads se existir
if exist "uploads" (
    xcopy /E /I /Y "uploads" "C:\BACKUPS\%backup_folder%\uploads\"
    xcopy /E /I /Y "uploads" "D:\BACKUPS_SISTEMA\%backup_folder%\uploads\" 2>nul
    xcopy /E /I /Y "uploads" "%USERPROFILE%\Documents\BACKUPS_SISTEMA\%backup_folder%\uploads\"
)

:: Limpar backups antigos (manter últimos 30 dias)
forfiles /P "C:\BACKUPS" /D -30 /C "cmd /c IF @isdir == TRUE rmdir /S /Q @path" 2>nul
forfiles /P "D:\BACKUPS_SISTEMA" /D -30 /C "cmd /c IF @isdir == TRUE rmdir /S /Q @path" 2>nul
forfiles /P "%USERPROFILE%\Documents\BACKUPS_SISTEMA" /D -30 /C "cmd /c IF @isdir == TRUE rmdir /S /Q @path" 2>nul

echo Backup concluido com sucesso!
echo Localizacoes dos backups:
echo 1. C:\BACKUPS\%backup_folder%
echo 2. D:\BACKUPS_SISTEMA\%backup_folder% (se disponivel)
echo 3. %USERPROFILE%\Documents\BACKUPS_SISTEMA\%backup_folder%

pause 
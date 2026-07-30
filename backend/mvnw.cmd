@echo off
setlocal

set MAVEN_DIR=%~dp0.mvn\apache-maven-3.9.6
set MAVEN_EXE=%MAVEN_DIR%\bin\mvn.cmd

if exist "%MAVEN_EXE%" (
    "%MAVEN_EXE%" %*
    exit /b %ERRORLEVEL%
)

where mvn >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    mvn %*
    exit /b %ERRORLEVEL%
)

echo [INFO] Portable Maven not found. Downloading Apache Maven 3.9.6...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip', '%~dp0.mvn\maven.zip'); Expand-Archive -Path '%~dp0.mvn\maven.zip' -DestinationPath '%~dp0.mvn\' -Force; Remove-Item '%~dp0.mvn\maven.zip'"

if exist "%MAVEN_EXE%" (
    echo [INFO] Maven installed successfully!
    "%MAVEN_EXE%" %*
    exit /b %ERRORLEVEL%
) else (
    echo [ERROR] Failed to setup Maven.
    exit /b 1
)

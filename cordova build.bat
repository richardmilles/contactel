@echo off
:: Initialiser l’environnement Cordova avec JDK 11, Android SDK et Gradle

:: 1. JDK 11
::set "JAVA_HOME=C:\Jpt\Java\jdk-11.0.2\jdk-11.0.2"
set "JAVA_HOME=C:\Program Files\Java\jdk-21"
:: 2. Android SDK
set "ANDROID_HOME=C:\Users\MSI GS65 9SF\AppData\Local\Android\Sdk"

:: 3. Gradle
set "GRADLE_HOME=C:\path\Gradle\gradle-8.14.1"

:: 4. PATH complet
set "PATH=%JAVA_HOME%\bin;%GRADLE_HOME%\bin;%ANDROID_HOME%\cmdline-tools\latest\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator;%PATH%"


echo ============================================
echo Environnement Cordova initialisé :
echo JAVA_HOME = %JAVA_HOME%
echo ANDROID_HOME = %ANDROID_HOME%
echo GRADLE_HOME = %GRADLE_HOME%
echo ============================================
echo.

:: Lancer un terminal interactif avec cet environnement
cmd
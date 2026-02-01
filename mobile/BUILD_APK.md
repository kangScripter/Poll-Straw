# Building APK for PollStraw Mobile

## Prerequisites for local build: Java (JAVA_HOME)

Gradle needs **Java 17**. If you see `JAVA_HOME is not set`, do one of the following.

### A. Install Java 17 (if you don’t have it)

**Option 1 – Microsoft OpenJDK (recommended on Windows):**
1. Download: https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-17  
2. Run the installer (e.g. **Microsoft Build of OpenJDK 17 (MSI)**).  
3. During or after install, note the install path (e.g. `C:\Program Files\Microsoft\jdk-17.x.x`).

**Option 2 – Winget:**
```powershell
winget install Microsoft.OpenJDK.17
```
Then **close and reopen** your terminal.

### B. Set JAVA_HOME (Windows)

**If you already have Java 17 installed**, find the JDK folder (e.g. `C:\Program Files\Microsoft\jdk-17.0.13` or `C:\Program Files\Java\jdk-17`).

**Temporary (current terminal only):**
```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.13"   # use your actual path
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
```

**Permanent (recommended):**
1. Press **Win + R**, type `sysdm.cpl`, Enter.  
2. **Advanced** tab → **Environment Variables**.  
3. Under **System variables** → **New**:  
   - Variable name: `JAVA_HOME`  
   - Variable value: your JDK folder, e.g. `C:\Program Files\Microsoft\jdk-17.0.13`  
4. Edit **Path** → **New** → add: `%JAVA_HOME%\bin`  
5. OK out, then **close and reopen** your terminal.

**Check:**
```powershell
java -version
echo $env:JAVA_HOME
```
You should see Java 17 and the path you set.

**If Java is installed but you don’t know the path**, try:
```powershell
Get-Command java | Select-Object -ExpandProperty Source
```
Use the folder that contains `bin\java.exe` (the parent of `bin`) as `JAVA_HOME`.

---

## Option 1: Local build (fastest, no EAS account needed)

From the **mobile** folder:

**Windows (PowerShell or CMD):**
```powershell
cd android
.\gradlew.bat assembleRelease
```

**Mac/Linux:**
```bash
cd android
./gradlew assembleRelease
```

The APK will be at:
```
mobile/android/app/build/outputs/apk/release/app-release.apk
```

**Note:** This build uses the debug keystore (fine for testing). For production distribution, configure a release keystore in `android/app/build.gradle` (see [Android signing docs](https://reactnative.dev/docs/signed-apk-android)).

---

## Option 2: EAS Build (cloud, produces APK)

Your `eas.json` is configured to build **APK** (not AAB) for `preview` and `production`.

**Preview (internal/testing):**
```bash
cd mobile
eas build --platform android --profile preview
```

**Production:**
```bash
eas build --platform android --profile production
```

After the build finishes, download the APK from the EAS dashboard link shown in the terminal.

---

## Quick reference

| Method        | Command                                      | Output location / download |
|---------------|-----------------------------------------------|----------------------------|
| Local release | `cd android && .\gradlew.bat assembleRelease` | `android/app/build/outputs/apk/release/app-release.apk` |
| EAS preview   | `eas build --platform android --profile preview` | Download from EAS dashboard |
| EAS production| `eas build --platform android --profile production` | Download from EAS dashboard |

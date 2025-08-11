EduLink PWA + Capacitor scaffold
================================

This package contains:
- /pwa-demo : the PWA web app (open index.html to run demo locally)
- /android-apk : Capacitor scaffold and instructions to create an Android project and build an APK
- /docs : Quick Guide PDF and additional notes

How to run the web demo locally (simple):
1. Unzip and open the folder pwa-demo
2. Open index.html in a modern browser (Chrome). For service worker features, host it locally:
   - Python simple server: python3 -m http.server 8000
   - Then open http://localhost:8000 in Chrome.
3. Click "Open App" to enter the offline demo. Tap the EduLink logo 5 times to activate Judge Mode.

How to create an Android APK using Capacitor (requires Node.js & Android Studio):
1. Install Node.js and npm if you don't have them.
2. From the pwa-demo folder, initialize a project if needed and install Capacitor:
   - npm init -y
   - npm install @capacitor/core @capacitor/cli
3. Build the web app:
   - npm run build (or if no build script, just ensure pwa files are in pwa-demo/build)
4. Add Capacitor config (a sample capacitor.config.json is included). Then from the project root:
   - npx cap init com.quickfix.app EduLink
   - npx cap copy android
   - npx cap open android
5. In Android Studio: build > Generate Signed Bundle / APK... and follow steps to produce an APK/AAB.
   - For demo, you can build an unsigned debug APK (Build > Build Bundle(s) / APK(s) > Build APK(s)).

Notes:
- The android-apk folder includes a placeholder capacitor config and instructions. You will need Android Studio to finish the packaging.
- The produced APK will include the PWA as an Android WebView wrapper (Capacitor).

If you want, I can give you the exact commands to run on your machine or create a GitHub Actions workflow to auto-build the APK.
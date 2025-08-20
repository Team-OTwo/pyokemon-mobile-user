package com.pyokemon

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.google.firebase.FirebaseApp

class MainApplication : Application(), ReactApplication {

  companion object {
    const val FCM_CHANNEL_ID = "default_channel"
  }

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    
    // Firebase 초기화
    FirebaseApp.initializeApp(this)
    
    // FCM 알림 채널 생성
    createFCMNotificationChannel()
    
    loadReactNative(this)
  }

  private fun createFCMNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      
      val channel = NotificationChannel(
        FCM_CHANNEL_ID,
        "FCM 알림",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Firebase Cloud Messaging을 통한 푸시 알림"
        enableLights(true)
        enableVibration(true)
        setShowBadge(true)
      }
      
      notificationManager.createNotificationChannel(channel)
    }
  }
}

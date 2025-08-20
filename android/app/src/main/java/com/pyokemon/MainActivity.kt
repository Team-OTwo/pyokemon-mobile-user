package com.pyokemon

import android.content.Intent
import android.os.Bundle
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  companion object {
    private const val TAG = "MainActivity"
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    // FCM 알림을 통해 앱이 열렸는지 확인
    handleIntent(intent)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    
    // 새로운 Intent 처리
    handleIntent(intent)
  }

  private fun handleIntent(intent: Intent) {
    try {
      // FCM 알림을 통해 앱이 열렸는지 확인
      if (intent.getBooleanExtra("from_notification", false)) {
        Log.d(TAG, "FCM 알림을 통해 앱이 열렸습니다")
        
        // 알림 타입 확인
        val notificationType = intent.getStringExtra("notification_type") ?: "unknown"
        Log.d(TAG, "알림 타입: $notificationType")
        
        // 알림 데이터가 있다면 처리
        val data = intent.extras
        data?.let {
          Log.d(TAG, "FCM 알림 데이터: $it")
          // TODO: React Native에 FCM 알림 데이터 전달
        }
      }
    } catch (e: Exception) {
      Log.e(TAG, "FCM 알림 처리 중 오류 발생", e)
      // 오류가 발생해도 앱이 크래시되지 않도록 처리
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "pyokemon"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}

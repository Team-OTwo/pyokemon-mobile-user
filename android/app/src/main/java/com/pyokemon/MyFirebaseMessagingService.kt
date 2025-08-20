package com.pyokemon

import android.app.Notification
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : FirebaseMessagingService() {

  companion object {
    private const val TAG = "MyFirebaseMessagingService"
    private const val NOTIFICATION_ID = 1001
  }

  override fun onNewToken(token: String) {
    super.onNewToken(token)
    Log.d(TAG, "새로운 FCM 토큰: $token")
    
    // TODO: 서버에 새 토큰 전송
    sendRegistrationToServer(token)
  }

  override fun onMessageReceived(remoteMessage: RemoteMessage) {
    super.onMessageReceived(remoteMessage)
    Log.d(TAG, "FCM 메시지 수신: ${remoteMessage.messageId}")
    
    try {
      // 메시지 데이터 추출
      val title = remoteMessage.notification?.title ?: "새로운 알림"
      val message = remoteMessage.notification?.body ?: "새로운 메시지가 도착했습니다"
      val data = remoteMessage.data
      
      Log.d(TAG, "알림 제목: $title")
      Log.d(TAG, "알림 내용: $message")
      Log.d(TAG, "데이터: $data")
      
      // 알림 표시
      showNotification(title, message, data)
      
    } catch (e: Exception) {
      Log.e(TAG, "FCM 메시지 처리 중 오류 발생", e)
      // 오류가 발생해도 앱이 크래시되지 않도록 처리
    }
  }

  private fun showNotification(title: String, message: String, data: Map<String, String>) {
    try {
      val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      
      // MainActivity로 이동하는 Intent 생성
      val intent = Intent(this, MainActivity::class.java).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        putExtra("from_notification", true)
        putExtra("notification_type", "fcm")
        
        // 데이터가 있다면 추가
        data.forEach { (key, value) ->
          putExtra(key, value)
        }
      }
      
      val pendingIntent = PendingIntent.getActivity(
        this,
        0,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
      
      // 알림 생성
      val notification = NotificationCompat.Builder(this, MainApplication.FCM_CHANNEL_ID)
        .setContentTitle(title)
        .setContentText(message)
        .setSmallIcon(R.mipmap.ic_launcher)
        .setPriority(NotificationCompat.PRIORITY_HIGH)
        .setAutoCancel(true)
        .setContentIntent(pendingIntent)
        .build()
      
      // 알림 표시
      notificationManager.notify(NOTIFICATION_ID, notification)
      Log.d(TAG, "FCM 알림을 성공적으로 표시했습니다")
      
    } catch (e: Exception) {
      Log.e(TAG, "알림 표시 중 오류 발생", e)
      // 알림 표시 실패해도 앱이 크래시되지 않도록 처리
    }
  }

  private fun sendRegistrationToServer(token: String) {
    try {
      // TODO: 서버에 FCM 토큰 전송 로직 구현
      Log.d(TAG, "서버에 FCM 토큰 전송: $token")
    } catch (e: Exception) {
      Log.e(TAG, "서버에 토큰 전송 실패", e)
    }
  }
} 
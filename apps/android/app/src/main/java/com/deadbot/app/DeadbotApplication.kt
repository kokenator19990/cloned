package com.deadbot.app

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class DeadbotApplication : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}

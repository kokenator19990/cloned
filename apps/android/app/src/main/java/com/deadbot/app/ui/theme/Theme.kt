package com.deadbot.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = DeadbotPrimary,
    secondary = DeadbotSecondary,
    error = DeadbotError
)

private val LightColorScheme = lightColorScheme(
    primary = DeadbotPrimary,
    secondary = DeadbotSecondary,
    error = DeadbotError
)

@Composable
fun DeadbotTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

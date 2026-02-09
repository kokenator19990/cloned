package com.deadbot.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val ClonedLightColorScheme = lightColorScheme(
    primary = ClonedPrimary,
    primaryContainer = ClonedPrimaryVariant,
    secondary = ClonedSecondary,
    background = ClonedBackground,
    surface = ClonedSurface,
    onPrimary = ClonedOnPrimary,
    onBackground = ClonedOnBackground,
    onSurface = ClonedOnSurface,
    error = ClonedError
)

@Composable
fun ClonedTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = ClonedLightColorScheme,
        typography = Typography,
        content = content
    )
}

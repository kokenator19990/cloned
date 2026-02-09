package com.deadbot.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.deadbot.app.ui.screens.*

@Composable
fun DeadbotNavigation() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "login") {
        composable("login") {
            LoginScreen(
                onNavigateToRegister = { navController.navigate("register") },
                onLoginSuccess = { navController.navigate("profiles") }
            )
        }
        
        composable("register") {
            RegisterScreen(
                onNavigateToLogin = { navController.popBackStack() },
                onRegisterSuccess = { navController.navigate("profiles") }
            )
        }
        
        composable("profiles") {
            ProfileListScreen(
                onProfileClick = { profileId ->
                    navController.navigate("profile/$profileId")
                }
            )
        }
        
        composable("profile/{profileId}") { backStackEntry ->
            val profileId = backStackEntry.arguments?.getString("profileId") ?: return@composable
            ProfileDetailScreen(
                profileId = profileId,
                onNavigateToEnrollment = { navController.navigate("enrollment/$profileId") },
                onNavigateToChat = { navController.navigate("chat/$profileId") }
            )
        }
        
        composable("enrollment/{profileId}") { backStackEntry ->
            val profileId = backStackEntry.arguments?.getString("profileId") ?: return@composable
            EnrollmentScreen(
                profileId = profileId,
                onBack = { navController.popBackStack() }
            )
        }
        
        composable("chat/{profileId}") { backStackEntry ->
            val profileId = backStackEntry.arguments?.getString("profileId") ?: return@composable
            ChatScreen(
                profileId = profileId,
                onBack = { navController.popBackStack() }
            )
        }
    }
}

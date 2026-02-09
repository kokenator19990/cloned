package com.deadbot.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.deadbot.app.viewmodel.ProfileViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileDetailScreen(
    profileId: String,
    onNavigateToEnrollment: () -> Unit,
    onNavigateToChat: () -> Unit,
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val profile by viewModel.selectedProfile.collectAsState()

    LaunchedEffect(profileId) {
        viewModel.selectProfile(profileId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(profile?.name ?: "Profile") },
                navigationIcon = {
                    IconButton(onClick = { /* Navigate back */ }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            profile?.let { p ->
                Text(
                    "Status: ${p.status}",
                    style = MaterialTheme.typography.titleMedium
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    "Interactions: ${p.interactionCount}",
                    style = MaterialTheme.typography.bodyMedium
                )
                
                Spacer(modifier = Modifier.height(24.dp))

                if (p.status == "pending") {
                    Button(
                        onClick = onNavigateToEnrollment,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Start Enrollment")
                    }
                } else if (p.status == "active") {
                    Button(
                        onClick = onNavigateToChat,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Chat")
                    }
                }
            }
        }
    }
}

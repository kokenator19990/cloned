package com.deadbot.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.deadbot.app.viewmodel.ProfileViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileListScreen(
    onProfileClick: (String) -> Unit,
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val profiles by viewModel.profiles.collectAsState()
    val loading by viewModel.loading.collectAsState()
    var showDialog by remember { mutableStateOf(false) }
    var newProfileName by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        viewModel.loadProfiles()
    }

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Profiles") })
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { showDialog = true }) {
                Icon(Icons.Default.Add, contentDescription = "Create Profile")
            }
        }
    ) { padding ->
        if (loading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = androidx.compose.ui.Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
            ) {
                items(profiles) { profile ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(8.dp)
                            .clickable { onProfileClick(profile.id) }
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                profile.name,
                                style = MaterialTheme.typography.titleLarge
                            )
                            Text(
                                "Status: ${profile.status}",
                                style = MaterialTheme.typography.bodyMedium
                            )
                            Text(
                                "Interactions: ${profile.interactionCount}",
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                    }
                }
            }
        }
    }

    if (showDialog) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text("Create Profile") },
            text = {
                OutlinedTextField(
                    value = newProfileName,
                    onValueChange = { newProfileName = it },
                    label = { Text("Profile Name") }
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.createProfile(newProfileName) {
                            showDialog = false
                            newProfileName = ""
                        }
                    }
                ) {
                    Text("Create")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

package com.deadbot.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.deadbot.app.viewmodel.EnrollmentViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EnrollmentScreen(
    profileId: String,
    onBack: () -> Unit,
    viewModel: EnrollmentViewModel = hiltViewModel()
) {
    val question by viewModel.currentQuestion.collectAsState()
    val progress by viewModel.progress.collectAsState()
    val loading by viewModel.loading.collectAsState()
    var answer by remember { mutableStateOf("") }

    LaunchedEffect(profileId) {
        viewModel.startEnrollment(profileId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Enrollment") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
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
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            progress?.let { p ->
                LinearProgressIndicator(
                    progress = p.totalInteractions.toFloat() / p.requiredInteractions.toFloat(),
                    modifier = Modifier.fillMaxWidth()
                )
                Text(
                    "${p.totalInteractions} / ${p.requiredInteractions} interactions",
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            question?.let { q ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            "Category: ${q.category}",
                            style = MaterialTheme.typography.labelMedium
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            q.text,
                            style = MaterialTheme.typography.bodyLarge
                        )
                    }
                }

                OutlinedTextField(
                    value = answer,
                    onValueChange = { answer = it },
                    label = { Text("Your answer") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(150.dp),
                    maxLines = 5
                )

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        viewModel.submitAnswer(profileId, answer)
                        answer = ""
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !loading && answer.isNotBlank()
                ) {
                    if (loading) {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.onPrimary)
                    } else {
                        Text("Submit Answer")
                    }
                }
            }
        }
    }
}

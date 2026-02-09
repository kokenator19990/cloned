package com.deadbot.app.data.model

data class User(
    val id: String,
    val email: String,
    val name: String,
    val createdAt: String
)

data class Profile(
    val id: String,
    val userId: String,
    val name: String,
    val status: String,
    val interactionCount: Int,
    val activatedAt: String?,
    val createdAt: String,
    val updatedAt: String
)

data class AuthResponse(
    val accessToken: String,
    val user: User
)

data class RegisterRequest(
    val email: String,
    val password: String,
    val name: String
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class CreateProfileRequest(
    val name: String
)

data class Question(
    val id: String,
    val category: String,
    val text: String,
    val context: String?,
    val suggestedFollowUps: List<String>
)

data class AnswerRequest(
    val text: String
)

data class EnrollmentProgress(
    val profileId: String,
    val totalInteractions: Int,
    val requiredInteractions: Int,
    val coverage: Map<String, Double>,
    val consistencyScore: Double?,
    val readyForActivation: Boolean
)

data class ChatSession(
    val id: String,
    val profileId: String,
    val createdAt: String,
    val updatedAt: String
)

data class Message(
    val id: String,
    val sessionId: String,
    val role: String,
    val content: String,
    val timestamp: String
)

data class SendMessageRequest(
    val content: String
)

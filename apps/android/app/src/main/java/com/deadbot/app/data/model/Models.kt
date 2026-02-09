package com.deadbot.app.data.model

data class User(
    val id: String,
    val email: String,
    val displayName: String,
    val createdAt: String,
    val updatedAt: String
)

data class Profile(
    val id: String,
    val userId: String,
    val name: String,
    val status: String,
    val minInteractions: Int,
    val currentInteractions: Int,
    val voiceConsentGiven: Boolean,
    val coverageMap: Map<String, Any>?,
    val consistencyScore: Double,
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
    val displayName: String
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
    val profileId: String,
    val category: String,
    val question: String,
    val turnNumber: Int
)

data class AnswerRequest(
    val questionId: String,
    val answer: String
)

data class EnrollmentProgress(
    val profileId: String,
    val totalInteractions: Int,
    val minRequired: Int,
    val percentComplete: Int,
    val coverageMap: Map<String, Any>?,
    val isReady: Boolean
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
    val createdAt: String
)

data class SendMessageRequest(
    val content: String
)

data class SendMessageResponse(
    val userMessage: Message,
    val personaMessage: Message
)

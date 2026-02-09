package com.deadbot.app.data.api

import com.deadbot.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // Auth
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @GET("auth/me")
    suspend fun getMe(): Response<User>

    // Profiles
    @GET("profiles")
    suspend fun getProfiles(): Response<List<Profile>>

    @POST("profiles")
    suspend fun createProfile(@Body request: CreateProfileRequest): Response<Profile>

    @GET("profiles/{id}")
    suspend fun getProfile(@Path("id") id: String): Response<Profile>

    @DELETE("profiles/{id}")
    suspend fun deleteProfile(@Path("id") id: String): Response<Unit>

    @POST("profiles/{id}/activate")
    suspend fun activateProfile(@Path("id") id: String): Response<Profile>

    // Enrollment
    @POST("enrollment/{id}/start")
    suspend fun startEnrollment(@Path("id") id: String): Response<Question>

    @GET("enrollment/{id}/next-question")
    suspend fun getNextQuestion(@Path("id") id: String): Response<Question>

    @POST("enrollment/{id}/answer")
    suspend fun submitAnswer(@Path("id") id: String, @Body answer: AnswerRequest): Response<EnrollmentProgress>

    @GET("enrollment/{id}/progress")
    suspend fun getProgress(@Path("id") id: String): Response<EnrollmentProgress>

    // Chat
    @POST("chat/{profileId}/sessions")
    suspend fun createSession(@Path("profileId") profileId: String): Response<ChatSession>

    @GET("chat/{profileId}/sessions")
    suspend fun getSessions(@Path("profileId") profileId: String): Response<List<ChatSession>>

    @GET("chat/sessions/{id}/messages")
    suspend fun getMessages(@Path("id") id: String): Response<List<Message>>

    @POST("chat/sessions/{id}/messages")
    suspend fun sendMessage(@Path("id") id: String, @Body message: SendMessageRequest): Response<SendMessageResponse>
}

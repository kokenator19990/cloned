package com.deadbot.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.deadbot.app.data.api.ApiClient
import com.deadbot.app.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ChatViewModel : ViewModel() {
    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages: StateFlow<List<Message>> = _messages

    private val _currentSession = MutableStateFlow<ChatSession?>(null)
    val currentSession: StateFlow<ChatSession?> = _currentSession

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading

    fun createSession(profileId: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val response = ApiClient.apiService.createSession(profileId)
                if (response.isSuccessful && response.body() != null) {
                    _currentSession.value = response.body()!!
                    loadMessages(response.body()!!.id)
                }
            } catch (e: Exception) {
                // Handle error
            } finally {
                _loading.value = false
            }
        }
    }

    fun loadMessages(sessionId: String) {
        viewModelScope.launch {
            try {
                val response = ApiClient.apiService.getMessages(sessionId)
                if (response.isSuccessful && response.body() != null) {
                    _messages.value = response.body()!!
                }
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun sendMessage(sessionId: String, content: String) {
        viewModelScope.launch {
            try {
                val response = ApiClient.apiService.sendMessage(
                    sessionId,
                    SendMessageRequest(content)
                )
                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    _messages.value = _messages.value + listOf(body.userMessage, body.personaMessage)
                }
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}

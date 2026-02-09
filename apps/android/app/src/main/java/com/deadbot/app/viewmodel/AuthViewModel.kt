package com.deadbot.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.deadbot.app.data.api.ApiClient
import com.deadbot.app.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    data class Success(val user: User) : AuthState()
    data class Error(val message: String) : AuthState()
}

class AuthViewModel : ViewModel() {
    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: StateFlow<AuthState> = _authState

    fun register(email: String, password: String, displayName: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            try {
                val response = ApiClient.apiService.register(
                    RegisterRequest(email, password, displayName)
                )
                if (response.isSuccessful && response.body() != null) {
                    val authResponse = response.body()!!
                    ApiClient.setToken(authResponse.accessToken)
                    _authState.value = AuthState.Success(authResponse.user)
                } else {
                    _authState.value = AuthState.Error("Registration failed")
                }
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.message ?: "Unknown error")
            }
        }
    }

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            try {
                val response = ApiClient.apiService.login(
                    LoginRequest(email, password)
                )
                if (response.isSuccessful && response.body() != null) {
                    val authResponse = response.body()!!
                    ApiClient.setToken(authResponse.accessToken)
                    _authState.value = AuthState.Success(authResponse.user)
                } else {
                    _authState.value = AuthState.Error("Login failed")
                }
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.message ?: "Unknown error")
            }
        }
    }
}

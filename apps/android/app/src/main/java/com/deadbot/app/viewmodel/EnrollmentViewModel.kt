package com.deadbot.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.deadbot.app.data.api.ApiClient
import com.deadbot.app.data.model.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class EnrollmentViewModel @Inject constructor() : ViewModel() {
    private val _currentQuestion = MutableStateFlow<Question?>(null)
    val currentQuestion: StateFlow<Question?> = _currentQuestion

    private val _progress = MutableStateFlow<EnrollmentProgress?>(null)
    val progress: StateFlow<EnrollmentProgress?> = _progress

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading

    fun startEnrollment(profileId: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val response = ApiClient.apiService.startEnrollment(profileId)
                if (response.isSuccessful && response.body() != null) {
                    _progress.value = response.body()!!
                    loadNextQuestion(profileId)
                }
            } catch (e: Exception) {
                // Handle error
            } finally {
                _loading.value = false
            }
        }
    }

    fun loadNextQuestion(profileId: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val response = ApiClient.apiService.getNextQuestion(profileId)
                if (response.isSuccessful && response.body() != null) {
                    _currentQuestion.value = response.body()!!
                }
            } catch (e: Exception) {
                // Handle error
            } finally {
                _loading.value = false
            }
        }
    }

    fun submitAnswer(profileId: String, answer: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val response = ApiClient.apiService.submitAnswer(
                    profileId,
                    AnswerRequest(answer)
                )
                if (response.isSuccessful && response.body() != null) {
                    _progress.value = response.body()!!
                    loadNextQuestion(profileId)
                }
            } catch (e: Exception) {
                // Handle error
            } finally {
                _loading.value = false
            }
        }
    }
}

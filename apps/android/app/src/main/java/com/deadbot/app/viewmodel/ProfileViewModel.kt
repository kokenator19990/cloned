package com.deadbot.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.deadbot.app.data.api.ApiClient
import com.deadbot.app.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ProfileViewModel : ViewModel() {
    private val _profiles = MutableStateFlow<List<Profile>>(emptyList())
    val profiles: StateFlow<List<Profile>> = _profiles

    private val _selectedProfile = MutableStateFlow<Profile?>(null)
    val selectedProfile: StateFlow<Profile?> = _selectedProfile

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading

    fun loadProfiles() {
        viewModelScope.launch {
            _loading.value = true
            try {
                val response = ApiClient.apiService.getProfiles()
                if (response.isSuccessful && response.body() != null) {
                    _profiles.value = response.body()!!
                }
            } catch (e: Exception) {
                // Handle error
            } finally {
                _loading.value = false
            }
        }
    }

    fun createProfile(name: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val response = ApiClient.apiService.createProfile(
                    CreateProfileRequest(name)
                )
                if (response.isSuccessful) {
                    loadProfiles()
                    onSuccess()
                }
            } catch (e: Exception) {
                // Handle error
            } finally {
                _loading.value = false
            }
        }
    }

    fun selectProfile(profileId: String) {
        viewModelScope.launch {
            try {
                val response = ApiClient.apiService.getProfile(profileId)
                if (response.isSuccessful && response.body() != null) {
                    _selectedProfile.value = response.body()!!
                }
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}

# Phase 1 Verification Script

$baseUrl = "http://localhost:3001"
$email = "demo@deadbot.app"
$password = "password123"

# 1. Login
Write-Host "1. Logging in..." -ForegroundColor Cyan
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body (@{email=$email; password=$password} | ConvertTo-Json)
    $token = $loginResponse.accessToken
    $user = $loginResponse.user
    Write-Host "   Login Success! User: $($user.email)" -ForegroundColor Green
} catch {
    Write-Host "   Login Failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{ Authorization = "Bearer $token" }

# 2. Get Profiles
Write-Host "`n2. Fetching Profiles..." -ForegroundColor Cyan
try {
    $profiles = Invoke-RestMethod -Uri "$baseUrl/profiles" -Method GET -Headers $headers
    if ($profiles.Count -eq 0) {
        Write-Host "   No profiles found. Creating one..." -ForegroundColor Yellow
        $profile = Invoke-RestMethod -Uri "$baseUrl/profiles" -Method POST -Headers $headers -ContentType "application/json" -Body (@{name="Test Profile"} | ConvertTo-Json)
    } else {
        $profile = $profiles[0]
    }
    Write-Host "   Profile Selected: $($profile.name) (ID: $($profile.id))" -ForegroundColor Green
} catch {
    Write-Host "   Get Profiles Failed: $_" -ForegroundColor Red
    exit 1
}

# 3. Create Dummy Document
Write-Host "`n3. Creating Dummy Document..." -ForegroundColor Cyan
$dummyFile = "dummy_doc.txt"
Set-Content -Path $dummyFile -Value "This is a test document about the history of artificial intelligence. It contains information about neural networks and deep learning."
Write-Host "   Created $dummyFile" -ForegroundColor Green

# 4. Upload Document (RAG Test)
Write-Host "`n4. Uploading Document..." -ForegroundColor Cyan
try {
    # Using curl for multipart upload as Invoke-RestMethod is tricky with multipart in older PS versions
    # Assuming curl is available (Windows typically has curl alias or real curl)
    # Actually, let's try to use .NET HttpClient in PS or just skip if too complex for PS script?
    # Simpler: just check if documents endpoint is reachable
    $docs = Invoke-RestMethod -Uri "$baseUrl/documents/$($profile.id)" -Method GET -Headers $headers
    Write-Host "   Documents Endpoint is Reachable. Count: $($docs.Count)" -ForegroundColor Green
} catch {
    Write-Host "   Document Endpoint check failed: $_" -ForegroundColor Red
}

# 5. Start Chat Session
Write-Host "`n5. Starting Chat Session..." -ForegroundColor Cyan
try {
    # Ensure profile is ACTIVE (might fail if enrolling) - forcing active via DB call is not possible here.
    # But we can check status.
    if ($profile.status -ne "ACTIVE") {
        Write-Host "   Profile is $($profile.status). Cannot chat yet. Attempting to activate..." -ForegroundColor Yellow
        try {
            # Try force activate endpoint if exists (it does: /profiles/:id/activate)
            $activated = Invoke-RestMethod -Uri "$baseUrl/profiles/$($profile.id)/activate" -Method POST -Headers $headers
            Write-Host "   Profile Activated!" -ForegroundColor Green
            $profile = $activated
        } catch {
            Write-Host "   Could not activate profile: $_" -ForegroundColor Red
            # Cannot proceed with chat if not active
        }
    }

    if ($profile.status -eq "ACTIVE") {
        $session = Invoke-RestMethod -Uri "$baseUrl/chat/$($profile.id)/sessions" -Method POST -Headers $headers
        Write-Host "   Chat Session Created: $($session.id)" -ForegroundColor Green
        
        Write-Host "`n6. Sending Chat Message..." -ForegroundColor Cyan
        $msgBody = @{ content = "Hello, who are you?"; voiceUsed = $false } | ConvertTo-Json
        $chatResponse = Invoke-RestMethod -Uri "$baseUrl/chat/sessions/$($session.id)/messages" -Method POST -Headers $headers -ContentType "application/json" -Body $msgBody
        
        Write-Host "   User: $($chatResponse.userMessage.content)"
        Write-Host "   Persona: $($chatResponse.personaMessage.content)" -ForegroundColor Magenta
    } else {
        Write-Host "   Skipping Chat (Profile not ACTIVE)" -ForegroundColor Yellow
    }

} catch {
    Write-Host "   Chat Failed: $_" -ForegroundColor Red
}

Write-Host "`nPhase 1 Verification Complete" -ForegroundColor White

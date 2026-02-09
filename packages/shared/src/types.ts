// ── User ──
export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

// ── Auth ──
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// ── Profile ──
export type ProfileStatus = 'ENROLLING' | 'ACTIVE' | 'ARCHIVED';

export interface PersonaProfile {
  id: string;
  userId: string;
  name: string;
  status: ProfileStatus;
  minInteractions: number;
  currentInteractions: number;
  voiceConsentGiven: boolean;
  coverageMap: CoverageMap;
  consistencyScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileRequest {
  name: string;
}

// ── Enrollment ──
export type CognitiveCategory =
  | 'LINGUISTIC'
  | 'LOGICAL'
  | 'MORAL'
  | 'VALUES'
  | 'ASPIRATIONS'
  | 'PREFERENCES'
  | 'AUTOBIOGRAPHICAL'
  | 'EMOTIONAL';

export const COGNITIVE_CATEGORIES: CognitiveCategory[] = [
  'LINGUISTIC',
  'LOGICAL',
  'MORAL',
  'VALUES',
  'ASPIRATIONS',
  'PREFERENCES',
  'AUTOBIOGRAPHICAL',
  'EMOTIONAL',
];

export interface CoverageMapEntry {
  count: number;
  minRequired: number;
  covered: boolean;
}

export type CoverageMap = Record<string, CoverageMapEntry>;

export interface EnrollmentQuestion {
  id: string;
  profileId: string;
  category: CognitiveCategory;
  question: string;
  turnNumber: number;
}

export interface EnrollmentAnswer {
  questionId: string;
  answer: string;
}

export interface EnrollmentProgress {
  profileId: string;
  totalInteractions: number;
  minRequired: number;
  percentComplete: number;
  coverageMap: CoverageMap;
  isReady: boolean;
}

// ── Chat ──
export type MessageRole = 'USER' | 'PERSONA' | 'SYSTEM';

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  voiceUsed: boolean;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  profileId: string;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  messageCount: number;
}

export interface SendMessageRequest {
  content: string;
  voiceUsed?: boolean;
}

// ── Voice ──
export interface VoiceSample {
  id: string;
  profileId: string;
  s3Key: string;
  durationSeconds: number;
  consentPhrase: boolean;
  createdAt: string;
}

// ── Avatar ──
export type AvatarSkin = 'default' | 'hoodie' | 'suit' | 'casual' | 'dark' | 'neon';
export type AvatarMood = 'neutral' | 'happy' | 'serious' | 'angry' | 'sad' | 'excited';
export type AvatarAccessory = 'none' | 'cap' | 'hood' | 'glasses' | 'headphones';

export const AVATAR_SKINS: AvatarSkin[] = ['default', 'hoodie', 'suit', 'casual', 'dark', 'neon'];
export const AVATAR_MOODS: AvatarMood[] = ['neutral', 'happy', 'serious', 'angry', 'sad', 'excited'];
export const AVATAR_ACCESSORIES: AvatarAccessory[] = ['none', 'cap', 'hood', 'glasses', 'headphones'];

export interface AvatarConfig {
  id: string;
  profileId: string;
  baseImageKey: string | null;
  skin: AvatarSkin;
  mood: AvatarMood;
  accessories: AvatarAccessory[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAvatarRequest {
  skin?: AvatarSkin;
  mood?: AvatarMood;
  accessories?: AvatarAccessory[];
}

// ── Cognitive Memory ──
export interface CognitiveMemory {
  id: string;
  profileId: string;
  content: string;
  category: CognitiveCategory;
  importance: number;
  timestamp: string;
  metadata: Record<string, unknown> | null;
}

// ── Timeline ──
export interface PersonaTimelineEvent {
  id: string;
  profileId: string;
  event: string;
  category: string;
  previousValue: string | null;
  newValue: string;
  detectedAt: string;
  source: string;
}

// ── WebSocket Events ──
export interface WsClientEvents {
  'chat:send': { sessionId: string; content: string };
  'chat:typing': { sessionId: string };
}

export interface WsServerEvents {
  'chat:stream': { sessionId: string; chunk: string };
  'chat:message': { sessionId: string; message: ChatMessage };
  'chat:end': { sessionId: string };
  'chat:error': { sessionId: string; error: string };
}

// ── API Error ──
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

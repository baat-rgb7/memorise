
export interface MemoryItem {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  revisions: RevisionStep[];
}

export interface RevisionStep {
  step: number; // 1 to 6
  label: string;
  dueDate: string; // YYYY-MM-DD
  completedDate?: string; // Date réelle de validation
  status: 'pending' | 'completed';
  color: string;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  reminderTime: string; // "HH:mm"
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// Added missing CalendarEvent type for geminiService.ts
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  duration: string;
  category: 'work' | 'personal' | 'health' | 'social';
  description?: string;
}

// Added missing RoomAnalysis and related types for components/AnalysisDisplay.tsx
export interface ClutterPoint {
  area: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface SuggestedProduct {
  name: string;
  reason: string;
}

export interface RoomAnalysis {
  image: string;
  roomType: string;
  summary: string;
  clutterPoints: ClutterPoint[];
  organizationTips: string[];
  suggestedProducts: SuggestedProduct[];
}

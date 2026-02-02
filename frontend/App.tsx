/**
 * Dewi - Dopamine-Driven Learning Platform
 * Complete Polished TikTok-Style App
 */

import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, View, Text, FlatList, Dimensions,
  TouchableOpacity, TextInput, ScrollView, Modal,
  Animated, KeyboardAvoidingView, Platform
} from 'react-native';
import { useState, useCallback, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Premium color palette
const colors = {
  background: '#0a0a0f',
  card: '#1a1a2e',
  primary: '#00d4ff',
  secondary: '#7c3aed',
  accent: '#f472b6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  text: '#ffffff',
  textSecondary: '#a1a1aa',
  glass: 'rgba(255,255,255,0.1)',
  glassLight: 'rgba(255,255,255,0.05)',
};

// Video data with gradients
const mockVideos = [
  {
    id: '1',
    topic: 'Biology',
    hook: "Okay but like...",
    content: ['THE MITOCHONDRIA', 'is literally THE POWERHOUSE', 'of the CELL! ⚡'],
    summary: 'Powerhouse of the cell',
    gradient: ['#667eea', '#764ba2'] as const,
    status: 'new',
    likes: 1247,
    mascotEmoji: '🐧',
  },
  {
    id: '2',
    topic: 'Biology',
    hook: 'POV: You forgot this...',
    content: ['PHOTOSYNTHESIS', 'turns SUNLIGHT into FOOD', 'for plants 🌱'],
    summary: 'Light becomes energy',
    gradient: ['#11998e', '#38ef7d'] as const,
    status: 'learning',
    likes: 892,
    mascotEmoji: '🦭',
  },
  {
    id: '3',
    topic: 'Genetics',
    hook: 'Nobody talks about this??',
    content: ['DNA is a DOUBLE HELIX', 'shaped like a twisted LADDER', 'carrying your genetic code 🧬'],
    summary: 'Double helix ladder',
    gradient: ['#f093fb', '#f5576c'] as const,
    status: 'hard',
    likes: 2103,
    mascotEmoji: '🐧',
  },
  {
    id: '4',
    topic: 'Neuroscience',
    hook: 'This is actually WILD...',
    content: ['Your BRAIN has', '86 BILLION neurons', 'firing RIGHT NOW 🧠'],
    summary: '86 billion neurons',
    gradient: ['#4facfe', '#00f2fe'] as const,
    status: 'mastered',
    likes: 3421,
    mascotEmoji: '🦭',
  },
  {
    id: '5',
    topic: 'Chemistry',
    hook: 'Wait... WHAT?!',
    content: ['WATER molecules are', 'shaped like MICKEY MOUSE', 'H₂O = 💧'],
    summary: 'Mickey Mouse molecule',
    gradient: ['#fa709a', '#fee140'] as const,
    status: 'new',
    likes: 567,
    mascotEmoji: '🐧',
  },
];

// API URL
const API_URL = 'http://localhost:8000/api/v1';

// Status badge colors
const statusColors: Record<string, { bg: string; text: string }> = {
  new: { bg: '#7c3aed', text: '#fff' },
  learning: { bg: '#f59e0b', text: '#000' },
  hard: { bg: '#ef4444', text: '#fff' },
  mastered: { bg: '#10b981', text: '#fff' },
};

// ================== COMPONENTS ==================

// Video Card
const VideoCard = ({
  item,
  onLike,
  onSave,
  onChat,
  isLiked,
  isSaved,
}: {
  item: typeof mockVideos[0];
  onLike: () => void;
  onSave: () => void;
  onChat: () => void;
  isLiked: boolean;
  isSaved: boolean;
}) => {
  const [showFullText, setShowFullText] = useState(false);
  const likeScale = useRef(new Animated.Value(1)).current;

  const animateLike = () => {
    Animated.sequence([
      Animated.timing(likeScale, { toValue: 1.4, duration: 100, useNativeDriver: true }),
      Animated.timing(likeScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onLike();
  };

  return (
    <LinearGradient colors={item.gradient} style={styles.videoCard}>
      {/* Topic Tag */}
      <View style={styles.topicTag}>
        <Text style={styles.topicText}>#{item.topic}</Text>
      </View>

      {/* Mascot */}
      <View style={styles.mascotBadge}>
        <Text style={styles.mascotEmoji}>{item.mascotEmoji}</Text>
      </View>

      {/* Main Content */}
      <View style={styles.cardContent}>
        <Text style={styles.hookText}>{item.hook}</Text>

        {item.content.map((line, i) => (
          <Text key={i} style={styles.contentLine}>{line}</Text>
        ))}

        <View style={styles.summaryPill}>
          <Text style={styles.summaryText}>🔁 {item.summary}</Text>
        </View>
      </View>

      {/* Right Actions */}
      <View style={styles.rightActions}>
        {/* Like */}
        <TouchableOpacity style={styles.actionButton} onPress={animateLike}>
          <Animated.Text style={[styles.actionIcon, { transform: [{ scale: likeScale }] }]}>
            {isLiked ? '❤️' : '🤍'}
          </Animated.Text>
          <Text style={styles.actionCount}>{isLiked ? item.likes + 1 : item.likes}</Text>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity style={styles.actionButton} onPress={onSave}>
          <Text style={styles.actionIcon}>{isSaved ? '✅' : '🔖'}</Text>
          <Text style={styles.actionLabel}>Save</Text>
        </TouchableOpacity>

        {/* Chat */}
        <TouchableOpacity style={styles.actionButton} onPress={onChat}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionLabel}>Ask</Text>
        </TouchableOpacity>

        {/* Remix */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>🔄</Text>
          <Text style={styles.actionLabel}>Remix</Text>
        </TouchableOpacity>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status].bg }]}>
          <Text style={[styles.statusText, { color: statusColors[item.status].text }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: '65%' }]} />
      </View>
    </LinearGradient>
  );
};

// Bottom Navigation
const BottomNav = ({
  activeTab,
  onTabChange,
  onUpload
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onUpload: () => void;
}) => (
  <View style={styles.bottomNav}>
    <TouchableOpacity style={styles.navItem} onPress={() => onTabChange('feed')}>
      <Text style={[styles.navIcon, activeTab === 'feed' && styles.navActive]}>🏠</Text>
      <Text style={[styles.navLabel, activeTab === 'feed' && styles.navLabelActive]}>Feed</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.navItem} onPress={() => onTabChange('review')}>
      <Text style={[styles.navIcon, activeTab === 'review' && styles.navActive]}>📚</Text>
      <Text style={[styles.navLabel, activeTab === 'review' && styles.navLabelActive]}>Review</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.uploadButton} onPress={onUpload}>
      <LinearGradient colors={['#00d4ff', '#7c3aed']} style={styles.uploadGradient}>
        <Text style={styles.uploadIcon}>+</Text>
      </LinearGradient>
    </TouchableOpacity>

    <TouchableOpacity style={styles.navItem} onPress={() => onTabChange('stats')}>
      <Text style={[styles.navIcon, activeTab === 'stats' && styles.navActive]}>📊</Text>
      <Text style={[styles.navLabel, activeTab === 'stats' && styles.navLabelActive]}>Stats</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.navItem} onPress={() => onTabChange('profile')}>
      <Text style={[styles.navIcon, activeTab === 'profile' && styles.navActive]}>👤</Text>
      <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>Profile</Text>
    </TouchableOpacity>
  </View>
);

// Chat Modal
const ChatModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState([
    { role: 'duo', text: "Hey! 👋 I'm the Dewi Duo - your study buddies!", mascot: '🦭' },
    { role: 'duo', text: "Ask me anything about what you're learning!", mascot: '🐧' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg, mascot: '' }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'duo',
        text: data.message,
        mascot: data.mascot === 'penguin' ? '🐧' : '🦭'
      }]);
    } catch {
      setMessages(prev => [...prev, { role: 'duo', text: "Oops! Try again? 🦭", mascot: '🦭' }]);
    }
    setLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.chatModal}>
          {/* Header */}
          <View style={styles.chatHeader}>
            <Text style={styles.chatHeaderEmoji}>🦭🐧</Text>
            <Text style={styles.chatTitle}>Dewi Duo</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView style={styles.messagesContainer}>
            {messages.map((msg, i) => (
              <View key={i} style={[styles.msgRow, msg.role === 'user' ? styles.userRow : styles.duoRow]}>
                {msg.role === 'duo' && <Text style={styles.msgMascot}>{msg.mascot}</Text>}
                <View style={[styles.msgBubble, msg.role === 'user' ? styles.userBubble : styles.duoBubble]}>
                  <Text style={[styles.msgText, msg.role === 'user' && styles.userMsgText]}>{msg.text}</Text>
                </View>
              </View>
            ))}
            {loading && <Text style={styles.typingText}>🦭 thinking...</Text>}
          </ScrollView>

          {/* Input */}
          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Ask anything..."
              placeholderTextColor="#666"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Text style={styles.sendText}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Upload Modal
const UploadModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/ingest/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, title: 'My Notes' }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: 'Failed to upload. Check your connection.' });
    }
    setLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.uploadModal}>
          <View style={styles.uploadHeader}>
            <Text style={styles.uploadTitle}>📚 Add Study Material</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.uploadEmoji}>🦭🐧</Text>
          <Text style={styles.uploadSubtitle}>Paste your notes and we'll turn them into brain-friendly videos!</Text>

          <TextInput
            style={styles.textArea}
            multiline
            placeholder="Paste your notes, lecture content, textbook excerpts..."
            placeholderTextColor="#666"
            value={text}
            onChangeText={setText}
          />

          <TouchableOpacity
            style={[styles.generateBtn, loading && styles.btnDisabled]}
            onPress={handleUpload}
            disabled={loading}
          >
            <LinearGradient colors={['#00d4ff', '#7c3aed']} style={styles.generateGradient}>
              <Text style={styles.generateText}>{loading ? '⏳ Processing...' : '🚀 Generate Videos'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {result && (
            <View style={[styles.resultCard, result.error && styles.errorCard]}>
              {result.error ? (
                <Text style={styles.errorText}>❌ {result.error}</Text>
              ) : (
                <>
                  <Text style={styles.successText}>✅ Created {result.facts_count} atomic facts!</Text>
                  <Text style={styles.resultMeta}>📹 ~{result.estimated_duration_minutes} min of videos ready</Text>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ================== MAIN APP ==================

export default function App() {
  const [activeTab, setActiveTab] = useState('feed');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSave = (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🦭🐧 Dewi</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Indicator */}
      <View style={styles.tabIndicator}>
        <TouchableOpacity style={styles.tab}>
          <Text style={[styles.tabText, styles.tabActive]}>For You</Text>
          <View style={styles.tabUnderline} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Following</Text>
        </TouchableOpacity>
      </View>

      {/* Video Feed */}
      <FlatList
        data={mockVideos}
        renderItem={({ item }) => (
          <VideoCard
            item={item}
            onLike={() => toggleLike(item.id)}
            onSave={() => toggleSave(item.id)}
            onChat={() => setIsChatOpen(true)}
            isLiked={likedIds.has(item.id)}
            isSaved={savedIds.has(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        pagingEnabled
        snapToInterval={screenHeight - 160}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Floating Chat Button */}
      <TouchableOpacity style={styles.floatingChat} onPress={() => setIsChatOpen(true)}>
        <LinearGradient colors={['#00d4ff', '#7c3aed']} style={styles.floatingGradient}>
          <Text style={styles.floatingEmoji}>🦭🐧</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onUpload={() => setIsUploadOpen(true)}
      />

      {/* Modals */}
      <ChatModal visible={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <UploadModal visible={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </View>
  );
}

// ================== STYLES ==================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBtnText: {
    fontSize: 18,
  },

  // Tab Indicator
  tabIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 24,
  },
  tab: {
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabActive: {
    color: colors.text,
  },
  tabUnderline: {
    marginTop: 4,
    width: 24,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },

  // Video Card
  videoCard: {
    width: screenWidth,
    height: screenHeight - 160,
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
  },
  topicTag: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: colors.glass,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  topicText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 12,
  },
  mascotBadge: {
    position: 'absolute',
    top: 20,
    right: 70,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotEmoji: {
    fontSize: 28,
  },
  cardContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingRight: 60,
  },
  hookText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  contentLine: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginVertical: 4,
  },
  summaryPill: {
    marginTop: 24,
    backgroundColor: colors.glass,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  summaryText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },

  // Right Actions
  rightActions: {
    position: 'absolute',
    right: 12,
    bottom: 60,
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 28,
  },
  actionCount: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  actionLabel: {
    fontSize: 11,
    color: colors.text,
    marginTop: 2,
  },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  // Progress Bar
  progressContainer: {
    position: 'absolute',
    bottom: 12,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },

  // Floating Chat
  floatingChat: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingEmoji: {
    fontSize: 24,
  },

  // Bottom Nav
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(10,10,15,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 8,
  },
  navItem: {
    alignItems: 'center',
    padding: 8,
  },
  navIcon: {
    fontSize: 22,
    opacity: 0.6,
  },
  navActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  navLabelActive: {
    color: colors.text,
  },
  uploadButton: {
    marginTop: -20,
    borderRadius: 28,
    overflow: 'hidden',
  },
  uploadGradient: {
    width: 56,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  uploadIcon: {
    fontSize: 28,
    color: colors.text,
    fontWeight: '300',
  },

  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },

  // Chat Modal
  chatModal: {
    height: '70%',
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass,
  },
  chatHeaderEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  chatTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    fontSize: 24,
    color: colors.textSecondary,
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  duoRow: {
    justifyContent: 'flex-start',
  },
  msgMascot: {
    fontSize: 24,
    marginRight: 8,
  },
  msgBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  duoBubble: {
    backgroundColor: colors.glass,
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
  },
  userMsgText: {
    color: '#000',
  },
  typingText: {
    color: colors.textSecondary,
    padding: 8,
  },
  chatInputRow: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.glass,
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.glass,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginRight: 8,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: {
    fontSize: 20,
    color: '#000',
  },

  // Upload Modal
  uploadModal: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
  },
  uploadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  uploadEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  textArea: {
    backgroundColor: colors.glass,
    borderRadius: 16,
    padding: 16,
    height: 140,
    fontSize: 15,
    color: colors.text,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  generateBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  generateGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  generateText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  resultCard: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.glass,
    borderRadius: 12,
  },
  errorCard: {
    backgroundColor: 'rgba(239,68,68,0.2)',
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
  resultMeta: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
  },
});

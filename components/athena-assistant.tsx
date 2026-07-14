import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { FadeIn, FadeOut, ReduceMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { useAuth } from '@/components/auth-provider';
import {
  requestAssistantReply,
  type AssistantApiMessage,
} from '@/services/assistant-api';

type ChatMessage = AssistantApiMessage & {
  id: string;
  failed?: boolean;
};

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Hi, I’m Ask Athena. I can help explain proposal sections, revision feedback, research calls, and how to use ATHENA.',
};

const suggestions = [
  'What should I prepare before submitting?',
  'Explain the common proposal sections.',
  'How should I respond to revision feedback?',
];

const hiddenRoutes = new Set(['/', '/login']);

function makeMessageId(role: ChatMessage['role']) {
  return `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function AssistantAvatar({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.avatar, compact && styles.avatarCompact]}>
      <Ionicons name="sparkles" size={compact ? 14 : 18} color="#FFFFFF" />
    </View>
  );
}

export function AthenaAssistant() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const isVeryWide = width >= 980;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [isReplying, setIsReplying] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const requestController = useRef<AbortController | null>(null);

  const hidden = hiddenRoutes.has(pathname);

  useEffect(() => {
    if (hidden) {
      setOpen(false);
    }
  }, [hidden]);

  useEffect(
    () => () => {
      requestController.current?.abort();
    },
    [],
  );

  if (hidden) {
    return null;
  }

  const clearConversation = () => {
    requestController.current?.abort();
    requestController.current = null;
    setIsReplying(false);
    setMessages([welcomeMessage]);
    setInput('');
  };

  const sendMessage = async (suggestedMessage?: string) => {
    const content = (suggestedMessage ?? input).trim();

    if (!content || isReplying) {
      return;
    }

    const userMessage: ChatMessage = {
      id: makeMessageId('user'),
      role: 'user',
      content,
    };
    const conversation = [
      ...messages.filter((message) => message.id !== 'welcome' && !message.failed),
      userMessage,
    ].slice(-12);

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsReplying(true);

    const controller = new AbortController();
    requestController.current = controller;

    try {
      const result = await requestAssistantReply(
        conversation.map(({ role, content: messageContent }) => ({
          role,
          content: messageContent,
        })),
        controller.signal,
      );

      setMessages((current) => [
        ...current,
        {
          id: makeMessageId('assistant'),
          role: 'assistant',
          content: result.message.content,
        },
      ]);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      setMessages((current) => [
        ...current,
        {
          id: makeMessageId('assistant'),
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Ask Athena is unavailable right now.',
          failed: true,
        },
      ]);
    } finally {
      if (requestController.current === controller) {
        requestController.current = null;
        setIsReplying(false);
      }
    }
  };

  if (!user) return null;

  return (
    <>
      <Animated.View
        entering={FadeIn.duration(180).reduceMotion(ReduceMotion.System)}
        exiting={FadeOut.duration(120).reduceMotion(ReduceMotion.System)}
        style={[
          styles.launcherWrap,
          {
            bottom: Math.max(insets.bottom + 18, 24),
            right: isWide ? 28 : 18,
          },
        ]}>
        <Pressable
          accessibilityLabel="Open Ask Athena"
          accessibilityRole="button"
          onPress={() => setOpen(true)}
          style={({ pressed }) => [
            styles.launcher,
            !isWide && styles.launcherCompact,
            {
              backgroundColor: pressed ? colors.primaryPressed : colors.primary,
              opacity: pressed ? 0.92 : 1,
              shadowColor: colors.shadow,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}>
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          {isWide && <Text style={styles.launcherText}>Ask Athena</Text>}
        </Pressable>
      </Animated.View>

      <Modal
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
        transparent
        visible={open}>
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Close Ask Athena"
            onPress={() => setOpen(false)}
            style={[styles.scrim, { backgroundColor: isDark ? '#020714B8' : '#25101470' }]}
          />

          <KeyboardAvoidingView
            behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
            pointerEvents="box-none"
            style={[
              styles.panelPosition,
              isWide ? styles.panelPositionWide : styles.panelPositionCompact,
              isVeryWide && styles.panelPositionVeryWide,
            ]}>
            <Animated.View
              entering={FadeIn.duration(180).reduceMotion(ReduceMotion.System)}
              style={[
                styles.panel,
                isWide ? styles.panelWide : styles.panelCompact,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  paddingBottom: isWide ? 0 : insets.bottom,
                  paddingTop: isWide ? 0 : insets.top,
                  shadowColor: colors.shadow,
                },
              ]}>
              <View
                style={[
                  styles.header,
                  { backgroundColor: colors.surface, borderBottomColor: colors.border },
                ]}>
                <AssistantAvatar />
                <View style={styles.headerCopy}>
                  <Text selectable style={[styles.headerTitle, { color: colors.text }]}>Ask Athena</Text>
                  <View style={styles.statusRow}>
                    <View style={styles.statusDot} />
                    <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Research support assistant</Text>
                  </View>
                </View>
                {messages.length > 1 && (
                  <Pressable
                    accessibilityLabel="Clear conversation"
                    hitSlop={8}
                    onPress={clearConversation}
                    style={({ pressed }) => [
                      styles.headerButton,
                      { backgroundColor: colors.surfaceMuted, opacity: pressed ? 0.58 : 1 },
                    ]}>
                    <Ionicons name="refresh" size={18} color={colors.textMuted} />
                  </Pressable>
                )}
                <Pressable
                  accessibilityLabel="Close Ask Athena"
                  hitSlop={8}
                  onPress={() => setOpen(false)}
                  style={({ pressed }) => [
                    styles.headerButton,
                    { backgroundColor: colors.surfaceMuted, opacity: pressed ? 0.58 : 1 },
                  ]}>
                  <Ionicons name="close" size={21} color={colors.text} />
                </Pressable>
              </View>

              <ScrollView
                contentContainerStyle={styles.messagesContent}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                ref={scrollRef}
                showsVerticalScrollIndicator={false}>
                <View
                  style={[
                    styles.contextCard,
                    { backgroundColor: colors.primarySoft, borderColor: colors.border },
                  ]}>
                  <Ionicons name="shield-checkmark-outline" size={17} color={colors.primary} />
                  <Text style={[styles.contextText, { color: colors.textMuted }]}>AI assistant · Avoid sharing confidential research or personal data.</Text>
                </View>

                {messages.map((message) => {
                  const assistant = message.role === 'assistant';

                  return (
                    <Animated.View
                      entering={FadeIn.duration(160).reduceMotion(ReduceMotion.System)}
                      key={message.id}
                      style={[
                        styles.messageRow,
                        !assistant && styles.messageRowUser,
                      ]}>
                      {assistant && <AssistantAvatar compact />}
                      <View
                        style={[
                          styles.messageBubble,
                          assistant ? styles.assistantBubble : styles.userBubble,
                          {
                            backgroundColor: assistant
                              ? message.failed
                                ? colors.primarySoft
                                : colors.surface
                              : colors.primary,
                            borderColor: message.failed ? colors.primary : colors.border,
                          },
                        ]}>
                        <Text
                          selectable
                          style={[
                            styles.messageText,
                            { color: assistant ? colors.text : '#FFFFFF' },
                          ]}>
                          {message.content}
                        </Text>
                      </View>
                    </Animated.View>
                  );
                })}

                {messages.length === 1 && (
                  <View style={styles.suggestions}>
                    <Text style={[styles.suggestionsLabel, { color: colors.textMuted }]}>TRY ASKING</Text>
                    {suggestions.map((suggestion) => (
                      <Pressable
                        accessibilityRole="button"
                        disabled={isReplying}
                        key={suggestion}
                        onPress={() => sendMessage(suggestion)}
                        style={({ pressed }) => [
                          styles.suggestion,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                            opacity: pressed ? 0.68 : 1,
                          },
                        ]}>
                        <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion}</Text>
                        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                      </Pressable>
                    ))}
                  </View>
                )}

                {isReplying && (
                  <Animated.View
                    entering={FadeIn.duration(160).reduceMotion(ReduceMotion.System)}
                    style={styles.messageRow}>
                    <AssistantAvatar compact />
                    <View
                      style={[
                        styles.typingBubble,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}>
                      <ActivityIndicator color={colors.primary} size="small" />
                      <Text style={[styles.typingText, { color: colors.textMuted }]}>Athena is thinking…</Text>
                    </View>
                  </Animated.View>
                )}
              </ScrollView>

              <View
                style={[
                  styles.composerArea,
                  { backgroundColor: colors.surface, borderTopColor: colors.border },
                ]}>
                <View
                  style={[
                    styles.composer,
                    { backgroundColor: colors.background, borderColor: colors.border },
                  ]}>
                  <TextInput
                    accessibilityLabel="Message Ask Athena"
                    editable={!isReplying}
                    maxLength={2000}
                    multiline
                    onChangeText={setInput}
                    placeholder="Ask about proposals or ATHENA…"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, { color: colors.text }]}
                    value={input}
                  />
                  <Pressable
                    accessibilityLabel="Send message"
                    accessibilityRole="button"
                    disabled={!input.trim() || isReplying}
                    onPress={() => sendMessage()}
                    style={({ pressed }) => [
                      styles.sendButton,
                      {
                        backgroundColor: input.trim() && !isReplying ? colors.primary : colors.border,
                        opacity: pressed ? 0.72 : 1,
                      },
                    ]}>
                    <Ionicons name="arrow-up" size={19} color="#FFFFFF" />
                  </Pressable>
                </View>
                <Text style={[styles.disclaimer, { color: colors.textMuted }]}>AI can make mistakes. Verify official university requirements.</Text>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  launcherWrap: { position: 'absolute', zIndex: 30 },
  launcher: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 22,
    flexDirection: 'row',
    gap: 9,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
  },
  launcherCompact: { borderRadius: 27, height: 54, paddingHorizontal: 0, width: 54 },
  launcherText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  modalRoot: { flex: 1 },
  scrim: { ...StyleSheet.absoluteFillObject },
  panelPosition: { position: 'absolute' },
  panelPositionWide: { bottom: 14, right: 14, top: 14, width: 430 },
  panelPositionVeryWide: { bottom: 18, right: 18, top: 18, width: 450 },
  panelPositionCompact: { bottom: 0, left: 0, right: 0, top: 0 },
  panel: {
    borderCurve: 'continuous',
    borderWidth: 1,
    elevation: 18,
    flex: 1,
    overflow: 'hidden',
    shadowOffset: { width: -8, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
  },
  panelWide: { borderRadius: 26 },
  panelCompact: { borderRadius: 0, borderWidth: 0 },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#B20D30',
    borderRadius: 17,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  avatarCompact: { borderRadius: 13, height: 27, width: 27 },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: '800' },
  statusRow: { alignItems: 'center', flexDirection: 'row', gap: 6, paddingTop: 3 },
  statusDot: { backgroundColor: '#2EAE67', borderRadius: 4, height: 7, width: 7 },
  headerSubtitle: { fontSize: 10, fontWeight: '600' },
  headerButton: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  messagesContent: { gap: 18, padding: 17, paddingBottom: 26 },
  contextCard: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  contextText: { flex: 1, fontSize: 10, lineHeight: 15 },
  messageRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 9 },
  messageRowUser: { justifyContent: 'flex-end' },
  messageBubble: {
    borderCurve: 'continuous',
    borderWidth: 1,
    maxWidth: '84%',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  assistantBubble: { borderBottomLeftRadius: 6, borderRadius: 17 },
  userBubble: { borderBottomRightRadius: 6, borderRadius: 17 },
  messageText: { fontSize: 13, lineHeight: 20 },
  suggestions: { gap: 9, paddingLeft: 36, paddingTop: 2 },
  suggestionsLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1, paddingBottom: 2 },
  suggestion: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  suggestionText: { flex: 1, fontSize: 11, fontWeight: '600', lineHeight: 16 },
  typingBubble: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 16,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  typingText: { fontSize: 11, fontWeight: '600' },
  composerArea: { borderTopWidth: 1, gap: 8, paddingHorizontal: 14, paddingVertical: 12 },
  composer: {
    alignItems: 'flex-end',
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 52,
    paddingBottom: 7,
    paddingLeft: 14,
    paddingRight: 7,
    paddingTop: 7,
  },
  input: { flex: 1, fontSize: 13, lineHeight: 19, maxHeight: 116, minHeight: 36, paddingVertical: 8 },
  sendButton: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  disclaimer: { fontSize: 8.5, textAlign: 'center' },
});

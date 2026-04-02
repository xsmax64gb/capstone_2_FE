"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Brain,
  CheckCircle2,
  Loader2,
  MessageSquareText,
  Mic,
  MicOff,
  Radio,
  RotateCcw,
  SendHorizontal,
  Sparkles,
  Swords,
  Target,
  Volume2,
  VolumeX,
  Waves,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type {
  LearnBossBattleState,
  LearnMessage,
  LearnStep,
} from "@/lib/api/learnApi";
import { handleApiError } from "@/lib/api-error-handler";
import { useI18n } from "@/lib/i18n/context";
import {
  useEvaluateLearnMessageMutation,
  useEndLearnConversationMutation,
  useSendLearnMessageQuickMutation,
  useStartLearnConversationMutation,
} from "@/lib/api/learnApi";

type Props = {
  slug: string;
  step: LearnStep;
};

type VoiceCapabilities = {
  recognition: boolean;
  synthesis: boolean;
};

type StepChatMessage = LearnMessage & {
  pendingEvaluation?: boolean;
  pendingRequestId?: string;
};

type SpeechRecognitionAlternativeLike = { transcript: string };
type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
  length: number;
};
type SpeechRecognitionEventLike = Event & {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};
type SpeechRecognitionErrorEventLike = Event & { error?: string };
type BrowserSpeechRecognition = EventTarget & {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: ((event: Event) => void) | null;
};
type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}

function getRecognitionConstructor() {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

type PairTextPicker = (vi: string, en: string) => string;

function translateSpeechError(error: string | undefined, pick: PairTextPicker) {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return pick(
        "Trình duyệt đang chặn micro. Hãy cấp quyền microphone rồi thử lại.",
        "The browser is blocking the microphone. Please allow microphone access and try again.",
      );
    case "audio-capture":
      return pick(
        "Không tìm thấy microphone khả dụng trên thiết bị này.",
        "No working microphone was found on this device.",
      );
    case "network":
      return pick(
        "Nhận diện giọng nói cần mạng ổn định. Hãy thử lại.",
        "Speech recognition needs a stable network connection. Please try again.",
      );
    case "no-speech":
      return pick(
        "Không nghe thấy giọng nói. Nói gần micro hơn một chút.",
        "No speech was detected. Please speak a bit closer to the microphone.",
      );
    default:
      return pick(
        "Không thể bật voice input lúc này.",
        "Voice input cannot be started right now.",
      );
  }
}

function compactDisplayLabel(value: string, maxLength = 32) {
  const normalized = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return "";
  }

  const firstSentence = normalized.split(/[.!?]/)[0]?.trim() || normalized;
  const candidate = firstSentence || normalized;

  if (candidate.length <= maxLength) {
    return candidate;
  }

  return `${candidate.slice(0, maxLength - 1).trimEnd()}…`;
}

function getTeacherName(
  step: LearnStep,
  boss: LearnBossBattleState | null,
  pick: PairTextPicker,
) {
  if (boss?.bossName) return compactDisplayLabel(boss.bossName, 28);
  if (step.aiPersona?.trim()) return compactDisplayLabel(step.aiPersona.trim());
  return step.type === "boss"
    ? pick("Giáo viên boss", "Boss Teacher")
    : pick("Giáo viên AI", "AI Teacher");
}

function getLatestAiMessage(messages: StepChatMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === "ai") return messages[index];
  }
  return null;
}

function getStartConversationErrorMessage(
  error: unknown,
  pick: PairTextPicker,
) {
  const apiError = handleApiError(error);

  if (apiError.message === "Complete earlier steps first") {
    return pick(
      "Bạn cần hoàn thành bước hiện tại trước khi mở bước này.",
      "You need to finish your current step before opening this one.",
    );
  }

  if (apiError.message === "Finish or abandon current attempt first") {
    return pick(
      "Bạn đang có một phiên học chưa kết thúc ở bước này.",
      "You still have an unfinished lesson session on this step.",
    );
  }

  if (apiError.message === "Map not available") {
    return pick(
      "Bản đồ này hiện chưa khả dụng.",
      "This map is not available right now.",
    );
  }

  if (apiError.message === "Map locked") {
    return pick("Bản đồ này đang bị khóa.", "This map is currently locked.");
  }

  if (apiError.message === "Step not found") {
    return pick(
      "Không tìm thấy bước học.",
      "The lesson step could not be found.",
    );
  }

  if (apiError.status === 401) {
    return pick(
      "Bạn cần đăng nhập lại để tiếp tục.",
      "You need to sign in again to continue.",
    );
  }

  if (apiError.status === 403) {
    return pick(
      "Bạn chưa thể truy cập bước học này.",
      "You cannot access this lesson step yet.",
    );
  }

  if (apiError.status === 404) {
    return pick(
      "Không tìm thấy dữ liệu phiên học.",
      "The lesson session data could not be found.",
    );
  }

  if (apiError.status === 409) {
    return pick(
      "Phiên học hiện đang xung đột trạng thái.",
      "The lesson session is currently in a conflicting state.",
    );
  }

  if (apiError.status >= 500 || apiError.status === 0) {
    return pick(
      "Máy chủ đang lỗi hoặc không thể kết nối.",
      "The server has an issue or cannot be reached.",
    );
  }

  return pick(
    "Không thể bắt đầu phiên học.",
    "Unable to start the lesson session.",
  );
}

function Meter({
  label,
  value,
  progress,
  tone,
}: {
  label: string;
  value: string;
  progress: number;
  tone: "dark" | "emerald" | "violet";
}) {
  const barClass =
    tone === "emerald"
      ? "bg-emerald-500"
      : tone === "violet"
        ? "bg-violet-500"
        : "bg-slate-900";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
        <p className="text-sm font-bold text-slate-900">{value}</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barClass}`}
          style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
        />
      </div>
    </div>
  );
}

export function LearnStepClient({ slug, step }: Props) {
  const { lang } = useI18n();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<StepChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [boss, setBoss] = useState<LearnBossBattleState | null>(null);
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(true);
  const [startError, setStartError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [endError, setEndError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const [ended, setEnded] = useState<{
    passed: boolean;
    feedback: string;
    score: number | null;
    xp: number;
    requiredScore?: number;
    mapCompleted?: boolean;
    currentMapXP?: number;
    requiredMapXP?: number;
    replayAttempt?: boolean;
  } | null>(null);
  const [voice, setVoice] = useState<VoiceCapabilities>({
    recognition: false,
    synthesis: false,
  });
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const lastSpokenMessageIdRef = useRef<string | null>(null);

  const [startConversation] = useStartLearnConversationMutation();
  const [sendQuickMessage] = useSendLearnMessageQuickMutation();
  const [evaluateMessage] = useEvaluateLearnMessageMutation();
  const [endConversation] = useEndLearnConversationMutation();

  const bi = (vi: string, en: string) => (lang === "vi" ? vi : en);
  const teacherName = getTeacherName(step, boss, bi);
  const latestAiMessage = getLatestAiMessage(messages);
  const focusItems = [
    step.scenarioTitle,
    ...(step.passCriteria ?? []).slice(0, 2),
    ...(step.vocabularyFocus ?? []).slice(0, 2),
    ...(step.grammarFocus ?? []).slice(0, 1),
  ].filter(Boolean) as string[];
  const learnerTurns = messages.filter(
    (message) => message.role === "user",
  ).length;
  const minTurns = step.minTurns ?? (step.type === "boss" ? 4 : 3);
  const turnProgress = Math.min(
    100,
    (learnerTurns / Math.max(minTurns, 1)) * 100,
  );

  const stopSpeaking = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setIsSpeaking(false);
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  };

  const replayAiLine = (content: string) => {
    if (!voice.synthesis || typeof window === "undefined" || !content.trim())
      return;
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = "en-US";
    utterance.rate = 0.96;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  const stopListening = (mode: "stop" | "abort" = "stop") => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      if (mode === "abort") recognition.abort();
      else recognition.stop();
    } catch {
      /* ignore */
    }
  };

  const startListening = () => {
    const RecognitionCtor = getRecognitionConstructor();
    if (!RecognitionCtor) {
      setSpeechError(
        bi(
          "Trình duyệt này chưa hỗ trợ speech-to-text.",
          "This browser does not support speech-to-text yet.",
        ),
      );
      return;
    }
    if (isListening) {
      stopListening("stop");
      return;
    }

    setSpeechError(null);
    setInterimTranscript("");
    if (!recognitionRef.current) recognitionRef.current = new RecognitionCtor();

    const recognition = recognitionRef.current;
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError(null);
    };
    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];
        const transcript = result[0]?.transcript?.trim();
        if (!transcript) continue;
        if (result.isFinal) finalText += `${transcript} `;
        else interimText += `${transcript} `;
      }
      if (finalText.trim()) {
        setInput((current) =>
          [current.trim(), finalText.trim()].filter(Boolean).join(" "),
        );
      }
      setInterimTranscript(interimText.trim());
    };
    recognition.onerror = (event) => {
      if (event.error !== "aborted")
        setSpeechError(translateSpeechError(event.error, bi));
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch {
      setSpeechError(
        bi(
          "Trình duyệt chưa thể bật micro. Hãy thử lại.",
          "The browser could not start the microphone. Please try again.",
        ),
      );
    }
  };

  const evaluateMessageInBackground = async (
    currentConversationId: string,
    targetMessageId: string,
  ) => {
    try {
      const response = await evaluateMessage({
        conversationId: currentConversationId,
        messageId: targetMessageId,
      }).unwrap();

      setMessages((current) =>
        current.map((message) =>
          message.id === targetMessageId
            ? {
                ...message,
                ...response.userMessage,
                pendingEvaluation: false,
                pendingRequestId: undefined,
              }
            : message,
        ),
      );

      const nextBoss = response.bossBattle;
      if (nextBoss) {
        setBoss((current) => ({
          ...nextBoss,
          tasks: nextBoss.tasks ?? current?.tasks ?? [],
        }));
      }
    } catch {
      setMessages((current) =>
        current.map((message) =>
          message.id === targetMessageId
            ? {
                ...message,
                pendingEvaluation: false,
                pendingRequestId: undefined,
              }
            : message,
        ),
      );
    }
  };

  const handleSend = async () => {
    const text = [input.trim(), interimTranscript.trim()]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (!text || !conversationId || sending || ended) return;

    const pendingRequestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimisticUserMessage: StepChatMessage = {
      id: `tmp-user-${pendingRequestId}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      pendingEvaluation: true,
      pendingRequestId,
    };

    setSending(true);
    setSendError(null);
    stopListening("abort");
    setInput("");
    setInterimTranscript("");
    setMessages((current) => [...current, optimisticUserMessage]);

    try {
      const response = await sendQuickMessage({
        conversationId,
        content: text,
      }).unwrap();
      setMessages((current) => {
        const nextMessages = current.filter(
          (message) => message.pendingRequestId !== pendingRequestId,
        );

        nextMessages.push({
          ...response.userMessage,
          pendingEvaluation: true,
        });

        if (response.assistantMessage) {
          nextMessages.push(response.assistantMessage);
        }

        return nextMessages;
      });

      if (response.userMessage?.id) {
        void evaluateMessageInBackground(
          conversationId,
          response.userMessage.id,
        );
      }
    } catch (error) {
      const apiError = handleApiError(error);
      setMessages((current) =>
        current.filter(
          (message) => message.pendingRequestId !== pendingRequestId,
        ),
      );
      setInput(text);
      setSendError(
        apiError.status === 401
          ? bi(
              "Bạn cần đăng nhập lại để tiếp tục gửi câu trả lời.",
              "Please sign in again before sending your answer.",
            )
          : bi(
              "Không thể gửi câu trả lời lúc này. Hãy thử lại.",
              "Unable to send your answer right now. Please try again.",
            ),
      );
    } finally {
      setSending(false);
    }
  };

  const handleEnd = async () => {
    if (!conversationId || ended || ending) return;
    stopListening("abort");
    stopSpeaking();
    setEnding(true);
    setEndError(null);

    try {
      const response = await endConversation(conversationId).unwrap();
      setEnded({
        passed: response.passed ?? false,
        feedback: response.conversation?.aiFeedback ?? "",
        score: response.conversation?.score ?? null,
        xp: response.conversation?.xpEarned ?? 0,
        requiredScore: response.requiredScore,
        mapCompleted: response.mapCompleted,
        currentMapXP: response.currentMapXP,
        requiredMapXP: response.requiredMapXP,
        replayAttempt: response.replayAttempt,
      });
      setEnding(false);
    } catch (error) {
      const apiError = handleApiError(error);
      setEndError(
        apiError.status === 401
          ? bi(
              "Bạn cần đăng nhập lại để chấm điểm buổi học.",
              "Please sign in again before grading this lesson.",
            )
          : bi(
              "Chưa thể chấm điểm lúc này. Hãy thử lại.",
              "Unable to grade this lesson right now. Please try again.",
            ),
      );
    } finally {
      // State already updated in try block
    }
  };

  useEffect(() => {
    setVoice({
      recognition: Boolean(getRecognitionConstructor()),
      synthesis:
        typeof window !== "undefined" &&
        "speechSynthesis" in window &&
        typeof SpeechSynthesisUtterance !== "undefined",
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    setStarting(true);
    setConversationId(null);
    setMessages([]);
    setInput("");
    setBoss(null);
    setStartError(null);
    setSendError(null);
    setEndError(null);
    setEnding(false);
    setEnded(null);
    setSpeechError(null);
    setInterimTranscript("");
    lastSpokenMessageIdRef.current = null;
    stopListening("abort");
    stopSpeaking();
    (async () => {
      try {
        const response = await startConversation(step.id).unwrap();
        if (cancelled) return;
        setConversationId(response.conversation.id);
        setMessages(response.messages);
        setBoss(
          response.bossBattle
            ? { ...response.bossBattle, tasks: response.bossBattle.tasks ?? [] }
            : null,
        );
      } catch (error) {
        if (!cancelled) {
          setStartError(getStartConversationErrorMessage(error, bi));
          setStarting(false);
        }
        return;
      }

      if (!cancelled) setStarting(false);
    })();

    return () => {
      cancelled = true;
      stopListening("abort");
      stopSpeaking();
    };
  }, [startConversation, step.id]);

  useEffect(() => {
    if (!transcriptRef.current) return;
    const viewport = transcriptRef.current;
    const rafId = requestAnimationFrame(() => {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(rafId);
  }, [interimTranscript, messages]);

  useEffect(() => {
    if (!autoSpeak || !latestAiMessage || !voice.synthesis) return;
    if (lastSpokenMessageIdRef.current === latestAiMessage.id) return;
    lastSpokenMessageIdRef.current = latestAiMessage.id;
    replayAiLine(latestAiMessage.content);
  }, [autoSpeak, latestAiMessage, voice.synthesis]);

  if (starting) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-600">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <p className="text-lg font-bold text-slate-900">
          {bi("Đang chuẩn bị buổi học nói…", "Preparing the speaking lesson…")}
        </p>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-sm text-red-800 shadow-sm">
        {startError ||
          bi(
            "Không thể bắt đầu phiên học.",
            "Unable to start the lesson session.",
          )}
        <div className="mt-4">
          <Link href={`/learn/${slug}`} className="font-semibold underline">
            {bi("Quay lại bản đồ", "Back to map")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
                <Sparkles className="h-3.5 w-3.5" />
                {step.type === "boss"
                  ? bi("Thử thách boss", "Boss speaking check")
                  : bi("Bài học nói", "Voice lesson")}
              </Badge>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                {teacherName}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {step.scenarioContext?.trim() ||
                  bi(
                    "Luyện nói tự nhiên, trả lời rõ ràng và phản hồi như một cuộc hội thoại thật.",
                    "Practice naturally, keep your answers clear, and respond like a real conversation.",
                  )}
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/10">
              <Bot className="h-8 w-8" />
            </div>
          </div>

          <div className="mt-6 flex items-end gap-1.5">
            {[18, 34, 52, 68, 52, 34, 18].map((height, index) => (
              <span
                key={`wave-${height}-${index}`}
                className={`w-1.5 rounded-full bg-white/90 transition-all ${isListening || isSpeaking ? "animate-pulse" : "opacity-55"}`}
                style={{ height }}
              />
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                {bi("Chế độ", "Mode")}
              </p>
              <p className="mt-1 text-sm font-semibold">
                {voice.recognition
                  ? bi("Ưu tiên giọng nói", "Voice first")
                  : bi("Dùng văn bản thay thế", "Text fallback")}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                {bi("Trạng thái", "Status")}
              </p>
              <p className="mt-1 text-sm font-semibold">
                {isListening
                  ? bi("Đang nghe…", "Listening…")
                  : isSpeaking
                    ? bi("AI đang nói…", "AI speaking…")
                    : bi("Sẵn sàng", "Ready")}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Target className="h-4 w-4" />
            {bi("Tóm tắt buổi học", "Session brief")}
          </div>
          <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
            {step.title}
          </h3>
          {step.scenarioTitle && (
            <p className="mt-1 text-sm text-slate-500">{step.scenarioTitle}</p>
          )}
          <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
            {step.openingMessage?.trim() ||
              step.scenarioContext?.trim() ||
              bi(
                "Hãy bắt đầu bằng cách trả lời tự nhiên bằng tiếng Anh.",
                "Start by answering naturally in English.",
              )}
          </p>
          {focusItems.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {focusItems.map((item, index) => (
                <Badge
                  key={`${item}-${index}`}
                  variant="outline"
                  className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-slate-600"
                >
                  {item}
                </Badge>
              ))}
            </div>
          ) : null}
          <div className="mt-4 grid gap-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">
                {bi("Độ khó chấm", "Grading difficulty")}
              </p>
              <p className="mt-1">
                {(step.gradingDifficulty || "medium").toUpperCase()} ·{" "}
                {bi("Điểm pass", "Pass score")}{" "}
                {step.minimumPassScore ?? bi("tự động", "auto")}
              </p>
            </div>
            {step.grammarFocus?.length ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">
                  {bi("Ngữ pháp cần tập trung", "Grammar focus")}
                </p>
                <p className="mt-1">{step.grammarFocus.join(", ")}</p>
              </div>
            ) : null}
            {step.scenarioScript?.trim() ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">
                  {bi("Kịch bản", "Scenario script")}
                </p>
                <p className="mt-1 whitespace-pre-wrap leading-6">
                  {step.scenarioScript}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <Meter
            label={bi("Lượt của bạn", "Your turns")}
            value={`${learnerTurns}/${minTurns}`}
            progress={turnProgress}
            tone="dark"
          />
          <Meter
            label={bi("XP nhận được", "XP reward")}
            value={`+${step.xpReward ?? 0}`}
            progress={Math.min(100, ((step.xpReward ?? 0) / 40) * 100)}
            tone="emerald"
          />
        </div>

        {step.type === "boss" && boss && !ended ? (
          <section className="rounded-[28px] border border-violet-200 bg-violet-50 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-violet-900">
              <Swords className="h-4 w-4" />
              {bi("Trận boss", "Boss battle")}
            </div>
            <div className="mt-4 space-y-4">
              <Meter
                label={bi("Máu boss", "Boss HP")}
                value={`${boss.bossHPCurrent}/${boss.bossHPMax}`}
                progress={
                  (boss.bossHPCurrent / Math.max(boss.bossHPMax, 1)) * 100
                }
                tone="violet"
              />
              <Meter
                label={bi("Máu của bạn", "Your HP")}
                value={`${boss.playerHPCurrent}/${boss.playerHPMax}`}
                progress={
                  (boss.playerHPCurrent / Math.max(boss.playerHPMax, 1)) * 100
                }
                tone="emerald"
              />
            </div>
            {boss.tasks?.length ? (
              <ul className="mt-4 space-y-2 text-sm text-violet-950">
                {boss.tasks.map((task) => (
                  <li key={task.id} className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 ${task.completed ? "text-emerald-600" : "text-violet-400"}`}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                    </span>
                    <span>{task.description}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}
      </aside>

      <section className="space-y-4">
        <div className="rounded-[32px] border border-slate-200 bg-white shadow-xl">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-slate-600"
                >
                  <MessageSquareText className="h-3.5 w-3.5" />
                  {bi("Phiên âm trực tiếp", "Live transcript")}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-slate-600"
                >
                  <Waves className="h-3.5 w-3.5" />
                  {bi("Nói tiếng Anh", "English only")}
                </Badge>
              </div>
              <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-900">
                {bi("Trò chuyện với giáo viên AI", "Talk to your AI teacher")}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {bi(
                  "Nói tự nhiên, theo dõi phiên âm, rồi gửi câu trả lời tốt nhất để nhận phản hồi.",
                  "Speak naturally, watch the transcript, then send your best answer for feedback.",
                )}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {bi("Giáo viên", "Teacher")}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {teacherName}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {bi("Mục tiêu", "Goal")}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {bi(
                    `${minTurns}+ lượt nói của bạn`,
                    `${minTurns}+ learner turns`,
                  )}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {bi("Giọng nói", "Voice")}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {voice.recognition
                    ? bi("Mic sẵn sàng", "Mic ready")
                    : bi("Chỉ nhập chữ", "Type only")}
                </p>
              </div>
            </div>
          </div>

          <div
            ref={transcriptRef}
            className="max-h-[52vh] space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(241,245,249,0.9),_transparent_48%)] px-5 py-5 md:px-6"
          >
            {messages.map((message) => {
              const isAi = message.role === "ai";

              return (
                <div
                  key={message.id}
                  className={`flex ${isAi ? "justify-start" : "justify-end"}`}
                >
                  <article
                    className={`max-w-[92%] rounded-[26px] border px-4 py-4 shadow-sm md:max-w-[80%] ${isAi ? "border-slate-200 bg-white text-slate-900" : "border-slate-900 bg-slate-900 text-white"}`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          isAi
                            ? "border-slate-200 bg-slate-50 text-slate-600"
                            : "border-white/20 bg-white/10 text-white"
                        }
                      >
                        {isAi ? teacherName : bi("Bạn", "You")}
                      </Badge>
                      {isAi && (
                        <button
                          type="button"
                          onClick={() => replayAiLine(message.content)}
                          disabled={!voice.synthesis}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={bi("Nghe lại câu AI", "Replay AI line")}
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      )}
                      {message.pendingEvaluation ? (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${isAi ? "text-slate-400" : "text-slate-200"}`}
                        >
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          {bi("Đang chấm...", "Scoring...")}
                        </span>
                      ) : (
                        message.evaluationScore != null && (
                          <span
                            className={`text-xs font-semibold ${isAi ? "text-slate-400" : "text-slate-200"}`}
                          >
                            {bi("Điểm", "Score")} {message.evaluationScore}
                          </span>
                        )
                      )}
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {message.content}
                    </p>

                    {message.grammarErrors?.length ? (
                      <div
                        className={`mt-3 rounded-2xl border px-3 py-2 text-xs ${isAi ? "border-amber-200 bg-amber-50 text-amber-900" : "border-white/10 bg-white/10 text-slate-100"}`}
                      >
                        <p className="font-semibold">
                          {bi("Điểm cần sửa", "Things to fix")}
                        </p>
                        <ul className="mt-1 space-y-1">
                          {message.grammarErrors
                            .slice(0, 2)
                            .map((item, index) => (
                              <li key={`${message.id}-grammar-${index}`}>
                                {item.message}{" "}
                                {item.span ? `(${item.span})` : ""}
                              </li>
                            ))}
                        </ul>
                      </div>
                    ) : null}

                    {!isAi && message.suggestion && (
                      <div
                        className={`mt-3 rounded-2xl border px-3 py-2 text-xs ${
                          message.grammarErrors?.length
                            ? "border-white/10 bg-white/10 text-slate-100"
                            : "border-emerald-300/30 bg-emerald-500/10 text-emerald-100"
                        }`}
                      >
                        <p className="font-semibold">
                          {message.grammarErrors?.length
                            ? bi("Bản tốt hơn", "Better version")
                            : bi("Khen ngợi", "Praise")}
                        </p>
                        <p className="mt-1 leading-5">{message.suggestion}</p>
                      </div>
                    )}
                  </article>
                </div>
              );
            })}

            {isListening && interimTranscript && (
              <div className="flex justify-end">
                <div className="max-w-[92%] rounded-[26px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 md:max-w-[80%]">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    <Radio className="h-3.5 w-3.5 animate-pulse" />
                    {bi("Phiên âm trực tiếp", "Live transcript")}
                  </div>
                  <p className="leading-6">{interimTranscript}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {ended || ending ? (
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl">
            {ending && !ended ? (
              <>
                <Badge className="rounded-full bg-slate-900 px-3 py-1 text-white">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {bi("Đang chấm điểm", "Grading in progress")}
                </Badge>
                <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
                  {bi(
                    "AI đang chấm buổi học của bạn",
                    "AI is grading your lesson",
                  )}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  {bi(
                    "Giao diện chấm điểm đã sẵn sàng. Hệ thống đang tổng hợp điểm và nhận xét từ AI, vui lòng đợi trong giây lát.",
                    "Your grading screen is ready. The system is now collecting the score and AI feedback, so please wait a moment.",
                  )}
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm font-semibold">
                        {bi("Đang tính điểm tổng", "Calculating final score")}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm font-semibold">
                        {bi("Đang tạo nhận xét AI", "Generating AI feedback")}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : ended ? (
              <>
                <Badge
                  className={`rounded-full px-3 py-1 ${ended.passed ? "bg-emerald-600 text-white" : "bg-slate-900 text-white"}`}
                >
                  {ended.passed
                    ? bi("Đạt", "Passed")
                    : bi("Xem lại và thử lại", "Review and retry")}
                </Badge>
                <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
                  {ended.passed
                    ? bi("Buổi học hoàn thành", "Lesson completed")
                    : bi("Phiên học đã kết thúc", "Lesson session ended")}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  {ended.feedback ||
                    bi("Không có nhận xét AI.", "No AI feedback available.")}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {ended.score != null && (
                    <Meter
                      label={bi("Điểm", "Score")}
                      value={`${ended.score}`}
                      progress={ended.score}
                      tone="dark"
                    />
                  )}
                  <Meter
                    label={bi("XP đã nhận", "XP earned")}
                    value={`+${ended.xp}`}
                    progress={Math.min(100, (ended.xp / 40) * 100)}
                    tone="emerald"
                  />
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  {ended.requiredScore != null ? (
                    <p>
                      {bi("Điểm cần để pass", "Score needed to pass")}:{" "}
                      <strong>{ended.requiredScore}</strong>
                    </p>
                  ) : null}
                  {ended.requiredMapXP != null && ended.currentMapXP != null ? (
                    <p>
                      {bi("Tiến độ map", "Map progress")}:{" "}
                      <strong>{ended.currentMapXP}</strong> /{" "}
                      <strong>{ended.requiredMapXP}</strong> XP
                    </p>
                  ) : null}
                  {ended.replayAttempt ? (
                    <p>
                      {bi(
                        "Đây là lượt ôn lại nên sẽ không mở khóa tiến độ mới.",
                        "This was a review attempt, so it does not unlock new progression.",
                      )}
                    </p>
                  ) : ended.mapCompleted ? (
                    <p>
                      {bi(
                        "Bạn đã hoàn thành map này.",
                        "You completed this map.",
                      )}
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href={`/learn/${slug}`}>
                      <ArrowLeft className="h-4 w-4" />
                      {bi("Về bản đồ", "Back to map")}
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    <RotateCcw className="h-4 w-4" />
                    {bi("Học lại bước này", "Retry this step")}
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-slate-600"
                  >
                    <Brain className="h-3.5 w-3.5" />
                    {bi("Bản nháp câu trả lời", "Draft answer")}
                  </Badge>
                  {sendError && (
                    <Badge
                      variant="outline"
                      className="rounded-full border-red-200 bg-red-50 px-3 py-1 text-red-900"
                    >
                      {sendError}
                    </Badge>
                  )}
                  {speechError && (
                    <Badge
                      variant="outline"
                      className="rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-amber-900"
                    >
                      {speechError}
                    </Badge>
                  )}
                  {endError && (
                    <Badge
                      variant="outline"
                      className="rounded-full border-red-200 bg-red-50 px-3 py-1 text-red-900"
                    >
                      {endError}
                    </Badge>
                  )}
                </div>

                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                  rows={4}
                  placeholder={bi(
                    "Nhập câu trả lời hoặc dùng micro để phiên âm hiện ở đây...",
                    "Type your answer or use the mic and let the transcript appear here...",
                  )}
                  className="mt-3 min-h-[132px] rounded-[24px] border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 shadow-none focus-visible:border-slate-400"
                />

                <p className="mt-3 text-sm text-slate-500">
                  {isListening
                    ? bi(
                        "Mic đang nghe. Hãy nói bằng tiếng Anh, phiên âm sẽ hiện ngay bên dưới.",
                        "The mic is listening. Speak in English and the transcript will appear below.",
                      )
                    : bi(
                        "Mẹo: nói 1-2 câu ngắn rồi chỉnh lại phiên âm nếu cần trước khi gửi.",
                        "Tip: say 1-2 short sentences, then edit the transcript if needed before sending.",
                      )}
                </p>

                {step.passCriteria?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {step.passCriteria.slice(0, 3).map((criterion, index) => (
                      <button
                        key={`${criterion}-${index}`}
                        type="button"
                        onClick={() => setInput(criterion)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        {criterion}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-3 xl:w-[280px]">
                <Button
                  type="button"
                  onClick={startListening}
                  disabled={!voice.recognition}
                  className={`h-14 rounded-2xl text-sm font-semibold ${isListening ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-slate-950 text-white hover:bg-slate-800"}`}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                  {isListening
                    ? bi("Dừng micro", "Stop mic")
                    : voice.recognition
                      ? bi("Bắt đầu nói", "Start speaking")
                      : bi("Không có micro", "No mic available")}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    latestAiMessage && replayAiLine(latestAiMessage.content)
                  }
                  disabled={!voice.synthesis || !latestAiMessage}
                  className="h-12 rounded-2xl border-slate-200"
                >
                  <Volume2 className="h-4 w-4" />
                  {bi("Nghe AI nói lại", "Replay AI voice")}
                </Button>

                <Button
                  type="button"
                  variant={autoSpeak ? "default" : "outline"}
                  onClick={() => {
                    setAutoSpeak((current) => !current);
                    if (autoSpeak) stopSpeaking();
                  }}
                  className={`h-12 rounded-2xl ${autoSpeak ? "bg-slate-900 text-white hover:bg-slate-800" : "border-slate-200"}`}
                >
                  {autoSpeak ? (
                    <Radio className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                  {autoSpeak
                    ? bi("Tự đọc đang bật", "Auto voice on")
                    : bi("Tự đọc đang tắt", "Auto voice off")}
                </Button>

                <Button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={
                    sending ||
                    ![input.trim(), interimTranscript.trim()]
                      .filter(Boolean)
                      .join(" ")
                      .trim()
                  }
                  className="h-12 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SendHorizontal className="h-4 w-4" />
                  )}
                  {bi("Gửi câu trả lời", "Send answer")}
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-slate-600"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {learnerTurns < minTurns
                    ? bi(
                        `Còn ${minTurns - learnerTurns} lượt để đủ mục tiêu`,
                        `${minTurns - learnerTurns} more turns to reach the goal`,
                      )
                    : bi(
                        "Đã đủ số lượt tối thiểu",
                        "Minimum number of turns reached",
                      )}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-slate-600"
                >
                  <Brain className="h-3.5 w-3.5" />
                  {bi(
                    "Tập trung vào độ trôi chảy + rõ ràng",
                    "Focus on fluency + clarity",
                  )}
                </Badge>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => void handleEnd()}
                disabled={ending}
                className="rounded-2xl border-slate-200"
              >
                {ending
                  ? bi("Đang chấm điểm...", "Grading...")
                  : bi("Kết thúc và chấm điểm", "Finish and grade")}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

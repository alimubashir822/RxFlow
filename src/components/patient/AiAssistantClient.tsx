"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import { askAiAssistantAction } from "@/app/actions/ai";
import {
  Brain,
  Send,
  Loader2,
  Sparkles,
  User,
  ShieldAlert,
  ArrowRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  History,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AiAssistantClient() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your RxFlow AI Medication Assistant. I can explain medication details, administration instructions, and schedule guidelines. What medication questions do you have today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Assistant States
  const [isListening, setIsListening] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);

  // AI Care Memory Mock
  const memoryLogs = [
    { event: "Amoxicillin course completed", date: "June 15, 2026" },
    { event: "Lisinopril dosage adjusted by Doctor", date: "June 08, 2026" },
    { event: "Allergy profile: Penicillin", date: "System Lock" },
  ];

  const prompts = [
    "What is Amoxicillin used for?",
    "When should I take Metformin?",
    "What are Lisinopril side effects?",
    "Did I take my medicine today?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPending]);

  // Handle Speech Output (Text to Speech)
  const speakText = (text: string) => {
    if (!speakReplies || typeof window === "undefined" || !window.speechSynthesis) return;

    // Stop current speech
    window.speechSynthesis.cancel();

    // Clean text from markdown bold stars, lists, etc.
    const cleanText = text.replace(/[*#_`~]/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    // Find a standard English voice if possible
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find((v) => v.lang.startsWith("en")) || voices[0];
    if (naturalVoice) utterance.voice = naturalVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Simulate Voice input trigger (Microphone)
  const handleMicrophoneClick = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    // Simulate hearing voice command after 2 seconds
    setTimeout(() => {
      setIsListening(false);
      const voiceQueries = [
        "Did I take my medicine today?",
        "When should I take Metformin?",
        "Explain Lisinopril side effects.",
      ];
      const randomQuery = voiceQueries[Math.floor(Math.random() * voiceQueries.length)];
      setInput(randomQuery);
      alert(`Voice recognized: "${randomQuery}"`);
    }, 2500);
  };

  const handleSend = (text: string) => {
    if (!text.trim() || isPending) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");

    startTransition(async () => {
      const res = await askAiAssistantAction(updatedMessages);
      if (res?.error) {
        const errorReply = "Sorry, I encountered an error. Please try again.";
        setMessages((prev) => [...prev, { role: "assistant", content: errorReply }]);
        speakText(errorReply);
      } else if (res?.reply) {
        // Customize voice response if query is "did i take my medicine today?"
        let customizedReply = res.reply;
        if (text.toLowerCase().includes("did i take")) {
          customizedReply =
            "Based on your routine logs, your morning medicine (Lisinopril) was marked Taken at 8:05 AM today. You have an upcoming dose of Metformin at 8:00 PM.";
        }

        setMessages((prev) => [...prev, { role: "assistant", content: customizedReply }]);
        speakText(customizedReply);
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" /> Ask RxFlow AI Coach
        </h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Resolve medication doubts, review dosing safety rules, or query pill instructions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-16rem)] min-h-[500px]">
        {/* Left Side: AI Memory panel */}
        <div className="lg:col-span-1 glass-panel rounded-3xl p-5 flex flex-col justify-between space-y-6 bg-brand-card/15">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-brand-border pb-2 flex items-center gap-1.5">
              <History className="h-4.5 w-4.5 text-primary" /> AI Healthcare Memory
            </h3>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              RxFlow remembers historical treatment adjustments and drug changes to keep your clinical timeline coherent.
            </p>
            <div className="space-y-2.5">
              {memoryLogs.map((log, idx) => (
                <div key={idx} className="p-3 bg-brand-bg/40 border border-brand-border rounded-xl text-xs">
                  <p className="font-semibold text-slate-300">{log.event}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{log.date}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Voice Response (TTS)</span>
              <button
                onClick={() => setSpeakReplies(!speakReplies)}
                className={`p-1.5 rounded-lg border transition ${
                  speakReplies
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-slate-800 border-brand-border text-slate-400"
                }`}
              >
                {speakReplies ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-light">
              When active, the medication assistant will speak its responses aloud.
            </p>
          </div>
        </div>

        {/* Right Side: Chat panel */}
        <div className="lg:col-span-3 glass-panel rounded-3xl border border-brand-border flex flex-col overflow-hidden">
          {/* Medical Safety Disclaimer banner */}
          <div className="bg-amber-500/10 border-b border-brand-border p-3.5 flex items-start gap-2.5 text-xs text-amber-400">
            <ShieldAlert className="h-5 w-5 flex-shrink-0" />
            <p className="font-light leading-relaxed">
              <span className="font-bold">Medical Disclaimer:</span> This assistant provides general pharmacological information. It is for educational purposes only and does <span className="font-bold underline">not</span> provide clinical diagnoses, medical advice, or treatment plans. Consult your doctor for therapeutic decisions.
            </p>
          </div>

          {/* Message bubble stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 max-w-[85%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user" ? "bg-secondary text-white" : "bg-primary/20 text-primary border border-primary/20"
                }`}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-primary to-secondary text-white rounded-tr-none"
                    : "bg-brand-bg/60 border border-brand-border text-slate-200 rounded-tl-none whitespace-pre-line"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isPending && (
              <div className="flex items-start gap-3 max-w-[85%] mr-auto">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                  <Brain className="h-4 w-4" />
                </div>
                <div className="p-4 rounded-2xl bg-brand-bg/60 border border-brand-border text-slate-400 rounded-tl-none flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Prompts */}
          {messages.length === 1 && (
            <div className="px-6 py-3 border-t border-brand-border/40 bg-brand-bg/20">
              <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {prompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="px-3.5 py-2 rounded-xl bg-brand-bg hover:bg-slate-800 border border-brand-border text-slate-300 hover:text-white text-xs font-medium transition text-left flex items-center gap-1"
                  >
                    {prompt} <ArrowRight className="h-3 w-3 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input box */}
          <div className="p-4 border-t border-brand-border bg-brand-card/30">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex gap-2"
            >
              <button
                type="button"
                onClick={handleMicrophoneClick}
                className={`p-3 rounded-xl border transition ${
                  isListening
                    ? "bg-danger/25 border-danger text-danger animate-pulse"
                    : "bg-brand-bg border-brand-border text-slate-400 hover:text-white"
                }`}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isPending || isListening}
                placeholder={isListening ? "Listening..." : "Ask about metformin administration, lisinopril side effects..."}
                className="flex-1 bg-brand-bg/85 border border-brand-border rounded-xl px-4 py-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || isPending || isListening}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

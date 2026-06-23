"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendMessageAction } from "@/app/actions/messages";
import { User, Send, MessageSquare, Loader2, Sparkles } from "lucide-react";

interface PharmacyMessagesClientProps {
  currentUserId: string;
  patients: any[];
  messages: any[];
}

export default function PharmacyMessagesClient({
  currentUserId,
  patients,
  messages,
}: PharmacyMessagesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activePatientId, setActivePatientId] = useState<string>(patients[0]?.id || "");
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find the selected patient profile
  const selectedPatient = patients.find((p) => p.id === activePatientId);
  const selectedUser = selectedPatient?.user;

  // Filter messages exchanged with the selected patient's user id
  const chatMessages = messages.filter(
    (msg) =>
      (msg.senderId === currentUserId && msg.receiverId === selectedUser?.id) ||
      (msg.senderId === selectedUser?.id && msg.receiverId === currentUserId)
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser || isPending) return;

    const messageText = input;
    setInput("");

    startTransition(async () => {
      const res = await sendMessageAction(selectedUser.id, messageText);
      if (res?.error) {
        alert(res.error);
        setInput(messageText); // restore input
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-12rem)] min-h-[500px] space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-emerald-400" /> Patient Inbox
        </h1>
        <p className="text-sm text-slate-400 font-light mt-1">
          Provide direct guidance or respond to pill refill inquiries from your patients.
        </p>
      </div>

      <div className="flex-1 glass-panel rounded-3xl border border-brand-border flex overflow-hidden">
        {/* Left Side: Patient list */}
        <div className="w-80 border-r border-brand-border flex flex-col bg-brand-card/15">
          <div className="p-4 border-b border-brand-border bg-brand-card/25">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Patients</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {patients.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-8">No registered patients found.</p>
            ) : (
              patients.map((patient) => {
                const active = patient.id === activePatientId;
                return (
                  <button
                    key={patient.id}
                    onClick={() => setActivePatientId(patient.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-left border ${
                      active
                        ? "bg-emerald-500/10 border-emerald-500/20 text-white"
                        : "bg-transparent border-transparent hover:bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      active ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
                    }`}>
                      <User className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold truncate">{patient.user.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{patient.user.email}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Chat box */}
        <div className="flex-1 flex flex-col overflow-hidden bg-brand-bg/25">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-brand-border bg-brand-card/20 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedUser.name}</h3>
                  <p className="text-[10px] text-emerald-400">Direct Patient Communication Channel</p>
                </div>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                    <MessageSquare className="h-10 w-10 text-slate-700" />
                    <p className="text-xs">No prior messages. Send a message to open communication.</p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-2.5 max-w-[80%] ${
                          isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                        }`}
                      >
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isMe ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
                        }`}>
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? "bg-emerald-500 text-slate-950 font-medium rounded-tr-none"
                            : "bg-brand-bg border border-brand-border text-slate-200 rounded-tl-none"
                        }`}>
                          {msg.content}
                          <p className={`text-[8px] mt-1 text-right ${isMe ? "text-slate-900/60" : "text-slate-500"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-brand-border bg-brand-card/30">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isPending}
                    placeholder={`Write a message to ${selectedUser.name}...`}
                    className="flex-1 bg-brand-bg/85 border border-brand-border rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isPending}
                    className="px-4 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
              <MessageSquare className="h-12 w-12 text-slate-700 mb-2" />
              <h3 className="text-sm font-bold text-slate-400">No Patient Selected</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Select a patient from the list on the left to review order details or initiate messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

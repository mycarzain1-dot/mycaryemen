import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, ImagePlus, X, Loader2, Bot, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useServerFn } from "@tanstack/react-start";
import { chatWithGemini } from "@/lib/gemini-chat.functions";

type Part = { text?: string; inlineData?: { mimeType: string; data: string } };
type Msg = { role: "user" | "model"; parts: Part[] };

function fileToBase64(file: File): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const data = result.split(",")[1];
      resolve({ data, mimeType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "model",
      parts: [{ text: "أهلاً بك! أنا زين، مساعدك الذكي في تعديل السيارات 🚗✨ ارفع صورة سيارتك أو اسألني عن أي إكسسوار." }],
    },
  ]);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const chat = useServerFn(chatWithGemini);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data, mimeType } = await fileToBase64(file);
    setPendingImage({ data, mimeType, preview: `data:${mimeType};base64,${data}` });
    e.target.value = "";
  }

  async function send() {
    if (loading) return;
    if (!input.trim() && !pendingImage) return;

    const parts: Part[] = [];
    if (pendingImage) parts.push({ inlineData: { mimeType: pendingImage.mimeType, data: pendingImage.data } });
    if (input.trim()) parts.push({ text: input.trim() });

    const userMsg: Msg = { role: "user", parts };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setPendingImage(null);
    setLoading(true);

    try {
      const { reply } = await chat({ data: { messages: next } });
      setMessages((m) => [...m, { role: "model", parts: [{ text: reply || "..." }] }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "model", parts: [{ text: "عذراً، حدث خطأ في الاتصال. حاول مرة أخرى." }] },
      ]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button - middle right */}
      <button
        onClick={() => setOpen(true)}
        aria-label="فتح المحادثة"
        className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-2xl shadow-amber-500/40 ring-2 ring-white/20 transition-all hover:scale-110 hover:shadow-amber-500/60 active:scale-95 dark:from-amber-300 dark:to-amber-500"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -left-1 h-3 w-3 animate-pulse rounded-full bg-green-500 ring-2 ring-white dark:ring-black" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[85vh] max-h-[700px] w-[95vw] max-w-md flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-white dark:from-amber-600 dark:to-amber-800">
            <DialogTitle className="flex items-center gap-3 text-white">
              <Avatar className="h-10 w-10 ring-2 ring-white/40">
                <AvatarFallback className="bg-black text-amber-400">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-base font-bold">زين للسيارات</span>
                <span className="flex items-center gap-1 text-xs font-normal opacity-90">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  متصل الآن
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-900">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={m.role === "user" ? "bg-slate-700 text-white" : "bg-amber-500 text-black"}>
                    {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "rounded-tr-sm bg-amber-500 text-black"
                      : "rounded-tl-sm bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                  }`}
                >
                  {m.parts.map((p, j) => {
                    if (p.inlineData) {
                      return (
                        <img
                          key={j}
                          src={`data:${p.inlineData.mimeType};base64,${p.inlineData.data}`}
                          alt="uploaded"
                          className="mb-2 max-h-48 rounded-lg object-cover"
                        />
                      );
                    }
                    return (
                      <div key={j} className="whitespace-pre-wrap">
                        {p.text}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-amber-500 text-black">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm dark:bg-slate-800">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">زين يكتب...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t bg-white p-3 dark:bg-slate-950">
            {pendingImage && (
              <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                <img src={pendingImage.preview} alt="preview" className="h-12 w-12 rounded object-cover" />
                <span className="flex-1 text-xs text-slate-600 dark:text-slate-300">صورة جاهزة للإرسال</span>
                <button
                  onClick={() => setPendingImage(null)}
                  className="rounded-full p-1 hover:bg-slate-200 dark:hover:bg-slate-700"
                  aria-label="إزالة الصورة"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImagePick}
                className="hidden"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                className="shrink-0 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950"
              >
                <ImagePlus className="h-5 w-5" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="اكتب رسالتك..."
                disabled={loading}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                onClick={send}
                disabled={loading || (!input.trim() && !pendingImage)}
                className="shrink-0 bg-amber-500 text-black hover:bg-amber-600"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PartSchema = z.object({
  text: z.string().optional(),
  inlineData: z
    .object({
      mimeType: z.string(),
      data: z.string(),
    })
    .optional(),
});

const MessageSchema = z.object({
  role: z.enum(["user", "model"]),
  parts: z.array(PartSchema),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1),
});

const SYSTEM_INSTRUCTION = `أنت المساعد الذكي "زين للسيارات"، خبير في تعديل السيارات وتحليل الصور والإجابة باللغة العربية.`;

export const chatWithGemini = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        reply: "❌ لم يتم العثور على GEMINI_API_KEY داخل بيئة المشروع.",
      };
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
          contents: data.messages,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const body = await response.text();

    if (!response.ok) {
      console.error(body);

      return {
        reply: `Gemini Error (${response.status})\n${body}`,
      };
    }

    const json = JSON.parse(body);

    return {
      reply:
        json.candidates?.[0]?.content?.parts
          ?.map((p: any) => p.text ?? "")
          .join("") || "لم يتم الحصول على رد.",
    };
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PartSchema = z.object({
  text: z.string().optional(),
  inlineData: z.object({
    mimeType: z.string(),
    data: z.string(),
  }).optional(),
});

const MessageSchema = z.object({
  role: z.enum(["user", "model"]),
  parts: z.array(PartSchema),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1),
});

const SYSTEM_INSTRUCTION = `
أنت المساعد الذكي "زين للسيارات"، خبير في تعديل السيارات والإكسسوارات.
أجب بالعربية وبأسلوب ودود ومختصر.
`;

export const chatWithGemini = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        reply: "❌ متغير GEMINI_API_KEY غير موجود."
      };
    }

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
          },
          contents: data.messages,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const body = await res.text();

    if (!res.ok) {
      console.error(body);
      return {
        reply: `❌ Gemini Error (${res.status})\n${body}`,
      };
    }

    const json = JSON.parse(body);

    return {
      reply:
        json.candidates?.[0]?.content?.parts
          ?.map((p: any) => p.text ?? "")
          .join("") || "لا يوجد رد.",
    };
  });

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

const SYSTEM_INSTRUCTION = `أنت المساعد الذكي 'زين للسيارات'، خبير ومصمم محترف في هندسة وتعديل السيارات بجميع أنواعها وموديلاتها.
وظيفتك الأساسية:
- استقبال صور سيارات العملاء وفهم نوعها، موديلها، لونها، والزوايا المصورة بدقة متناهية.
- تقديم نصائح تقنية وجمالية مخصصة لنوع السيارة المعروضة حول الإكسسوارات والقطع الأنسب لها (مثل الجنوط، الإضاءات، التظليل، الجناح الخلفي، الشاشات الداخلية).
- عند رفع العميل لصورة سيارته وطلب تجربة منتج معين عليها، استخدم قدراتك كنموذج بصري (Vision Model) لتحليل الصورة وإيجاد أفضل طريقة لتركيب ودمج المنتج وتعديل شكل السيارة لتبدو واقعية واحترافية بأقصى جودة ممكنة ومشاركتها مع العميل لشرح الفكرة له.
- تحدث بلغة عربية سهلة، ودودة، ومحفزة للعميل على الشراء والتعديل.`;

export const chatWithGemini = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY missing");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: data.messages,
        systemInstruction: { role: "system", parts: [{ text: SYSTEM_INSTRUCTION }] },
        generationConfig: { temperature: 0.8, maxOutputTokens: 2048 },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini API error [${res.status}]: ${text}`);
    }

    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const reply = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    return { reply };
  });

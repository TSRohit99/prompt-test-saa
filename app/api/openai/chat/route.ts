import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const apiKey = auth?.replace(/^Bearer\s+/i, "").trim();
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const body = await req.json();
    const {
      model = "gpt-4o-mini",
      systemPrompt,
      userPrompt,
      options = {},
    } = body;

    if (!systemPrompt || !userPrompt) {
      return NextResponse.json(
        { error: "systemPrompt and userPrompt are required" },
        { status: 400 }
      );
    }

    const {
      max_tokens = 4500,
      temperature = 0.8,
      response_format,
      retries = 5,
      backoffMs = 1000,
    } = options;

    const openai = new OpenAI({ apiKey });
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const request: OpenAI.Chat.ChatCompletionCreateParams = {
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens,
          temperature,
        };
        if (response_format) {
          request.response_format = response_format;
        }

        const completion = await openai.chat.completions.create(request);
        let content = completion.choices[0]?.message?.content?.trim() ?? "";
        content = content.replace(/^\s*["']|["']\s*$/g, "");

        if (!content) {
          throw new Error("Empty response from model");
        }

        return NextResponse.json({
          content,
          usage: completion.usage,
          model: completion.model,
        });
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt === retries) break;
        await new Promise((r) =>
          setTimeout(r, backoffMs * Math.pow(2, attempt - 1))
        );
      }
    }

    return NextResponse.json(
      { error: lastError?.message || "OpenAI request failed" },
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

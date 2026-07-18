const https = require("https");
const ApiError = require("../utils/ApiError");

const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const API_KEY = process.env.GEMINI_API_KEY;

const extractJson = (text) => {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fenced ? fenced[1] : text;
    const start = candidate.search(/[[{]/);
    if (start === -1) throw new ApiError(502, "AI returned an unexpected response");
    const end = Math.max(candidate.lastIndexOf("]"), candidate.lastIndexOf("}"));
    try {
      return JSON.parse(candidate.slice(start, end + 1));
    } catch {
      throw new ApiError(502, "Failed to parse AI response");
    }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const runPrompt = async (prompt, retries = 3) => {
    if (!API_KEY) throw new ApiError(503, "Gemini key is not configured on the server");

    const data = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] });
    const path = `/v1beta/models/${MODEL}:generateContent`;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const result = await new Promise((resolve, reject) => {
                const req = https.request({
                    hostname: "generativelanguage.googleapis.com",
                    path,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-goog-api-key": API_KEY,
                        "Content-Length": Buffer.byteLength(data),
                    },
                    timeout: 60000,
                }, (res) => {
                    let body = "";
                    res.on("data", (d) => (body += d));
                    res.on("end", () => {
                        try {
                            const json = JSON.parse(body);
                            if (res.statusCode === 429) {
                                const retryDelay = attempt < retries ? 15000 * attempt : 0;
                                console.warn(`Gemini 429 (attempt ${attempt}/${retries}), retry in ${retryDelay}ms`);
                                return reject({ retryable: true, delay: retryDelay, status: 429 });
                            }
                            if (res.statusCode === 503 || res.statusCode === 500) {
                                const retryDelay = attempt < retries ? 5000 * attempt : 0;
                                console.warn(`Gemini ${res.statusCode} (attempt ${attempt}/${retries}), retry in ${retryDelay}ms`);
                                return reject({ retryable: true, delay: retryDelay, status: res.statusCode });
                            }
                            if (res.statusCode >= 400) {
                                console.error("Gemini API error:", res.statusCode, body.slice(0, 300));
                                return reject(new ApiError(502, "The AI service returned an error."));
                            }
                            resolve(json.candidates?.[0]?.content?.parts?.[0]?.text || "");
                        } catch (e) {
                            reject(new ApiError(502, "Failed to parse AI response"));
                        }
                    });
                });
                req.on("timeout", () => {
                    req.destroy();
                    reject({ retryable: true, delay: 5000 * attempt, status: 0 });
                });
                req.on("error", (e) => {
                    if (e.code === "ECONNRESET" || e.code === "ETIMEDOUT") {
                        return reject({ retryable: true, delay: 5000 * attempt, status: 0 });
                    }
                    console.error("Gemini request failed:", e.message);
                    reject(new ApiError(502, "The AI service is temporarily unavailable."));
                });
                req.write(data);
                req.end();
            });

            return result;
        } catch (err) {
            if (err.retryable && err.delay && attempt < retries) {
                await sleep(err.delay);
                continue;
            }
            if (err.retryable) {
                throw new ApiError(503, "The AI service is temporarily unavailable after retries.");
            }
            throw err;
        }
    }

    throw new ApiError(502, "The AI service is temporarily unavailable after retries.");
};

const VALID_PRIORITIES = ["low", "medium", "high", "urgent"];
const normalizeTask = (t) => ({
    title: String(t.title || t.name || "").trim().slice(0, 200),
    description: String(t.description || "").trim().slice(0, 1000),
    priority: VALID_PRIORITIES.includes(t.priority) ? t.priority : "medium",
});

const generateTasks = async (goal, count = 6) => {
    const prompt = `You are a senior project manager. Break the following project goal into ${count} concrete, actionable Kanban tasks.
Goal: "${goal}"

Respond ONLY with a JSON array. Each item: { "title": string, "description": string (1-2 sentences), "priority": "low"|"medium"|"high"|"urgent" }.
No markdown, no commentary.`;
    const json = extractJson(await runPrompt(prompt));
    if (!Array.isArray(json)) throw new ApiError(502, "AI did not return a task list");
    return json.map(normalizeTask).filter((t) => t.title);
};

const breakdownTask = async (title, description = "", count = 5) => {
    const prompt = `Break the following task into ${count} smaller, sequential subtasks.
Task title: "${title}"
Task details: "${description || "n/a"}"

Respond ONLY with a JSON array. Each item: { "title": string, "description": string (short), "priority": "low"|"medium"|"high"|"urgent" }.
No markdown, no commentary.`;
    const json = extractJson(await runPrompt(prompt));
    if (!Array.isArray(json)) throw new ApiError(502, "AI did not return subtasks");
    return json.map(normalizeTask).filter((t) => t.title);
};

const summarizeBoard = async ({ boardTitle, columns }) => {
    const snapshot = columns
     .map(
        (c) =>
            `${c.title} (${c.tasks.length}):\n` +
            (c.tasks.map((t) => ` - ${t.title} [${t.priority}]`).join("\n") || " (none)")
     )
    .join("\n");

   const prompt = `You are a scrum master. Write a concise sprint summary for the Kanban board "${boardTitle}".
Current board state:
${snapshot}

Respond ONLY with JSON: {
    "headline": string (one sentence overview),
    "completed": string[] (key done items),
    "inProgress": string[] (what's actively being worked),
    "risks": string[] (blockers/risks/overdue concerns),
    "recommendations": string[] (next priorities)
}
No markdown, no commentary.`;
    return extractJson(await runPrompt(prompt));
};

module.exports = { generateTasks, breakdownTask, summarizeBoard };

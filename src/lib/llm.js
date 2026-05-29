const ENDPOINT = (process.env.AZURE_OPENAI_ENDPOINT || '').replace(/\/$/, '');
const API_KEY = process.env.AZURE_OPENAI_API_KEY || '';
const API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2025-04-01-preview';
const DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';

function isGpt5(model) {
  return String(model).toLowerCase().startsWith('gpt-5');
}

function safeParseJson(raw) {
  let text = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object in LLM response');
  let extracted = text.slice(start, end + 1);

  let out = '';
  let inStr = false;
  let esc = false;
  for (let i = 0; i < extracted.length; i++) {
    const ch = extracted[i];
    const code = ch.charCodeAt(0);
    if (esc) { out += ch; esc = false; continue; }
    if (ch === '\\' && inStr) { out += ch; esc = true; continue; }
    if (ch === '"') { out += ch; inStr = !inStr; continue; }
    if (inStr) {
      if (ch === '\n') { out += '\\n'; continue; }
      if (ch === '\r') continue;
      if (ch === '\t') { out += '\\t'; continue; }
      if (code < 0x20) { out += `\\u${code.toString(16).padStart(4, '0')}`; continue; }
    }
    out += ch;
  }
  out = out.replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(out);
}

async function callApi(body) {
  const url = `${ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`;
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': API_KEY },
    body: JSON.stringify(body),
  });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function requestLlm({ systemPrompt, userPrompt, maxTokens = 2000 }) {
  const tokenKey = isGpt5(DEPLOYMENT) ? 'max_completion_tokens' : 'max_tokens';
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  let res = await callApi({ messages, temperature: 0.3, [tokenKey]: maxTokens });

  // Handle temperature incompatibility (some models don't accept it)
  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 400 && errText.includes('temperature')) {
      res = await callApi({ messages, [tokenKey]: maxTokens });
    } else if (res.status >= 500) {
      // Transient server error — wait 3s and retry once
      console.warn(`[llm] ${res.status} transient error, retrying in 3s…`);
      await sleep(3000);
      res = await callApi({ messages, temperature: 0.3, [tokenKey]: maxTokens });
      if (!res.ok) {
        const retryErr = await res.text();
        throw new Error(`LLM ${res.status}: ${retryErr.slice(0, 300)}`);
      }
    } else {
      throw new Error(`LLM ${res.status}: ${errText.slice(0, 300)}`);
    }
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LLM ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const choice = data?.choices?.[0];
  const finishReason = choice?.finish_reason;
  const content = choice?.message?.content || '';

  if (!content && finishReason === 'content_filter') {
    throw new Error('Response blocked by content filter. Try rephrasing the input.');
  }
  if (!content) {
    throw new Error(`Empty response from model (finish_reason: ${finishReason || 'unknown'})`);
  }

  return safeParseJson(content);
}

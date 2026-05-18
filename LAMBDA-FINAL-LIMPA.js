import { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
const db = new DynamoDBClient({ region: "sa-east-1" });

export const handler = async (event) => {
const headers = {"Access-Control-Allow-Origin": "*","Access-Control-Allow-Headers": "Content-Type,Authorization","Access-Control-Allow-Methods": "GET,POST,OPTIONS","Content-Type": "application/json"};
if (event.requestContext?.http?.method === "OPTIONS") {return { statusCode: 200, headers, body: "" };}
const path = event.rawPath || "";
const method = event.requestContext?.http?.method || "";
let body = {};
try { body = JSON.parse(event.body || "{}"); } catch(e) {}
const queryEmail = event.queryStringParameters?.email || "";
const email = event.requestContext?.authorizer?.jwt?.claims?.email || body.email || queryEmail || "";

try {

// GET /credits
if (path === "/credits" && method === "GET") {
const res = await db.send(new GetItemCommand({TableName: "tecfe-users",Key: { email: { S: email } }}));
const credits = res.Item?.credits?.N || "0";
const baeCredits = res.Item?.baeCredits?.N || "0";
const trmvCredits = res.Item?.trmvCredits?.N || "0";
const trefCredits = res.Item?.trefCredits?.N || "0";
const taavCredits = res.Item?.taavCredits?.N || "0";
const tflodCredits = res.Item?.tflodCredits?.N || "0";
const name = res.Item?.name?.S || "";
try {const { SESClient, GetIdentityVerificationAttributesCommand, VerifyEmailIdentityCommand } = await import("@aws-sdk/client-ses");const ses = new SESClient({ region: "sa-east-1" });const ver = await ses.send(new GetIdentityVerificationAttributesCommand({ Identities: [email] }));const status = ver.VerificationAttributes?.[email]?.VerificationStatus;if (!status || status === "NotStarted") {await ses.send(new VerifyEmailIdentityCommand({ EmailAddress: email }));}} catch (sesErr) {}
return { statusCode: 200, headers, body: JSON.stringify({ credits: parseInt(credits), baeCredits: parseInt(baeCredits), trmvCredits: parseInt(trmvCredits), trefCredits: parseInt(trefCredits), taavCredits: parseInt(taavCredits), tflodCredits: parseInt(tflodCredits), name }) };
}

// POST /use-credit
if (path === "/use-credit" && method === "POST") {
const tipo = body.tipo || "tecfe";
const creditField = tipo === "bae" ? "baeCredits" : tipo === "trmv" ? "trmvCredits" : tipo === "tref" ? "trefCredits" : tipo === "taav" ? "taavCredits" : tipo === "tflod" ? "tflodCredits" : "credits";
const res = await db.send(new GetItemCommand({TableName: "tecfe-users",Key: { email: { S: email } }}));
const credits = parseInt(res.Item?.[creditField]?.N || "0");
if (credits <= 0) {return { statusCode: 403, headers, body: JSON.stringify({ error: "Sem creditos" }) };}
await db.send(new UpdateItemCommand({TableName: "tecfe-users",Key: { email: { S: email } },UpdateExpression: "SET #cf = #cf - :one",ExpressionAttributeNames: { "#cf": creditField },ExpressionAttributeValues: { ":one": { N: "1" } }}));
const sessionId = (tipo === "bae" ? "bae-" : "") + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
return { statusCode: 200, headers, body: JSON.stringify({ sessionId, credits: credits - 1 }) };
}

// POST /save-result
if (path === "/save-result" && method === "POST") {
const tipo = body.tipo || "tecfe";
await db.send(new PutItemCommand({TableName: "tecfe-results",Item: {sessionId: { S: body.sessionId },email: { S: email },date: { S: new Date().toISOString() },tipo: { S: tipo },data: { S: JSON.stringify(body.data) }}}));
try {const status = body.data?.status || "finalizado";const nome = body.data?.formData?.nome || body.data?.formData?.patientName || "Paciente";const tipoLabel = tipo === "bae" ? "BAE" : tipo === "trmv" ? "TRMV" : tipo === "taav" ? "TAAV" : tipo === "tref" ? "TREF" : tipo === "tflod" ? "TFLOD" : "TECFE";if (email && status !== "aguardando") {const { SESClient, SendEmailCommand } = await import("@aws-sdk/client-ses");const ses = new SESClient({ region: "sa-east-1" });await ses.send(new SendEmailCommand({Source: "setmonte@gmail.com",Destination: { ToAddresses: [email] },Message: {Subject: { Data: tipoLabel + " - Teste de " + nome + " " + status },Body: {Text: { Data: "O teste " + tipoLabel + " do paciente " + nome + " foi " + status + ".\n\nAcesse o painel para ver os resultados e gerar o PDF:\nhttps://setmonte.github.io/online/\n\nIMPORTANTE: Se este email caiu no Spam, marque como 'Nao e spam' para receber as proximas notificacoes na caixa de entrada.\n\nSYM Online - Notificacao automatica" }}}}));}} catch (emailErr) {}
return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
}

// POST /save-escala
if (path === "/save-escala" && method === "POST") {
const res = await db.send(new GetItemCommand({TableName: "tecfe-users",Key: { email: { S: body.email || "" } }}));
if (!res.Item) {return { statusCode: 403, headers, body: JSON.stringify({ error: "Email nao cadastrado. Inscreva-se primeiro no painel." }) };}
await db.send(new PutItemCommand({TableName: "tecfe-results",Item: {sessionId: { S: body.sessionId },email: { S: body.email },date: { S: new Date().toISOString() },tipo: { S: "escala" },data: { S: JSON.stringify(body.data) }}}));
return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
}

// POST /add-credits
if (path === "/add-credits" && method === "POST") {
const targetEmail = body.targetEmail;
const amount = parseInt(body.amount || "0");
const tipo = body.tipo || "tecfe";
const creditField = tipo === "bae" ? "baeCredits" : tipo === "trmv" ? "trmvCredits" : tipo === "tref" ? "trefCredits" : tipo === "taav" ? "taavCredits" : tipo === "tflod" ? "tflodCredits" : "credits";
const res = await db.send(new GetItemCommand({TableName: "tecfe-users",Key: { email: { S: targetEmail } }}));
if (!res.Item) {const item = { email: { S: targetEmail }, credits: { N: "0" }, baeCredits: { N: "0" }, trefCredits: { N: "0" }, taavCredits: { N: "0" }, name: { S: "" } };item[creditField] = { N: String(amount) };await db.send(new PutItemCommand({ TableName: "tecfe-users", Item: item }));} else {await db.send(new UpdateItemCommand({TableName: "tecfe-users",Key: { email: { S: targetEmail } },UpdateExpression: "SET #cf = if_not_exists(#cf, :zero) + :amt",ExpressionAttributeNames: { "#cf": creditField },ExpressionAttributeValues: { ":amt": { N: String(amount) }, ":zero": { N: "0" } }}));}
return { statusCode: 200, headers, body: JSON.stringify({ ok: true, credits: amount }) };
}

// GET /get-results
if (path === "/get-results" && method === "GET") {
const { ScanCommand } = await import("@aws-sdk/client-dynamodb");
const tipo = event.queryStringParameters?.tipo || "";
let filterExpr = "email = :e";
let exprValues = { ":e": { S: email } };
if (tipo) {filterExpr += " AND tipo = :t";exprValues[":t"] = { S: tipo };}
const res = await db.send(new ScanCommand({TableName: "tecfe-results",FilterExpression: filterExpr,ExpressionAttributeValues: exprValues}));
const results = (res.Items || []).map(item => ({sessionId: item.sessionId?.S || "",email: item.email?.S || "",date: item.date?.S || "",tipo: item.tipo?.S || "tecfe",data: JSON.parse(item.data?.S || "{}")}));
results.sort((a, b) => b.date.localeCompare(a.date));
return { statusCode: 200, headers, body: JSON.stringify({ results }) };
}

// GET /session-status
if (path === "/session-status" && method === "GET") {
const sid = event.queryStringParameters?.sessionId || "";
const res = await db.send(new GetItemCommand({TableName: "tecfe-results",Key: { sessionId: { S: sid } }}));
const data = res.Item?.data?.S ? JSON.parse(res.Item.data.S) : null;
const status = data?.status || "not_found";
return { statusCode: 200, headers, body: JSON.stringify({ status }) };
}

// POST /generate-ai
if (path === "/generate-ai" && method === "POST") {
const aiKey = "AIzaSyBksBoqOc249rR1386EGDt6Nnvt5odOGJI";
const aiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + aiKey;
const aiResp = await fetch(aiUrl, {method: "POST",headers: { "Content-Type": "application/json" },body: JSON.stringify({ contents: [{ parts: [{ text: body.prompt }] }] })});
const aiData = await aiResp.json();
const text = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
return { statusCode: 200, headers, body: JSON.stringify({ text }) };
}

// POST /create-payment
if (path === "/create-payment" && method === "POST") {
const mpToken = "APP_USR-3728154817984688-042614-479591687e31de894a85c0728d4e9182-60087843";
const quantidade = parseInt(body.quantidade || "1");
const tipo = body.tipo || "tecfe";
let titulo, preco;
if (tipo === "bae") {titulo = "BAE - " + quantidade + " credito" + (quantidade > 1 ? "s" : "");if (quantidade >= 50) preco = 750;else if (quantidade >= 10) preco = 200;else preco = 25;} else if (tipo === "trmv") {titulo = "TRMV - " + quantidade + " credito" + (quantidade > 1 ? "s" : "");if (quantidade >= 50) preco = 150;else if (quantidade >= 10) preco = 40;else preco = 5;} else if (tipo === "tref") {titulo = "TREF - " + quantidade + " credito" + (quantidade > 1 ? "s" : "");if (quantidade >= 50) preco = 150;else if (quantidade >= 10) preco = 40;else preco = 5;} else {titulo = "TECFE - " + quantidade + " credito" + (quantidade > 1 ? "s" : "");if (quantidade >= 50) preco = 500;else if (quantidade >= 10) preco = 150;else preco = 20;}
const mpResp = await fetch("https://api.mercadopago.com/checkout/preferences", {method: "POST",headers: { "Authorization": "Bearer " + mpToken, "Content-Type": "application/json" },body: JSON.stringify({items: [{ title: titulo, quantity: 1, unit_price: preco, currency_id: "BRL" }],metadata: { email: email, tipo: tipo, quantidade: quantidade },back_urls: {success: "https://setmonte.github.io/online/",failure: "https://setmonte.github.io/online/",pending: "https://setmonte.github.io/online/"},auto_return: "approved",notification_url: "https://dguom5dfla.execute-api.sa-east-1.amazonaws.com/webhook-mp"})});
const mpData = await mpResp.json();
return { statusCode: 200, headers, body: JSON.stringify({ url: mpData.init_point || "" }) };
}

// POST /webhook-mp
if (path === "/webhook-mp" && method === "POST") {
try {console.log("WEBHOOK:", JSON.stringify(body));if (body.type === "payment" && body.data?.id) {const mpToken = "APP_USR-3728154817984688-042614-479591687e31de894a85c0728d4e9182-60087843";const mpResp = await fetch("https://api.mercadopago.com/v1/payments/" + body.data.id, {headers: { "Authorization": "Bearer " + mpToken }});const payment = await mpResp.json();if (payment.status === "approved") {const payerEmail = payment.metadata?.email || payment.payer?.email || "";const tipo = payment.metadata?.tipo || "tecfe";const quantidade = parseInt(payment.metadata?.quantidade || "0");const amount = payment.transaction_amount;const creditField = tipo === "bae" ? "baeCredits" : tipo === "trmv" ? "trmvCredits" : tipo === "tref" ? "trefCredits" : tipo === "taav" ? "taavCredits" : "credits";let creditos = quantidade;if (!creditos) {if (tipo === "bae") {if (amount >= 750) creditos = 50;else if (amount >= 200) creditos = 10;else if (amount >= 25) creditos = 1;} else if (tipo === "trmv") {if (amount >= 150) creditos = 50;else if (amount >= 40) creditos = 10;else if (amount >= 5) creditos = 1;} else if (tipo === "tref") {if (amount >= 150) creditos = 50;else if (amount >= 40) creditos = 10;else if (amount >= 5) creditos = 1;} else {if (amount >= 500) creditos = 50;else if (amount >= 150) creditos = 10;else if (amount >= 20) creditos = 1;}}if (payerEmail && creditos > 0) {const res = await db.send(new GetItemCommand({TableName: "tecfe-users",Key: { email: { S: payerEmail } }}));if (!res.Item) {const item = { email: { S: payerEmail }, credits: { N: "0" }, baeCredits: { N: "0" }, name: { S: "" } };item[creditField] = { N: String(creditos) };await db.send(new PutItemCommand({ TableName: "tecfe-users", Item: item }));} else {await db.send(new UpdateItemCommand({TableName: "tecfe-users",Key: { email: { S: payerEmail } },UpdateExpression: "SET #cf = if_not_exists(#cf, :zero) + :amt",ExpressionAttributeNames: { "#cf": creditField },ExpressionAttributeValues: { ":amt": { N: String(creditos) }, ":zero": { N: "0" } }}));}}}}} catch (mpErr) {}
return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
}

// POST /delete-result
if (path === "/delete-result" && method === "POST") {
const { DeleteItemCommand } = await import("@aws-sdk/client-dynamodb");
await db.send(new DeleteItemCommand({TableName: "tecfe-results",Key: { sessionId: { S: body.sessionId } }}));
return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
}

// GET /visit-count
if (path === "/visit-count" && method === "GET") {
await db.send(new UpdateItemCommand({TableName: "tecfe-users",Key: { email: { S: "_site_counter" } },UpdateExpression: "SET visits = if_not_exists(visits, :zero) + :one",ExpressionAttributeValues: { ":one": { N: "1" }, ":zero": { N: "0" } }}));
const res = await db.send(new GetItemCommand({TableName: "tecfe-users",Key: { email: { S: "_site_counter" } }}));
const total = parseInt(res.Item?.visits?.N || "0");
return { statusCode: 200, headers, body: JSON.stringify({ visits: total }) };
}

// POST /save-paciente
if (path === "/save-paciente" && method === "POST") {
const id = "pac-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
await db.send(new PutItemCommand({TableName: "tecfe-pacientes",Item: {id: { S: id },emailAvaliador: { S: body.email || email },nome: { S: body.nome || "" },dataNascimento: { S: body.dataNascimento || "" },cpf: { S: body.cpf || "" },criadoEm: { S: new Date().toISOString() }}}));
return { statusCode: 200, headers, body: JSON.stringify({ ok: true, id: id }) };
}

// GET /get-pacientes
if (path === "/get-pacientes" && method === "GET") {
const { ScanCommand } = await import("@aws-sdk/client-dynamodb");
const res = await db.send(new ScanCommand({TableName: "tecfe-pacientes",FilterExpression: "emailAvaliador = :e",ExpressionAttributeValues: { ":e": { S: email } }}));
const pacientes = (res.Items || []).map(item => ({id: item.id?.S || "",nome: item.nome?.S || "",dataNascimento: item.dataNascimento?.S || "",cpf: item.cpf?.S || ""}));
pacientes.sort((a, b) => a.nome.localeCompare(b.nome));
return { statusCode: 200, headers, body: JSON.stringify({ pacientes }) };
}

// POST /delete-paciente
if (path === "/delete-paciente" && method === "POST") {
const { DeleteItemCommand } = await import("@aws-sdk/client-dynamodb");
await db.send(new DeleteItemCommand({TableName: "tecfe-pacientes",Key: { id: { S: body.id } }}));
return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
}

// POST /save-depoimento (com moderacao por IA)
if (path === "/save-depoimento" && method === "POST") {
const nome = (body.nome || "").trim().slice(0, 50);
const nota = parseInt(body.nota || "5");
const texto = (body.texto || "").trim().slice(0, 500);
const servico = (body.servico || "").slice(0, 50);
if (!nome || !texto || texto.length < 20) {return { statusCode: 400, headers, body: JSON.stringify({ error: "Preencha nome e depoimento (min 20 caracteres)." }) };}
const aiKey = "AIzaSyBksBoqOc249rR1386EGDt6Nnvt5odOGJI";
const moderationPrompt = `Voce e um moderador de depoimentos para o site de um neuropsicologo. Analise o texto abaixo e responda APENAS com "APROVADO" ou "REPROVADO". Regras para REPROVAR: contem palavroes, ofensas, dados pessoais sensiveis (CPF, telefone, endereco, email), spam, propaganda, conteudo sexual/violento/ilegal, ou texto sem sentido. Regras para APROVAR: depoimento genuino sobre atendimento psicologico/neuropsicologico, elogios ou criticas construtivas, pode mencionar nome do profissional, pode ter erros de portugues. TEXTO: "${texto}" RESPOSTA:`;
let aprovado = true;
try {const aiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + aiKey;const aiResp = await fetch(aiUrl, {method: "POST",headers: { "Content-Type": "application/json" },body: JSON.stringify({ contents: [{ parts: [{ text: moderationPrompt }] }] })});const aiData = await aiResp.json();const resposta = (aiData.candidates?.[0]?.content?.parts?.[0]?.text || "").trim().toUpperCase();if (resposta.includes("REPROVADO")) aprovado = false;} catch (aiErr) {}
if (!aprovado) {return { statusCode: 200, headers, body: JSON.stringify({ ok: false, error: "Seu depoimento nao pode ser publicado. Verifique se nao contem dados pessoais ou linguagem inadequada." }) };}
const depId = "dep-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
await db.send(new PutItemCommand({TableName: "tecfe-results",Item: {sessionId: { S: depId },email: { S: "_depoimentos" },date: { S: new Date().toISOString() },tipo: { S: "depoimento" },data: { S: JSON.stringify({ nome, nota, texto, servico, aprovado: true }) }}}));
try {const { SESClient, SendEmailCommand } = await import("@aws-sdk/client-ses");const ses = new SESClient({ region: "sa-east-1" });await ses.send(new SendEmailCommand({Source: "setmonte@gmail.com",Destination: { ToAddresses: ["setmonte@gmail.com"] },Message: {Subject: { Data: "Novo depoimento recebido - " + nome },Body: {Text: { Data: "Voce recebeu um novo depoimento no site!\n\nNome: " + nome + "\nNota: " + nota + " estrelas\nServico: " + (servico || "Nao informado") + "\n\nTexto:\n" + texto + "\n\nAcesse o painel para responder:\nhttps://setmonte.github.io/online/\n(Aba Depoimentos)" }}}}));} catch(emailErr) {}
return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
}

// GET /get-depoimentos
if (path === "/get-depoimentos" && method === "GET") {
const { ScanCommand } = await import("@aws-sdk/client-dynamodb");
const res = await db.send(new ScanCommand({TableName: "tecfe-results",FilterExpression: "email = :e AND tipo = :t",ExpressionAttributeValues: {":e": { S: "_depoimentos" },":t": { S: "depoimento" }}}));
const depoimentos = (res.Items || []).map(item => {const d = JSON.parse(item.data?.S || "{}");return {id: item.sessionId?.S || "",nome: d.nome || "",nota: d.nota || 5,texto: d.texto || "",servico: d.servico || "",resposta: d.resposta || "",data: item.date?.S || ""};});
depoimentos.sort((a, b) => b.data.localeCompare(a.data));
return { statusCode: 200, headers, body: JSON.stringify({ depoimentos }) };
}

// POST /delete-depoimento
if (path === "/delete-depoimento" && method === "POST") {
const { DeleteItemCommand } = await import("@aws-sdk/client-dynamodb");
await db.send(new DeleteItemCommand({TableName: "tecfe-results",Key: { sessionId: { S: body.id } }}));
return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
}

// POST /responder-depoimento
if (path === "/responder-depoimento" && method === "POST") {
const depId = body.id;
const resposta = (body.resposta || "").trim().slice(0, 300);
if (!depId || !resposta) {return { statusCode: 400, headers, body: JSON.stringify({ error: "ID e resposta obrigatorios." }) };}
const res = await db.send(new GetItemCommand({TableName: "tecfe-results",Key: { sessionId: { S: depId } }}));
if (!res.Item) {return { statusCode: 404, headers, body: JSON.stringify({ error: "Depoimento nao encontrado." }) };}
const dadosAtuais = JSON.parse(res.Item.data?.S || "{}");
dadosAtuais.resposta = resposta;
await db.send(new UpdateItemCommand({TableName: "tecfe-results",Key: { sessionId: { S: depId } },UpdateExpression: "SET #d = :data",ExpressionAttributeNames: { "#d": "data" },ExpressionAttributeValues: { ":data": { S: JSON.stringify(dadosAtuais) } }}));
return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
}

// GET /admin-list-users
if (path === "/admin-list-users" && method === "GET") {
const { ScanCommand } = await import("@aws-sdk/client-dynamodb");
const res = await db.send(new ScanCommand({ TableName: "tecfe-users" }));
const users = (res.Items || []).filter(item => item.email?.S && !item.email.S.startsWith('_')).map(item => ({
  email: item.email?.S || "",
  credits: parseInt(item.credits?.N || "0"),
  baeCredits: parseInt(item.baeCredits?.N || "0"),
  trmvCredits: parseInt(item.trmvCredits?.N || "0"),
  trefCredits: parseInt(item.trefCredits?.N || "0"),
  taavCredits: parseInt(item.taavCredits?.N || "0"),
  name: item.name?.S || ""
}));
users.sort((a, b) => a.email.localeCompare(b.email));
return { statusCode: 200, headers, body: JSON.stringify({ users }) };
}

// GET /admin-list-cognito
if (path === "/admin-list-cognito" && method === "GET") {
const { CognitoIdentityProviderClient, ListUsersCommand } = await import("@aws-sdk/client-cognito-identity-provider");
const cognito = new CognitoIdentityProviderClient({ region: "sa-east-1" });
const cogRes = await cognito.send(new ListUsersCommand({ UserPoolId: "sa-east-1_msQ8gxRBW", Limit: 60 }));
const users = (cogRes.Users || []).map(u => {
  const emailAttr = (u.Attributes || []).find(a => a.Name === "email");
  return { email: emailAttr?.Value || u.Username, status: u.UserStatus || "", criado: u.UserCreateDate ? u.UserCreateDate.toISOString().split('T')[0] : "" };
});
return { statusCode: 200, headers, body: JSON.stringify({ users }) };
}

// GET /admin-stats
if (path === "/admin-stats" && method === "GET") {
const { ScanCommand } = await import("@aws-sdk/client-dynamodb");
const usersRes = await db.send(new ScanCommand({ TableName: "tecfe-users" }));
const resultsRes = await db.send(new ScanCommand({ TableName: "tecfe-results", Select: "COUNT" }));
const pacRes = await db.send(new ScanCommand({ TableName: "tecfe-pacientes", Select: "COUNT" }));
const totalUsers = (usersRes.Items || []).filter(i => i.email?.S && !i.email.S.startsWith('_')).length;
const counterItem = (usersRes.Items || []).find(i => i.email?.S === '_site_counter');
const totalVisits = parseInt(counterItem?.visits?.N || "0");
const resultsFullRes = await db.send(new ScanCommand({ TableName: "tecfe-results", ProjectionExpression: "tipo" }));
const porTipo = {};
(resultsFullRes.Items || []).forEach(function(i) { var t = i.tipo?.S || 'outro'; porTipo[t] = (porTipo[t] || 0) + 1; });
return { statusCode: 200, headers, body: JSON.stringify({ totalUsers, totalResults: resultsRes.Count || 0, totalPacientes: pacRes.Count || 0, totalVisits, porTipo }) };
}

return { statusCode: 404, headers, body: JSON.stringify({ error: "Rota nao encontrada" }) };
} catch (err) {
return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
}
};

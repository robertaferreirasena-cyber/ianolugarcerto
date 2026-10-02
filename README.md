# IA no Lugar Certo

Página de captura de leads do Diagnóstico IA (Roberta Sena).

- Site: https://ianolugarcerto.vercel.app
- Deploy automático via Vercel a cada push na branch `main`.

## Quiz de aplicação (versão ampliada)

O formulário é montado por `quiz.js` a partir da lista `STEPS`: 19 a 20 etapas curtas, com perguntas condicionais (números de WhatsApp, funções da equipe) e avanço automático nas de escolha única. Coleta o suficiente para a fábrica de MVP + proposta da Jornada do Lead montar a proposta e o protótipo.

Envio, em ordem:
1. **Jornada do Lead:** função pública do Supabase `intake_submit` (`JORNADA_ENDPOINT` + chave publicável no topo de `quiz.js`). Cria ou atualiza o lead pelo WhatsApp (origem "Página de captura", etapa "Novo lead", tag `quiz:ianolugarcerto`) e grava o briefing na fila da fábrica. O corpo enviado é `{p_source, p_slug, p_contact{name, whatsapp, email, company, consent}, p_briefing, p_honeypot}`.
2. **Google Forms:** cópia de segurança dos campos principais.
3. **WhatsApp da Roberta:** resumo completo, e a pessoa toca em enviar.

Formato enviado para a Jornada do Lead:

```json
{
  "source": "quiz", "quiz": "ianolugarcerto", "origem": "<?origem=>", "submittedAt": "ISO",
  "contact": { "nome": "", "whatsapp": "", "email": null },
  "consent": true,
  "answers": { "...respostas brutas por campo..." },
  "briefing": { "...ProjectBriefing (schema da skill fabrica-de-mvp-e-proposta)..." },
  "website": ""
}
```

- `briefing` segue exatamente o `briefingSchema` da skill (validado com Zod 4; um quiz completo dá completude 100).
- `website` é o campo isca contra robôs. Se vier preenchido, a rota deve descartar o envio.
- A rota deve validar com Zod, limitar envios por IP, criar ou atualizar o lead (origem "Página de captura", tag `quiz:ianolugarcerto`) e gravar o briefing.

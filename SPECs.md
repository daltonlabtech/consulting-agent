# **ESPECIFICAÇÃO TÉCNICA - MVP AGENTE DALTON**

**Versão:** 1.0  
**Data:** 12 de Fevereiro de 2026  
**Para:** Time de Desenvolvimento Dalton Lab

---

## **1. VISÃO GERAL DO PROJETO**

### **Objetivo**
Desenvolver sistema híbrido de coleta do Diagnóstico 360 composto por:
- 2 formulários web estruturados
- Sistema de tracking de progresso
- Painel administrativo básico
- Integração com transcrição de áudio

### **Premissa do MVP**
Validar se formulários estruturados com condicionais + follow-ups manuais conseguem coletar informações de 3-8 entrevistados em 5-7 dias, substituindo reuniões de 1h que levam 2-3 semanas.

---

## **2. ARQUITETURA TÉCNICA**

### **2.1 Stack Tecnológica**

```
Frontend + Backend: Next.js 14+ (App Router)
Deploy: Vercel
Banco de dados: Supabase (Postgres)
Transcrição: OpenAI Whisper API
Linguagem: TypeScript
Estilização: Tailwind CSS
```

### **2.2 Estrutura do Projeto**

```
dalton-diagnostico/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── sponsors/
│   │   │   │   └── route.ts
│   │   │   ├── entrevistados/
│   │   │   │   └── route.ts
│   │   │   ├── respostas/
│   │   │   │   └── route.ts
│   │   │   └── transcribe/
│   │   │       └── route.ts
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── sponsor/
│   │   │   └── page.tsx
│   │   └── diagnostico/
│   │       └── [uuid]/
│   │           └── page.tsx
│   ├── components/
│   │   ├── forms/
│   │   │   ├── SponsorForm.tsx
│   │   │   ├── DiagnosticoForm.tsx
│   │   │   ├── AudioRecorder.tsx
│   │   │   └── SectionProgress.tsx
│   │   └── admin/
│   │       ├── EntrevistadosList.tsx
│   │       └── RespostasView.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── whisper.ts
│   │   └── validations.ts
│   └── types/
│       └── index.ts
├── prisma/
│   └── schema.prisma
└── public/
```

---

## **3. MODELO DE DADOS**

### **3.1 Schema Prisma**

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Sponsor {
  id                 String        @id @default(uuid())
  nome               String
  empresa            String
  whatsapp           String
  areas_contratadas  String[]      // Array de áreas
  data_limite        DateTime
  avisou_time        Boolean       @default(false)
  entrevistados      Entrevistado[]
  created_at         DateTime      @default(now())
  updated_at         DateTime      @updatedAt

  @@map("sponsors")
}

model Entrevistado {
  id                   String    @id @default(uuid())
  sponsor_id           String
  sponsor              Sponsor   @relation(fields: [sponsor_id], references: [id], onDelete: Cascade)
  
  // Dados pessoais
  nome                 String
  cargo                String
  area                 String
  whatsapp             String    @unique
  
  // Tracking
  status               String    @default("nao_iniciado") // "nao_iniciado" | "em_andamento" | "concluido"
  secao_atual          Int       @default(1)
  secoes_completadas   Int[]     @default([])
  
  // Respostas (JSON)
  respostas            Json      @default("{}")
  
  // Timestamps
  iniciado_em          DateTime?
  concluido_em         DateTime?
  created_at           DateTime  @default(now())
  updated_at           DateTime  @updatedAt

  @@map("entrevistados")
  @@index([sponsor_id])
  @@index([status])
}
```

### **3.2 Estrutura do JSON de Respostas**

```typescript
// src/types/index.ts

export interface Respostas {
  secao_1?: {
    p1_fluxo_principal: string;
    p2_pessoas_envolvidas: string;
  };
  secao_2?: {
    p3_gargalos: string;
    p4_impactos: string;
    p5_tarefas_repetitivas: string;
  };
  secao_3?: {
    p6_ferramentas: string;
    p7_tempo_ferramentas: string;
    p8a_tempo_planilhas?: string;
    p8b_limitacoes_sistema?: string;
  };
  secao_4?: {
    p9_usa_ia: 'Sim' | 'Não';
    p10a_ferramentas_ia?: string[];
    p10b_como_usa?: string;
    p11_por_que_nao?: string;
    p11_outro?: string;
  };
  secao_5?: {
    p10_metas: string;
    p11_cenario_ideal: string;
  };
}

export type StatusEntrevistado = 'nao_iniciado' | 'em_andamento' | 'concluido';

export interface Entrevistado {
  id: string;
  sponsor_id: string;
  nome: string;
  cargo: string;
  area: string;
  whatsapp: string;
  status: StatusEntrevistado;
  secao_atual: number;
  secoes_completadas: number[];
  respostas: Respostas;
  iniciado_em?: Date;
  concluido_em?: Date;
  created_at: Date;
  updated_at: Date;
}
```

---

## **4. FUNCIONALIDADES DETALHADAS**

### **4.1 FORMULÁRIO 1 - Coleta de Entrevistados (Sponsor)**

**Rota:** `/sponsor`

#### **Campos do Formulário**

**Dados pré-preenchidos (podem vir via query params ou estado):**
- `empresa` (string)
- `nome_sponsor` (string)
- `areas_contratadas` (string[])
- `data_limite` (DateTime)

**Campos editáveis:**

**Lista de Entrevistados** (array dinâmico, mínimo 3):
```typescript
interface EntrevistadoInput {
  nome: string;          // obrigatório
  cargo: string;         // obrigatório
  area: string;          // obrigatório
  whatsapp: string;      // obrigatório, formato: +55XXXXXXXXXXX
}
```

**Pergunta final:**
- `avisou_time`: boolean (checkbox "Você já avisou o time que eles receberão mensagem do Dalton?")

#### **Validações**

```typescript
// src/lib/validations.ts

export const sponsorFormSchema = z.object({
  empresa: z.string().min(1, "Nome da empresa é obrigatório"),
  nome_sponsor: z.string().min(1, "Nome do sponsor é obrigatório"),
  whatsapp_sponsor: z.string().regex(/^\+55\d{10,11}$/, "WhatsApp inválido"),
  areas_contratadas: z.array(z.string()).min(1),
  data_limite: z.date(),
  avisou_time: z.boolean(),
  entrevistados: z.array(
    z.object({
      nome: z.string().min(1, "Nome obrigatório"),
      cargo: z.string().min(1, "Cargo obrigatório"),
      area: z.string().min(1, "Área obrigatória"),
      whatsapp: z.string().regex(/^\+55\d{10,11}$/, "WhatsApp inválido"),
    })
  ).min(3, "Mínimo 3 entrevistados")
  .refine(
    (entrevistados) => {
      const whatsapps = entrevistados.map(e => e.whatsapp);
      return new Set(whatsapps).size === whatsapps.length;
    },
    { message: "WhatsApps duplicados não são permitidos" }
  ),
});
```

#### **Fluxo de Submit**

```typescript
// src/app/api/sponsors/route.ts

export async function POST(req: Request) {
  const body = await req.json();
  
  // Validar dados
  const validated = sponsorFormSchema.parse(body);
  
  // Criar sponsor no banco
  const sponsor = await prisma.sponsor.create({
    data: {
      nome: validated.nome_sponsor,
      empresa: validated.empresa,
      whatsapp: validated.whatsapp_sponsor,
      areas_contratadas: validated.areas_contratadas,
      data_limite: validated.data_limite,
      avisou_time: validated.avisou_time,
      entrevistados: {
        create: validated.entrevistados.map(e => ({
          nome: e.nome,
          cargo: e.cargo,
          area: e.area,
          whatsapp: e.whatsapp,
          status: 'nao_iniciado',
          secao_atual: 1,
          respostas: {},
        })),
      },
    },
    include: {
      entrevistados: true,
    },
  });
  
  return Response.json({ success: true, sponsor });
}
```

#### **UI/UX**

- Botão **"+ Adicionar outro entrevistado"** adiciona novo bloco de campos
- Botão **"Remover"** em cada entrevistado (exceto se tiver apenas 3)
- Validação em tempo real de WhatsApp (formato e duplicidade)
- Feedback visual de erro por campo
- Botão "Enviar" desabilitado até todas validações passarem

---

### **4.2 FORMULÁRIO 2 - Diagnóstico 360 (Entrevistado)**

**Rota:** `/diagnostico/[uuid]`

#### **Fluxo de Entrada**

1. Entrevistado recebe link: `https://forms.daltonlab.ai/diagnostico/550e8400-1234-5678`
2. Sistema busca entrevistado por UUID
3. Se não encontrado → 404
4. Se encontrado → carrega dados e respostas salvas

```typescript
// src/app/diagnostico/[uuid]/page.tsx

export default async function DiagnosticoPage({ params }: { params: { uuid: string } }) {
  const entrevistado = await prisma.entrevistado.findUnique({
    where: { id: params.uuid },
    include: { sponsor: true },
  });
  
  if (!entrevistado) {
    return <NotFound />;
  }
  
  return (
    <DiagnosticoForm 
      entrevistado={entrevistado}
      sponsor={entrevistado.sponsor}
    />
  );
}
```

#### **Estrutura do Formulário**

**Componente:** `<DiagnosticoForm />`

**Props:**
```typescript
interface DiagnosticoFormProps {
  entrevistado: Entrevistado;
  sponsor: Sponsor;
}
```

**Estado:**
```typescript
const [secaoAtual, setSecaoAtual] = useState(entrevistado.secao_atual);
const [respostas, setRespostas] = useState<Respostas>(entrevistado.respostas);
const [isSaving, setIsSaving] = useState(false);
```

#### **Navegação entre Seções**

- Cada seção é um step do formulário
- Botão "Próxima Seção" só habilitado quando todos campos obrigatórios preenchidos
- Ao clicar "Próxima Seção" → auto-save + avança
- Botão "Continuar Depois" → auto-save + pode fechar
- Progresso visual: barra ou steps (1/5, 2/5, etc)

#### **Auto-save**

```typescript
// src/app/api/respostas/route.ts

export async function PATCH(req: Request) {
  const { entrevistado_id, secao, respostas } = await req.json();
  
  const updated = await prisma.entrevistado.update({
    where: { id: entrevistado_id },
    data: {
      respostas: respostas,
      secao_atual: secao,
      secoes_completadas: {
        push: secao, // Adiciona seção ao array se não existir
      },
      status: secao === 5 ? 'concluido' : 'em_andamento',
      iniciado_em: entrevistado.iniciado_em || new Date(),
      concluido_em: secao === 5 ? new Date() : null,
    },
  });
  
  return Response.json({ success: true, updated });
}
```

---

### **4.3 GRAVAÇÃO E TRANSCRIÇÃO DE ÁUDIO**

#### **Componente: AudioRecorder**

```typescript
// src/components/forms/AudioRecorder.tsx

interface AudioRecorderProps {
  onTranscript: (text: string) => void;
  fieldName: string;
}

export function AudioRecorder({ onTranscript, fieldName }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    
    const chunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };
    
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      await transcribeAudio(audioBlob);
      stream.getTracks().forEach(track => track.stop());
    };
    
    mediaRecorder.start();
    setIsRecording(true);
  };
  
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };
  
  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('field_name', fieldName);
    
    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      const { transcript } = await response.json();
      onTranscript(transcript);
    } catch (error) {
      console.error('Erro na transcrição:', error);
      alert('Erro ao transcrever áudio. Tente novamente.');
    } finally {
      setIsTranscribing(false);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isTranscribing}
        className={`p-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-blue-500'}`}
      >
        {isRecording ? '⏹️ Parar' : '🎤 Gravar'}
      </button>
      {isTranscribing && <span className="text-sm text-gray-500">Transcrevendo...</span>}
    </div>
  );
}
```

#### **API de Transcrição**

```typescript
// src/app/api/transcribe/route.ts

import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const audioFile = formData.get('audio') as Blob;
  
  if (!audioFile) {
    return Response.json({ error: 'Audio file required' }, { status: 400 });
  }
  
  try {
    // Converter Blob para File
    const file = new File([audioFile], 'audio.webm', { type: 'audio/webm' });
    
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'pt',
    });
    
    return Response.json({ transcript: transcription.text });
  } catch (error) {
    console.error('Whisper API error:', error);
    return Response.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
```

#### **Integração no Textarea**

```typescript
<div className="relative">
  <textarea
    value={value}
    onChange={(e) => setValue(e.target.value)}
    className="w-full p-3 border rounded-lg"
    rows={4}
  />
  <div className="absolute bottom-3 right-3">
    <AudioRecorder 
      onTranscript={(text) => setValue(value + ' ' + text)}
      fieldName="p1_fluxo_principal"
    />
  </div>
</div>
```

---

### **4.4 LÓGICA DAS CONDICIONAIS**

#### **Seção 3 - Ferramentas**

```typescript
// Detectar menção a planilhas
const mencionouPlanilhas = (texto: string): boolean => {
  const keywords = ['planilha', 'excel', 'sheets', 'google sheets'];
  const textoLower = texto.toLowerCase();
  return keywords.some(keyword => textoLower.includes(keyword));
};

// No componente da Seção 3
const showPerguntaPlanilhas = mencionouPlanilhas(respostas.secao_3?.p6_ferramentas || '');

{showPerguntaPlanilhas && (
  <div>
    <label>Especificamente com planilhas, quanto tempo por semana?</label>
    <select {...}>
      <option value="Menos de 2h">Menos de 2h</option>
      <option value="2-5h">2-5h</option>
      <option value="5-10h">5-10h</option>
      <option value="10-20h">10-20h</option>
      <option value="Mais de 20h">Mais de 20h</option>
    </select>
  </div>
)}
```

#### **Seção 4 - Uso de IA**

```typescript
const usaIA = respostas.secao_4?.p9_usa_ia === 'Sim';

{usaIA ? (
  <>
    <div>
      <label>Qual(is) ferramenta(s) de IA vocês usam?</label>
      <MultiSelect
        options={['ChatGPT', 'Copilot', 'Gemini', 'Claude', 'Automações personalizadas', 'Outro']}
        value={respostas.secao_4?.p10a_ferramentas_ia || []}
        onChange={(selected) => updateResposta('secao_4', 'p10a_ferramentas_ia', selected)}
      />
    </div>
    <div>
      <label>Como vocês usam? Está funcionando bem?</label>
      <textarea {...} />
      <AudioRecorder {...} />
    </div>
  </>
) : (
  <div>
    <label>Por que ainda não?</label>
    <select {...}>
      <option value="Falta de tempo">Falta de tempo</option>
      <option value="Falta de conhecimento">Falta de conhecimento</option>
      <option value="Não se aplica">Não se aplica</option>
      <option value="Outro">Outro</option>
    </select>
    {respostas.secao_4?.p11_por_que_nao === 'Outro' && (
      <textarea {...} />
    )}
  </div>
)}
```

---

### **4.5 PAINEL ADMINISTRATIVO**

**Rota:** `/admin`

#### **Lista de Entrevistados**

```typescript
// src/app/admin/page.tsx

export default async function AdminPage() {
  const entrevistados = await prisma.entrevistado.findMany({
    include: { sponsor: true },
    orderBy: { created_at: 'desc' },
  });
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>
      
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Nome</th>
            <th className="p-3 text-left">Área</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Seção Atual</th>
            <th className="p-3 text-left">Data Início</th>
            <th className="p-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {entrevistados.map(entrevistado => (
            <tr key={entrevistado.id} className="border-b">
              <td className="p-3">{entrevistado.nome}</td>
              <td className="p-3">{entrevistado.area}</td>
              <td className="p-3">
                <StatusBadge status={entrevistado.status} />
              </td>
              <td className="p-3">{entrevistado.secao_atual}/5</td>
              <td className="p-3">
                {entrevistado.iniciado_em 
                  ? format(entrevistado.iniciado_em, 'dd/MM/yyyy HH:mm')
                  : '-'
                }
              </td>
              <td className="p-3">
                {entrevistado.status === 'concluido' && (
                  <Link 
                    href={`/admin/${entrevistado.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Ver Respostas
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### **Badge de Status**

```typescript
// src/components/admin/StatusBadge.tsx

const statusConfig = {
  nao_iniciado: { label: 'Não Iniciado', color: 'bg-gray-200 text-gray-700' },
  em_andamento: { label: 'Em Andamento', color: 'bg-yellow-200 text-yellow-800' },
  concluido: { label: 'Concluído', color: 'bg-green-200 text-green-800' },
};

export function StatusBadge({ status }: { status: StatusEntrevistado }) {
  const config = statusConfig[status];
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
```

#### **Visualização de Respostas**

```typescript
// src/app/admin/[id]/page.tsx

export default async function RespostasPage({ params }: { params: { id: string } }) {
  const entrevistado = await prisma.entrevistado.findUnique({
    where: { id: params.id },
    include: { sponsor: true },
  });
  
  if (!entrevistado) {
    return <NotFound />;
  }
  
  const respostas = entrevistado.respostas as Respostas;
  
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{entrevistado.nome}</h1>
        <p className="text-gray-600">{entrevistado.cargo} - {entrevistado.area}</p>
        <p className="text-gray-600">Empresa: {entrevistado.sponsor.empresa}</p>
      </div>
      
      {/* Seção 1 */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Seção 1: Processo Atual</h2>
        
        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2">
            Como funciona o fluxo principal do seu trabalho?
          </h3>
          <p className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
            {respostas.secao_1?.p1_fluxo_principal}
          </p>
        </div>
        
        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2">
            Quem mais está envolvido nesse processo?
          </h3>
          <p className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
            {respostas.secao_1?.p2_pessoas_envolvidas}
          </p>
        </div>
      </section>
      
      {/* Repetir para Seções 2, 3, 4, 5 */}
      
      <div className="mt-8">
        <button 
          onClick={() => exportarJSON(respostas)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Exportar JSON
        </button>
      </div>
    </div>
  );
}
```

---

## **5. MENSAGEM INICIAL VIA WHATSAPP**

### **5.1 Geração da Mensagem**

**Funcionalidade no Painel Admin:**

```typescript
// Adicionar ao componente da lista de entrevistados

function gerarMensagemWhatsApp(entrevistado: Entrevistado, sponsor: Sponsor): string {
  const dataLimite = format(sponsor.data_limite, "dd/MM/yyyy");
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/diagnostico/${entrevistado.id}`;
  
  return `Olá, ${entrevistado.nome}! Aqui é o Dalton, consultor de IA do Dalton Lab.

A ${sponsor.empresa} está passando pelo nosso Programa de Transformação Agêntica, e o ${sponsor.nome} indicou você como pessoa-chave da área de ${entrevistado.area}.

Preciso te fazer algumas perguntas rápidas sobre o seu dia a dia — são 11 perguntas no total, leva uns 10-15 minutos, e você pode responder no seu ritmo.

Só preciso que a gente conclua até ${dataLimite}, para manter o cronograma do programa.

Acesse aqui: ${link}

Podemos começar?`;
}

// No componente
<button
  onClick={() => {
    const mensagem = gerarMensagemWhatsApp(entrevistado, entrevistado.sponsor);
    navigator.clipboard.writeText(mensagem);
    toast.success('Mensagem copiada!');
  }}
  className="text-sm text-blue-600 hover:underline"
>
  Copiar mensagem
</button>
```

### **5.2 Envio Manual**

**Instruções para o Time:**

1. Acesse o painel admin
2. Localize o entrevistado na lista
3. Clique em "Copiar mensagem"
4. Abra WhatsApp Web/App
5. Cole e envie a mensagem

---

## **6. VARIÁVEIS DE AMBIENTE**

```bash
# .env.local

# Database
DATABASE_URL="postgresql://user:password@host:5432/dalton_diagnostico"

# OpenAI
OPENAI_API_KEY="sk-..."

# App
NEXT_PUBLIC_APP_URL="https://forms.daltonlab.ai"

# Supabase (se usar auth/storage adicional)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
```

---

## **7. COMANDOS DE SETUP**

```bash
# Clone o repositório
git clone [repo-url]
cd dalton-diagnostico

# Instale dependências
npm install

# Configure o banco de dados
npx prisma generate
npx prisma db push

# (Opcional) Seed inicial se necessário
npx prisma db seed

# Rode em desenvolvimento
npm run dev

# Build para produção
npm run build

# Deploy (Vercel)
vercel --prod
```

---

## **8. MIGRATIONS E SEEDS**

### **8.1 Seed Inicial (Opcional)**

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Criar sponsor de exemplo
  const sponsor = await prisma.sponsor.create({
    data: {
      nome: 'João Silva',
      empresa: 'Empresa Teste',
      whatsapp: '+5511999999999',
      areas_contratadas: ['Financeiro', 'Operações'],
      data_limite: new Date('2026-03-15'),
      avisou_time: true,
      entrevistados: {
        create: [
          {
            nome: 'Maria Santos',
            cargo: 'Analista Financeiro',
            area: 'Financeiro',
            whatsapp: '+5511988888888',
            status: 'nao_iniciado',
          },
          {
            nome: 'Pedro Oliveira',
            cargo: 'Coordenador de Operações',
            area: 'Operações',
            whatsapp: '+5511977777777',
            status: 'nao_iniciado',
          },
          {
            nome: 'Ana Costa',
            cargo: 'Assistente Financeiro',
            area: 'Financeiro',
            whatsapp: '+5511966666666',
            status: 'nao_iniciado',
          },
        ],
      },
    },
  });

  console.log('Seed concluído:', sponsor);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## **9. TESTES**

### **9.1 Casos de Teste Prioritários**

**Formulário Sponsor:**
- ✅ Validação de mínimo 3 entrevistados
- ✅ Validação de WhatsApps únicos
- ✅ Validação de formato de WhatsApp
- ✅ Submit cria sponsor + entrevistados no banco

**Formulário Diagnóstico:**
- ✅ Carrega dados corretos via UUID
- ✅ 404 para UUID inválido
- ✅ Auto-save funciona ao avançar seção
- ✅ Condicionais aparecem/somem corretamente
- ✅ Status atualiza para "concluido" na seção 5
- ✅ Gravação e transcrição de áudio funciona

**Painel Admin:**
- ✅ Lista todos entrevistados
- ✅ Filtros de status funcionam
- ✅ Link "Ver respostas" só aparece para concluídos
- ✅ Visualização de respostas renderiza corretamente

---

## **10. CHECKLIST DE IMPLEMENTAÇÃO**

### **Fase 1: Setup Inicial**
- [ ] Criar projeto Next.js
- [ ] Configurar Prisma + Supabase
- [ ] Criar schema do banco
- [ ] Rodar migrations
- [ ] Configurar variáveis de ambiente

### **Fase 2: Formulário Sponsor**
- [ ] Criar página `/sponsor`
- [ ] Implementar campos dinâmicos de entrevistados
- [ ] Adicionar validações
- [ ] Criar API POST `/api/sponsors`
- [ ] Testar criação no banco

### **Fase 3: Formulário Diagnóstico**
- [ ] Criar página `/diagnostico/[uuid]`
- [ ] Implementar navegação entre seções
- [ ] Adicionar validações por seção
- [ ] Implementar auto-save
- [ ] Criar API PATCH `/api/respostas`

### **Fase 4: Gravação de Áudio**
- [ ] Criar componente `AudioRecorder`
- [ ] Configurar OpenAI Whisper API
- [ ] Criar API POST `/api/transcribe`
- [ ] Integrar nos textareas
- [ ] Testar transcrição

### **Fase 5: Condicionais**
- [ ] Implementar detecção de planilhas (Seção 3)
- [ ] Implementar condicionais de IA (Seção 4)
- [ ] Testar todos os fluxos condicionais

### **Fase 6: Painel Admin**
- [ ] Criar página `/admin`
- [ ] Implementar lista de entrevistados
- [ ] Adicionar badges de status
- [ ] Criar página `/admin/[id]` (visualização)
- [ ] Adicionar botão de copiar mensagem

### **Fase 7: Deploy**
- [ ] Build de produção local
- [ ] Deploy no Vercel
- [ ] Configurar domínio custom (se aplicável)
- [ ] Testar em produção

---

## **11. CONSIDERAÇÕES DE SEGURANÇA**

### **11.1 Proteção de Rotas**

```typescript
// Middleware básico para proteger rotas admin
// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Proteger rotas /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Implementar autenticação básica ou JWT
    const token = request.cookies.get('admin_token');
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
```

### **11.2 Rate Limiting (API Whisper)**

```typescript
// Implementar rate limit simples no endpoint de transcrição
// Para evitar abuso/custo excessivo

import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 transcrições por IP
});

// Aplicar no endpoint /api/transcribe
```

---

## **12. MÉTRICAS E MONITORAMENTO**

### **12.1 Eventos para Tracking**

```typescript
// Eventos importantes para analytics

// Formulário Sponsor
- sponsor_form_submitted
- entrevistados_cadastrados (count)

// Formulário Diagnóstico
- diagnostico_iniciado
- secao_completada (secao_numero)
- diagnostico_concluido
- audio_transcrito (secao, pergunta)
- tempo_por_secao (duração)

// Admin
- respostas_visualizadas
- mensagem_copiada
```

### **12.2 Logs Importantes**

```typescript
// Logs críticos para debugging

console.log('[SPONSOR] Criado:', sponsor.id);
console.log('[ENTREVISTADO] Iniciado:', entrevistado.id);
console.log('[SECAO] Completada:', { entrevistado_id, secao });
console.log('[DIAGNOSTICO] Concluído:', entrevistado.id);
console.log('[WHISPER] Transcrição:', { duration, chars });
```

---

## **13. OTIMIZAÇÕES FUTURAS (PÓS-MVP)**

**Não implementar agora, mas documentar para próximas iterações:**

- [ ] Follow-ups automáticos via WhatsApp API
- [ ] Detecção inteligente de sistemas com IA
- [ ] Dashboard com gráficos e analytics
- [ ] Exportação em múltiplos formatos (PDF, Excel)
- [ ] Notificações em tempo real (WebSockets)
- [ ] Sistema de templates de mensagens customizáveis
- [ ] Multi-idioma (i18n)
- [ ] Mobile app nativo

---

## **14. CONTATOS E SUPORTE**

**Para dúvidas técnicas durante implementação:**
- Diego (Product Owner): [contato]
- Time Dalton Lab: @daltonlab.ai

**Repositório:**
- GitHub: [URL do repo]

**Ambientes:**
- Desenvolvimento: http://localhost:3000
- Produção: https://forms.daltonlab.ai

---

**FIM DA ESPECIFICAÇÃO TÉCNICA**
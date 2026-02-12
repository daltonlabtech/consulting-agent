-- CreateTable
CREATE TABLE "sponsors" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "areas_contratadas" TEXT[],
    "data_limite" TIMESTAMP(3) NOT NULL,
    "avisou_time" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrevistados" (
    "id" TEXT NOT NULL,
    "sponsor_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'nao_iniciado',
    "secao_atual" INTEGER NOT NULL DEFAULT 1,
    "secoes_completadas" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "respostas" JSONB NOT NULL DEFAULT '{}',
    "iniciado_em" TIMESTAMP(3),
    "concluido_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entrevistados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "entrevistados_whatsapp_key" ON "entrevistados"("whatsapp");

-- CreateIndex
CREATE INDEX "entrevistados_sponsor_id_idx" ON "entrevistados"("sponsor_id");

-- CreateIndex
CREATE INDEX "entrevistados_status_idx" ON "entrevistados"("status");

-- AddForeignKey
ALTER TABLE "entrevistados" ADD CONSTRAINT "entrevistados_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "sponsors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "@/app/styles/material-details.css";
import { parseRichText } from "@/app/utils/parseRichText";

import { useUserMaterialViewModel } from "@/app/components/viewmodels/useUserMaterialViewModel";
import { Material } from "@/app/models/types/material";
import { parseSlides, ParsedSlide } from "@/app/utils/slidePreview";
import { SlidesPreview } from "@/app/components/views/SlidesPreview";
import { DocumentPreview } from "@/app/components/views/DocumentPreview";
import { supabaseMaterialRepository } from "@/app/models/repository/supabase/supabaseMaterialRepository";

const MaterialDetailsPage = () => {
  const { id, unitId, materialId } = useParams();
  const router = useRouter();
  const { state, actions } = useUserMaterialViewModel();

  const [material, setMaterial] = useState<Material | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

 useEffect(() => {
  const loadMaterial = async () => {
    const found = actions.getMaterialById(materialId as string);
    if (found) {
      setMaterial(found);
      setEditedContent(found.content);
      return;
    }

    const fromDb = await supabaseMaterialRepository.getMaterialById(
      materialId as string
    );

    if (fromDb) {
      setMaterial(fromDb);
      setEditedContent(fromDb.content);
    }
  };

  loadMaterial();
}, [materialId, actions]);


  if (!material) {
    return <p>Material não encontrado.</p>;
  }

  const slidePreviews: ParsedSlide[] =
    material.type === "SLIDES" ? parseSlides(material.content) : [];

  const handleSave = () => {
    if (!material) return;

    const updatedMaterial: Material = {
      ...material,
      content: editedContent,
    };

    actions.updateMaterial(updatedMaterial); // você pode criar essa função no viewmodel
    setMaterial(updatedMaterial);
    setIsEditing(false);
  };

  return (
    <div className="material-details-container">
      <header>
        <h1>{material.title}</h1>
        <button onClick={() => router.back()}>Voltar</button>
      </header>

      <section className="material-meta">
        <p>
          <strong>Tipo:</strong> {material.type}
        </p>
        <p>
          <strong>Criado em:</strong>{" "}
          {material.createdAt.toLocaleString("pt-BR")}
        </p>
      </section>

      <section className="material-content">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={15}
            style={{ width: "100%", fontFamily: "inherit" }}
          />
        ) : material.type === "SLIDES" ? (
          <SlidesPreview slides={slidePreviews} />
        ) : (
          <DocumentPreview title={material.title} content={material.content} />
        )}
      </section>

      <section className="material-actions">
        {isEditing ? (
          <>
            <button onClick={handleSave}>Salvar Alterações</button>
            <button onClick={() => setIsEditing(false)}>Cancelar</button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)}>Editar Conteúdo</button>
        )}

        <button onClick={() => actions.exportMaterial(material.id, "PDF")}>
          Exportar PDF
        </button>

        <button onClick={() => actions.exportMaterial(material.id, "SLIDES")}>
          Exportar Slides
        </button>
      </section>
    </div>
  );
};

export default MaterialDetailsPage;

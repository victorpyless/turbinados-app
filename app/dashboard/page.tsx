"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import KanbanBoard from "@/components/KanbanBoard";
// import NewProjectModal from "@/components/NewProjectModal"; // Lazy loaded below
import Toast from "@/components/Toast";
import { Plus, Search, Flame, LogOut } from "lucide-react";
import { Project } from "@/types/project";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const NewProjectModal = dynamic(() => import("@/components/NewProjectModal"), { ssr: false });

export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });

  // Visionary: Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [onlyPriority, setOnlyPriority] = useState(false);

  // Engineer: Auth Protection
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
      }
    };
    checkSession();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSaveProject = async (data: { title: string; carModel: string; date: string; priority: boolean; imageFile: File | null }) => {
    let uploadedImageUrl = "";

    // 0. Upload Image if exists (Engineer)
    if (data.imageFile) {
      const fileExt = data.imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-covers')
        .upload(filePath, data.imageFile);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setToast({ visible: true, message: "⚠️ Erro ao enviar imagem (mas criando projeto...)" });
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('project-covers')
          .getPublicUrl(filePath);
        uploadedImageUrl = publicUrl;
      }
    }

    // 1. Insert into Supabase
    const { data: insertedData, error } = await supabase
      .from('projects')
      .insert([
        {
          title: data.title,
          car_model: data.carModel,
          date: data.date,
          status: 'pauta',
          is_delayed: false,
          thumbnail_url: uploadedImageUrl
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting project", error);
      setToast({ visible: true, message: `❌ Erro ao criar projeto` });
      return;
    }

    // 2. Update Local State (Optimistic or from response)
    const newProject: Project = {
      id: insertedData.id,
      title: insertedData.title,
      carModel: insertedData.car_model, // snake_case from DB
      status: insertedData.status,
      date: insertedData.date,
      thumbnailUrl: insertedData.thumbnail_url || "",
      isDelayed: insertedData.is_delayed,
      year: insertedData.year,
      color: insertedData.color,
      notes: insertedData.notes
    };

    setProjects((prev) => [newProject, ...prev]);

    // 3. Show Toast (Visionary)
    setToast({ visible: true, message: `🚀 Projeto Iniciado: ${data.title}` });

    // 4. Close Modal
    setIsModalOpen(false);
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Tem certeza que quer excluir este projeto?")) {
      // Optimistic UI Update
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setToast({ visible: true, message: "🗑️ Projeto removido." });

      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        console.error("Error deleting project:", error);
        setToast({ visible: true, message: "❌ Erro ao excluir do banco." });
        // Optionally revert state here
      }
    }
  };

  return (
    <main className="min-h-screen bg-garage-dark flex flex-col">
      {/* Header / Nav */}
      <header className="h-14 border-b border-neutral-800 flex items-center justify-between px-6 bg-garage-dark z-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-turbinados-red rounded-full animate-pulse shadow-[0_0_8px_#ff3b30]"></div>
          <h1 className="font-bold text-lg tracking-tight text-white">TURBINADOS<span className="text-neutral-500 font-mono text-xs ml-2">v.1.0</span></h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-xs font-mono text-neutral-500 uppercase">
            Status do Sistema: <span className="text-green-500">OPERACIONAL</span>
          </div>

          {/* Visionary: Search Bar */}
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-turbinados-red transition-colors" size={14} />
            <input
              type="text"
              placeholder="Buscar placa ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-white/20 focus:border-turbinados-red/50 focus:outline-none focus:w-64 w-48 transition-all font-mono"
            />
          </div>

          {/* Visionary: Priority Toggle */}
          <button
            onClick={() => setOnlyPriority(!onlyPriority)}
            className={`p-1.5 rounded-full border transition-all ${onlyPriority
              ? 'bg-turbinados-red/20 border-turbinados-red text-turbinados-red shadow-[0_0_10px_rgba(220,38,38,0.5)]'
              : 'bg-transparent border-white/10 text-white/20 hover:text-white'
              }`}
            title="Filtrar Prioridade Alta"
          >
            <Flame size={16} className={onlyPriority ? 'fill-red-500 animate-pulse' : ''} />
          </button>

          {/* Strategist: Key Action Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-white text-black px-4 py-1.5 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-turbinados-red hover:text-white transition-all group"
          >
            <Plus size={14} className="group-hover:rotate-90 transition-transform" />
            Novo Projeto
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral-800 rounded-full border border-neutral-700 flex items-center justify-center text-xs text-white font-mono">
              AD
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-neutral-500 hover:text-white transition-colors"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          projects={projects}
          setProjects={setProjects}
          onDeleteProject={handleDeleteProject}
          showToast={(msg) => setToast({ visible: true, message: msg })}
          searchTerm={searchTerm}
          onlyPriority={onlyPriority}
        />
      </div>

      {/* Overlays */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
      />

      <Toast
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </main>
  );
}

'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Restored Interface for Frontend Compatibility
export interface Comment {
    id: string;
    content: string;
    created_at: string;
    project_id: string;
    user_id: string;
    user?: {
        email: string;
    };
    user_email?: string; // Keeping for backward compatibility if needed by frontend types
}

export async function addComment(projectId: string, content: string) {
    const schema = z.object({
        content: z.string().min(1),
        projectId: z.string().uuid(),
    })

    const validation = schema.safeParse({ content, projectId })

    if (!validation.success) {
        return { error: 'Dados inválidos. O comentário não pode estar vazio.' }
    }

    const supabase = createClient()

    // 1. Verificar quem é o usuário
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        console.error("Erro de Auth:", authError)
        return { error: 'Sessão perdida. Por favor, recarregue a página e logue novamente.' }
    }

    // 2. Tentar inserir
    const { error: dbError } = await supabase.from('comments').insert({
        project_id: projectId,
        content: content,
        user_id: user.id // Vincula explicitamente ao usuário logado
    })

    if (dbError) {
        console.error("Erro no Banco de Dados:", dbError)
        // Retorna a mensagem técnica para facilitar o debug
        return { error: `Erro no Banco: ${dbError.message} (Código: ${dbError.code})` }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function getComments(projectId: string) {
    const supabase = createClient()
    const { data } = await supabase
        .from('comments')
        .select('*, user:user_id(email)') // Tenta buscar o email do usuário
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

    // Normalize data to flatten user email if necessary, or let frontend handle it
    return (data || []) as unknown as Comment[]
}

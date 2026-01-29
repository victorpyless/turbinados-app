"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Zod Schema for strict validation
const BrainstormSchema = z.object({
    carModel: z.string().min(2, "O modelo do carro deve ter pelo menos 2 caracteres."),
});

// Response Interface
export interface BrainstormData {
    titles: string[];
    prompts: string[];
}

export interface BrainstormResponse {
    success: boolean;
    data?: BrainstormData;
    error?: string;
}

export async function generateIdeas(inputCarModel: string): Promise<BrainstormResponse> {
    console.log("🚀 Server Action Called: generateIdeas for", inputCarModel);

    // 1. Validation (Strict Engineering Standard)
    const validation = BrainstormSchema.safeParse({ carModel: inputCarModel });
    if (!validation.success) {
        const errorMsg = validation.error.issues[0]?.message || "Invalid Input";
        console.error("❌ Validation Error:", validation.error.format());
        return { success: false, error: errorMsg };
    }
    const { carModel } = validation.data;

    // 2. Environment Check
    if (!genAI) {
        console.error("❌ GEMINI_API_KEY not found.");
        return { success: false, error: "Erro de Configuração: API Key não encontrada." };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

        // 3. Prompt Engineering
        const prompt = `Atue como um especialista em YouTube Automotivo (Canal Turbinados). Para o carro "${carModel}", gere um JSON com:
    
    titles: 3 títulos virais, chamativos e curtos para o YouTube (PT-BR).
    prompts: 3 prompts de imagem detalhados (em Inglês, para melhor qualidade no Midjourney) focados em fotografia automotiva realista, ângulos dramáticos e iluminação de estúdio.
    
    Responda APENAS o JSON puro, sem markdown (sem \`\`\`json), contendo exatamente as chaves "titles" e "prompts".`;

        console.log("⏳ Calling Gemini API...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("✅ Gemini Response:", text.substring(0, 100) + "...");

        // 4. Parsing & Sanitization
        // Remove markdown code blocks if AI fails to follow "no markdown" rule
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(jsonString) as BrainstormData;

        return { success: true, data };

    } catch (error: any) {
        console.error("❌ Error generating brainstorming ideas:", error);
        return { success: false, error: `Erro na IA: ${error.message || "Falha desconhecida"}` };
    }
}

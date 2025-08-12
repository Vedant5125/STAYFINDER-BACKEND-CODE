import { GoogleGenerativeAI } from '@google/generative-ai';
const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateDescriptionWithGemini = async(prompt) =>{
    try {
        const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.log("Gemini Api Error:",error);
        throw new Error("Failed to generate description with Gemini.");   
    }
}
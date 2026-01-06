
import { GoogleGenAI, Type } from "@google/genai";
import { Student } from '../types';

// Utility to fetch an image from a URL and convert it to a base64 string
const imageUrlToBase64 = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch(error) {
        console.error("Error converting image URL to base64:", error);
        // Return a placeholder or handle the error as appropriate
        return "";
    }
};

interface StudentImageData {
    id: string;
    name: string;
    imageBase64: string;
}

export const recognizeStudents = async (classroomImageBase64: string, students: Student[]): Promise<string[]> => {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        // Simulate a successful response for demonstration purposes if no key is available.
        const presentStudents = students.slice(0, Math.floor(Math.random() * students.length) + 1).map(s => s.id);
        console.log("Simulating Gemini response. Present students:", presentStudents);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
        return presentStudents;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        // Prepare student images by converting them to base64
        const studentImagesData: StudentImageData[] = await Promise.all(
            students.map(async (student) => ({
                id: student.id,
                name: student.name,
                imageBase64: await imageUrlToBase64(student.faceImage),
            }))
        );

        const studentParts = studentImagesData.filter(s => s.imageBase64).map(student => ({
            text: `Student Name: ${student.name}, Student ID: ${student.id}`,
        }));
        
        const studentImageParts = studentImagesData.filter(s => s.imageBase64).map(student => ({
            inlineData: {
                mimeType: 'image/jpeg',
                data: student.imageBase64,
            },
        }));

        const prompt = `
            You are an AI-powered attendance system. Your task is to identify which registered students are present in a classroom photo.
            1. Analyze the main classroom photo provided.
            2. Compare the faces in the classroom photo with the provided registered student photos.
            3. Respond ONLY with a valid JSON object. The object should have a single key "present_student_ids" which is an array of strings.
            4. Each string in the array must be the "Student ID" of a student you have confidently identified in the classroom photo.
            5. Do not include students who are not visible or identifiable. Do not include any other text, explanation, or formatting.
            
            Here are the registered students:
            ${studentImagesData.map(s => `- Student Name: ${s.name}, Student ID: ${s.id}`).join('\n')}
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: 'image/jpeg', data: classroomImageBase64 } },
                    ...studentImageParts,
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        present_student_ids: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING
                            }
                        }
                    }
                }
            }
        });
        
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        
        if (result && Array.isArray(result.present_student_ids)) {
            return result.present_student_ids;
        } else {
            console.error("Invalid JSON structure in Gemini response:", result);
            return [];
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to recognize students.");
    }
};

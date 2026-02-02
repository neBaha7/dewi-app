const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://dewi-app-production-72dc.up.railway.app';

export const api = {
    baseUrl: `${API_URL}/api/v1`,

    async ingestText(text: string, title: string) {
        const response = await fetch(`${this.baseUrl}/ingest/text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, title })
        });
        return response.json();
    },

    async generateVideo(factId: string, vibe: string = 'hype') {
        const response = await fetch(`${this.baseUrl}/videos/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fact_id: factId, vibe })
        });
        return response.json();
    },

    async chat(message: string) {
        const response = await fetch(`${this.baseUrl}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        return response.json();
    }
};

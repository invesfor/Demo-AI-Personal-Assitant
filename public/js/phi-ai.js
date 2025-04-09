class PhiAI {
    constructor() {
        this.apiUrl = 'http://localhost:11434/api/generate';
        this.model = 'phi';
    }

    async generateResponse(prompt) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        top_p: 0.9,
                        max_tokens: 500
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error calling Phi-2:', error);
            throw error;
        }
    }

    async chat(message) {
        try {
            const response = await this.generateResponse(message);
            return {
                role: 'assistant',
                content: response
            };
        } catch (error) {
            console.error('Chat error:', error);
            return {
                role: 'assistant',
                content: 'Sorry, I encountered an error processing your request.'
            };
        }
    }
}

// Export for use in other files
window.PhiAI = PhiAI; 
class SpeechAnalyzer {
    constructor() {
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.transcripts = [];
        
        this.recognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    this.transcripts.push(event.results[i][0].transcript);
                }
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };
    }

    start() {
        this.recognition.start();
    }

    stop() {
        this.recognition.stop();
    }

    getTranscripts() {
        return this.transcripts;
    }

    clearTranscripts() {
        this.transcripts = [];
    }
}

export default SpeechAnalyzer;
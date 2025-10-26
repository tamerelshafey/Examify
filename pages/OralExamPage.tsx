import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, GenerationConfig } from '@google/genai';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import DashboardLayout from '../components/DashboardLayout';
import { BookOpenIcon, CheckCircleIcon, SpeechIcon, BotIcon, MicIcon, SpinnerIcon } from '../components/icons';
import AudioVisualizer from '../components/AudioVisualizer';
import { analyzeOralExamPerformance } from '../services/ai';
import { OralExamAnalysis, TranscriptItem } from '../types';

const translations = {
    en: {
        title: "AI Oral Exam Practice",
        description: "Practice your speaking skills with an AI examiner. Choose a topic and start the conversation.",
        availableExams: "Available Exams",
        myResults: "My Results",
        oralPractice: "Oral Practice",
        selectTopic: "Select a topic...",
        startSession: "Start Session",
        endSession: "End Session",
        connecting: "Connecting...",
        sessionActive: "Session Active",
        error: "An error occurred",
        closed: "Connection closed.",
        micError: "Microphone access denied. Please enable microphone permissions in your browser settings.",
        topics: {
            'job-interview': "Job Interview Practice",
            'react-hooks': "Discussing React Hooks",
            'daily-conversation': "Daily Conversation",
        },
        analysis: "Session Analysis",
        analyzing: "Analyzing your performance...",
        fluency: "Fluency",
        pronunciation: "Pronunciation",
        grammar: "Grammar",
        overallFeedback: "Overall Feedback",
        analysisError: "Failed to analyze performance.",
    },
    ar: {
        title: "تدريب على الاختبار الشفهي مع الذكاء الاصطناعي",
        description: "تدرب على مهاراتك في التحدث مع ممتحن افتراضي. اختر موضوعًا وابدأ المحادثة.",
        availableExams: "الاختبارات المتاحة",
        myResults: "نتائجي",
        oralPractice: "تدريب شفهي",
        selectTopic: "اختر موضوعًا...",
        startSession: "بدء الجلسة",
        endSession: "إنهاء الجلسة",
        connecting: "جارٍ الاتصال...",
        sessionActive: "الجلسة نشطة",
        error: "حدث خطأ",
        closed: "تم إغلاق الاتصال.",
        micError: "تم رفض الوصول إلى الميكروفون. يرجى تمكين أذونات الميكروفون في إعدادات المتصفح.",
        topics: {
            'job-interview': "تدريب على مقابلة عمل",
            'react-hooks': "مناقشة حول React Hooks",
            'daily-conversation': "محادثة يومية",
        },
        analysis: "تحليل الجلسة",
        analyzing: "جاري تحليل أدائك...",
        fluency: "الطلاقة",
        pronunciation: "النطق",
        grammar: "القواعد",
        overallFeedback: "ملاحظات عامة",
        analysisError: "فشل تحليل الأداء.",
    }
};

const topicSystemInstructions = {
    'job-interview': "You are a friendly but professional hiring manager conducting a job interview for a frontend developer role. Ask the user about their experience, projects, and technical skills. Keep your questions concise.",
    'react-hooks': "You are a senior software engineer discussing React Hooks with a junior colleague. Ask about their understanding of hooks like useState, useEffect, and custom hooks. Provide simple explanations if they struggle.",
    'daily-conversation': "You are a friendly person making small talk. Ask about the user's day, hobbies, or weekend plans. Keep the conversation light and casual."
};

// Audio encoding/decoding helpers
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const ScoreCircle: React.FC<{ score: number; label: string }> = ({ score, label }) => {
    const getColor = (s: number) => {
        if (s >= 80) return 'text-green-500';
        if (s >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="flex flex-col items-center">
            <div className={`relative w-24 h-24 flex items-center justify-center`}>
                <svg className="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90)">
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        className="text-slate-200 dark:text-slate-700"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    />
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        className={getColor(score)}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeDasharray={`${score}, 100`}
                    />
                </svg>
                <span className={`absolute text-2xl font-bold ${getColor(score)}`}>{score}</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</p>
        </div>
    );
};

const AnalysisReport: React.FC<{ analysis: OralExamAnalysis, t: any }> = ({ analysis, t }) => (
    <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md animate-fade-in">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">{t.analysis}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <ScoreCircle score={analysis.fluency.score} label={t.fluency} />
            <ScoreCircle score={analysis.pronunciation.score} label={t.pronunciation} />
            <ScoreCircle score={analysis.grammar.score} label={t.grammar} />
        </div>
        <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <h4 className="font-semibold text-slate-700 dark:text-slate-200">{t.fluency}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{analysis.fluency.feedback}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <h4 className="font-semibold text-slate-700 dark:text-slate-200">{t.pronunciation}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{analysis.pronunciation.feedback}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <h4 className="font-semibold text-slate-700 dark:text-slate-200">{t.grammar}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{analysis.grammar.feedback}</p>
            </div>
            <div className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                <h4 className="font-semibold text-primary-800 dark:text-primary-300">{t.overallFeedback}</h4>
                <p className="text-sm text-primary-700 dark:text-primary-400 mt-1">{analysis.overallFeedback}</p>
            </div>
        </div>
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
            }
        `}</style>
    </div>
);

const OralExamPage = () => {
    const { theme } = useTheme();
    const { lang } = useLanguage();
    const t = { ...translations[lang], title: `${theme.platformName} Portal` };

    const [session, setSession] = useState<any>(null);
    const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'active' | 'error' | 'closed'>('idle');
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<keyof typeof topicSystemInstructions>('job-interview');
    const [micError, setMicError] = useState(false);
    const [analysis, setAnalysis] = useState<OralExamAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const mediaStream = useRef<MediaStream | null>(null);
    const inputAudioContext = useRef<AudioContext | null>(null);
    const outputAudioContext = useRef<AudioContext | null>(null);
    const scriptProcessor = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSource = useRef<MediaStreamAudioSourceNode | null>(null);
    const outputGainNode = useRef<GainNode | null>(null);
    const analyserNode = useRef<AnalyserNode | null>(null);
    
    const nextStartTime = useRef(0);
    const audioSources = useRef<Set<AudioBufferSourceNode>>(new Set());

    const navLinks = [
        { path: '/examinee', label: t.availableExams, icon: BookOpenIcon },
        { path: '/examinee', label: t.myResults, icon: CheckCircleIcon },
        { path: '/examinee/oral-exam', label: t.oralPractice, icon: SpeechIcon },
    ];
    
    // Initialize AudioContexts
    useEffect(() => {
        const anyWindow = window as any;
        inputAudioContext.current = new (anyWindow.AudioContext || anyWindow.webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContext.current = new (anyWindow.AudioContext || anyWindow.webkitAudioContext)({ sampleRate: 24000 });
        outputGainNode.current = outputAudioContext.current.createGain();
        outputGainNode.current.connect(outputAudioContext.current.destination);

        analyserNode.current = inputAudioContext.current.createAnalyser();

        return () => {
            inputAudioContext.current?.close();
            outputAudioContext.current?.close();
        }
    }, []);

    const startSession = async () => {
        if (connectionState !== 'idle' && connectionState !== 'closed') return;
        setConnectionState('connecting');
        setTranscript([]);
        setMicError(false);
        setAnalysis(null);
        setAnalysisError(null);
        setIsAnalyzing(false);

        try {
            mediaStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
            setMicError(true);
            setConnectionState('error');
            return;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const generationConfig: GenerationConfig = {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: topicSystemInstructions[selectedTopic],
            outputAudioTranscription: {},
            inputAudioTranscription: {},
        };

        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: generationConfig,
            callbacks: {
                onopen: () => {
                    setConnectionState('active');

                    if (!inputAudioContext.current || !mediaStream.current || !analyserNode.current) return;
                    
                    mediaStreamSource.current = inputAudioContext.current.createMediaStreamSource(mediaStream.current);
                    scriptProcessor.current = inputAudioContext.current.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessor.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob: Blob = {
                            data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };
                        sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                    };
                    
                    mediaStreamSource.current.connect(scriptProcessor.current);
                    scriptProcessor.current.connect(inputAudioContext.current.destination);
                    mediaStreamSource.current.connect(analyserNode.current);
                },
                onmessage: async (message: LiveServerMessage) => {
                     if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        setTranscript(prev => {
                            const last = prev[prev.length - 1];
                            if (last && last.role === 'user') {
                                return [...prev.slice(0, -1), { role: 'user', text: last.text + text }];
                            }
                            return [...prev, { role: 'user', text }];
                        });
                    }
                    if (message.serverContent?.outputTranscription) {
                        const text = message.serverContent.outputTranscription.text;
                        setTranscript(prev => {
                            const last = prev[prev.length - 1];
                            if (last && last.role === 'model') {
                                return [...prev.slice(0, -1), { role: 'model', text: last.text + text }];
                            }
                            return [...prev, { role: 'model', text }];
                        });
                    }

                    if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
                        if (outputAudioContext.current && outputGainNode.current) {
                            const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
                            const audioBytes = decode(base64Audio);
                            const audioBuffer = await decodeAudioData(
                                audioBytes,
                                outputAudioContext.current,
                                24000,
                                1,
                            );

                            const source = outputAudioContext.current.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputGainNode.current);
                            
                            source.addEventListener('ended', () => audioSources.current.delete(source));

                            const currentTime = outputAudioContext.current.currentTime;
                            nextStartTime.current = Math.max(nextStartTime.current, currentTime);
                            source.start(nextStartTime.current);
                            nextStartTime.current += audioBuffer.duration;
                            audioSources.current.add(source);
                        }
                    }

                    if (message.serverContent?.interrupted) {
                        for (const source of audioSources.current.values()) {
                            source.stop();
                        }
                        audioSources.current.clear();
                        nextStartTime.current = 0;
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live session error:', e);
                    setConnectionState('error');
                },
                onclose: (e: CloseEvent) => {
                    setConnectionState('closed');
                    mediaStream.current?.getTracks().forEach(track => track.stop());
                    scriptProcessor.current?.disconnect();
                    mediaStreamSource.current?.disconnect();
                    mediaStream.current = null;
                    scriptProcessor.current = null;
                    mediaStreamSource.current = null;
                    setSession(null);
                },
            },
        });
        setSession(await sessionPromise);
    };

    const endSession = () => {
        if (transcript.length > 0 && transcript.some(t => t.role === 'user')) {
            const performAnalysis = async () => {
                setIsAnalyzing(true);
                setAnalysisError(null);
                setAnalysis(null);
                try {
                    const result = await analyzeOralExamPerformance({
                        transcript,
                        topic: t.topics[selectedTopic]
                    });
                    setAnalysis(result);
                } catch (err: any) {
                    setAnalysisError(err.message || t.analysisError);
                } finally {
                    setIsAnalyzing(false);
                }
            };
            performAnalysis();
        }

        session?.close();
        // Cleanup is handled by onclose callback
    };

    return (
        <DashboardLayout navLinks={navLinks} pageTitle={t.title} sidebarHeader={<h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-10">{t.title}</h1>}>
             <p className="text-slate-500 dark:text-slate-400 mb-6">{t.description}</p>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-8">
                <div className="flex items-center gap-4">
                    <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value as any)}
                        className="p-3 bg-slate-100 dark:bg-slate-700 rounded-md w-full focus:ring-2 focus:ring-primary-500"
                        disabled={connectionState === 'active' || connectionState === 'connecting'}
                    >
                        {Object.entries(t.topics).map(([key, value]) => (
                            <option key={key} value={key}>{value}</option>
                        ))}
                    </select>
                    {connectionState !== 'active' && connectionState !== 'connecting' ? (
                        <button onClick={startSession} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-lg whitespace-nowrap">
                            {t.startSession}
                        </button>
                    ) : (
                        <button onClick={endSession} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg whitespace-nowrap">
                            {t.endSession}
                        </button>
                    )}
                </div>
                 {micError && <p className="text-red-500 text-sm mt-2">{t.micError}</p>}
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        {connectionState === 'connecting' && <><div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div><span>{t.connecting}</span></>}
                        {connectionState === 'active' && <><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div><span className="text-green-600 dark:text-green-400 font-semibold">{t.sessionActive}</span></>}
                        {connectionState === 'error' && <><div className="w-3 h-3 bg-red-500 rounded-full"></div><span className="text-red-500">{t.error}</span></>}
                        {connectionState === 'closed' && <><div className="w-3 h-3 bg-slate-400 rounded-full"></div><span className="text-slate-500">{t.closed}</span></>}
                    </div>
                     <div className="w-32 h-10">
                         <AudioVisualizer analyserNode={analyserNode.current} isAnimating={connectionState === 'active'} />
                    </div>
                </div>

                <div className="h-96 overflow-y-auto space-y-4 pr-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                    {transcript.map((item, index) => (
                        <div key={index} className={`flex items-start gap-3 ${item.role === 'user' ? 'justify-end' : ''}`}>
                            {item.role === 'model' && <BotIcon className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />}
                            <div className={`max-w-md p-3 rounded-lg ${item.role === 'user' ? 'bg-primary-100 dark:bg-primary-900/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                <p className="text-sm">{item.text}</p>
                            </div>
                            {item.role === 'user' && <MicIcon className="w-6 h-6 text-slate-500 flex-shrink-0 mt-1" />}
                        </div>
                    ))}
                </div>
            </div>

            {isAnalyzing && (
                <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center justify-center">
                    <SpinnerIcon className="w-6 h-6 text-primary-500 me-3" />
                    <p className="text-slate-600 dark:text-slate-300 font-semibold">{t.analyzing}</p>
                </div>
            )}
            {analysisError && <p className="mt-4 text-center text-red-500">{analysisError}</p>}
            {analysis && <AnalysisReport analysis={analysis} t={t} />}

        </DashboardLayout>
    );
};

export default OralExamPage;
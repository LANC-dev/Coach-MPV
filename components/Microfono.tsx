"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export default function PremiumMicrofono() {
  const [currentStep, setCurrentStep] = useState(1); // 1: Setup, 2: Recording, 3: Processing, 4: Results
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lang, setLang] = useState("es-ES");
  const [evaluacion, setEvaluacion] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(180);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Componente de rating con estrellas
  const StarRating = ({ score, label }: { score: number; label: string }) => {
    const percentage = (score / 5) * 100;
    const color = score >= 4 ? "text-green-500" : score >= 3 ? "text-yellow-500" : "text-red-500";
    
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-gray-800">{label}</span>
          <span className={`text-2xl font-bold ${color}`}>{score}/5</span>
        </div>
        <div className="flex justify-center mb-2">
          <span className="text-2xl">
            {"⭐".repeat(score)}{"☆".repeat(5-score)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              score >= 4 ? 'bg-green-500' : score >= 3 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Función de evaluación mejorada con useCallback
  const evaluar = useCallback(async () => {
    if (!transcript) {
      alert("No hay transcripción para evaluar.");
      return;
    }
    
    setCurrentStep(3);
    setIsProcessing(true);
    
    try {
      const res = await fetch("/api/evaluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, lang }),
      });
      const data = await res.json();
      
      // Simular procesamiento para mejor UX
      setTimeout(() => {
        setEvaluacion(data);
        setIsProcessing(false);
        setCurrentStep(4);
        leerResultados(data);
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setIsProcessing(false);
      setCurrentStep(2);
    }
  }, [transcript, lang]);

  // Inicialización del SpeechRecognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang;
        
        recognition.onresult = (event: any) => {
          let text = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
          }
          setTranscript(text);
        };

        recognition.onstart = () => {
          setIsSpeaking(true);
        };

        recognition.onend = () => {
          setIsSpeaking(false);
        };

        recognition.onerror = (event: any) => {
          if (event.error !== "no-speech") {
            console.error("Error en reconocimiento:", event.error);
          }
        };
        
        recognitionRef.current = recognition;
      }
      synthRef.current = window.speechSynthesis;
    }
  }, [lang]);

  // Temporizador
  useEffect(() => {
    if (isListening) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopListening();
            if (transcript) evaluar();
            return 0;
          }
          return prev - 1;
        });
        setProgress((prev) => prev + 100 / 180);
        setAudioLevel(Math.random() * 100); // Simular nivel de audio
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      setProgress(0);
      setTimeLeft(180);
      setAudioLevel(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [isListening, transcript, evaluar]);

  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Tu navegador no soporta reconocimiento de voz");
      return;
    }
    recognitionRef.current.start();
    setIsListening(true);
    setCurrentStep(2);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const leerResultados = (data: any) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    
    const texto = `Excelente trabajo. Tu puntuación general es muy buena. ${Object.entries(data.puntajes)
      .map(([k, v]) => `En ${k}, obtuviste ${v} de 5 puntos`)
      .join(". ")}. Algunos consejos para mejorar: ${data.consejos.slice(0, 2).join(". ")}.`;
    
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = lang;
    synthRef.current.speak(utterance);
  };

  const detenerLectura = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  // Función mejorada para generar PDF
  const descargarReporte = async () => {
    if (!evaluacion) return;

    const html2pdf = (await import("html2pdf.js")).default;
    
    const promedio = Object.values(evaluacion.puntajes).reduce((a: number, b: any) => a + Number(b), 0) / Object.keys(evaluacion.puntajes).length;
    const fecha = new Date().toLocaleDateString('es-ES');
    const duracion = Math.floor((180 - timeLeft) / 60);
    
    const element = document.createElement("div");
    element.innerHTML = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1f2937;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 30px; margin-bottom: 40px;">
          <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 20px;">
            <div style="width: 50px; height: 50px; background: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px;">🎤</span>
            </div>
            <h1 style="margin: 0; color: #1f2937; font-size: 32px; font-weight: bold;">VoiceCoach</h1>
          </div>
          <h2 style="margin: 0; color: #6b7280; font-size: 18px; font-weight: normal;">Reporte de Evaluación de Comunicación</h2>
          <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px; display: inline-block;">
            <p style="margin: 0; color: #4b5563;"><strong>Fecha:</strong> ${fecha} | <strong>Idioma:</strong> ${lang === 'es-ES' ? 'Español' : 'Inglés'} | <strong>Duración:</strong> ${duracion} min</p>
          </div>
        </div>

        <!-- Resumen Ejecutivo -->
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; border-radius: 12px; margin-bottom: 40px;">
          <h3 style="margin: 0 0 20px 0; font-size: 24px;">Resumen Ejecutivo</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div style="text-align: center;">
              <div style="font-size: 36px; font-weight: bold; margin-bottom: 5px;">${promedio.toFixed(1)}/5</div>
              <div style="opacity: 0.9;">Puntuación General</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 36px; font-weight: bold; margin-bottom: 5px;">${transcript.split(' ').length}</div>
              <div style="opacity: 0.9;">Palabras Totales</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 36px; font-weight: bold; margin-bottom: 5px;">${Math.round(transcript.split(' ').length / (duracion || 1))}</div>
              <div style="opacity: 0.9;">Palabras/min</div>
            </div>
          </div>
        </div>

        <!-- Transcripción -->
        <div style="margin-bottom: 40px;">
          <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            📝 Transcripción de la Sesión
          </h3>
          <div style="background: #f9fafb; padding: 25px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="line-height: 1.8; margin: 0; color: #4b5563; font-size: 16px;">&ldquo;${transcript}&rdquo;</p>
          </div>
        </div>

        <!-- Evaluación Detallada -->
        <div style="margin-bottom: 40px;">
          <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 25px; display: flex; align-items: center; gap: 10px;">
            📊 Evaluación por Competencias
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            ${Object.entries(evaluacion.puntajes).map(([key, value]: [string, any]) => {
              const percentage = (value / 5) * 100;
              const color = value >= 4 ? '#10b981' : value >= 3 ? '#f59e0b' : '#ef4444';
              return `
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 15px;">
                    <span style="font-weight: 600; color: #1f2937; text-transform: capitalize;">${key}</span>
                    <span style="font-size: 24px; font-weight: bold; color: ${color};">${value}/5</span>
                  </div>
                  <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; background: ${color}; width: ${percentage}%; transition: width 0.3s;"></div>
                  </div>
                  <div style="margin-top: 10px; font-size: 14px; color: #6b7280;">
                    ${value >= 4 ? 'Excelente desempeño' : value >= 3 ? 'Buen nivel, con oportunidades de mejora' : 'Área que requiere atención y práctica'}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Recomendaciones -->
        <div style="margin-bottom: 40px;">
          <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            💡 Recomendaciones Personalizadas
          </h3>
          <div style="background: #eff6ff; padding: 25px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            ${evaluacion.consejos.map((consejo: string, index: number) => `
              <div style="margin-bottom: 15px; display: flex; align-items: flex-start; gap: 12px;">
                <div style="background: #3b82f6; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0; margin-top: 2px;">
                  ${index + 1}
                </div>
                <p style="margin: 0; color: #1e40af; line-height: 1.6; font-size: 15px;">${consejo}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Plan de Acción -->
        <div style="margin-bottom: 40px;">
          <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 20px;">🎯 Plan de Acción Sugerido</h3>
          <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; border-left: 4px solid #10b981;">
            <div style="margin-bottom: 20px;">
              <h4 style="color: #166534; margin: 0 0 10px 0; font-size: 16px;">Próximos 7 días:</h4>
              <p style="margin: 0; color: #15803d; line-height: 1.6;">Practica 10 minutos diarios enfocándote en las áreas con menor puntuación. Graba tus sesiones para auto-evaluación.</p>
            </div>
            <div style="margin-bottom: 20px;">
              <h4 style="color: #166534; margin: 0 0 10px 0; font-size: 16px;">Próximos 30 días:</h4>
              <p style="margin: 0; color: #15803d; line-height: 1.6;">Implementa una recomendación específica cada semana. Solicita feedback de colegas o supervisores en situaciones reales.</p>
            </div>
            <div>
              <h4 style="color: #166534; margin: 0 0 10px 0; font-size: 16px;">Largo plazo (90 días):</h4>
              <p style="margin: 0; color: #15803d; line-height: 1.6;">Vuelve a evaluar tu progreso con VoiceCoach. Considera entrenamientos especializados en áreas específicas de comunicación.</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 30px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          <p style="margin: 0 0 10px 0;">Generado por <strong>VoiceCoach AI</strong> - Plataforma de entrenamiento en comunicación</p>
          <p style="margin: 0;">Para más información y entrenamientos adicionales, visita nuestro portal web</p>
        </div>
      </div>
    `;

    const options = {
      margin: 0.5,
      filename: `VoiceCoach_Reporte_${fecha.replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).save();
  };

  const resetSession = () => {
    setCurrentStep(1);
    setTranscript("");
    setEvaluacion(null);
    setTimeLeft(180);
    setProgress(0);
    setIsProcessing(false);
    detenerLectura();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎤</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Sesión de Entrenamiento</h1>
                <p className="text-blue-100">Análisis inteligente de comunicación</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {currentStep === 4 && evaluacion ? 
                  `${(Object.values(evaluacion.puntajes).reduce((a: any, b: any) => a + b, 0) / Object.keys(evaluacion.puntajes).length).toFixed(1)}/5` 
                  : `${currentStep}/4`
                }
              </div>
              <p className="text-blue-100 text-sm">
                {currentStep === 4 ? 'Puntuación' : 'Progreso'}
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Setup */}
        {currentStep === 1 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Prepárate para tu sesión</h2>
              <p className="text-lg text-gray-600">Configura tu entrenamiento de comunicación</p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-blue-50 p-6 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Idioma de práctica
                </label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="w-full p-4 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 text-lg"
                >
                  <option value="es-ES">🇪🇸 Español</option>
                  <option value="en-US">🇺🇸 English</option>
                </select>
              </div>

              <div className="bg-green-50 p-6 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-3">¿Qué vas a practicar?</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['Presentación', 'Entrevista', 'Ventas', 'Reunión', 'Conferencia', 'Conversación'].map((tipo) => (
                    <button key={tipo} className="p-3 bg-white border-2 border-green-200 rounded-lg hover:border-green-400 transition-colors text-left">
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startListening}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-xl font-semibold text-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-3"
              >
                <span className="text-2xl">🎤</span>
                <span>Comenzar Sesión</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Recording */}
        {currentStep === 2 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl transition-all transform hover:scale-105 shadow-2xl ${
                    isListening 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse' 
                      : 'bg-gradient-to-r from-green-500 to-green-600'
                  }`}
                >
                  <span className="text-5xl">{isListening ? '🔴' : '🎤'}</span>
                </button>
                
                {isListening && (
                  <div className="absolute -inset-4 rounded-full border-4 border-red-300 animate-ping"></div>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-2">
                {isListening ? 'Grabando...' : 'Presiona para grabar'}
              </h2>
              <p className="text-gray-600">
                {isListening ? 'Habla con naturalidad y confianza' : 'Tu sesión de entrenamiento te está esperando'}
              </p>
            </div>

            {isListening && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-gray-700">Progreso de sesión</span>
                    <span className="text-blue-600 font-mono">
                      {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
                      {(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-3">Transcripción en tiempo real</h3>
                  <div className="bg-white p-4 rounded-lg border min-h-[100px]">
                    <p className="text-gray-700 leading-relaxed">
                      {transcript || "Tu voz aparecerá aquí en tiempo real..."}
                      {isListening && <span className="animate-pulse ml-1">|</span>}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => { stopListening(); evaluar(); }}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <span>✅</span>
                    <span>Finalizar y Evaluar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Processing */}
        {currentStep === 3 && (
          <div className="p-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <div className="w-16 h-16 mx-auto mb-6 animate-spin">
                  <span className="text-6xl">⏳</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Analizando tu comunicación</h2>
                <p className="text-lg text-gray-600">Nuestro AI está evaluando tu desempeño...</p>
              </div>
              
              <div className="bg-blue-50 p-8 rounded-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Procesando transcripción</span>
                    <span className="text-green-500 text-xl">✅</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Analizando patrones de habla</span>
                    <span className="text-blue-600 text-xl animate-spin">⚙️</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Generando recomendaciones</span>
                    <span className="text-gray-300 text-xl">⚪</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {currentStep === 4 && evaluacion && (
          <div className="p-8">
            <div className="text-center mb-8">
              <span className="text-6xl mb-4 block">🏆</span>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Excelente trabajo!</h2>
              <p className="text-lg text-gray-600">Aquí están los resultados de tu sesión</p>
            </div>

            <div className="space-y-8">
              {/* Puntuaciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(evaluacion.puntajes).map(([key, value]) => (
                  <StarRating key={key} score={Number(value)} label={key} />
                ))}
              </div>

              {/* Transcripción */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <span className="text-xl">💬</span>
                  <span>Tu presentación</span>
                </h3>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-gray-700 leading-relaxed italic">&ldquo;{transcript}&rdquo;</p>
                </div>
              </div>

              {/* Consejos */}
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="font-semibold text-blue-800 mb-4 flex items-center space-x-2">
                  <span className="text-xl">🎯</span>
                  <span>Recomendaciones personalizadas</span>
                </h3>
                <div className="space-y-3">
                  {evaluacion.consejos.map((consejo: string, index: number) => (
                    <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-blue-400 flex items-start space-x-3">
                      <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{consejo}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={descargarReporte}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center space-x-2"
                >
                  <span className="text-xl">📄</span>
                  <span>Descargar Reporte PDF</span>
                </button>
                
                <button
                  onClick={isSpeaking ? detenerLectura : () => leerResultados(evaluacion)}
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <span className="text-xl">{isSpeaking ? '🔇' : '🔊'}</span>
                  <span>{isSpeaking ? 'Detener Audio' : 'Escuchar Resultados'}</span>
                </button>
                
                <button
                  onClick={resetSession}
                  className="bg-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
                >
                  <span className="text-xl">🔄</span>
                  <span>Nueva Sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer siempre visible */}
        <div className="bg-gray-50 px-8 py-6 border-t">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Idioma: {lang === 'es-ES' ? 'Español' : 'English'}</span>
              <span>•</span>
              <span>Sesión segura y privada</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-base">🔒</span>
              <span>Datos protegidos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

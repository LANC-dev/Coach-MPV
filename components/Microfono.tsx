"use client";
import { useState, useEffect, useRef } from "react";

export default function Microfono() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lang, setLang] = useState("es-ES");
  const [evaluacion, setEvaluacion] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(180);
  const [progress, setProgress] = useState(0);
  const recognitionRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  // 🔊 Referencia para SpeechSynthesis
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Componente de estrellas
  const StarRating = ({ score }: { score: number }) => {
    return (
      <div className="flex justify-center mt-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill={i < score ? "gold" : "lightgray"}
            className="w-5 h-5"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Evaluar con API
  const evaluar = async () => {
    if (!transcript) {
      alert("No hay transcripción para evaluar.");
      return;
    }
    setEvaluacion(null);
    const res = await fetch("/api/evaluar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, lang }),
    });
    const data = await res.json();
    setEvaluacion(data);
    // 🔊 Leer en voz alta los resultados automáticamente
    leerResultados(data);
  };

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
        recognition.onerror = (event: any) => {
          if (event.error === "no-speech") {
            alert("No detecté ninguna voz, intenta hablar de nuevo 🎤");
            recognition.stop();
            // Reiniciar escucha automáticamente (opcional)
            setTimeout(() => {
              recognition.start();
            }, 500);
          } else {
            console.error("Error en reconocimiento:", event.error);
            alert(`Ocurrió un error: ${event.error}`);
          }
        };
        recognitionRef.current = recognition;
      }
      // Inicializar SpeechSynthesis
      synthRef.current = window.speechSynthesis;
    }
  }, [lang]);

  // Temporizador y progreso
  useEffect(() => {
    if (isListening) {
      intervalRef.current = setInterval(async () => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopListening();
            if (transcript) evaluar();
            return 0;
          }
          return prev - 1;
        });
        setProgress((prev) => prev + 100 / 180);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      setProgress(0);
      setTimeLeft(180);
    }
    return () => clearInterval(intervalRef.current);
  }, [isListening, transcript, evaluar]); // ← AGREGUÉ evaluar aquí

  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Tu navegador no soporta SpeechRecognition 😢");
      return;
    }
    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // 🔊 Función para leer en voz alta los resultados
  const leerResultados = (data: any) => {
    if (!synthRef.current) return;
    // Detener cualquier lectura anterior
    synthRef.current.cancel();
    let texto = `Aquí están tus resultados. 
    Idioma: ${lang === "es-ES" ? "Español" : "Inglés"}.
    Transcripción: ${transcript}.
    Puntajes: 
    ${Object.entries(data.puntajes)
      .map(([k, v]) => `${k}: ${v} de 5`)
      .join(". ")}.
    Consejos: 
    ${data.consejos.join(". ")}.`;
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = lang;
    synthRef.current.speak(utterance);
  };

  // 🔊 Detener lectura manualmente
  const detenerLectura = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  // Descargar reporte
  const descargarReporte = async () => {
    if (!evaluacion) {
      alert("Primero debes evaluar la sesión.");
      return;
    }
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.createElement("div");
    element.innerHTML = `
      <h2>Reporte de Comunicación</h2>
      <p><strong>Idioma:</strong> ${lang === "es-ES" ? "Español" : "Inglés"}</p>
      <p><strong>Transcripción:</strong> ${transcript}</p>
      <h3>Puntajes:</h3>
      <ul>
        ${Object.entries(evaluacion.puntajes)
          .map(([k, v]) => `<li>${k}: ${v}</li>`)
          .join("")}
      </ul>
      <h3>Consejos:</h3>
      <ul>
        ${evaluacion.consejos.map((c: string) => `<li>${c}</li>`).join("")}
      </ul>
    `;
    html2pdf().from(element).set({ filename: "reporte_comunicacion.pdf" }).save();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 space-y-6">
        {/* Título */}
        <h2 className="text-xl font-semibold text-center text-gray-800">
          📊 Evaluación de tu Sesión
        </h2>
        <p className="text-center text-gray-500">
          Análisis detallado de tus habilidades de comunicación
        </p>
        {/* Botones de grabación */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="es-ES">Español</option>
            <option value="en-US">Inglés</option>
          </select>
          <button
            onClick={isListening ? stopListening : startListening}
            className={`px-6 py-2 rounded-xl font-semibold text-white transition-colors ${
              isListening ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isListening ? "Detener" : "Iniciar Sesión"}
          </button>
          <button
            onClick={evaluar}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors"
          >
            Evaluar
          </button>
          {evaluacion && (
            <button
              onClick={detenerLectura}
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold transition-colors"
            >
              🔇 Detener Lectura
            </button>
          )}
        </div>
        {/* Progreso */}
        {isListening && (
          <div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-3 bg-green-400 transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-gray-600 mt-1 text-sm text-center">
              Tiempo restante: {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </p>
          </div>
        )}
        {/* Transcripción */}
        <div className="p-4 border rounded-xl bg-gray-50 min-h-[100px]">
          <p className="text-gray-600 font-medium">📝 Transcripción:</p>
          <p className="text-gray-700">{transcript || "Aquí aparecerá lo que digas..."}</p>
        </div>
        {/* Evaluación */}
        {evaluacion && (
          <div className="space-y-6">
            {/* Puntajes con estrellas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.entries(evaluacion.puntajes).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-gray-50 p-4 rounded-xl shadow text-center border"
                >
                  <p className="text-lg font-semibold text-gray-700">{String(value)}/5</p>
                  <StarRating score={Number(value)} />
                  <p className="text-sm text-gray-500 mt-1">{key}</p>
                </div>
              ))}
            </div>
            {/* Consejos */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">💡 Consejos para Mejorar</h3>
              <ul className="space-y-2">
                {evaluacion.consejos.map((c: string, i: number) => (
                  <li
                    key={i}
                    className="bg-white p-2 rounded-md shadow-sm border text-gray-600"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            {/* Botones finales */}
            <div className="flex justify-center gap-4">
              <button
                onClick={descargarReporte}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold transition-colors"
              >
                📄 Descargar Reporte PDF
              </button>
              <button
                onClick={() => {
                  setEvaluacion(null);
                  setTranscript("");
                  detenerLectura();
                }}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                🔄 Nueva Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

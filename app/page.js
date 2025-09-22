"use client";
import { useState } from "react";
import Image from "next/image";
import Microfono from "../components/Microfono"; // Asegúrate de que la ruta sea correcta

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const [startSession, setStartSession] = useState(false);

  const handleAccept = () => {
    setShowModal(false);
    setStartSession(true); // Redirige o muestra el microfono
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center justify-center p-6">
      {!startSession ? (
        <>
          {/* Logo y título */}
          <div className="text-center mb-10">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={96} 
              height={96}
              className="mx-auto mb-4" 
            />
            <h1 className="text-4xl font-bold text-gray-800">
              The AI voice platform for <span className="text-purple-600">communication</span> learning
            </h1>
            <p className="mt-3 text-gray-600 max-w-xl mx-auto">
              Create personalized coaching sessions with AI avatars and get real-time feedback on your communication skills in multiple languages with the click of a button.
            </p>
          </div>
          {/* Botón de generar sesión */}
          <button
            onClick={() => setShowModal(true)}
            className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
          >
            🚀 Generate your communication session
          </button>
          {/* Modal de privacidad */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-md mx-4 text-center shadow-lg">
                <h2 className="text-2xl font-bold mb-4">🔒 Privacy &amp; Consent</h2>
                <p className="text-gray-700 mb-4">
                  To provide you with the best coaching experience, we need access to your microphone to:
                </p>
                <ul className="text-left mb-4 list-disc list-inside text-gray-700">
                  <li>Transcribe your voice in real-time</li>
                  <li>Analyze your communication patterns</li>
                  <li>Generate personalized feedback</li>
                </ul>
                <p className="text-gray-600 mb-6">
                  <strong>Privacy:</strong> We don&apos;t store your audio. We only process transcriptions temporarily to generate your evaluation.
                </p>
                <div className="flex justify-around">
                  <button
                    onClick={handleAccept}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
                  >
                    ✅ Accept &amp; Continue
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        // Mostrar Microfono después de aceptar
        <Microfono />
      )}
    </div>
  );
}

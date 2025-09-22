"use client";
import { useState } from 'react'
import { Mic, ChevronDown, Play, Star, Users, Zap, BarChart3, Globe, Lock } from 'lucide-react'

export default function ColossyanInspiredLanding() {
  const [showModal, setShowModal] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(0)

  const avatars = [
    { name: "Professional Coach", bg: "bg-gradient-to-br from-blue-500 to-purple-600", emoji: "👨‍💼" },
    { name: "Friendly Mentor", bg: "bg-gradient-to-br from-green-500 to-blue-500", emoji: "👩‍🏫" },
    { name: "Expert Trainer", bg: "bg-gradient-to-br from-purple-500 to-pink-500", emoji: "🎯" }
  ]

  const handleStartSession = () => {
    setShowModal(true)
  }

  const handleAccept = () => {
    setShowModal(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">VoiceCoach</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 cursor-pointer">
                <span>Product</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 cursor-pointer">
                <span>Resources</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Pricing</span>
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Enterprise</span>
              <button className="text-gray-600 hover:text-gray-900">Contact sales</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium">
                Get started free
              </button>
              <button className="text-gray-600 hover:text-gray-900">Log in</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gray-50 pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-xl">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
                The AI voice platform for{' '}
                <span className="text-blue-600">communication</span> learning
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create personalized coaching sessions with AI avatars and get real-time 
                feedback on your communication skills in multiple languages with the click of a button.
              </p>

              {/* Interactive Demo Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    1
                  </div>
                  <span className="text-sm font-medium text-gray-700">Choose your AI coach</span>
                </div>
                
                <div className="flex space-x-3 mb-6">
                  {avatars.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAvatar(index)}
                      className={`w-16 h-16 ${avatar.bg} rounded-xl flex items-center justify-center text-2xl hover:scale-105 transition-transform ${
                        selectedAvatar === index ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                      }`}
                    >
                      {avatar.emoji}
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Mic className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">What should your AI coach help you practice?</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Presentation skills, sales pitch, interview preparation..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button 
                  onClick={handleStartSession}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Generate your coaching session</span>
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-2">No sign up required</p>
              </div>

              {/* Trust Indicators */}
              <div>
                <p className="text-sm text-gray-500 mb-3">TRUSTED BY:</p>
                <div className="flex items-center space-x-6 opacity-60">
                  <div className="text-lg font-bold text-gray-400">Microsoft</div>
                  <div className="text-lg font-bold text-gray-400">Salesforce</div>
                  <div className="text-lg font-bold text-gray-400">Porsche</div>
                  <div className="text-lg font-bold text-gray-400">BASF</div>
                </div>
              </div>
            </div>
            
            {/* Avatar/Coach Visualization */}
            <div className="lg:text-center">
              <div className="relative">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md mx-auto">
                  <div className={`w-48 h-48 ${avatars[selectedAvatar].bg} rounded-2xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden`}>
                    <div className="text-6xl">{avatars[selectedAvatar].emoji}</div>
                    {/* Animated microphone indicator */}
                    <div className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Mic className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {avatars[selectedAvatar].name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Ready to analyze your communication skills and provide personalized feedback
                  </p>
                  <div className="flex justify-center items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">4.9/5 rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to master communication
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful AI technology meets practical communication training
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8 text-blue-600" />,
                title: "Instant Feedback",
                description: "Get real-time analysis of your communication patterns, tone, and delivery as you speak."
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
                title: "Detailed Analytics",
                description: "Track 5 key areas: Clarity, Structure, Persuasion, Empathy, and Confidence with scoring."
              },
              {
                icon: <Globe className="w-8 h-8 text-blue-600" />,
                title: "Multi-Language",
                description: "Practice and improve in Spanish, English, and more languages with native-level AI coaching."
              },
              {
                icon: <Users className="w-8 h-8 text-blue-600" />,
                title: "AI Coaches",
                description: "Choose from different AI personalities and coaching styles that match your learning preference."
              },
              {
                icon: <Lock className="w-8 h-8 text-blue-600" />,
                title: "Privacy First",
                description: "Your voice data is processed securely and never stored permanently. Complete privacy guaranteed."
              },
              {
                icon: <Play className="w-8 h-8 text-blue-600" />,
                title: "Practice Anywhere",
                description: "Web-based platform works on any device. Practice presentations, meetings, or conversations."
              }
            ].map((feature, index) => (
              <div key={index} className="p-6">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">10,000+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">95%</div>
              <div className="text-gray-600">Improvement Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">30+</div>
              <div className="text-gray-600">Languages Supported</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">4.9/5</div>
              <div className="text-gray-600">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Ready to transform your communication skills?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of professionals who have improved their speaking abilities with AI coaching.
          </p>
          <button 
            onClick={handleStartSession}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
          >
            Start your free session
          </button>
          <p className="text-gray-400 mt-4">No credit card required • 3 free sessions</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">VoiceCoach</span>
            </div>
            <p className="text-gray-600">Transforming communication skills with AI technology.</p>
          </div>
        </div>
      </footer>

      {/* Privacy Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🔒 Privacy & Consent</h3>
            <p className="text-gray-600 mb-4">
              To provide you with the best coaching experience, we need access to your microphone to:
            </p>
            <ul className="text-left mb-4 list-disc list-inside text-gray-700 space-y-1">
              <li>Transcribe your voice in real-time</li>
              <li>Analyze your communication patterns</li>
              <li>Generate personalized feedback</li>
            </ul>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-green-800">
                <strong>Privacy guaranteed:</strong> We don't store your audio. We only process transcriptions temporarily to generate your evaluation.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleAccept}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Accept & Continue
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

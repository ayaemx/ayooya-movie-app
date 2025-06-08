import React, { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import ChatIcon from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import SmartToyIcon from '@mui/icons-material/SmartToy'

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Ayooya Assistant 🎬 I'm here to help you discover amazing movies! Choose from the options below or type your own request:",
      sender: 'bot',
      timestamp: new Date(),
      showQuickOptions: true
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const movies = useSelector(state => state.movies.items)

  const quickOptions = [
    { text: "🎬 Action Movies", query: "action movies" },
    { text: "😂 Comedy Movies", query: "comedy movies" },
    { text: "💕 Romance Movies", query: "romance movies" },
    { text: "👻 Horror Movies", query: "horror movies" },
    { text: "⭐ Top Rated", query: "top rated movies" },
    { text: "🔥 Popular Now", query: "popular movies" },
    { text: "🎲 Surprise Me", query: "random movies" },
    { text: "❓ Help", query: "help" }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getMovieRecommendations = (userInput) => {
    const input = userInput.toLowerCase()
    let recommendations = []

    // Genre-based recommendations
    if (input.includes('action') || input.includes('fight') || input.includes('adventure')) {
      recommendations = movies.filter(movie => 
        movie.genre_ids?.includes(28) || movie.overview?.toLowerCase().includes('action')
      ).slice(0, 3)
    }
    else if (input.includes('comedy') || input.includes('funny') || input.includes('laugh')) {
      recommendations = movies.filter(movie => 
        movie.genre_ids?.includes(35) || movie.overview?.toLowerCase().includes('comedy')
      ).slice(0, 3)
    }
    else if (input.includes('horror') || input.includes('scary') || input.includes('fear')) {
      recommendations = movies.filter(movie => 
        movie.genre_ids?.includes(27) || movie.overview?.toLowerCase().includes('horror')
      ).slice(0, 3)
    }
    else if (input.includes('romance') || input.includes('love') || input.includes('romantic')) {
      recommendations = movies.filter(movie => 
        movie.genre_ids?.includes(10749) || movie.overview?.toLowerCase().includes('love')
      ).slice(0, 3)
    }
    else if (input.includes('drama') || input.includes('serious') || input.includes('emotional')) {
      recommendations = movies.filter(movie => 
        movie.genre_ids?.includes(18) || movie.overview?.toLowerCase().includes('drama')
      ).slice(0, 3)
    }
    // Rating-based recommendations
    else if (input.includes('top rated') || input.includes('best') || input.includes('highly rated')) {
      recommendations = movies.sort((a, b) => b.vote_average - a.vote_average).slice(0, 3)
    }
    // Popular recommendations
    else if (input.includes('popular') || input.includes('trending') || input.includes('famous')) {
      recommendations = movies.sort((a, b) => b.popularity - a.popularity).slice(0, 3)
    }
    // Random recommendations
    else if (input.includes('random') || input.includes('surprise') || input.includes('anything')) {
      const shuffled = [...movies].sort(() => 0.5 - Math.random())
      recommendations = shuffled.slice(0, 3)
    }
    // Default: recent movies
    else {
      recommendations = movies.slice(0, 3)
    }

    return recommendations
  }

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase()
    const recommendations = getMovieRecommendations(userInput)

    let response = ""

    // Positive feedback responses
    if (input.includes('thanks') || input.includes('thank you') || input.includes('thx')) {
      const thankResponses = [
        "You're very welcome! 🎬 Enjoy your movie night with Ayooya!",
        "My pleasure! Hope you find something amazing to watch! 🍿",
        "Happy to help! Have a fantastic movie experience! ✨",
        "Anytime! Grab some popcorn and enjoy! 🎭"
      ]
      response = thankResponses[Math.floor(Math.random() * thankResponses.length)]
      return { response, recommendations: [], showQuickOptions: true }
    }
    else if (input.includes('good work') || input.includes('great job') || input.includes('awesome') || input.includes('amazing')) {
      const appreciationResponses = [
        "Thank you so much! 😊 I'm glad I could help you discover great movies on Ayooya!",
        "That means a lot! 🎬 I love helping movie lovers find their next favorite film!",
        "Thanks! I'm here whenever you need movie recommendations. Enjoy watching! 🍿",
        "Aww, thank you! 🌟 Have an amazing time with your movie selection!"
      ]
      response = appreciationResponses[Math.floor(Math.random() * appreciationResponses.length)]
      return { response, recommendations: [], showQuickOptions: true }
    }
    else if (input.includes('perfect') || input.includes('excellent') || input.includes('wonderful')) {
      response = "I'm so happy you're satisfied! 🎉 Enjoy your cinematic journey and come back anytime for more recommendations! 🎬✨"
      return { response, recommendations: [], showQuickOptions: true }
    }
    else if (input.includes('bye') || input.includes('goodbye') || input.includes('see you')) {
      const goodbyeResponses = [
        "Goodbye! 👋 Enjoy your movies and come back to Ayooya anytime!",
        "See you later! 🎬 Have a wonderful time watching your films!",
        "Farewell, movie lover! 🍿 May your next watch be absolutely amazing!",
        "Until next time! 🌟 Happy movie watching on Ayooya!"
      ]
      response = goodbyeResponses[Math.floor(Math.random() * goodbyeResponses.length)]
      return { response, recommendations: [], showQuickOptions: false }
    }
    // Greeting responses
    else if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      response = "Hello there, movie enthusiast! 👋🎬 I'm Ayooya Assistant, here to help you find amazing movies. What kind of film are you in the mood for today?"
      return { response, recommendations: [], showQuickOptions: true }
    }
    // Genre-based responses
    else if (input.includes('action')) {
      response = "Excellent choice! 💥 Here are some heart-pounding action movies that'll keep you on the edge of your seat:"
    }
    else if (input.includes('comedy') || input.includes('funny')) {
      response = "Time for some laughs! 😄 Here are some hilarious movies that'll brighten your day:"
    }
    else if (input.includes('horror') || input.includes('scary')) {
      response = "Feeling brave tonight? 👻 Here are some spine-chilling movies (watch with the lights on!):"
    }
    else if (input.includes('romance') || input.includes('love')) {
      response = "Aww, looking for love! 💕 Here are some beautiful romantic movies to warm your heart:"
    }
    else if (input.includes('drama')) {
      response = "Ready for some deep storytelling? 🎭 Here are some compelling drama movies:"
    }
    else if (input.includes('top rated') || input.includes('best')) {
      response = "Going for quality! ⭐ Here are the highest-rated movies that critics and audiences love:"
    }
    else if (input.includes('popular') || input.includes('trending')) {
      response = "Great taste! 📈 Here are the most popular movies everyone's talking about:"
    }
    else if (input.includes('random') || input.includes('surprise')) {
      response = "I love surprises! 🎲 Here's a delightful random selection just for you:"
    }
    else if (input.includes('help')) {
      response = "I'm here to help you discover amazing movies on Ayooya! 🎬 You can:\n\n• Use the quick options below\n• Ask me 'I want an action movie'\n• Say 'Show me comedies'\n• Try 'What's popular?'\n• Request 'Surprise me with something random'\n\nWhat sounds good to you?"
      return { response, recommendations: [], showQuickOptions: true }
    }
    // Default responses
    else {
      const defaultResponses = [
        "Based on what you're looking for, here are some fantastic movies I think you'll love:",
        "I've got some great recommendations for you! Check these out:",
        "Here are some amazing movies that match your request:",
        "Perfect! I found some wonderful films for you:"
      ]
      response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
    }

    return { response, recommendations, showQuickOptions: true }
  }

  const handleSendMessage = (text = null) => {
    const messageText = text || inputText
    if (!messageText.trim()) return

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    // Simulate bot thinking time
    setTimeout(() => {
      const { response, recommendations, showQuickOptions } = generateBotResponse(messageText)
      
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        timestamp: new Date(),
        recommendations: recommendations,
        showQuickOptions: showQuickOptions
      }

      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000)
  }

  const handleQuickOption = (optionQuery) => {
    handleSendMessage(optionQuery)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <button 
        className="chat-toggle-btn" 
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with Ayooya Assistant"
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <SmartToyIcon />
            <span>Ayooya Assistant</span>
            <button onClick={() => setIsOpen(false)}>
              <CloseIcon />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map(message => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  <p>{message.text}</p>
                  
                  {/* Quick Options */}
                  {message.showQuickOptions && (
                    <div className="quick-options">
                      {quickOptions.map((option, index) => (
                        <button
                          key={index}
                          className="quick-option-btn"
                          onClick={() => handleQuickOption(option.query)}
                        >
                          {option.text}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Movie Recommendations */}
                  {message.recommendations && message.recommendations.length > 0 && (
                    <div className="movie-recommendations">
                      {message.recommendations.map(movie => (
                        <div key={movie.id} className="mini-movie-card">
                          <img 
                            src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                            alt={movie.title}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/200x300?text=No+Image'
                            }}
                          />
                          <div className="mini-movie-info">
                            <h4>{movie.title}</h4>
                            <p>⭐ {movie.vote_average?.toFixed(1)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about movies or use quick options above..."
              maxLength={200}
            />
            <button onClick={() => handleSendMessage()} disabled={!inputText.trim()}>
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

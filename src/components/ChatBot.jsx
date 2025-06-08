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
    { text: "🎬 Action Movies", query: "action movies", intent: "action" },
    { text: "😂 Comedy Movies", query: "comedy movies", intent: "comedy" },
    { text: "💕 Romance Movies", query: "romance movies", intent: "romance" },
    { text: "👻 Horror Movies", query: "horror movies", intent: "horror" },
    { text: "⭐ Top Rated", query: "top rated movies", intent: "top_rated" },
    { text: "🔥 Popular Now", query: "popular movies", intent: "popular" },
    { text: "🎲 Surprise Me", query: "random movies", intent: "random" },
    { text: "❓ Help", query: "help", intent: "help" }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fixed and optimized movie recommendations
  const getMovieRecommendations = (userInput, quickIntent = null) => {
    const input = userInput.toLowerCase()
    let recommendations = []
    let detectedIntent = quickIntent

    // If no quick intent, detect from user input
    if (!detectedIntent) {
      if (input.includes('action') || input.includes('fight') || input.includes('adventure')) {
        detectedIntent = 'action'
      } else if (input.includes('comedy') || input.includes('funny') || input.includes('laugh')) {
        detectedIntent = 'comedy'
      } else if (input.includes('horror') || input.includes('scary') || input.includes('fear')) {
        detectedIntent = 'horror'
      } else if (input.includes('romance') || input.includes('love') || input.includes('romantic')) {
        detectedIntent = 'romance'
      } else if (input.includes('top') || input.includes('best') || input.includes('highly rated')) {
        detectedIntent = 'top_rated'
      } else if (input.includes('popular') || input.includes('trending') || input.includes('famous')) {
        detectedIntent = 'popular'
      } else if (input.includes('random') || input.includes('surprise') || input.includes('anything')) {
        detectedIntent = 'random'
      }
    }

    // Get recommendations based on intent
    switch (detectedIntent) {
      case 'action':
        recommendations = movies.filter(movie => 
          movie.genre_ids?.includes(28) || movie.genre_ids?.includes(12) ||
          movie.overview?.toLowerCase().includes('action')
        ).slice(0, 3)
        break
      case 'comedy':
        recommendations = movies.filter(movie => 
          movie.genre_ids?.includes(35) ||
          movie.overview?.toLowerCase().includes('comedy')
        ).slice(0, 3)
        break
      case 'horror':
        recommendations = movies.filter(movie => 
          movie.genre_ids?.includes(27) ||
          movie.overview?.toLowerCase().includes('horror')
        ).slice(0, 3)
        break
      case 'romance':
        recommendations = movies.filter(movie => 
          movie.genre_ids?.includes(10749) ||
          movie.overview?.toLowerCase().includes('love')
        ).slice(0, 3)
        break
      case 'top_rated':
        recommendations = movies
          .filter(movie => movie.vote_average >= 7.0)
          .sort((a, b) => b.vote_average - a.vote_average)
          .slice(0, 3)
        break
      case 'popular':
        recommendations = movies
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 3)
        break
      case 'random':
        const shuffled = [...movies].sort(() => 0.5 - Math.random())
        recommendations = shuffled.slice(0, 3)
        break
      default:
        recommendations = movies.slice(0, 3)
    }

    return recommendations
  }

  // Fixed and complete response generation
  const generateBotResponse = (userInput, quickIntent = null) => {
    const input = userInput.toLowerCase()
    const recommendations = getMovieRecommendations(userInput, quickIntent)

    let response = ""
    let showQuickOptions = false

    // Complete polite responses
    if (input.includes('thanks') || input.includes('thank you') || input.includes('thx')) {
      const thankResponses = [
        "You're very welcome! 🎬 Enjoy your movie night with Ayooya!",
        "My pleasure! Hope you find something amazing to watch! 🍿",
        "Happy to help! Have a fantastic movie experience! ✨",
        "Anytime! Grab some popcorn and enjoy! 🎭"
      ]
      response = thankResponses[Math.floor(Math.random() * thankResponses.length)]
      showQuickOptions = true
      return { response, recommendations: [], showQuickOptions }
    }

    if (input.includes('good work') || input.includes('great job') || input.includes('awesome') || 
        input.includes('amazing') || input.includes('perfect') || input.includes('excellent')) {
      const appreciationResponses = [
        "Thank you so much! 😊 I'm glad I could help you discover great movies on Ayooya!",
        "That means a lot! 🎬 I love helping movie lovers find their next favorite film!",
        "Thanks! I'm here whenever you need movie recommendations. Enjoy watching! 🍿",
        "Aww, thank you! 🌟 Have an amazing time with your movie selection!"
      ]
      response = appreciationResponses[Math.floor(Math.random() * appreciationResponses.length)]
      showQuickOptions = true
      return { response, recommendations: [], showQuickOptions }
    }

    if (input.includes('bye') || input.includes('goodbye') || input.includes('see you')) {
      const goodbyeResponses = [
        "Goodbye! 👋 Enjoy your movies and come back to Ayooya anytime!",
        "See you later! 🎬 Have a wonderful time watching your films!",
        "Farewell, movie lover! 🍿 May your next watch be absolutely amazing!"
      ]
      response = goodbyeResponses[Math.floor(Math.random() * goodbyeResponses.length)]
      showQuickOptions = false
      return { response, recommendations: [], showQuickOptions }
    }

    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      response = "Hello there, movie enthusiast! 👋🎬 I'm Ayooya Assistant, here to help you find amazing movies. What kind of film are you in the mood for today?"
      showQuickOptions = true
      return { response, recommendations: [], showQuickOptions }
    }

    if (input.includes('help')) {
      response = "I'm here to help you discover amazing movies on Ayooya! 🎬 You can:\n\n• Use the quick options below\n• Ask me 'I want an action movie'\n• Say 'Show me comedies'\n• Try 'What's popular?'\n• Request 'Surprise me with something random'\n\nWhat sounds good to you?"
      showQuickOptions = true
      return { response, recommendations: [], showQuickOptions }
    }

    // Genre-specific responses
    const genreResponses = {
      action: "Excellent choice! 💥 Here are some heart-pounding action movies that'll keep you on the edge of your seat:",
      comedy: "Time for some laughs! 😄 Here are some hilarious movies that'll brighten your day:",
      horror: "Feeling brave tonight? 👻 Here are some spine-chilling movies (watch with the lights on!):",
      romance: "Aww, looking for love! 💕 Here are some beautiful romantic movies to warm your heart:",
      top_rated: "Going for quality! ⭐ Here are the highest-rated movies that critics and audiences love:",
      popular: "Great taste! 📈 Here are the most popular movies everyone's talking about:",
      random: "I love surprises! 🎲 Here's a delightful random selection just for you:"
    }

    // Use appropriate response based on intent
    if (quickIntent && genreResponses[quickIntent]) {
      response = genreResponses[quickIntent]
    } else if (input.includes('action')) {
      response = genreResponses.action
    } else if (input.includes('comedy') || input.includes('funny')) {
      response = genreResponses.comedy
    } else if (input.includes('horror') || input.includes('scary')) {
      response = genreResponses.horror
    } else if (input.includes('romance') || input.includes('love')) {
      response = genreResponses.romance
    } else if (input.includes('top') || input.includes('best')) {
      response = genreResponses.top_rated
    } else if (input.includes('popular') || input.includes('trending')) {
      response = genreResponses.popular
    } else if (input.includes('random') || input.includes('surprise')) {
      response = genreResponses.random
    } else {
      const defaultResponses = [
        "Based on what you're looking for, here are some fantastic movies I think you'll love:",
        "I've got some great recommendations for you! Check these out:",
        "Here are some amazing movies that match your request:",
        "Perfect! I found some wonderful films for you:"
      ]
      response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
    }

    showQuickOptions = true
    return { response, recommendations, showQuickOptions }
  }

  const handleSendMessage = (text = null, intent = null) => {
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

    // Much faster response - 200ms
    setTimeout(() => {
      const { response, recommendations, showQuickOptions } = generateBotResponse(messageText, intent)
      
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
    }, 200) // Super fast response
  }

  const handleQuickOption = (optionQuery) => {
    // Find the intent for this option
    const option = quickOptions.find(opt => opt.query === optionQuery)
    const intent = option ? option.intent : null
    handleSendMessage(optionQuery, intent)
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

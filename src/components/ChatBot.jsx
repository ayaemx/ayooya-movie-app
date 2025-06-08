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

  // Enhanced quick options with more variety
  const quickOptions = [
    { text: "🎬 Action Movies", query: "action movies", keywords: ["action", "adventure", "fight", "thriller"] },
    { text: "😂 Comedy Movies", query: "comedy movies", keywords: ["comedy", "funny", "laugh", "humor"] },
    { text: "💕 Romance Movies", query: "romance movies", keywords: ["romance", "love", "romantic"] },
    { text: "👻 Horror Movies", query: "horror movies", keywords: ["horror", "scary", "fear", "thriller"] },
    { text: "⭐ Top Rated", query: "top rated movies", keywords: ["top", "best", "highly rated", "award"] },
    { text: "🔥 Popular Now", query: "popular movies", keywords: ["popular", "trending", "famous"] },
    { text: "🎲 Surprise Me", query: "random movies", keywords: ["random", "surprise", "anything"] },
    { text: "❓ Help", query: "help", keywords: ["help", "what can you do"] }
  ]

  // Cache for faster responses
  const responseCache = useRef(new Map())

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Enhanced movie recommendation logic with better accuracy
  const getMovieRecommendations = (userInput, intent = null) => {
    const cacheKey = `${userInput}-${intent}`
    if (responseCache.current.has(cacheKey)) {
      return responseCache.current.get(cacheKey)
    }

    const input = userInput.toLowerCase()
    let recommendations = []
    
    // Enhanced genre detection with multiple keywords
    const genreKeywords = {
      action: ["action", "fight", "adventure", "war", "battle", "combat", "explosive"],
      comedy: ["comedy", "funny", "laugh", "humor", "hilarious", "comic", "amusing"],
      horror: ["horror", "scary", "fear", "frightening", "spooky", "terrifying", "suspense"],
      romance: ["romance", "love", "romantic", "dating", "relationship", "passion"],
      drama: ["drama", "serious", "emotional", "deep", "intense", "moving"],
      family: ["family", "kids", "children", "animated", "disney"],
      scifi: ["sci-fi", "science fiction", "space", "future", "alien", "technology"]
    }

    let detectedGenre = null
    for (const [genre, keywords] of Object.entries(genreKeywords)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        detectedGenre = genre
        break
      }
    }

    // Get recommendations based on detected genre or intent
    if (detectedGenre === 'action' || intent === 'action') {
      recommendations = movies.filter(movie => 
        movie.genre_ids?.includes(28) || movie.genre_ids?.includes(12) ||
        movie.overview?.toLowerCase().includes('action') ||
        movie.overview?.toLowerCase().includes('adventure')
      ).slice(0, 3)
    }
    else if (detectedGenre === 'comedy' || intent === 'comedy') {
      recommendations = movies.filter(movie => 
        movie.genre_ids?.includes(35) ||
        movie.overview?.toLowerCase().includes('comedy') ||
        movie.overview?.toLowerCase().includes('funny')
      ).slice(0, 3)
    }
    else if (detectedGenre === 'horror' || intent === 'horror') {
      recommendations = movies.filter(movie => 
        movie.genre_ids?.includes(27) ||
        movie.overview?.toLowerCase().includes('horror') ||
        movie.overview?.toLowerCase().includes('scary')
      ).slice(0, 3)
    }
    else if (detectedGenre === 'romance' || intent === 'romance') {
      recommendations = movies.filter(movie => 
        movie.genre_ids?.includes(10749) ||
        movie.overview?.toLowerCase().includes('love') ||
        movie.overview?.toLowerCase().includes('romance')
      ).slice(0, 3)
    }
    else if (detectedGenre === 'drama' || intent === 'drama') {
      recommendations = movies.filter(movie => 
        movie.genre_ids?.includes(18) ||
        movie.overview?.toLowerCase().includes('drama')
      ).slice(0, 3)
    }
    // Rating and popularity-based
    else if (input.includes('top') || input.includes('best') || input.includes('highly rated') || intent === 'top_rated') {
      recommendations = movies
        .filter(movie => movie.vote_average >= 7.0)
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 3)
    }
    else if (input.includes('popular') || input.includes('trending') || input.includes('famous') || intent === 'popular') {
      recommendations = movies
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 3)
    }
    else if (input.includes('random') || input.includes('surprise') || input.includes('anything') || intent === 'random') {
      const shuffled = [...movies].sort(() => 0.5 - Math.random())
      recommendations = shuffled.slice(0, 3)
    }
    // Recent movies
    else if (input.includes('new') || input.includes('recent') || input.includes('latest')) {
      recommendations = movies
        .filter(movie => movie.release_date)
        .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
        .slice(0, 3)
    }
    // Default: mix of popular and high-rated
    else {
      const popular = movies.sort((a, b) => b.popularity - a.popularity).slice(0, 2)
      const topRated = movies.filter(movie => movie.vote_average >= 7.5).slice(0, 1)
      recommendations = [...popular, ...topRated]
    }

    // Cache the result
    responseCache.current.set(cacheKey, recommendations)
    return recommendations
  }

  // Enhanced response generation with pre-defined responses for speed
  const generateBotResponse = (userInput, quickOptionIntent = null) => {
    const input = userInput.toLowerCase()
    const recommendations = getMovieRecommendations(userInput, quickOptionIntent)

    let response = ""
    let showQuickOptions = false

    // Pre-defined responses for common queries (faster)
    const responses = {
      greeting: [
        "Hello there, movie enthusiast! 👋🎬 I'm Ayooya Assistant, here to help you find amazing movies. What kind of film are you in the mood for today?",
        "Hi! 🎬 Welcome to Ayooya! I'm here to help you discover your next favorite movie. What are you looking for?",
        "Hey! 👋 Ready to find some amazing movies? I'm here to help you explore our collection!"
      ],
      thanks: [
        "You're very welcome! 🎬 Enjoy your movie night with Ayooya!",
        "My pleasure! Hope you find something amazing to watch! 🍿",
        "Happy to help! Have a fantastic movie experience! ✨",
        "Anytime! Grab some popcorn and enjoy! 🎭"
      ],
      appreciation: [
        "Thank you so much! 😊 I'm glad I could help you discover great movies on Ayooya!",
        "That means a lot! 🎬 I love helping movie lovers find their next favorite film!",
        "Thanks! I'm here whenever you need movie recommendations. Enjoy watching! 🍿",
        "Aww, thank you! 🌟 Have an amazing time with your movie selection!"
      ],
      goodbye: [
        "Goodbye! 👋 Enjoy your movies and come back to Ayooya anytime!",
        "See you later! 🎬 Have a wonderful time watching your films!",
        "Farewell, movie lover! 🍿 May your next watch be absolutely amazing!",
        "Until next time! 🌟 Happy movie watching on Ayooya!"
      ]
    }

    // Quick response logic for common patterns
    if (input.includes('thanks') || input.includes('thank you') || input.includes('thx')) {
      response = responses.thanks[Math.floor(Math.random() * responses.thanks.length)]
      showQuickOptions = true
      return { response, recommendations: [], showQuickOptions }
    }
    else if (input.includes('good work') || input.includes('great job') || input.includes('awesome') || input.includes('amazing') || input.includes('perfect')) {
      response = responses.appreciation[Math.floor(Math.random() * responses.appreciation.length)]
      showQuickOptions = true
      return { response, recommendations: [], showQuickOptions }
    }
    else if (input.includes('bye') || input.includes('goodbye') || input.includes('see you')) {
      response = responses.goodbye[Math.floor(Math.random() * responses.goodbye.length)]
      showQuickOptions = false
      return { response, recommendations: [], showQuickOptions }
    }
    else if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      response = responses.greeting[Math.floor(Math.random() * responses.greeting.length)]
      showQuickOptions = true
      return { response, recommendations: [], showQuickOptions }
    }

    // Genre-specific responses with intent detection
    const genreResponses = {
      action: "Excellent choice! 💥 Here are some heart-pounding action movies that'll keep you on the edge of your seat:",
      comedy: "Time for some laughs! 😄 Here are some hilarious movies that'll brighten your day:",
      horror: "Feeling brave tonight? 👻 Here are some spine-chilling movies (watch with the lights on!):",
      romance: "Aww, looking for love! 💕 Here are some beautiful romantic movies to warm your heart:",
      drama: "Ready for some deep storytelling? 🎭 Here are some compelling drama movies:",
      top_rated: "Going for quality! ⭐ Here are the highest-rated movies that critics and audiences love:",
      popular: "Great taste! 📈 Here are the most popular movies everyone's talking about:",
      random: "I love surprises! 🎲 Here's a delightful random selection just for you:"
    }

    // Map quick option intents to responses
    if (quickOptionIntent && genreResponses[quickOptionIntent]) {
      response = genreResponses[quickOptionIntent]
    }
    // Detect genre in user input
    else if (input.includes('action') || input.includes('fight') || input.includes('adventure')) {
      response = genreResponses.action
    }
    else if (input.includes('comedy') || input.includes('funny') || input.includes('laugh')) {
      response = genreResponses.comedy
    }
    else if (input.includes('horror') || input.includes('scary') || input.includes('fear')) {
      response = genreResponses.horror
    }
    else if (input.includes('romance') || input.includes('love') || input.includes('romantic')) {
      response = genreResponses.romance
    }
    else if (input.includes('drama') || input.includes('serious') || input.includes('emotional')) {
      response = genreResponses.drama
    }
    else if (input.includes('top') || input.includes('best') || input.includes('highly rated')) {
      response = genreResponses.top_rated
    }
    else if (input.includes('popular') || input.includes('trending') || input.includes('famous')) {
      response = genreResponses.popular
    }
    else if (input.includes('random') || input.includes('surprise') || input.includes('anything')) {
      response = genreResponses.random
    }
    else if (input.includes('help')) {
      response = "I'm here to help you discover amazing movies on Ayooya! 🎬 You can:\n\n• Use the quick options below\n• Ask me 'I want an action movie'\n• Say 'Show me comedies'\n• Try 'What's popular?'\n• Request 'Surprise me with something random'\n\nWhat sounds good to you?"
      showQuickOptions = true
      return { response, recommendations: [], showQuickOptions }
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

    // Reduced delay for faster responses
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
    }, 500) // Reduced from 1000ms to 500ms
  }

  const handleQuickOption = (optionQuery) => {
    // Map option queries to intents for better accuracy
    const intentMap = {
      "action movies": "action",
      "comedy movies": "comedy", 
      "romance movies": "romance",
      "horror movies": "horror",
      "top rated movies": "top_rated",
      "popular movies": "popular",
      "random movies": "random"
    }
    
    const intent = intentMap[optionQuery] || null
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

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Sparkles, ShoppingBag, Star, RefreshCw, MessageSquare, Check, Loader2 } from 'lucide-react';
import { api } from '../api';

function getProductImage(product) {
  if (product.imageUrl) {
    return product.imageUrl;
  }
  const cat = (product.category || '').toLowerCase();
  if (cat.includes('saree')) {
    return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80';
  } else if (cat.includes('lehenga')) {
    return 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=80';
  } else if (cat.includes('salwar') || cat.includes('kameez') || cat.includes('kurta')) {
    return 'https://images.unsplash.com/photo-1631856955409-0912b33f1d2b?w=500&auto=format&fit=crop&q=80';
  } else if (cat.includes('jewellery') || cat.includes('necklace')) {
    return 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80';
  } else if (cat.includes('men')) {
    return 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80';
}

export default function AIChatbot({ isOpen, onClose, user, onOpenAuth, onAddToCart }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Namaste! Welcome to FRAIS. I am your personal AI fashion stylist.\n\nI can help you browse our exquisite collection of sarees, lehengas, salwar kameez, and ethnic couture. Ask me for suggestions based on wedding themes, colors, or your budget!",
      recommendations: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState({});

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const SUGGESTIONS = [
    "Sarees under ₹2000",
    "Haldi Ceremony Outfits",
    "Return Policy?",
    "Lehengas for Sangeet"
  ];

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input on open
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (textToSend) => {
    const query = (typeof textToSend === 'string' ? textToSend : input).trim();
    if (!query) return;

    // Add user message
    const userMsg = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build previous history (excluding current query)
      const chatHistory = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await api.sendChatMessage(query, chatHistory);

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: res.response || "I'm sorry, I couldn't formulate a response. Let me know if you have other questions!",
        recommendations: res.recommendations || []
      }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "I apologize, but I am facing temporary issues connecting to my stylists. Please try again soon.",
        recommendations: [],
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleAddProductToCart = async (productId, e) => {
    e.stopPropagation();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (user.role !== 'CUSTOMER') {
      alert("Only customers can add items to the cart.");
      return;
    }

    setAddingId(productId);
    try {
      await onAddToCart(productId, 1);
      setAddedIds(prev => ({ ...prev, [productId]: true }));
      setTimeout(() => {
        setAddedIds(prev => ({ ...prev, [productId]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert("Error adding product to cart. Please try again.");
    } finally {
      setAddingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="frais-ai-chatbot-overlay">
      <div className="frais-ai-chat-window animate-chat-in">
        {/* HEADER */}
        <div className="frais-ai-chat-header">
          <div className="frais-ai-chat-header-info">
            <div className="frais-ai-chat-avatar-container">
              <div className="frais-ai-chat-avatar">
                <Sparkles size={16} className="sparkles-pulse" />
              </div>
              <span className="frais-ai-chat-status-dot"></span>
            </div>
            <div>
              <h3 className="frais-ai-chat-title">FRAIS AI Stylist</h3>
              <p className="frais-ai-chat-subtitle">Couture Advisor • Online</p>
            </div>
          </div>
          <button className="frais-ai-chat-close-btn" onClick={onClose} aria-label="Close Chat">
            <X size={18} />
          </button>
        </div>

        {/* MESSAGES */}
        <div className="frais-ai-chat-body">
          {messages.map((msg, index) => (
            <div key={index} className={`frais-ai-message-row ${msg.role === 'user' ? 'user-row' : 'bot-row'}`}>
              {msg.role === 'assistant' && (
                <div className="frais-ai-message-avatar">
                  <Sparkles size={12} />
                </div>
              )}
              <div className="frais-ai-message-bubble-container">
                <div className={`frais-ai-message-bubble ${msg.role === 'user' ? 'user-bubble' : 'bot-bubble'} ${msg.isError ? 'error-bubble' : ''}`}>
                  {msg.text.split('\n').map((paragraph, pIdx) => (
                    <p key={pIdx} style={{ marginBottom: pIdx < msg.text.split('\n').length - 1 ? '8px' : 0 }}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* RECOMMENDATIONS CAROUSEL */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="frais-ai-recommendations-wrapper">
                    <h4 className="frais-ai-recommendations-title">Recommended Couture</h4>
                    <div className="frais-ai-recommendations-carousel">
                      {msg.recommendations.map(prod => (
                        <div key={prod.productId} className="frais-ai-product-card">
                          <div className="frais-ai-product-image-container">
                            <img src={getProductImage(prod)} alt={prod.productName} className="frais-ai-product-image" />
                            {prod.discountPrice && (
                              <span className="frais-ai-product-sale-tag">Sale</span>
                            )}
                          </div>
                          <div className="frais-ai-product-info">
                            <h5 className="frais-ai-product-name" title={prod.productName}>{prod.productName}</h5>
                            <p className="frais-ai-product-category">{prod.category}</p>
                            <div className="frais-ai-product-rating">
                              <Star size={10} fill="currentColor" className="star-icon" />
                              <span>{prod.ratings || '5.0'}</span>
                            </div>
                            <div className="frais-ai-product-pricing">
                              {prod.discountPrice ? (
                                <>
                                  <span className="frais-ai-price-discount">₹{prod.discountPrice}</span>
                                  <span className="frais-ai-price-original">₹{prod.price}</span>
                                </>
                              ) : (
                                <span className="frais-ai-price-regular">₹{prod.price}</span>
                              )}
                            </div>
                            <button
                              className={`frais-ai-add-to-cart-btn ${addedIds[prod.productId] ? 'added' : ''}`}
                              disabled={addingId === prod.productId}
                              onClick={(e) => handleAddProductToCart(prod.productId, e)}
                            >
                              {addingId === prod.productId ? (
                                <Loader2 size={12} className="spin-loader" />
                              ) : addedIds[prod.productId] ? (
                                <>
                                  <Check size={12} style={{ marginRight: '4px' }} />
                                  Added
                                </>
                              ) : (
                                <>
                                  <ShoppingBag size={12} style={{ marginRight: '4px' }} />
                                  Add to Bag
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="frais-ai-message-row bot-row">
              <div className="frais-ai-message-avatar">
                <Sparkles size={12} className="spin-loader" />
              </div>
              <div className="frais-ai-typing-indicator">
                <span className="dot animate-dot-1"></span>
                <span className="dot animate-dot-2"></span>
                <span className="dot animate-dot-3"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* SUGGESTION CHIPS */}
        <div className="frais-ai-suggestions-container">
          {SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              className="frais-ai-suggestion-chip"
              disabled={loading}
              onClick={() => handleSend(sug)}
            >
              {sug}
            </button>
          ))}
        </div>

        {/* INPUT FOOTER */}
        <div className="frais-ai-chat-footer">
          <input
            ref={inputRef}
            type="text"
            className="frais-ai-chat-input"
            placeholder="Ask FRAIS AI about styling, sarees, etc..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
          />
          <button
            className="frais-ai-chat-send-btn"
            disabled={!input.trim() || loading}
            onClick={() => handleSend()}
            aria-label="Send Message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

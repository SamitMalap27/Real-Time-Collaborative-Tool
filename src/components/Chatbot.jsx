import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your actual API key
const API_KEY = "AIzaSyDqBNQPLUJhY2CpmkoaYIic3lia6sOge4s";

function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Function to handle user queries
    const handleQuery = async () => {
        if (userInput.trim().toLowerCase() === 'exit') {
            setMessages([...messages, { author: 'Chatbot', text: 'Goodbye!' }]);
            return;
        }

        const chat = await model.startChat({
            generationConfig: { maxOutputTokens: 1000 },
        });
        const response = await chat.sendMessage(userInput);
        const answer = await response.response.text();

        // Check if the response contains code snippets
        const formattedAnswer = formatCodeSnippets(answer);

        setMessages([...messages, { author: 'Chatbot', text: formattedAnswer }]);
        setUserInput('');
    };

    // Function to format code snippets
    const formatCodeSnippets = (text) => {
        // Apply CSS class to existing code tags
        // const formattedText = text.replace(/<code>([\s\S]+?)<\/code>/g, '<code class="formatted-code">$1</code>');

        return text;
    };




    // Function to handle user input change
    const handleChange = (event) => {
        setUserInput(event.target.value);
    };

    // Function to handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        if (userInput.trim() !== '') {
            setMessages([...messages, { author: 'User', text: userInput }]);
            handleQuery();
        }
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot">
                <h1>WELCOME TO THE CODING CHATBOT!</h1>
                <div className="messages">
                    {messages.map((message, index) => (
                        <div key={index} className={message.author === 'User' ? 'user-message' : 'chatbot-message'}>
                            <p>{message.text}</p>
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSubmit} className="input-form">
                    <input
                        type="text"
                        value={userInput}
                        onChange={handleChange}
                        placeholder="Type your message..."
                    />
                    <button type="submit" className='Hbtn sendBTN'>Send</button>
                </form>
            </div>
        </div>
    );
}

export default Chatbot;

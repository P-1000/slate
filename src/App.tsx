import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  // State to hold the copied content and the clipboard history
  const [copiedContent, setCopiedContent] = useState<string>('')
  const [history, setHistory] = useState<string[]>([])

  // Function to handle copy event
  const handleCopy = () => {
    // Get the current clipboard content
    const clipboardData = navigator.clipboard.readText()

    clipboardData.then(text => {
      // Store copied content in state
      setCopiedContent(text)

      // Add the copied content to the history (limit to 10 items)
      setHistory(prevHistory => {
        const updatedHistory = [text, ...prevHistory]  // Add new content at the start
        if (updatedHistory.length > 10) updatedHistory.pop()  // Remove the oldest if more than 10
        return updatedHistory
      })
      console.log('Copied content:', text)
    })
  }

  // Optional: Listen for clipboard changes continuously
  useEffect(() => {
    const interval = setInterval(() => {
      handleCopy()
    }, 1000) // Poll every second to check for clipboard changes

    return () => clearInterval(interval) // Clean up interval on component unmount
  }, [])

  // Function to copy a history item back to clipboard when clicked
  const handleHistoryClick = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedContent(text)  // Update the current copied content state
    console.log('Copied from history:', text)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-lg p-8 bg-black bg-opacity-80 rounded-xl shadow-xl">
        {/* Main Title */}
        <h1 className="text-4xl text-white font-semibold text-center">
          Bankai - Sembonzakura Kageyoshi
        </h1>
        
        {/* Display the last copied content */}
        <p className="mt-6 text-gray-300 text-lg text-center">Last Copied Content:</p>
        <div className="mt-4 bg-gray-800 p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-300">{copiedContent || 'No content copied yet.'}</p>
        </div>

        {/* Clipboard History Section */}
        <div className="mt-6">
          <h2 className="text-gray-300 text-lg">Clipboard History</h2>
          <ul className="mt-2 space-y-2">
            {history.map((item, index) => (
              <li
                key={index}
                onClick={() => handleHistoryClick(item)}
                className="p-2 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition duration-200"
              >
                <p className="text-sm text-gray-300">{item}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Search-like Input field (mimicking Raycast search) */}
        <div className="mt-6">
          <input
            type="text"
            placeholder="Type to search..."
            className="w-full p-4 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
            onClick={handleCopy} // Clicking triggers handleCopy for testing
          />
        </div>
      </div>
    </div>
  )
}

export default App

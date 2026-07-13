'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Send, User, MessageSquare, AlertCircle, RefreshCw, Layers } from 'lucide-react'

interface AdultWorkEmail {
  EmailID: number
  Read: boolean
  Subject: string
  Body: string
  SentDate: string
  OtherUserID: number
  OtherNickname: string
  FolderID: number // 0 for Inbox, -1 for Sent
}

interface Conversation {
  userId: number
  nickname: string
  messages: AdultWorkEmail[]
  lastMessageDate: string
  unreadCount: number
}

export default function MessagesChatView() {
  const searchParams = useSearchParams()
  const participantParam = searchParams.get('participant')

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConvoId, setSelectedConvoId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const loadConversations = async (autoSelectId?: number | null) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/messages')
      if (res.ok) {
        const data = await res.json()
        const convos: Conversation[] = data.conversations || []
        setConversations(convos)

        if (autoSelectId) {
          setSelectedConvoId(autoSelectId)
        } else if (convos.length > 0 && !selectedConvoId) {
          setSelectedConvoId(convos[0].userId)
        }
      } else {
        setError("Failed to fetch active message streams.")
      }
    } catch (err) {
      setError("Network error retrieving message streams.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const targetParticipant = participantParam ? parseInt(participantParam, 10) : null
    loadConversations(targetParticipant)

    const interval = setInterval(() => {
      fetch('/api/messages')
        .then(res => res.json())
        .then(data => {
          if (data && data.conversations) {
            setConversations(data.conversations)
          }
        })
        .catch(err => console.error("Poll error:", err))
    }, 15000)

    return () => clearInterval(interval)
  }, [participantParam])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConvoId, conversations])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedConvoId) return

    setSending(true)
    try {
      const activeConvo = conversations.find(c => c.userId === selectedConvoId)
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: selectedConvoId,
          subject: activeConvo?.messages[0]?.Subject || "Inquiry",
          body: messageText
        })
      })

      if (res.ok) {
        setMessageText('')
        await loadConversations(selectedConvoId)
      } else {
        const data = await res.json()
        alert(`Error sending message: ${data.error || 'Server rejected'}`)
      }
    } catch (err) {
      alert("Failed to deliver message due to connectivity issue.")
    } finally {
      setSending(false)
    }
  }

  const activeConversation = conversations.find(c => c.userId === selectedConvoId)

  const allConversationsToShow = [...conversations]
  if (participantParam) {
    const paramId = parseInt(participantParam, 10)
    const exists = conversations.some(c => c.userId === paramId)
    if (!exists && !isNaN(paramId)) {
      allConversationsToShow.push({
        userId: paramId,
        nickname: `User #${paramId}`,
        messages: [],
        lastMessageDate: new Date().toISOString(),
        unreadCount: 0
      })
    }
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-indigo-600" />
            Direct Chats
          </h3>
          <button
            onClick={() => loadConversations(selectedConvoId)}
            className="text-slate-500 hover:text-indigo-600 focus:outline-none"
            title="Refresh Chats"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {allConversationsToShow.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No conversations found. Use Profile Search to message a member.
            </div>
          ) : (
            allConversationsToShow.map((convo) => {
              const isSelected = selectedConvoId === convo.userId
              const lastMsg = convo.messages[convo.messages.length - 1]
              return (
                <button
                  key={convo.userId}
                  onClick={() => setSelectedConvoId(convo.userId)}
                  className={`w-full text-left p-4 flex items-start gap-3 transition-colors ${
                    isSelected ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-100 bg-white'
                  }`}
                >
                  <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs flex-shrink-0 uppercase">
                    {convo.nickname.substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {convo.nickname}
                      </span>
                      {lastMsg && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(lastMsg.SentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {lastMsg ? lastMsg.Body : 'New conversation started...'}
                    </p>
                  </div>

                  {convo.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                      {convo.unreadCount}
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-50">
        {selectedConvoId ? (
          <>
            <div className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {conversations.find(c => c.userId === selectedConvoId)?.nickname.substring(0, 2) || "U"}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    {conversations.find(c => c.userId === selectedConvoId)?.nickname || `User #${selectedConvoId}`}
                  </h4>
                  <p className="text-[10px] text-slate-400">Secure Direct Messaging Channel</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                <Layers className="h-3.5 w-3.5 text-indigo-600" />
                Teams Interface Active
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeConversation && activeConversation.messages.length > 0 ? (
                activeConversation.messages.map((msg) => {
                  const isSentByMe = msg.FolderID === -1
                  return (
                    <div
                      key={msg.EmailID}
                      className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md rounded-lg p-3 shadow-sm ${
                          isSentByMe
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
                        }`}
                      >
                        {msg.Subject && !msg.Subject.startsWith("RE:") && (
                          <div className="text-[10px] uppercase font-bold opacity-75 mb-1 tracking-wider">
                            Sub: {msg.Subject}
                          </div>
                        )}
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.Body}</p>
                        <span
                          className={`text-[9px] block text-right mt-1.5 ${
                            isSentByMe ? 'text-indigo-200' : 'text-slate-400'
                          }`}
                        >
                          {new Date(msg.SentDate).toLocaleDateString()} {new Date(msg.SentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <User className="h-8 w-8 text-slate-300" />
                  <p className="text-xs font-semibold">Start the conversation</p>
                  <p className="text-[10px] text-slate-400">Type a message below to reach out.</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-3">
              <input
                type="text"
                placeholder="Type a secure corporate reply..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={sending}
                className="flex-1 text-xs border border-slate-300 rounded-md px-4 py-2 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="bg-indigo-600 text-white rounded-md px-4 py-2 text-xs font-bold hover:bg-indigo-700 focus:outline-none flex items-center gap-1.5 disabled:bg-slate-300"
              >
                <Send className="h-3.5 w-3.5" />
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <MessageSquare className="h-10 w-10 text-slate-300" />
            <div className="text-center">
              <p className="font-bold text-slate-800">No Chat Selected</p>
              <p className="text-xs text-slate-500 mt-1">Pick an existing conversation from the list or initiate one from Profile Search.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

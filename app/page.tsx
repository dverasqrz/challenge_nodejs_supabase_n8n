'use client'

import { useState } from 'react'
import UserProfile from '@/components/UserProfile'
import TaskList from '@/components/TaskList'
import ChatBot from '@/components/ChatBot'

export default function Home() {
  const [userIdentifier, setUserIdentifier] = useState('')
  const [taskListRefreshKey, setTaskListRefreshKey] = useState(0)

  const handleTaskCreated = () => {
    // Trigger refresh of task list
    setTaskListRefreshKey((prev) => prev + 1)
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          To-Do List
        </h1>
        
        <UserProfile 
          userIdentifier={userIdentifier}
          onUserIdentifierChange={setUserIdentifier}
        />
        
        <ChatBot 
          userIdentifier={userIdentifier}
          onTaskCreated={handleTaskCreated}
        />
        
        <TaskList 
          userIdentifier={userIdentifier}
          refreshKey={taskListRefreshKey}
        />
      </div>
    </main>
  )
}


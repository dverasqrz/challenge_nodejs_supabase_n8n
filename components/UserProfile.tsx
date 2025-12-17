'use client'

interface UserProfileProps {
  userIdentifier: string
  onUserIdentifierChange: (identifier: string) => void
}

export default function UserProfile({ userIdentifier, onUserIdentifierChange }: UserProfileProps) {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <label htmlFor="user-identifier" className="block text-sm font-medium text-gray-700 mb-2">
        User Identifier
      </label>
      <input
        id="user-identifier"
        type="text"
        value={userIdentifier}
        onChange={(e) => onUserIdentifierChange(e.target.value)}
        placeholder="Enter your name or email"
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <p className="mt-2 text-xs text-gray-500">
        Enter your identifier to load your tasks
      </p>
    </div>
  )
}


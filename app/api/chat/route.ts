import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, user_identifier } = body

    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!user_identifier || typeof user_identifier !== 'string') {
      return NextResponse.json(
        { error: 'User identifier is required' },
        { status: 400 }
      )
    }

    // Check if message contains #to-do list
    const hasTodoKeyword = message.toLowerCase().includes('#to-do list') || 
                           message.toLowerCase().includes('#todo list') ||
                           message.toLowerCase().includes('#todolist')

    if (!hasTodoKeyword) {
      return NextResponse.json({
        reply: 'Use #to-do list in your message to create a task. For example: "I need to #to-do list buy groceries"',
        taskCreated: false,
      })
    }

    // Get n8n webhook URL from environment
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { 
          error: 'n8n webhook URL not configured',
          reply: 'Sorry, the automation service is not configured. Please contact support.',
          taskCreated: false,
        },
        { status: 500 }
      )
    }

    // Call n8n webhook
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        user_identifier,
      }),
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('n8n webhook error:', errorText)
      return NextResponse.json(
        {
          error: 'Failed to process request with n8n',
          reply: 'Sorry, I encountered an error processing your request. Please try again.',
          taskCreated: false,
        },
        { status: 500 }
      )
    }

    const n8nData = await n8nResponse.json()

    // Return n8n response with safe defaults
    return NextResponse.json({
      reply: n8nData.reply || 'Task processed successfully.',
      taskCreated: n8nData.taskCreated === true,
      title: n8nData.title || null,
      enhanced_title: n8nData.enhanced_title || n8nData.title || null,
      steps: Array.isArray(n8nData.steps) ? n8nData.steps : null,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        reply: 'Sorry, I encountered an error. Please try again later.',
        taskCreated: false,
      },
      { status: 500 }
    )
  }
}


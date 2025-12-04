# Architecture Documentation

This document provides a comprehensive overview of the AI SF-50 Assistant architecture, design decisions, and system components.

## Table of Contents

- [System Overview](#system-overview)
- [High-Level Architecture](#high-level-architecture)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Technology Stack](#technology-stack)
- [Key Design Decisions](#key-design-decisions)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Future Considerations](#future-considerations)

## System Overview

The AI SF-50 Assistant is a Next.js application that uses AWS Bedrock and Claude models to recommend appropriate Nature of Action (NOA) codes for federal employee personnel actions. The application follows a client-server architecture with conversational AI capabilities and PDF generation.

### Core Functionality

1. **Employee Selection**: Choose from sample employees with various grades, steps, and duty stations
2. **Scenario Input**: Natural language description of personnel action scenarios
3. **AI Recommendations**: Server-side API routes invoke AWS Bedrock to recommend NOA codes, Legal Authority Codes (LAC), and required SF-50 fields
4. **Conversational Refinement**: Interactive chatbot for follow-up questions to refine recommendations
5. **PDF Generation**: Client-side PDF generation of complete SF-50 forms with all recommendations
6. **Input Validation**: Client-side and server-side validation using Zod schemas

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  React Component (AIAssistantPage - page.tsx)      │  │
│  │  - Employee selection                                │  │
│  │  - Scenario input                                    │  │
│  │  - Chatbot interface                                 │  │
│  │  - Client-side validation (Zod)                    │  │
│  │  - PDF generation (client-side)                      │  │
│  │  - UI rendering & user interaction                  │  │
│  └──────────┬───────────────────────┬──────────────────┘  │
└─────────────┼───────────────────────┼──────────────────────┘
              │                       │
              │ HTTP POST             │ HTTP POST
              │ /api/recommend-noa    │ /api/chat-noa
              │                       │
              ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Server Layer                           │
│  ┌──────────────────────────┐  ┌────────────────────────┐ │
│  │  API Route                │  │  API Route             │ │
│  │  /api/recommend-noa       │  │  /api/chat-noa         │ │
│  │  - Request validation     │  │  - Request validation  │ │
│  │  - Server-side Zod        │  │  - Server-side Zod     │ │
│  │  - Prompt engineering      │  │  - Conversational      │ │
│  │  - Error handling          │  │    prompt building     │ │
│  └──────────┬────────────────┘  └──────────┬─────────────┘ │
│             │                                │               │
│             └────────────┬───────────────────┘               │
│                          │ AWS SDK                            │
│                          ▼                                    │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Bedrock Client (route.ts)                           │  │
│  │  - Credential management                             │  │
│  │  - Model ID conversion (inference profiles)         │  │
│  │  - InvokeModelCommand                               │  │
│  └──────────────────┬──────────────────────────────────┘  │
└─────────────────────┼──────────────────────────────────────┘
                       │ InvokeModelCommand
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  AWS Bedrock                                          │  │
│  │  - Claude 3.5/3.7 Sonnet Models                     │  │
│  │  - Model invocation & response                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

#### 1. AIAssistantPage (Main Component)
- **Location**: `app/page.tsx`
- **Type**: Client Component (`'use client'`)
- **Responsibilities**:
  - Employee selection from sample data
  - Scenario input and validation
  - API communication (initial recommendation and chat updates)
  - Chatbot interface management
  - PDF generation trigger
  - UI rendering and state management
- **State Management**:
  - `scenario`: User input scenario description
  - `selectedEmpId`: Selected employee ID
  - `recommendation`: Current NOA recommendation
  - `chatMessages`: Conversation history
  - `isLoading`: Loading state for initial recommendation
  - `isChatLoading`: Loading state for chat updates
  - `error`: Error messages
  - `showPDF`: PDF display state
  - `effectiveDate`: Effective date for SF-50

#### 2. SF50Document
- **Location**: `components/sf50-document.tsx`
- **Type**: React-PDF Document Component
- **Responsibilities**:
  - SF-50 form layout and structure
  - Employee information display
  - NOA code and label display
  - Legal Authority Code (LAC) display
  - OPM remarks display
  - Required fields display
  - Professional PDF formatting

#### 3. PDFViewerWrapper
- **Location**: `components/pdf-viewer-wrapper.tsx`
- **Type**: Client Component with dynamic import
- **Responsibilities**:
  - Client-side PDF rendering (avoids SSR issues)
  - PDF viewer display
  - PDF download functionality
  - Dynamic import of @react-pdf/renderer

#### 4. UI Components
- **Button**: shadcn/ui button component
- **Card**: shadcn/ui card component
- **Input**: shadcn/ui input component
- **Textarea**: shadcn/ui textarea component
- **Select**: shadcn/ui select component

### Backend Components

#### 1. API Route: /api/recommend-noa
- **Location**: `app/api/recommend-noa/route.ts`
- **Type**: Next.js API Route (Server Component)
- **Responsibilities**:
  - HTTP POST request handling
  - Request body parsing
  - Server-side validation (Zod `recommendNOASchema`)
  - Prompt construction using `buildNOAPrompt()`
  - AWS Bedrock invocation
  - Response parsing using `parseNOAResponse()`
  - Error handling with user-friendly messages
- **Input Validation**:
  - Scenario: string, max 5,000 characters
  - Trimming and sanitization

#### 2. API Route: /api/chat-noa
- **Location**: `app/api/chat-noa/route.ts`
- **Type**: Next.js API Route (Server Component)
- **Responsibilities**:
  - HTTP POST request handling
  - Request body parsing
  - Server-side validation (Zod `chatNOASchema`)
  - Conversational prompt construction
  - AWS Bedrock invocation
  - Response parsing using `parseNOAResponse()`
  - Error handling
- **Input Validation**:
  - Original scenario: string, max 5,000 characters
  - Conversation history: array, max 50 messages
  - Each message: valid role ("user" | "assistant"), content max 2,000 characters

#### 3. Prompt Engineering
- **Location**: `lib/prompt-engineering.ts`
- **Type**: Utility module
- **Responsibilities**:
  - `buildNOAPrompt()`: Constructs structured prompts for initial recommendations
  - `parseNOAResponse()`: Parses Claude responses into structured NOARecommendation objects
  - NOA code extraction
  - LAC (Legal Authority Code) extraction
  - Clarification questions extraction
  - Required SF-50 fields extraction
  - OPM remarks extraction
  - Remark codes extraction

#### 4. Validation Layer
- **Location**: `lib/validation.ts`
- **Type**: Zod schema definitions
- **Responsibilities**:
  - `recommendNOASchema`: Initial recommendation request validation
  - `chatNOASchema`: Conversational update request validation
  - `chatMessageSchema`: Individual chat message validation
  - Type inference for TypeScript
  - Input length limits (DoS protection)
  - Structure validation

#### 5. Sample Data
- **Location**: `lib/sample-data.ts`
- **Type**: Static data module
- **Responsibilities**:
  - Sample employee data (25 employees)
  - Employee information (name, series, grade, step, salary, duty station)
  - Data accessor functions

## Data Flow

### Initial Recommendation Flow

1. **User Input** → Employee selection and scenario description
2. **Client Validation** → Basic client-side checks (non-empty scenario)
3. **API Request** → HTTP POST to `/api/recommend-noa` with `{ scenario: string }`
4. **Server Validation** → Zod schema validation (`recommendNOASchema`)
5. **Prompt Construction** → `buildNOAPrompt()` creates structured prompt with examples
6. **Bedrock Invocation** → `InvokeModelCommand` via AWS SDK
7. **Response Parsing** → `parseNOAResponse()` extracts structured data
8. **Client Update** → Update UI with recommendation and initialize chatbot

### Conversational Update Flow

1. **User Response** → User answers chatbot question
2. **Message Addition** → Add user message to conversation history
3. **API Request** → HTTP POST to `/api/chat-noa` with `{ originalScenario, conversationHistory }`
4. **Server Validation** → Zod schema validation (`chatNOASchema`)
5. **Conversational Prompt** → Build prompt with original scenario and conversation history
6. **Bedrock Invocation** → `InvokeModelCommand` via AWS SDK
7. **Response Parsing** → `parseNOAResponse()` extracts updated recommendation
8. **Client Update** → Update recommendation and ask next question (if any)

### PDF Generation Flow

1. **User Action** → User clicks "Generate SF-50" button
2. **Data Collection** → Collect employee data, recommendation, and effective date
3. **PDF Component** → Render `SF50Document` with all data
4. **Client-Side Rendering** → `@react-pdf/renderer` generates PDF
5. **Display** → Show PDF in viewer component
6. **Download** → User can download PDF file

### Error Flow

1. **Validation Errors** → Field-level errors returned to client with details
2. **AWS Errors** → Specific error handling:
   - `ResourceNotFoundException`: Model not found
   - `AccessDeniedException`: Permission issues
   - `ValidationException`: Invalid request format
3. **Generic Errors** → Fallback error handling with user-friendly messages
4. **Error Display** → User-friendly error messages in UI

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript 5.4
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Validation**: Zod 4.1
- **PDF Generation**: @react-pdf/renderer 4.3

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Next.js API Routes
- **AWS SDK**: @aws-sdk/client-bedrock-runtime 3.931.0
- **Validation**: Zod (shared with frontend)

### Infrastructure
- **AI Service**: AWS Bedrock (Claude 3.5 Sonnet, Claude 3.7 Sonnet, or newer)
- **Deployment**: Vercel, AWS EC2, or other Node.js hosting platforms
- **Build System**: Next.js with TypeScript

## Key Design Decisions

### 1. Client-Side PDF Generation

**Decision**: Use `@react-pdf/renderer` for client-side PDF generation

**Rationale**:
- Avoids server-side rendering issues with ESM packages
- No need to send sensitive data to external PDF services
- Better user experience (instant generation)
- SSN handling: PDF shows placeholder, actual SSN entered at generation time

**Implementation**:
- Dynamic import of PDF components to avoid SSR
- Client-side only rendering
- PDF viewer wrapper component

### 2. Dual Validation (Client + Server)

**Decision**: Validate inputs on both client and server

**Rationale**:
- Client-side: Immediate user feedback, better UX
- Server-side: Security, prevents invalid API calls
- Shared Zod schemas ensure consistency
- Defense in depth security approach

### 3. Conversational AI Pattern

**Decision**: Two-step API design (initial recommendation + conversational updates)

**Rationale**:
- Allows for iterative refinement of recommendations
- Better user experience with follow-up questions
- Separates concerns (initial vs. conversational)
- Enables dynamic recommendation updates

### 4. Prompt Engineering with Examples

**Decision**: Use few-shot prompting with structured examples

**Rationale**:
- Improves AI response quality and consistency
- Ensures structured output format
- Reduces need for fine-tuning
- Easier to maintain and update

### 5. Inference Profile Support

**Decision**: Automatic conversion of model IDs to inference profile format

**Rationale**:
- Claude 3.7+ requires inference profiles
- Backward compatible with older model IDs
- Handles different AWS regions automatically
- Simplifies configuration for users

### 6. Type-Safe API Communication

**Decision**: Use TypeScript interfaces and Zod schemas for all API communication

**Rationale**:
- Compile-time type checking
- Better IDE support
- Reduced runtime errors
- Self-documenting code
- Automatic type inference from Zod schemas

### 7. Server-Side Only Credentials

**Decision**: No `NEXT_PUBLIC_` prefix for sensitive variables

**Rationale**:
- Prevents client-side exposure of AWS credentials
- Follows Next.js security best practices
- All sensitive operations happen server-side

### 8. Input Length Limits

**Decision**: Enforce strict input length limits via Zod

**Rationale**:
- Prevents DoS attacks via oversized payloads
- Protects AWS Bedrock from excessive token usage
- Ensures reasonable API response times
- Cost control for AWS Bedrock usage

## Security Architecture

### Credential Management

```
┌─────────────────────────────────────┐
│  Environment Variables (.env.local) │
│  - AWS_ACCESS_KEY_ID                │
│  - AWS_SECRET_ACCESS_KEY            │
│  - AWS_REGION                       │
│  - BEDROCK_MODEL_ID                 │
└──────────────┬──────────────────────┘
               │ (Server-side only)
               ▼
┌─────────────────────────────────────┐
│  Bedrock Client (route.ts)          │
│  - Validates env vars at runtime     │
│  - Model ID conversion               │
│  - Direct initialization            │
└──────────────┬──────────────────────┘
               │ AWS SDK
               ▼
┌─────────────────────────────────────┐
│  AWS Bedrock                        │
└─────────────────────────────────────┘
```

### Security Layers

1. **Input Validation**: Zod schemas on client and server
   - Scenario: max 5,000 characters
   - Chat messages: max 2,000 characters
   - Conversation history: max 50 messages
2. **Type Safety**: TypeScript prevents type-related vulnerabilities
3. **Environment Isolation**: Server-side only credential access
4. **Error Handling**: No sensitive information in error messages
5. **SSN Privacy**: SSNs never stored, only entered at PDF generation time

### Security Headers

Configured in Next.js (can be added to `next.config.js`):
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

## Deployment Architecture

### Production Deployment (Vercel - Recommended)

```
┌─────────────────────────────────────┐
│  Internet                            │
└──────────────┬──────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────┐
│  Vercel Edge Network                │
│  ┌───────────────────────────────┐  │
│  │  Next.js Application          │  │
│  │  - Serverless functions        │  │
│  │  - API routes                  │  │
│  │  - Static pages                │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Environment Variables        │  │
│  │  - AWS credentials             │  │
│  └───────────────────────────────┘  │
└──────────────┬──────────────────────┘
               │ AWS SDK
               ▼
┌─────────────────────────────────────┐
│  AWS Bedrock                        │
│  - Claude 3.5/3.7 Sonnet            │
└─────────────────────────────────────┘
```

### Alternative Deployments

- **AWS EC2**: Traditional server deployment with PM2
- **AWS Lambda**: Serverless deployment with API Gateway
- **Docker**: Containerized deployment
- **Other Platforms**: Any Node.js hosting platform

## Project Structure

```
nextjs-sf50generator/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── recommend-noa/
│   │   │   └── route.ts          # Initial recommendation endpoint
│   │   └── chat-noa/
│   │       └── route.ts          # Conversational update endpoint
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main AI Assistant page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── sf50-document.tsx         # SF-50 PDF document component
│   ├── pdf-viewer-wrapper.tsx   # PDF viewer wrapper (client-side)
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── textarea.tsx
├── lib/                          # Business logic
│   ├── prompt-engineering.ts     # NOA prompt building & parsing
│   ├── sample-data.ts            # Sample employee data
│   ├── validation.ts              # Zod schemas
│   ├── helpers.ts                # Utility functions
│   └── utils.ts                  # Tailwind merge utility
├── types/                        # TypeScript types
│   └── index.ts                  # Type definitions
├── .env.local                    # Environment variables (gitignored)
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
└── package.json                  # Dependencies
```

## Data Models

### NOARecommendation
```typescript
{
  noa: string;                    // NOA code (e.g., "702")
  label: string;                  // NOA label (e.g., "Promotion")
  lac?: string;                   // Legal Authority Code (optional)
  clarifications: string[];       // Follow-up questions
  requiredSF50Fields?: string[];  // Required SF-50 fields
  opmRemarks?: string;            // Suggested OPM remarks
  remarkCodes?: string[];         // Remark codes (optional)
}
```

### RecommendNOARequest
```typescript
{
  scenario: string;  // Max 5,000 characters
}
```

### ChatNOARequest
```typescript
{
  originalScenario: string;  // Max 5,000 characters
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;  // Max 2,000 characters
  }>;  // Max 50 messages
}
```

### Employee
```typescript
{
  id: string;
  name: string;
  series: string;
  grade: number;
  step: number;
  salary: number;
  dutyStation: string;
}
```

## Error Handling Strategy

1. **Validation Errors**: Field-level errors with specific messages
   - Returns 400 status with detailed error information
   - Includes field path and validation message
2. **AWS Errors**: Specific handling for Bedrock errors
   - `ResourceNotFoundException`: Model not found
   - `AccessDeniedException`: Permission issues
   - `ValidationException`: Invalid request format
   - User-friendly error messages
3. **Generic Errors**: Fallback with user-friendly messages
4. **Type Safety**: Proper type guards for error handling

## Performance Considerations

1. **Client-Side PDF Generation**: Avoids server load for PDF rendering
2. **Dynamic Imports**: PDF components loaded only when needed
3. **API Route Optimization**: Serverless functions scale automatically
4. **Input Validation**: Early validation prevents unnecessary API calls
5. **Response Caching**: Could be added for similar scenarios (future enhancement)

## Future Considerations

### Potential Enhancements

1. **Caching**: Cache recommendations for similar scenarios
2. **Rate Limiting**: Implement API rate limiting
3. **Authentication**: Optional user authentication
4. **History**: Save and retrieve previous recommendations
5. **Export Formats**: Additional export formats (DOCX, JSON)
6. **Employee Database**: Integration with real employee database
7. **Multi-language**: Support for multiple languages
8. **Analytics**: Usage tracking and analytics
9. **Batch Processing**: Process multiple scenarios at once
10. **Template Management**: Save and reuse common scenarios

### Scalability

- Current architecture supports horizontal scaling
- Stateless API routes enable load balancing
- Consider Redis for caching at scale
- Database integration for history/authentication features
- Consider AWS Bedrock provisioned throughput for high-volume usage

### AI Model Improvements

1. **Fine-tuning**: Fine-tune Claude model on NOA dataset
2. **Prompt Optimization**: Continuous improvement of prompt engineering
3. **Multi-model Support**: Support for additional Claude models
4. **Confidence Scores**: Add confidence scores to recommendations

---

**Last Updated**: January 2025  
**Version**: 0.1.0


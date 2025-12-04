# AI SF-50 Assistant

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)

A focused, standalone Next.js application that demonstrates the AI Assistant functionality for generating SF-50 (Standard Form 50) personnel action form recommendations. This application uses AWS Bedrock with Claude models to recommend appropriate Nature of Action (NOA) codes based on employee scenarios.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Level & Prerequisites](#project-level--prerequisites)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Sample Data](#sample-data)
- [Security & Privacy](#security--privacy)
- [PDF Generation](#pdf-generation)
- [Contributing](#contributing)
- [Security](#security)
- [Changelog](#changelog)
- [License](#license)

## Overview

This is a single-screen application designed for stakeholder demonstrations, focusing exclusively on the AI-powered NOA recommendation feature. HR managers can:

- Select an employee from the directory
- Describe the personnel action scenario in natural language
- Receive AI-powered recommendations for:
  - NOA codes and labels
  - Legal Authority Codes (LAC)
  - Required SF-50 fields
  - OPM NOA Remarks suggestions
- Engage in a conversational chatbot to answer follow-up questions
- Generate and download a complete SF-50 form PDF with all recommendations

## Features

### 🎯 Core Functionality

- **Employee Selection**: Choose from 25 sample employees with various grades, steps, and duty stations
- **Natural Language Input**: Describe employee scenarios in plain English
- **AI Recommendations**: Get structured recommendations including:
  - **NOA Code & Label**: Recommended Nature of Action code (e.g., 702 - Promotion)
  - **Legal Authority Code (LAC)**: Applicable legal authority when relevant
  - **Required SF-50 Fields**: List of fields that must be completed
  - **OPM NOA Remarks**: Suggested remarks text for the SF-50 remarks field
  - **Remark Codes**: Any applicable remark codes

### 💬 Interactive Chatbot

- **Follow-up Questions**: Clarifications from the initial recommendation become interactive chatbot questions
- **Conversational Flow**: Answer questions one at a time through a chat interface
- **Dynamic Updates**: Recommendations update based on your responses to clarify details
- **Real-time Refinement**: Get more accurate recommendations as you provide additional information

### 📄 PDF Generation

- **Generate SF-50 Form**: Create a complete, formatted SF-50 PDF with all recommendation data
- **Pre-filled Fields**: Employee information and AI recommendations automatically populate the form
- **Effective Date**: Set the effective date for the personnel action
- **View & Download**: Preview the PDF inline and download for official use
- **Professional Format**: Standard SF-50 form layout with all required fields

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **AI/ML**: AWS Bedrock (Claude 3.5 Sonnet, Claude 3.7 Sonnet, or newer)
- **AWS SDK**: @aws-sdk/client-bedrock-runtime
- **PDF Generation**: @react-pdf/renderer
- **Validation**: Zod (type-safe input validation)

## Project Level & Prerequisites

### Difficulty Level: Intermediate

This is an **intermediate-level** project that requires a solid understanding of modern web development concepts and tools. It's suitable for developers who have experience with React and Next.js and are comfortable working with APIs, state management, and third-party integrations.

### Prerequisite Knowledge

Before attempting to work with or modify this project, you should have familiarity with:

#### Core Web Development
- **React Fundamentals**: Components, hooks (useState, useEffect, useRef), props, JSX
- **TypeScript Basics**: Type definitions, interfaces, type safety, generics
- **Modern JavaScript (ES6+)**: Arrow functions, destructuring, async/await, promises, modules

#### Next.js Specific
- **Next.js 14 App Router**: File-based routing, server and client components, layouts
- **API Routes**: Creating and handling API endpoints in Next.js
- **Client-Side Rendering**: Understanding when and how to use "use client" directive
- **Dynamic Imports**: Using `next/dynamic` for code splitting and SSR handling

#### State Management & UI
- **React State Management**: Managing complex component state, lifting state up
- **Form Handling**: Controlled components, input validation
- **CSS/Tailwind**: Utility-first CSS, responsive design, component styling

#### Backend & APIs
- **RESTful APIs**: HTTP methods, request/response handling, error handling
- **AWS Services**: Basic understanding of AWS SDK, IAM, and service configuration
- **Environment Variables**: Managing secrets and configuration

#### Additional Technologies
- **PDF Generation**: Understanding of document generation concepts (helpful but not required)
- **Prompt Engineering**: Basic understanding of how to structure prompts for LLMs (helpful but not required)
- **Git**: Version control basics for collaboration

### Recommended Learning Path

If you're new to some of these technologies, consider learning in this order:

1. **React & TypeScript** → Build a few small React projects with TypeScript
2. **Next.js Basics** → Complete the Next.js tutorial and build a simple app
3. **API Integration** → Practice fetching data and handling API responses
4. **AWS Basics** → Learn about AWS SDK and basic service configuration
5. **Advanced Next.js** → Explore App Router, server components, and API routes

This project is a great learning opportunity if you're comfortable with React and want to explore AI integration, PDF generation, and more advanced Next.js patterns.

## Prerequisites

### Development Environment

- **Node.js 18+** and npm (or yarn/pnpm)
- **Git** for version control
- **Code Editor** (VS Code recommended) with TypeScript support

### AWS Prerequisites

For local development and production deployment:

- **AWS Account**: Active AWS account with billing enabled
- **AWS Bedrock Access**: 
  - Model access enabled for Claude models (Claude 3.5 Sonnet, Claude 3.7 Sonnet, or newer)
  - IAM user or role with `bedrock:InvokeModel` permission
  - AWS credentials (Access Key ID and Secret Access Key)
- **AWS Region**: Access to a region where Bedrock is available (e.g., us-east-1, us-west-2)
- **Basic AWS Knowledge**: Understanding of IAM roles, environment variables, and AWS SDK configuration

### Hosting & Deployment Prerequisites

This application can be deployed to various platforms. Choose based on your needs:

#### Option 1: Vercel (Recommended for Next.js)

**Prerequisites:**
- **Vercel Account**: Free tier available at [vercel.com](https://vercel.com)
- **GitHub/GitLab/Bitbucket Account**: For connecting your repository
- **Environment Variables Setup**: 
  - Add AWS credentials as environment variables in Vercel dashboard
  - Variables needed: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `BEDROCK_MODEL_ID` (optional)
- **Vercel CLI** (optional): For local deployment testing
  ```bash
  npm i -g vercel
  ```

**Advantages:**
- Zero-config Next.js deployment
- Automatic HTTPS and CDN
- Serverless functions for API routes
- Free tier suitable for development/demos
- Easy environment variable management

**Considerations:**
- API routes run as serverless functions (may have cold starts)
- Ensure AWS credentials are securely stored in Vercel environment variables
- Free tier has usage limits

#### Option 2: AWS (EC2, ECS, or Lambda)

**Prerequisites:**
- **AWS Account** with appropriate permissions
- **AWS CLI** installed and configured
  ```bash
  aws configure
  ```
- **Docker** (if using ECS/containerized deployment)
- **IAM Permissions**: 
  - EC2: `ec2:*`, `iam:PassRole` (for EC2 deployment)
  - ECS: `ecs:*`, `ecr:*` (for containerized deployment)
  - Lambda: `lambda:*`, `iam:CreateRole` (for serverless deployment)
- **Basic AWS Services Knowledge**: EC2, ECS, Lambda, or Elastic Beanstalk

**Advantages:**
- Full control over infrastructure
- Can use AWS IAM roles instead of access keys
- Better for enterprise/production deployments
- Can integrate with other AWS services

**Considerations:**
- More complex setup and maintenance
- Requires AWS infrastructure knowledge
- Cost considerations for running instances

#### Option 3: Other Node.js Hosting Platforms

**Alternatives:**
- **Netlify**: Similar to Vercel, good Next.js support
- **Railway**: Simple deployment with good Node.js support
- **Render**: Free tier available, supports Next.js
- **DigitalOcean App Platform**: Simple deployment with good documentation
- **Heroku**: Traditional PaaS (note: removed free tier)

**Prerequisites for these platforms:**
- Account on the chosen platform
- Git repository connected
- Environment variables configured
- Understanding of platform-specific deployment processes

**General Requirements for All Platforms:**
- Environment variables for AWS credentials must be securely configured
- Platform must support Next.js 14+ and Node.js 18+
- API routes must be supported (serverless functions or Node.js runtime)
- Sufficient memory/CPU for PDF generation (especially important for `@react-pdf/renderer`)

### Security Considerations

Regardless of hosting platform:

- **Never commit AWS credentials** to version control
- **Use environment variables** for all sensitive configuration
- **Rotate credentials regularly** for production deployments
- **Use IAM roles** when possible (especially on AWS) instead of access keys
- **Enable MFA** on AWS accounts
- **Review IAM permissions** regularly and follow least-privilege principle

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory (you can copy from `.env.example`):

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual credentials:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Bedrock Model (optional - defaults to Claude 3.7 Sonnet)
BEDROCK_MODEL_ID=anthropic.claude-3-7-sonnet-20250219-v1:0
```

**Note**: For Claude 3.7 Sonnet and newer models, the code automatically converts model IDs to inference profile format (e.g., `us.anthropic.claude-3-7-sonnet-20250219-v1:0`).

### 3. AWS Bedrock Setup

Before running the application, you need to:

1. **Enable Model Access** in AWS Bedrock Console
   - Navigate to Amazon Bedrock → Model access
   - Enable access to your chosen Claude model (e.g., Claude 3.5 Sonnet or Claude 3.7 Sonnet)
   - Wait 15 minutes for changes to propagate

2. **Configure IAM Permissions**
   - Your AWS user/role needs `bedrock:InvokeModel` permission
   - See the original project's `AWS_BEDROCK_SETUP.md` for detailed setup instructions

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## Deployment

### Deploying to Vercel

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project" and import your repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables**:
   - In Vercel project settings, go to "Environment Variables"
   - Add the following:
     - `AWS_REGION` = `us-east-1` (or your preferred region)
     - `AWS_ACCESS_KEY_ID` = Your AWS access key
     - `AWS_SECRET_ACCESS_KEY` = Your AWS secret key
     - `BEDROCK_MODEL_ID` = `anthropic.claude-3-7-sonnet-20250219-v1:0` (optional)

4. **Deploy**:
   - Click "Deploy" - Vercel will build and deploy automatically
   - Your app will be live at `your-project.vercel.app`

5. **Using Vercel CLI** (alternative):
   ```bash
   npm i -g vercel
   vercel
   # Follow prompts and add environment variables when asked
   ```

### Deploying to AWS

#### Option A: AWS Lambda (Serverless)

1. **Install Serverless Framework**:
   ```bash
   npm install -g serverless
   npm install --save-dev serverless-nextjs-plugin
   ```

2. **Configure serverless.yml** (create in project root):
   ```yaml
   service: nextjs-sf50generator
   provider:
     name: aws
     runtime: nodejs18.x
     region: us-east-1
     environment:
       AWS_REGION: ${env:AWS_REGION}
       AWS_ACCESS_KEY_ID: ${env:AWS_ACCESS_KEY_ID}
       AWS_SECRET_ACCESS_KEY: ${env:AWS_SECRET_ACCESS_KEY}
   plugins:
     - serverless-nextjs-plugin
   ```

3. **Deploy**:
   ```bash
   serverless deploy
   ```

#### Option B: AWS EC2

1. **Launch EC2 Instance**:
   - Choose Ubuntu/Amazon Linux AMI
   - Instance type: t3.small or larger (for PDF generation)
   - Configure security group to allow HTTP/HTTPS traffic

2. **SSH into instance and setup**:
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Clone your repository
   git clone <your-repo-url>
   cd nextjs-sf50generator

   # Install dependencies
   npm install

   # Set environment variables
   export AWS_REGION=us-east-1
   export AWS_ACCESS_KEY_ID=your-key
   export AWS_SECRET_ACCESS_KEY=your-secret

   # Build and start
   npm run build
   npm start
   ```

3. **Use PM2 for process management**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "sf50-generator" -- start
   pm2 save
   pm2 startup
   ```

#### Option C: AWS ECS (Containerized)

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and push to ECR**:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   docker build -t nextjs-sf50generator .
   docker tag nextjs-sf50generator:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/nextjs-sf50generator:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/nextjs-sf50generator:latest
   ```

3. **Create ECS task definition** with environment variables and deploy

### Deploying to Other Platforms

#### Netlify

1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables in Netlify dashboard
5. Deploy

#### Railway

1. Connect GitHub repository
2. Railway auto-detects Next.js
3. Add environment variables in Railway dashboard
4. Deploy automatically on push

#### Render

1. Create new Web Service
2. Connect repository
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables in Render dashboard

### Post-Deployment Checklist

- [ ] Verify environment variables are set correctly
- [ ] Test AI recommendation endpoint
- [ ] Test PDF generation functionality
- [ ] Verify AWS Bedrock access from deployed environment
- [ ] Check application logs for errors
- [ ] Test chatbot conversation flow
- [ ] Verify HTTPS is enabled (if applicable)
- [ ] Set up monitoring/error tracking (optional)

## Project Structure

```
nextjs-sf50generator/
├── app/
│   ├── api/
│   │   ├── recommend-noa/
│   │   │   └── route.ts          # API endpoint for initial AI recommendations
│   │   └── chat-noa/
│   │       └── route.ts          # API endpoint for conversational updates
│   ├── page.tsx                   # Main AI Assistant screen
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
├── components/
│   ├── ui/                        # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── textarea.tsx
│   ├── sf50-document.tsx          # SF-50 PDF document component
│   └── pdf-viewer-wrapper.tsx     # PDF viewer wrapper (client-side)
├── lib/
│   ├── prompt-engineering.ts     # NOA recommendation prompt building & parsing
│   ├── sample-data.ts             # Sample employee data
│   ├── helpers.ts                 # Utility functions
│   ├── utils.ts                   # Tailwind merge utility
│   └── validation.ts              # Zod schemas for input validation
└── types/
    └── index.ts                   # TypeScript type definitions
```

## Usage

1. **Select an Employee**: Choose from the dropdown list of 25 sample employees
2. **Describe the Scenario**: Enter a natural language description of the personnel action
   - Example: "Employee promoted from GS-12 to GS-13, permanent"
   - Example: "Employee reassigned to new division with no change in grade"
   - Example: "Employee receiving within-grade increase from step 2 to step 3"
3. **Get Recommendation**: Click "Get Recommendation" to receive AI-powered suggestions
4. **Answer Follow-up Questions**: A chatbot will appear with clarification questions. Answer them to refine the recommendation
5. **Review Updated Results**: The recommendation updates based on your responses
6. **Set Effective Date**: Optionally set the effective date for the personnel action
7. **Generate SF-50**: Click "Generate SF-50" to create a PDF form with all the information
8. **View & Download**: Review the PDF inline and download it for official use

## API Endpoints

### `/api/recommend-noa`

Initial recommendation endpoint that:
- Validates input with Zod schema (scenario must be a string, max 5,000 characters)
- Accepts employee scenario descriptions
- Builds structured prompts using prompt engineering utilities
- Invokes AWS Bedrock with Claude models
- Parses and returns structured NOA recommendations

**Request:**
```json
{
  "scenario": "Employee promoted from GS-12 to GS-13, permanent"
}
```

**Response:**
```json
{
  "recommendation": {
    "noa": "702",
    "label": "Promotion",
    "lac": "5 CFR 335.103",
    "clarifications": ["Effective date?", "Competitive certificate number?"],
    "requiredSF50Fields": ["Position title", "Pay plan", "Grade", "Step"],
    "opmRemarks": "Permanent promotion from GS-12 Step 5 to GS-13 Step 1..."
  }
}
```

**Validation Error Response (400):**
```json
{
  "error": "Invalid input",
  "details": [
    {
      "field": "scenario",
      "message": "Scenario cannot exceed 5000 characters"
    }
  ]
}
```

### `/api/chat-noa`

Conversational update endpoint that:
- Validates input with Zod schema:
  - Original scenario must be a string (max 5,000 characters)
  - Conversation history must be an array (max 50 messages)
  - Each message must have valid role ("user" or "assistant") and content (max 2,000 characters)
- Accepts the original scenario and conversation history
- Updates recommendations based on user responses
- Returns refined recommendations with new clarifications if needed

**Request:**
```json
{
  "originalScenario": "Employee promoted from GS-12 to GS-13, permanent",
  "conversationHistory": [
    { "role": "assistant", "content": "Effective date?" },
    { "role": "user", "content": "March 1, 2024" },
    { "role": "assistant", "content": "Competitive certificate number?" },
    { "role": "user", "content": "CERT-2024-001" }
  ]
}
```

**Response:**
```json
{
  "recommendation": {
    "noa": "702",
    "label": "Promotion",
    "lac": "5 CFR 335.103",
    "requiredSF50Fields": ["Position title", "Pay plan", "Grade", "Step"],
    "opmRemarks": "Permanent promotion from GS-12 Step 5 to GS-13 Step 1 effective March 1, 2024 via competitive certificate CERT-2024-001..."
  }
}
```

**Validation Error Response (400):**
```json
{
  "error": "Invalid input",
  "details": [
    {
      "field": "conversationHistory.0.role",
      "message": "Invalid enum value. Expected 'user' | 'assistant', received 'admin'"
    },
    {
      "field": "conversationHistory.1.content",
      "message": "Content cannot exceed 2000 characters"
    }
  ]
}
```

## Troubleshooting

### AI Recommendations Not Working

1. **Check AWS Credentials**: Verify `.env.local` has correct AWS credentials
2. **Verify Model Access**: Ensure model access is enabled in AWS Bedrock Console
3. **Check IAM Permissions**: Verify IAM user has `bedrock:InvokeModel` permission
4. **Wait for Propagation**: Model access changes can take up to 15 minutes
5. **Check Model ID**: For Claude 3.7+, ensure using correct inference profile format

### Common Errors

- **"Model access denied"**: Enable model access in Bedrock Console and wait 15 minutes
- **"on-demand throughput isn't supported"**: Use inference profile ID (automatically handled in code)
- **"AccessDeniedException"**: Check IAM permissions include `bedrock:InvokeModel`
- **ESM package errors**: The `@react-pdf/renderer` package is configured in `next.config.js` to be transpiled. If you see ESM errors, clear the `.next` cache and restart the dev server

### PDF Generation Issues

- **PDF not displaying**: Ensure you're using a modern browser that supports PDF rendering
- **Styling issues**: The PDF uses `@react-pdf/renderer` which has limited CSS support. Check the component styles if formatting looks incorrect

## Sample Data

The application includes 25 sample employees with:
- Various grades (GS-7 to GS-15)
- Different steps (1-10)
- Multiple duty stations
- Realistic salary data

All sample data is in `lib/sample-data.ts` and can be replaced with real data when integrating with a backend.

## Security & Privacy

- **Input Validation**: All API inputs are validated using Zod schemas to prevent injection attacks and DoS:
  - Scenario descriptions limited to 5,000 characters
  - Chat messages limited to 2,000 characters
  - Conversation history limited to 50 messages
  - Type-safe validation ensures data integrity
- **SSN Handling**: Social Security Numbers are entered at generation time and never stored (per PRD requirements). The PDF shows a placeholder indicating SSN is entered at generation.
- **AWS Credentials**: Store securely in environment variables, never commit to version control
- **IAM Permissions**: Use least-privilege IAM policies in production
- **Client-Side Rendering**: PDF components are rendered client-side only to avoid SSR issues with ESM packages

## PDF Generation

The SF-50 PDF form includes:
- Employee information (name, series, grade, step, salary, duty station)
- Nature of Action (NOA code and label)
- Effective date
- Legal Authority Code (if applicable)
- Remark codes (if applicable)
- OPM remarks
- Required SF-50 fields
- Professional formatting matching standard SF-50 layout

The PDF can be viewed inline in the application or downloaded for official use.

## License

Copyright 2025 Frank Manja

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting pull requests.

## Security

For security concerns, please review our [Security Policy](SECURITY.md).

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.


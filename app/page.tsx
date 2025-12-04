"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Sparkles, Send, Bot, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { employees } from "@/lib/sample-data";
import { SF50Document } from "@/components/sf50-document";
import { PDFViewerWrapper, PDFDownloadLink } from "@/components/pdf-viewer-wrapper";

// -------------------------------------------------------------
// AI Assistant Screen
// -------------------------------------------------------------
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistantPage() {
  const [scenario, setScenario] = useState("");
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0].id);
  const [recommendation, setRecommendation] = useState<{
    noa: string;
    label: string;
    lac?: string;
    opmRemarks?: string;
    remarkCodes?: string[];
    requiredSF50Fields?: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [originalScenario, setOriginalScenario] = useState("");
  const [originalClarifications, setOriginalClarifications] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showPDF, setShowPDF] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  async function runAssistant() {
    if (!scenario.trim()) {
      setError("Please enter a scenario description");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const response = await fetch("/api/recommend-noa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scenario: scenario.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Failed to get recommendation");
      }

      const data = await response.json();

      if (data.recommendation) {
        const clarifications = data.recommendation.clarifications || [];
        setRecommendation({
          noa: data.recommendation.noa,
          label: data.recommendation.label,
          lac: data.recommendation.lac,
          opmRemarks: data.recommendation.opmRemarks,
          remarkCodes: data.recommendation.remarkCodes,
          requiredSF50Fields: data.recommendation.requiredSF50Fields,
        });
        
        // Initialize chatbot with first clarification as a question
        setOriginalScenario(scenario.trim());
        setOriginalClarifications(clarifications);
        setCurrentQuestionIndex(0);
        if (clarifications.length > 0) {
          // Show only the first question
          const initialMessages: ChatMessage[] = [
            {
              role: "assistant",
              content: clarifications[0],
            },
          ];
          setChatMessages(initialMessages);
        } else {
          setChatMessages([]);
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("Error getting recommendation:", err);
      setError(err.message || "Failed to get recommendation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function sendChatMessage() {
    if (!chatInput.trim() || !originalScenario) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: chatInput.trim(),
    };

    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setChatInput("");
    setIsChatLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat-noa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalScenario,
          conversationHistory: updatedMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Failed to get updated recommendation");
      }

      const data = await response.json();

      if (data.recommendation) {
        // Update recommendation
        setRecommendation({
          noa: data.recommendation.noa,
          label: data.recommendation.label,
          lac: data.recommendation.lac,
          opmRemarks: data.recommendation.opmRemarks,
          remarkCodes: data.recommendation.remarkCodes,
          requiredSF50Fields: data.recommendation.requiredSF50Fields,
        });

        // Ask next question from original clarifications or new ones from updated recommendation
        const nextIndex = currentQuestionIndex + 1;
        const newClarifications = data.recommendation.clarifications || [];
        
        // Check if there are more original questions or new questions from updated recommendation
        if (nextIndex < originalClarifications.length) {
          // Ask next original question
          const assistantMessage: ChatMessage = {
            role: "assistant",
            content: originalClarifications[nextIndex],
          };
          setChatMessages([...updatedMessages, assistantMessage]);
          setCurrentQuestionIndex(nextIndex);
        } else if (newClarifications.length > 0) {
          // Ask new clarification from updated recommendation
          const assistantMessage: ChatMessage = {
            role: "assistant",
            content: newClarifications[0],
          };
          setChatMessages([...updatedMessages, assistantMessage]);
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("Error getting updated recommendation:", err);
      setError(err.message || "Failed to get updated recommendation. Please try again.");
    } finally {
      setIsChatLoading(false);
    }
  }

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">AI SF-50 Assistant</h1>
          <p className="mt-2 text-slate-600">
            Get AI-powered recommendations for Nature of Action (NOA) codes based on employee scenarios
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Describe the employee scenario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Employee</label>
                <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name} — GS-{e.grade} Step {e.step} ({e.dutyStation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedEmployee && (
                  <div className="mt-1 text-xs text-slate-500">
                    Series: {selectedEmployee.series} | Grade: GS-{selectedEmployee.grade} | Step: {selectedEmployee.step} | Salary: ${selectedEmployee.salary.toLocaleString()}
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Scenario</label>
                <Textarea
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  rows={6}
                  placeholder="Describe the employee action or change. For example: 'Employee promoted from GS-12 to GS-13, permanent' or 'Employee reassigned to new division with no change in grade'."
                  className="resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={runAssistant} disabled={isLoading} className="gap-2">
                  <Sparkles className="h-4 w-4" />{" "}
                  {isLoading ? "Getting Recommendation..." : "Get Recommendation"}
                </Button>
                {recommendation && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setScenario("");
                      setRecommendation(null);
                      setError(null);
                      setChatMessages([]);
                      setChatInput("");
                      setOriginalScenario("");
                      setOriginalClarifications([]);
                      setCurrentQuestionIndex(0);
                      setShowPDF(false);
                      setEffectiveDate("");
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Chatbot Section */}
              {recommendation && chatMessages.length > 0 && (
                <div className="mt-6 rounded-lg border bg-white">
                  <div className="border-b p-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm font-medium text-slate-700">Follow-up Questions</span>
                    </div>
                  </div>
                  <div className="max-h-64 space-y-3 overflow-y-auto p-4">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                            <Bot className="h-4 w-4 text-indigo-600" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            msg.role === "user"
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {msg.content}
                        </div>
                        {msg.role === "user" && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200">
                            <User className="h-4 w-4 text-slate-600" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                          <Bot className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
                          Thinking...
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="border-t p-3">
                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendChatMessage();
                          }
                        }}
                        placeholder="Type your response..."
                        disabled={isChatLoading}
                        className="flex-1"
                      />
                      <Button
                        onClick={sendChatMessage}
                        disabled={isChatLoading || !chatInput.trim()}
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {!recommendation ? (
                <div className="text-slate-500">
                  Run the assistant to see suggested NOA/LAC, clarifications, and references.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                    <div className="text-xs font-medium text-indigo-600">Nature of Action</div>
                    <div className="mt-1 text-lg font-semibold text-indigo-900">
                      {recommendation.noa} — {recommendation.label}
                    </div>
                  </div>
                  {recommendation.lac && (
                    <div className="rounded-lg border p-3">
                      <div className="text-xs font-medium text-slate-500">Legal Authority Code</div>
                      <div className="mt-1 font-medium text-slate-700">{recommendation.lac}</div>
                    </div>
                  )}
                  {recommendation.requiredSF50Fields &&
                    recommendation.requiredSF50Fields.length > 0 && (
                      <div className="rounded-lg border p-3">
                        <div className="mb-2 text-xs font-medium text-slate-500">
                          Required SF-50 Fields
                        </div>
                        <ul className="list-disc space-y-1 pl-5 text-slate-700">
                          {recommendation.requiredSF50Fields.map((field, i) => (
                            <li key={i} className="text-sm">
                              {field}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {recommendation.opmRemarks && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <div className="mb-1 text-xs font-medium text-blue-600">OPM NOA Remarks</div>
                      <div className="text-sm text-slate-700">{recommendation.opmRemarks}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        This will be used as the remarks field in the SF-50.
                      </div>
                    </div>
                  )}
                  {recommendation.remarkCodes && recommendation.remarkCodes.length > 0 && (
                    <div className="rounded-lg border p-3">
                      <div className="mb-1 text-xs font-medium text-slate-500">Remark Codes</div>
                      <div className="text-sm font-mono text-slate-700">
                        {recommendation.remarkCodes.join(", ")}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 space-y-3">
                    <div className="grid gap-2">
                      <label className="text-xs font-medium text-slate-700">Effective Date</label>
                      <Input
                        type="date"
                        value={effectiveDate}
                        onChange={(e) => setEffectiveDate(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <Button
                      onClick={() => setShowPDF(true)}
                      className="w-full gap-2"
                      variant="default"
                    >
                      <FileText className="h-4 w-4" />
                      Generate SF-50
                    </Button>
                  </div>
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">
                    <strong>Note:</strong> SSN will be entered right before generation and never
                    stored (per PRD).
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* PDF Display Section */}
        {showPDF && recommendation && selectedEmployee && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generated SF-50 Form
                </CardTitle>
                <div className="flex gap-2">
                  {selectedEmployee && recommendation && (
                    <PDFDownloadLink
                      document={
                        <SF50Document
                          employee={selectedEmployee}
                          recommendation={recommendation}
                          effectiveDate={effectiveDate || undefined}
                        />
                      }
                      fileName={`SF-50-${selectedEmployee.name.replace(/\s+/g, "-")}-${recommendation.noa}.pdf`}
                      className="inline-block"
                    >
                      {({ loading }) => (
                        <Button variant="default" size="sm" disabled={loading}>
                          {loading ? "Generating..." : "Download PDF"}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPDF(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] w-full rounded-lg border">
                <PDFViewerWrapper
                  document={
                    <SF50Document
                      employee={selectedEmployee}
                      recommendation={recommendation}
                      effectiveDate={effectiveDate || undefined}
                    />
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


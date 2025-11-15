import { useState } from "react";
import {
  Shield,
  MessageCircle,
  Send,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";

// Dummy data for preview, now with file attachments
const dummyComplaints = [
  {
    id: "c1",
    subject: "Leaking tap in kitchen",
    unit: "Modern City Centre Studio",
    status: "open",
    urgency: "high",
    created_at: "2024-12-01T10:30:00Z",
    messages: [
      {
        id: "m1",
        sender: "Lodger",
        message: "The kitchen tap is leaking badly.",
        created_at: "2024-12-01T10:31:00Z",
        attachment: null,
      },
      {
        id: "m2",
        sender: "Landlord",
        message: "Thanks for reporting. I'll send a plumber.",
        created_at: "2024-12-01T11:00:00Z",
        attachment: null,
      },
    ],
  },
];

const dummyConversations = [
  {
    id: "conv1",
    with: "Admin",
    messages: [
      {
        id: "cm1",
        sender: "Landlord",
        message: "Hello Admin, I need help with a new property listing.",
        created_at: "2024-12-02T08:00:00Z",
        attachment: null,
      },
      {
        id: "cm2",
        sender: "Admin",
        message: "Hi! Please send the property details.",
        created_at: "2024-12-02T08:05:00Z",
        attachment: null,
      },
    ],
  },
];

const TABS = [
  { key: "complaints", label: "Complaints", icon: <Shield className="h-4 w-4 mr-1" /> },
  { key: "messages", label: "Messages", icon: <MessageCircle className="h-4 w-4 mr-1" /> },
];

const LandlordMessages = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("complaints");
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [conversation, setConversation] = useState(dummyConversations[0]);
  const [chatInput, setChatInput] = useState("");
  const [chatAttachment, setChatAttachment] = useState<File | null>(null);

  // Dummy send message handler for chat
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !chatAttachment) return;
    setConversation({
      ...conversation,
      messages: [
        ...conversation.messages,
        {
          id: `cm${conversation.messages.length + 1}`,
          sender: "Landlord",
          message: chatInput,
          created_at: new Date().toISOString(),
          attachment: chatAttachment
            ? {
                url: URL.createObjectURL(chatAttachment),
                name: chatAttachment.name,
                type: chatAttachment.type,
              }
            : null,
        },
      ],
    });
    setChatInput("");
    setChatAttachment(null);
  };

  // File input for chat attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setChatAttachment(e.target.files[0]);
    }
  };

  return (
    <>
      <SEO
        title="Landlord Messages - Domus Servitia"
        description="View complaints and message admin."
        canonical="https://domusservitia.co.uk/landlord-messages"
      />
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <img src={logo} alt="Domus Servitia" className="h-10 rounded-lg" />
              <nav className="flex gap-2">
                {TABS.map(tab => (
                  <Button
                    key={tab.key}
                    variant={activeTab === tab.key ? "default" : "outline"}
                    className="flex items-center"
                    onClick={() => {
                      setActiveTab(tab.key);
                      setSelectedComplaint(null);
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                  </Button>
                ))}
              </nav>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Complaints Tab */}
          {activeTab === "complaints" && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Complaints List */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Complaints Linked to Your Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dummyComplaints.map(complaint => (
                      <div
                        key={complaint.id}
                        className={`p-4 border border-border rounded-lg cursor-pointer hover:shadow-elegant transition-all ${
                          selectedComplaint?.id === complaint.id ? "bg-accent/10" : ""
                        }`}
                        onClick={() => setSelectedComplaint(complaint)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold">{complaint.subject}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              complaint.status === "open"
                                ? "bg-yellow-100 text-yellow-700"
                                : complaint.status === "in_progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {complaint.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Unit: {complaint.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(complaint.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Complaint Messages */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>
                    {selectedComplaint
                      ? `Conversation: ${selectedComplaint.subject}`
                      : "Select a complaint to view messages"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedComplaint ? (
                    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
                      {selectedComplaint.messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.sender === "Landlord"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`rounded-lg px-4 py-2 max-w-[70%] ${
                              msg.sender === "Landlord"
                                ? "bg-accent text-right"
                                : msg.sender === "Admin"
                                ? "bg-blue-100"
                                : "bg-muted"
                            }`}
                          >
                            <div className="text-xs text-muted-foreground mb-1">
                              {msg.sender}
                            </div>
                            <div className="text-sm">{msg.message}</div>
                            {msg.attachment && (
                              <div className="mt-2 flex items-center gap-1">
                                <Paperclip className="h-4 w-4 text-muted-foreground" />
                                <a
                                  href={msg.attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-accent underline flex items-center"
                                >
                                  {msg.attachment.name}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </div>
                            )}
                            <div className="text-[10px] text-muted-foreground mt-1 text-right">
                              {new Date(msg.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground py-8 text-center">
                      Select a complaint to view its messages.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <div className="max-w-2xl mx-auto">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>
                    Chat with Admin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Chat Messages */}
                  <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto mb-4">
                    {conversation.messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender === "Landlord"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`rounded-lg px-4 py-2 max-w-[70%] ${
                            msg.sender === "Landlord"
                              ? "bg-accent text-right"
                              : "bg-muted"
                          }`}
                        >
                          <div className="text-xs text-muted-foreground mb-1">
                            {msg.sender}
                          </div>
                          <div className="text-sm">{msg.message}</div>
                          {msg.attachment && (
                            <div className="mt-2 flex items-center gap-1">
                              <Paperclip className="h-4 w-4 text-muted-foreground" />
                              <a
                                href={msg.attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-accent underline flex items-center"
                              >
                                {msg.attachment.name}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </div>
                          )}
                          <div className="text-[10px] text-muted-foreground mt-1 text-right">
                            {new Date(msg.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Chat Input */}
                  <form className="flex gap-2" onSubmit={handleSendChat}>
                    <Input
                      placeholder="Type your message..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      className="flex-1"
                    />
                    <label className="flex items-center gap-1 cursor-pointer">
                      <Paperclip className="h-4 w-4" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      {chatAttachment ? "Attached" : "Attach"}
                    </label>
                    <Button type="submit" className="flex items-center gap-1">
                      <Send className="h-4 w-4" />
                      Send
                    </Button>
                  </form>
                  {chatAttachment && (
                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                      <Paperclip className="h-4 w-4" />
                      <span>{chatAttachment.name}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setChatAttachment(null)}
                        className="ml-2"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LandlordMessages;
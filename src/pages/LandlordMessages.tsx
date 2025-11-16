import { useEffect, useState, useRef } from "react";
import {
  Shield,
  MessageCircle,
  Send,
  Paperclip,
  ExternalLink,
  X,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";

const TABS = [
  { key: "complaints", label: "Complaints", icon: <Shield className="h-4 w-4 mr-1" /> },
  { key: "messages", label: "Messages", icon: <MessageCircle className="h-4 w-4 mr-1" /> },
];

const ADMIN_ROLE = "admin"; // You may need to adjust this according to your roles setup

const LandlordMessages = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("complaints");
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);

  // Messaging state
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatAttachment, setChatAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Complaints dummy (leave as is for now)
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

  // Find admin user_id (for demo, fetch first admin profile)
  const [adminUserId, setAdminUserId] = useState<string | null>(null);

  useEffect(() => {
    // Find admin user_id
    const fetchAdmin = async () => {
      const { data, error } = await supabase
        .from("admin_profiles")
        .select("user_id")
        .limit(1)
        .single();
      if (data?.user_id) setAdminUserId(data.user_id);
    };
    fetchAdmin();
  }, []);

  // Find or create direct conversation between landlord and admin
  useEffect(() => {
    if (!user?.id || !adminUserId || activeTab !== "messages") return;

    const findOrCreateConversation = async () => {
      setLoading(true);
      // Find direct conversation
      const { data: convs, error } = await supabase
        .from("conversations")
        .select("id, type, subject")
        .eq("type", "direct")
        .in("id", [
          // Only conversations where both landlord and admin are participants
          ...(await supabase
            .from("conversation_participants")
            .select("conversation_id")
            .eq("user_id", user.id)
            .then(res => res.data?.map((row: any) => row.conversation_id) || [])),
        ]);
      let convId = null;
      if (convs && convs.length > 0) {
        // Check if admin is also participant
        for (const conv of convs) {
          const { data: participants } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", conv.id);
          if (participants?.some((p: any) => p.user_id === adminUserId)) {
            convId = conv.id;
            break;
          }
        }
      }
      // If not found, create
      if (!convId) {
        const { data: newConv, error: convError } = await supabase
          .from("conversations")
          .insert([
            {
              type: "direct",
              subject: "Landlord ↔ Admin Direct Chat",
              created_by_id: user.id,
            },
          ])
          .select()
          .single();
        convId = newConv?.id;
        // Add participants
        if (convId) {
          await supabase.from("conversation_participants").insert([
            { conversation_id: convId, user_id: user.id },
            { conversation_id: convId, user_id: adminUserId },
          ]);
        }
      }
      setConversation({ id: convId });
      setLoading(false);
    };
    findOrCreateConversation();
  }, [user?.id, adminUserId, activeTab]);

  // Fetch messages for conversation
  useEffect(() => {
    if (!conversation?.id) return;
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("conversation_messages")
        .select("id, sender_id, message, created_at, attachment")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });
      // Fetch sender names and attachments
      const msgs = await Promise.all(
        (data || []).map(async (msg: any) => {
          let senderName = "Unknown";
          if (msg.sender_id === user?.id) {
            senderName = "Landlord";
          } else if (msg.sender_id === adminUserId) {
            senderName = "Admin";
          }
          let attachmentObj = null;
          if (msg.attachment) {
            const { data: asset } = await supabase
              .from("assets")
              .select("public_url, file_name")
              .eq("id", msg.attachment)
              .single();
            if (asset) {
              attachmentObj = {
                url: asset.public_url,
                name: asset.file_name,
              };
            }
          }
          return {
            ...msg,
            sender: senderName,
            attachment: attachmentObj,
          };
        })
      );
      setMessages(msgs);
    };
    fetchMessages();
  }, [conversation?.id, user?.id, adminUserId]);

  // Supabase Realtime for new messages
  useEffect(() => {
    if (!conversation?.id) return;
    const channel = supabase
      .channel(`conversation_messages_${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          const msg = payload.new;
          let senderName = "Unknown";
          if (msg.sender_id === user?.id) {
            senderName = "Landlord";
          } else if (msg.sender_id === adminUserId) {
            senderName = "Admin";
          }
          let attachmentObj = null;
          if (msg.attachment) {
            const { data: asset } = await supabase
              .from("assets")
              .select("public_url, file_name")
              .eq("id", msg.attachment)
              .single();
            if (asset) {
              attachmentObj = {
                url: asset.public_url,
                name: asset.file_name,
              };
            }
          }
          setMessages((prev) => [
            ...prev,
            {
              ...msg,
              sender: senderName,
              attachment: attachmentObj,
            },
          ]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation?.id, user?.id, adminUserId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message handler
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !chatAttachment) return;
    let attachmentId = null;
    if (chatAttachment) {
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}_${chatAttachment.name}`;
      const { error: uploadError } = await supabase.storage
        .from("unit-images")
        .upload(fileName, chatAttachment);
      if (!uploadError) {
        const publicUrl = supabase.storage
          .from("unit-images")
          .getPublicUrl(fileName).data?.publicUrl;
        // Insert asset row
        const { data: assetData } = await supabase
          .from("assets")
          .insert([
            {
              storage_provider: "supabase",
              bucket: "unit-images",
              file_key: fileName,
              file_name: chatAttachment.name,
              public_url: publicUrl,
              content_type: chatAttachment.type,
              byte_size: chatAttachment.size,
              owner_user_id: user.id,
            },
          ])
          .select()
          .single();
        attachmentId = assetData?.id;
      }
    }
    // Insert message
    await supabase.from("conversation_messages").insert([
      {
        conversation_id: conversation.id,
        sender_id: user.id,
        message: chatInput,
        attachment: attachmentId,
      },
    ]);
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
                              <div className="mt-2 flex items-center gap-2">
                                <Paperclip className="h-4 w-4 text-muted-foreground" />
                                <a
                                  href={msg.attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs underline flex items-center text-primary font-medium"
                                  style={{ wordBreak: "break-all" }}
                                >
                                  {msg.attachment.name}
                                </a>
                                <a
                                  href={msg.attachment.url}
                                  download={msg.attachment.name}
                                  className="ml-1"
                                  title="Download"
                                >
                                  <Button variant="outline" size="icon">
                                    <Download className="h-4 w-4" />
                                  </Button>
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
                    {messages.map(msg => (
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
                            <div className="mt-2 flex items-center gap-2">
                              <Paperclip className="h-4 w-4 text-muted-foreground" />
                              <a
                                href={msg.attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs underline flex items-center text-primary font-medium"
                                style={{ wordBreak: "break-all" }}
                              >
                                {msg.attachment.name}
                              </a>
                              <a
                                href={msg.attachment.url}
                                download={msg.attachment.name}
                                className="ml-1"
                                title="Download"
                              >
                                <Button variant="outline" size="icon">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </a>
                            </div>
                          )}
                          <div className="text-[10px] text-muted-foreground mt-1 text-right">
                            {new Date(msg.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  {/* Chat Input */}
                  <form className="flex gap-2" onSubmit={handleSendChat}>
                    <Input
                      placeholder="Type your message..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      className="flex-1"
                      disabled={loading}
                    />
                    <label className="flex items-center gap-1 cursor-pointer">
                      <Paperclip className="h-4 w-4" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={loading}
                      />
                      {chatAttachment ? "Attached" : "Attach"}
                    </label>
                    <Button type="submit" className="flex items-center gap-1" disabled={loading}>
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
                        <X className="h-4 w-4" />
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
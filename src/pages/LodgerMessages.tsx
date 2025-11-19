import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  Paperclip,
  Download,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

const LodgerMessages = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [threadReads, setThreadReads] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatAttachment, setChatAttachment] = useState<File | null>(null);
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [newThreadSubject, setNewThreadSubject] = useState("");
  const [newThreadDescription, setNewThreadDescription] = useState("");
  const [creatingThread, setCreatingThread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch complaints (threads) for this lodger
  useEffect(() => {
    if (!user?.id) return;
    const fetchComplaints = async () => {
      const { data } = await supabase
        .from("complaints")
        .select("id, subject, assigned_to_user_id, status, urgency, created_at")
        .eq("raised_by_user_id", user.id)
        .order("created_at", { ascending: false });
      // Get last message for each complaint
      const complaintsWithLastMsg = await Promise.all(
        (data || []).map(async (comp: any) => {
          const { data: lastMsgArr } = await supabase
            .from("complaint_messages")
            .select("id, sender_id, message, created_at")
            .eq("complaint_id", comp.id)
            .order("created_at", { ascending: false })
            .limit(1);
          let lastMsg = lastMsgArr?.[0];
          let senderName = "";
          let senderRole = "";
          if (lastMsg) {
            // Get sender info
            const { data: lodger } = await supabase
              .from("lodger_profiles")
              .select("first_name, last_name")
              .eq("user_id", lastMsg.sender_id)
              .single();
            const { data: admin } = await supabase
              .from("admin_profiles")
              .select("bio")
              .eq("user_id", lastMsg.sender_id)
              .single();
            if (lodger) {
              senderName = `${lodger.first_name} ${lodger.last_name}`;
              senderRole = "Lodger";
            } else if (admin) {
              senderName = "Admin";
              senderRole = "Admin";
            } else {
              senderName = "Unknown";
              senderRole = "Unknown";
            }
          }
          return {
            ...comp,
            last_message: lastMsg?.message || "",
            last_message_time: lastMsg?.created_at || "",
            sender: senderName,
            sender_role: senderRole,
          };
        })
      );
      setComplaints(complaintsWithLastMsg);
      if (complaintsWithLastMsg.length > 0 && !selectedComplaintId) {
        setSelectedComplaintId(complaintsWithLastMsg[0].id);
      }
    };
    fetchComplaints();
  }, [user?.id]);

  // Fetch thread reads for lodger
  useEffect(() => {
    if (!user?.id) return;
    const fetchThreadReads = async () => {
      const { data } = await supabase
        .from("complaint_thread_reads")
        .select("complaint_id, user_id, last_opened_at")
        .eq("user_id", user.id);
      setThreadReads(data || []);
    };
    fetchThreadReads();
  }, [user?.id, complaints]);

  // Mark thread as opened when selected
  useEffect(() => {
    if (!selectedComplaintId || !user?.id) return;
    const upsertThreadRead = async () => {
      await supabase
        .from("complaint_thread_reads")
        .upsert(
          [
            {
              complaint_id: selectedComplaintId,
              user_id: user.id,
              last_opened_at: new Date().toISOString(),
            },
          ],
          { onConflict: "complaint_id,user_id" }
        );
      // Refresh threadReads
      const { data } = await supabase
        .from("complaint_thread_reads")
        .select("complaint_id, user_id, last_opened_at")
        .eq("user_id", user.id);
      setThreadReads(data || []);
    };
    upsertThreadRead();
  }, [selectedComplaintId, user?.id]);

  // Fetch messages for selected complaint
  useEffect(() => {
    if (!selectedComplaintId) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      const { data: msgs } = await supabase
        .from("complaint_messages")
        .select("id, sender_id, message, created_at, attachment")
        .eq("complaint_id", selectedComplaintId)
        .order("created_at", { ascending: true });

      // Get sender info and attachment for each message
      const msgsWithDetails = await Promise.all(
        (msgs || []).map(async (msg: any) => {
          let senderName = "";
          let senderRole = "";
          const { data: lodger } = await supabase
            .from("lodger_profiles")
            .select("first_name, last_name")
            .eq("user_id", msg.sender_id)
            .single();
          const { data: admin } = await supabase
            .from("admin_profiles")
            .select("bio")
            .eq("user_id", msg.sender_id)
            .single();
          if (lodger) {
            senderName = `${lodger.first_name} ${lodger.last_name}`;
            senderRole = "Lodger";
          } else if (admin) {
            senderName = "Admin";
            senderRole = "Admin";
          } else {
            senderName = "Unknown";
            senderRole = "Unknown";
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
            sender_role: senderRole,
            attachment: attachmentObj,
          };
        })
      );
      setMessages(msgsWithDetails);
    };
    fetchMessages();
  }, [selectedComplaintId]);

  // Supabase Realtime for new messages
  useEffect(() => {
    if (!selectedComplaintId) return;
    const channel = supabase
      .channel(`complaint_messages_${selectedComplaintId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "complaint_messages",
          filter: `complaint_id=eq.${selectedComplaintId}`,
        },
        async (payload) => {
          const msg = payload.new;
          let senderName = "";
          let senderRole = "";
          const { data: lodger } = await supabase
            .from("lodger_profiles")
            .select("first_name, last_name")
            .eq("user_id", msg.sender_id)
            .single();
          const { data: admin } = await supabase
            .from("admin_profiles")
            .select("bio")
            .eq("user_id", msg.sender_id)
            .single();
          if (lodger) {
            senderName = `${lodger.first_name} ${lodger.last_name}`;
            senderRole = "Lodger";
          } else if (admin) {
            senderName = "Admin";
            senderRole = "Admin";
          } else {
            senderName = "Unknown";
            senderRole = "Unknown";
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
              sender_role: senderRole,
              attachment: attachmentObj,
            },
          ]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedComplaintId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Responsive textarea handler
  const chatInputRefHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
    if (chatInputRef.current) {
      chatInputRef.current.style.height = "auto";
      chatInputRef.current.style.height = chatInputRef.current.scrollHeight + "px";
    }
  };

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
    await supabase.from("complaint_messages").insert([
      {
        complaint_id: selectedComplaintId,
        sender_id: user.id,
        message: chatInput,
        attachment: attachmentId,
      },
    ]);
    setChatInput("");
    setChatAttachment(null);
    if (chatInputRef.current) {
      chatInputRef.current.style.height = "auto";
    }
  };

  // File input for chat attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setChatAttachment(e.target.files[0]);
    }
  };

  // Check for new messages
  function hasNewMessages(thread) {
    const read = threadReads.find(
      (r) => r.complaint_id === thread.id && r.user_id === user?.id
    );
    if (!read) return true; // Never opened
    const lastMsgTime = new Date(thread.last_message_time);
    const lastOpened = new Date(read.last_opened_at);
    return lastMsgTime > lastOpened;
  }

  // Create new complaint thread
  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadSubject.trim() || !newThreadDescription.trim()) return;
    setCreatingThread(true);

    // Find admin user_id (first admin profile)
    const { data: adminProfile } = await supabase
      .from("admin_profiles")
      .select("user_id")
      .limit(1)
      .single();

    const adminUserId = adminProfile?.user_id || null;

    // Insert complaint
    const { data: complaint, error } = await supabase
      .from("complaints")
      .insert([
        {
          subject: newThreadSubject,
          description: newThreadDescription,
          raised_by_user_id: user.id,
          assigned_to_user_id: adminUserId,
          status: "open", // default
          urgency: "medium", // default
        },
      ])
      .select()
      .single();

    if (complaint?.id) {
      setShowNewThreadModal(false);
      setNewThreadSubject("");
      setNewThreadDescription("");
      setSelectedComplaintId(complaint.id);
      // Refresh complaints list
      const { data } = await supabase
        .from("complaints")
        .select("id, subject, assigned_to_user_id, status, urgency, created_at")
        .eq("raised_by_user_id", user.id)
        .order("created_at", { ascending: false });
      setComplaints(data || []);
    }
    setCreatingThread(false);
  };

  // Get selected complaint
  const selectedComplaint = complaints.find((c) => c.id === selectedComplaintId);

  return (
    <>
      <SEO
        title="Lodger Messages - Domus Servitia"
        description="View and send messages to admin via complaints."
        canonical="https://domusservitia.co.uk/lodger-messages"
      />
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <img src={logo} alt="Domus Servitia" className="h-10 rounded-lg" />
              <nav className="flex gap-2">
                <Button
                  variant="default"
                  className="flex items-center"
                  disabled
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Messages
                </Button>
              </nav>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Side Complaint Threads */}
            <div className="col-span-1">
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Complaint Threads</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => setShowNewThreadModal(true)}
                  >
                    <Plus className="h-4 w-4" />
                    New
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {complaints.map(thread => (
                      <div
                        key={thread.id}
                        className={`p-3 rounded-lg cursor-pointer border flex justify-between items-center ${
                          selectedComplaintId === thread.id
                            ? "bg-accent/10 border-accent"
                            : "border-border"
                        }`}
                        onClick={() => setSelectedComplaintId(thread.id)}
                      >
                        <div>
                          <span className="font-semibold">{thread.subject}</span>
                          <div className="text-xs text-muted-foreground">
                            {thread.sender} ({thread.sender_role})
                          </div>
                          <div className="text-xs mt-1 truncate">
                            {thread.last_message}
                          </div>
                          <div className="flex gap-2 mt-1">
                            <span
                              className={`text-[10px] px-2 py-1 rounded-full ${
                                thread.status === "open"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : thread.status === "in_progress"
                                  ? "bg-blue-100 text-blue-700"
                                  : thread.status === "awaiting_external"
                                  ? "bg-orange-100 text-orange-700"
                                  : thread.status === "resolved"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {thread.status.replace("_", " ")}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-1 rounded-full ${
                                thread.urgency === "critical"
                                  ? "bg-red-100 text-red-700"
                                  : thread.urgency === "high"
                                  ? "bg-orange-100 text-orange-700"
                                  : thread.urgency === "medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {thread.urgency}
                            </span>
                          </div>
                        </div>
                        {hasNewMessages(thread) && (
                          <span className="ml-2 px-2 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
                            New
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Thread View */}
            <div className="col-span-3">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>
                    {selectedComplaint
                      ? `Subject: ${selectedComplaint.subject}`
                      : "Select a complaint thread"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto mb-4">
                    {messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender_role === "Lodger"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`rounded-lg px-4 py-2 max-w-[70%] ${
                            msg.sender_role === "Lodger"
                              ? "bg-accent text-right"
                              : "bg-muted"
                          }`}
                        >
                          <div className="text-xs text-muted-foreground mb-1">
                            {msg.sender} ({msg.sender_role})
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
                  {selectedComplaint && (
                    <form className="flex gap-2" onSubmit={handleSendChat}>
                      <textarea
                        ref={chatInputRef}
                        placeholder="Type your message..."
                        value={chatInput}
                        onChange={chatInputRefHandler}
                        rows={1}
                        className="flex-1 resize-none border rounded px-2 py-2 min-h-[40px] max-h-[200px] transition-all"
                        style={{ overflow: "hidden" }}
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
                  )}
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
          </div>
        </div>
        {/* New Thread Modal */}
        {showNewThreadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative w-full max-w-md mx-2 sm:mx-auto">
              <Card className="border-border shadow-lg rounded-lg bg-card">
                <CardHeader className="sticky top-0 bg-card z-10">
                  <CardTitle>Start New Chat with Admin</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4"
                    onClick={() => setShowNewThreadModal(false)}
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleCreateThread}>
                    <label className="block mb-1 font-medium" htmlFor="subject">
                      Subject
                    </label>
                    <input
                      id="subject"
                      className="w-full border rounded px-2 py-2"
                      placeholder="Subject"
                      value={newThreadSubject}
                      onChange={e => setNewThreadSubject(e.target.value)}
                      required
                    />
                    <label className="block mb-1 font-medium" htmlFor="description">
                      Description
                    </label>
                    <textarea
                      id="description"
                      className="w-full border rounded px-2 py-2"
                      placeholder="Describe your issue or message"
                      value={newThreadDescription}
                      onChange={e => setNewThreadDescription(e.target.value)}
                      required
                    />
                    <div className="flex gap-2 justify-end sticky bottom-0 bg-card py-2">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setShowNewThreadModal(false)}
                        disabled={creatingThread}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={creatingThread}>
                        {creatingThread ? "Creating..." : "Start Chat"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LodgerMessages;
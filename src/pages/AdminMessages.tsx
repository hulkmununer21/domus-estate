import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Shield,
  Send,
  Paperclip,
  Download,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "awaiting_external", label: "Awaiting External" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const URGENCY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const AdminMessages = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("complaints");
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [complaintMessages, setComplaintMessages] = useState<any[]>([]);
  const [complaintThreadReads, setComplaintThreadReads] = useState<any[]>([]);
  const [complaintChatInput, setComplaintChatInput] = useState("");
  const [complaintChatAttachment, setComplaintChatAttachment] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [urgency, setUrgency] = useState("");
  const [updating, setUpdating] = useState(false);
  const complaintMessagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch complaints assigned to admin
  useEffect(() => {
    if (!user?.id || activeTab !== "complaints") return;
    const fetchComplaints = async () => {
      const { data } = await supabase
        .from("complaints")
        .select("id, subject, status, urgency, raised_by_user_id, created_at, description")
        .eq("assigned_to_user_id", user.id)
        .order("created_at", { ascending: false });
      setComplaints(data || []);
      if (data && data.length > 0 && !selectedComplaintId) {
        setSelectedComplaintId(data[0].id);
      }
    };
    fetchComplaints();
  }, [user?.id, activeTab]);

  // Fetch complaint thread reads for admin
  useEffect(() => {
    if (!user?.id || activeTab !== "complaints") return;
    const fetchThreadReads = async () => {
      const { data } = await supabase
        .from("complaint_thread_reads")
        .select("complaint_id, user_id, last_opened_at")
        .eq("user_id", user.id);
      setComplaintThreadReads(data || []);
    };
    fetchThreadReads();
  }, [user?.id, complaints, activeTab]);

  // Mark complaint thread as opened when selected
  useEffect(() => {
    if (!selectedComplaintId || !user?.id || activeTab !== "complaints") return;
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
      setComplaintThreadReads(data || []);
    };
    upsertThreadRead();
  }, [selectedComplaintId, user?.id, activeTab]);

  // Fetch messages for selected complaint
  useEffect(() => {
    if (!selectedComplaintId || activeTab !== "complaints") {
      setComplaintMessages([]);
      return;
    }
    const fetchMessages = async () => {
      const { data: msgs } = await supabase
        .from("complaint_messages")
        .select("id, sender_id, message, created_at, attachment")
        .eq("complaint_id", selectedComplaintId)
        .order("created_at", { ascending: true });

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
      setComplaintMessages(msgsWithDetails);
    };
    fetchMessages();
  }, [selectedComplaintId, activeTab]);

  // Fetch status and urgency for selected complaint
  useEffect(() => {
    if (!selectedComplaintId) return;
    const fetchComplaint = async () => {
      const { data } = await supabase
        .from("complaints")
        .select("status, urgency")
        .eq("id", selectedComplaintId)
        .single();
      setStatus(data?.status || "");
      setUrgency(data?.urgency || "");
    };
    fetchComplaint();
  }, [selectedComplaintId]);

  // Supabase Realtime for new complaint messages
  useEffect(() => {
    if (!selectedComplaintId || activeTab !== "complaints") return;
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
          setComplaintMessages((prev) => [
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
  }, [selectedComplaintId, activeTab]);

  // Scroll to bottom on new message
  useEffect(() => {
    complaintMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [complaintMessages]);

  // Send message handler for complaints
  const handleSendComplaintChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintChatInput.trim() && !complaintChatAttachment) return;
    let attachmentId = null;
    if (complaintChatAttachment) {
      const fileName = `${Date.now()}_${complaintChatAttachment.name}`;
      const { error: uploadError } = await supabase.storage
        .from("unit-images")
        .upload(fileName, complaintChatAttachment);
      if (!uploadError) {
        const publicUrl = supabase.storage
          .from("unit-images")
          .getPublicUrl(fileName).data?.publicUrl;
        const { data: assetData } = await supabase
          .from("assets")
          .insert([
            {
              storage_provider: "supabase",
              bucket: "unit-images",
              file_key: fileName,
              file_name: complaintChatAttachment.name,
              public_url: publicUrl,
              content_type: complaintChatAttachment.type,
              byte_size: complaintChatAttachment.size,
              owner_user_id: user.id,
            },
          ])
          .select()
          .single();
        attachmentId = assetData?.id;
      }
    }
    await supabase.from("complaint_messages").insert([
      {
        complaint_id: selectedComplaintId,
        sender_id: user.id,
        message: complaintChatInput,
        attachment: attachmentId,
      },
    ]);
    setComplaintChatInput("");
    setComplaintChatAttachment(null);
  };

  // File input for chat attachment
  const handleComplaintFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setComplaintChatAttachment(e.target.files[0]);
    }
  };

  // Update status and urgency
  const handleUpdateStatusUrgency = async () => {
    if (!selectedComplaintId) return;
    setUpdating(true);
    await supabase
      .from("complaints")
      .update({ status, urgency })
      .eq("id", selectedComplaintId);
    setUpdating(false);
    // Optionally refresh complaints
    const { data } = await supabase
      .from("complaints")
      .select("id, subject, status, urgency, raised_by_user_id, created_at, description")
      .eq("assigned_to_user_id", user.id)
      .order("created_at", { ascending: false });
    setComplaints(data || []);
  };

  // Check for new messages
  function hasNewComplaintMessages(thread) {
    const read = complaintThreadReads.find(
      (r) => r.complaint_id === thread.id && r.user_id === user?.id
    );
    if (!read) return true;
    const lastMsgTime = new Date(thread.last_message_time);
    const lastOpened = new Date(read.last_opened_at);
    return lastMsgTime > lastOpened;
  }

  // Get selected complaint
  const selectedComplaint = complaints.find((c) => c.id === selectedComplaintId);

  // --- Add your messages tab logic here ---
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [threadReads, setThreadReads] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatAttachment, setChatAttachment] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch message threads (conversations where admin is a participant)
  useEffect(() => {
    if (!user?.id || activeTab !== "messages") return;
    const fetchThreads = async () => {
      const { data: participantRows } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      const conversationIds = participantRows?.map((row: any) => row.conversation_id) || [];
      if (conversationIds.length === 0) {
        setThreads([]);
        return;
      }

      const { data: conversations } = await supabase
        .from("conversations")
        .select("id, type, subject, created_by_id")
        .in("id", conversationIds);

      const threadsWithLastMsg = await Promise.all(
        (conversations || []).map(async (conv: any) => {
          const { data: lastMsgArr } = await supabase
            .from("conversation_messages")
            .select("id, sender_id, message, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1);

          let lastMsg = lastMsgArr?.[0];
          let senderName = "";
          let senderRole = "";
          if (lastMsg) {
            const { data: landlord } = await supabase
              .from("landlord_profiles")
              .select("first_name, last_name")
              .eq("user_id", lastMsg.sender_id)
              .single();
            const { data: lodger } = await supabase
              .from("lodger_profiles")
              .select("first_name, last_name")
              .eq("user_id", lastMsg.sender_id)
              .single();
            const { data: staff } = await supabase
              .from("staff_profiles")
              .select("first_name, last_name")
              .eq("user_id", lastMsg.sender_id)
              .single();
            const { data: admin } = await supabase
              .from("admin_profiles")
              .select("bio")
              .eq("user_id", lastMsg.sender_id)
              .single();

            if (landlord) {
              senderName = `${landlord.first_name} ${landlord.last_name}`;
              senderRole = "Landlord";
            } else if (lodger) {
              senderName = `${lodger.first_name} ${lodger.last_name}`;
              senderRole = "Lodger";
            } else if (staff) {
              senderName = `${staff.first_name} ${staff.last_name}`;
              senderRole = "Staff";
            } else if (admin) {
              senderName = "Admin";
              senderRole = "Admin";
            } else {
              senderName = "Unknown";
              senderRole = "Unknown";
            }
          }
          return {
            ...conv,
            last_message: lastMsg?.message || "",
            last_message_time: lastMsg?.created_at || "",
            sender: senderName,
            sender_role: senderRole,
          };
        })
      );
      setThreads(threadsWithLastMsg);
      if (threadsWithLastMsg.length > 0 && !selectedThreadId) {
        setSelectedThreadId(threadsWithLastMsg[0].id);
      }
    };
    fetchThreads();
  }, [user?.id, activeTab]);

  // Fetch thread reads for admin
  useEffect(() => {
    if (!user?.id || activeTab !== "messages") return;
    const fetchThreadReads = async () => {
      const { data } = await supabase
        .from("conversation_thread_reads")
        .select("conversation_id, user_id, last_opened_at")
        .eq("user_id", user.id);
      setThreadReads(data || []);
    };
    fetchThreadReads();
  }, [user?.id, threads, activeTab]);

  // Mark thread as opened when selected
    useEffect(() => {
      if (!selectedThreadId || !user?.id || activeTab !== "messages") return;
      const upsertThreadRead = async () => {
        await supabase
          .from("conversation_thread_reads")
          .upsert(
            [
              {
                conversation_id: selectedThreadId,
                user_id: user.id,
                last_opened_at: new Date().toISOString(),
              },
            ],
            { onConflict: "conversation_id,user_id" }
          );
        const { data } = await supabase
          .from("conversation_thread_reads")
          .select("conversation_id, user_id, last_opened_at")
          .eq("user_id", user.id);
        setThreadReads(data || []);
      };
      upsertThreadRead();
    }, [selectedThreadId, user?.id, activeTab]);

  // Fetch messages for selected thread
  useEffect(() => {
    if (!selectedThreadId || activeTab !== "messages") {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      const { data: msgs } = await supabase
        .from("conversation_messages")
        .select("id, sender_id, message, created_at, attachment")
        .eq("conversation_id", selectedThreadId)
        .order("created_at", { ascending: true });

      const msgsWithDetails = await Promise.all(
        (msgs || []).map(async (msg: any) => {
          let senderName = "";
          let senderRole = "";
          const { data: landlord } = await supabase
            .from("landlord_profiles")
            .select("first_name, last_name")
            .eq("user_id", msg.sender_id)
            .single();
          const { data: lodger } = await supabase
            .from("lodger_profiles")
            .select("first_name, last_name")
            .eq("user_id", msg.sender_id)
            .single();
          const { data: staff } = await supabase
            .from("staff_profiles")
            .select("first_name, last_name")
            .eq("user_id", msg.sender_id)
            .single();
          const { data: admin } = await supabase
            .from("admin_profiles")
            .select("bio")
            .eq("user_id", msg.sender_id)
            .single();

          if (landlord) {
            senderName = `${landlord.first_name} ${landlord.last_name}`;
            senderRole = "Landlord";
          } else if (lodger) {
            senderName = `${lodger.first_name} ${lodger.last_name}`;
            senderRole = "Lodger";
          } else if (staff) {
            senderName = `${staff.first_name} ${staff.last_name}`;
            senderRole = "Staff";
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
  }, [selectedThreadId, activeTab]);

  // Supabase Realtime for new messages
  useEffect(() => {
    if (!selectedThreadId || activeTab !== "messages") return;
    const channel = supabase
      .channel(`conversation_messages_${selectedThreadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation_messages",
          filter: `conversation_id=eq.${selectedThreadId}`,
        },
        async (payload) => {
          const msg = payload.new;
          let senderName = "";
          let senderRole = "";
          const { data: landlord } = await supabase
            .from("landlord_profiles")
            .select("first_name, last_name")
            .eq("user_id", msg.sender_id)
            .single();
          const { data: lodger } = await supabase
            .from("lodger_profiles")
            .select("first_name, last_name")
            .eq("user_id", msg.sender_id)
            .single();
          const { data: staff } = await supabase
            .from("staff_profiles")
            .select("first_name, last_name")
            .eq("user_id", msg.sender_id)
            .single();
          const { data: admin } = await supabase
            .from("admin_profiles")
            .select("bio")
            .eq("user_id", msg.sender_id)
            .single();

          if (landlord) {
            senderName = `${landlord.first_name} ${landlord.last_name}`;
            senderRole = "Landlord";
          } else if (lodger) {
            senderName = `${lodger.first_name} ${lodger.last_name}`;
            senderRole = "Lodger";
          } else if (staff) {
            senderName = `${staff.first_name} ${staff.last_name}`;
            senderRole = "Staff";
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
  }, [selectedThreadId, activeTab]);

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
      const fileName = `${Date.now()}_${chatAttachment.name}`;
      const { error: uploadError } = await supabase.storage
        .from("unit-images")
        .upload(fileName, chatAttachment);
      if (!uploadError) {
        const publicUrl = supabase.storage
          .from("unit-images")
          .getPublicUrl(fileName).data?.publicUrl;
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
    await supabase.from("conversation_messages").insert([
      {
        conversation_id: selectedThreadId,
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

  // Check for new messages
  function hasNewMessages(thread) {
    const read = threadReads.find(
      (r) => r.conversation_id === thread.id && r.user_id === user?.id
    );
    if (!read) return true;
    const lastMsgTime = new Date(thread.last_message_time);
    const lastOpened = new Date(read.last_opened_at);
    return lastMsgTime > lastOpened;
  }

  // Get selected thread
  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  // --- End messages tab logic ---

  return (
    <>
      <SEO
        title="Admin Messages - Domus Servitia"
        description="Admin messaging and complaints."
        canonical="https://domusservitia.co.uk/admin-messages"
      />
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <img src={logo} alt="Domus Servitia" className="h-10 rounded-lg" />
              <nav className="flex gap-2">
                <Button
                  variant={activeTab === "messages" ? "default" : "outline"}
                  className="flex items-center"
                  onClick={() => setActiveTab("messages")}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Messages
                </Button>
                <Button
                  variant={activeTab === "complaints" ? "default" : "outline"}
                  className="flex items-center"
                  onClick={() => setActiveTab("complaints")}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Complaints
                </Button>
              </nav>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {activeTab === "messages" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Side Threads */}
              <div className="col-span-1">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Message Threads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {threads.map(thread => (
                        <div
                          key={thread.id}
                          className={`p-3 rounded-lg cursor-pointer border flex justify-between items-center ${
                            selectedThreadId === thread.id
                              ? "bg-accent/10 border-accent"
                              : "border-border"
                          }`}
                          onClick={() => setSelectedThreadId(thread.id)}
                        >
                          <div>
                            <span className="font-semibold">{thread.subject}</span>
                            <div className="text-xs text-muted-foreground">
                              {thread.sender} ({thread.sender_role})
                            </div>
                            <div className="text-xs mt-1 truncate">
                              {thread.last_message}
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
                      {selectedThread
                        ? `Subject: ${selectedThread.subject}`
                        : "Select a message thread"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto mb-4">
                      {messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.sender_role === "Admin"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`rounded-lg px-4 py-2 max-w-[70%] ${
                              msg.sender_role === "Admin"
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
                    {selectedThread && (
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
          )}

          {activeTab === "complaints" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Side Complaint Threads */}
              <div className="col-span-1">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Complaints</CardTitle>
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
                              {thread.raised_by_user_id}
                            </div>
                            <div className="text-xs mt-1 truncate">
                              {thread.description}
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
                          {hasNewComplaintMessages(thread) && (
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

              {/* Main Complaint Thread View */}
              <div className="col-span-3">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>
                      {selectedComplaint
                        ? `Subject: ${selectedComplaint.subject}`
                        : "Select a complaint"}
                    </CardTitle>
                    {selectedComplaint && (
                      <div className="flex gap-4 mt-2 items-center">
                        <div>
                          <span className="font-semibold mr-2">Status:</span>
                          <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            disabled={updating}
                            className="border rounded px-2 py-1"
                          >
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <span className="font-semibold mr-2">Urgency:</span>
                          <select
                            value={urgency}
                            onChange={e => setUrgency(e.target.value)}
                            disabled={updating}
                            className="border rounded px-2 py-1"
                          >
                            {URGENCY_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleUpdateStatusUrgency}
                          disabled={updating}
                        >
                          Update
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {selectedComplaint && (
                      <div className="mb-4 text-sm text-muted-foreground">
                        <span className="font-semibold">Description:</span> {selectedComplaint.description}
                      </div>
                    )}
                    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto mb-4">
                      {complaintMessages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.sender_role === "Admin"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`rounded-lg px-4 py-2 max-w-[70%] ${
                              msg.sender_role === "Admin"
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
                      <div ref={complaintMessagesEndRef} />
                    </div>
                    {/* Chat Input */}
                    {selectedComplaint && (
                      <form className="flex gap-2" onSubmit={handleSendComplaintChat}>
                        <Input
                          placeholder="Type your message..."
                          value={complaintChatInput}
                          onChange={e => setComplaintChatInput(e.target.value)}
                          className="flex-1"
                        />
                        <label className="flex items-center gap-1 cursor-pointer">
                          <Paperclip className="h-4 w-4" />
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleComplaintFileChange}
                          />
                          {complaintChatAttachment ? "Attached" : "Attach"}
                        </label>
                        <Button type="submit" className="flex items-center gap-1">
                          <Send className="h-4 w-4" />
                          Send
                        </Button>
                      </form>
                    )}
                    {complaintChatAttachment && (
                      <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                        <Paperclip className="h-4 w-4" />
                        <span>{complaintChatAttachment.name}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setComplaintChatAttachment(null)}
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
          )}
        </div>
      </div>
    </>
  );
};

export default AdminMessages;
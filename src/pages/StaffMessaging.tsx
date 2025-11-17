import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Paperclip, Send, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const StaffMessaging = () => {
  const { user } = useAuth();
  const [admin, setAdmin] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAdmin();
  }, [user]);

  useEffect(() => {
    if (admin && user) {
      findOrCreateConversation();
    }
    // eslint-disable-next-line
  }, [admin, user]);

  useEffect(() => {
    if (conversation) {
      fetchMessages(conversation.id);
    }
    // eslint-disable-next-line
  }, [conversation]);

  // Fetch admin profile (assume only one admin)
  const fetchAdmin = async () => {
    const { data: admins } = await supabase
      .from("admin_profiles")
      .select("user_id, email")
      .limit(1);
    if (admins && admins.length > 0) {
      setAdmin(admins[0]);
    }
  };

  // Find or create direct conversation between staff and admin
  const findOrCreateConversation = async () => {
    if (!user?.id || !admin?.user_id) return;
    // Find existing direct conversation
    const { data: participantRows } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    const convIds = participantRows?.map((row: any) => row.conversation_id) || [];
    let foundConv = null;
    if (convIds.length > 0) {
      const { data: convs } = await supabase
        .from("conversations")
        .select("id,subject")
        .in("id", convIds)
        .eq("type", "direct");
      for (const conv of convs || []) {
        // Check if admin is also a participant
        const { data: participants } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", conv.id);
        const userIds = participants?.map((p: any) => p.user_id);
        if (userIds?.includes(admin.user_id)) {
          foundConv = conv;
          break;
        }
      }
    }
    if (foundConv) {
      setConversation(foundConv);
      return;
    }
    // Create new conversation
    const { data: convData, error: convError } = await supabase
      .from("conversations")
      .insert([
        {
          type: "direct",
          subject: `Chat with Admin`,
          created_by_id: user.id,
        },
      ])
      .select()
      .single();
    if (convError || !convData) return;
    await supabase.from("conversation_participants").insert([
      { conversation_id: convData.id, user_id: user.id },
      { conversation_id: convData.id, user_id: admin.user_id },
    ]);
    setConversation(convData);
  };

  // Fetch messages for conversation
  const fetchMessages = async (convId: string) => {
    const { data: messages } = await supabase
      .from("conversation_messages")
      .select(
        `
          id,
          sender_id,
          message,
          created_at,
          attachment,
          asset:assets (
            public_url,
            file_name
          )
        `
      )
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages(
      (messages || []).map((msg: any) => ({
        ...msg,
        file_url: msg.asset?.public_url || null,
        file_name: msg.asset?.file_name || null,
      }))
    );
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Send message handler (file upload logic inspired by LodgerMessages)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText && !fileUpload) return;
    setSending(true);

    let assetId = null;
    if (fileUpload) {
      const fileName = `${Date.now()}_${fileUpload.name}`;
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("public")
        .upload(fileName, fileUpload);

      if (!uploadError) {
        const publicUrl = supabase.storage
          .from("public")
          .getPublicUrl(fileName).data?.publicUrl;
        // Insert asset row
        const { data: assetData } = await supabase
          .from("assets")
          .insert([
            {
              storage_provider: "supabase",
              bucket: "public",
              file_key: fileName,
              file_name: fileUpload.name,
              public_url: publicUrl,
              content_type: fileUpload.type,
              byte_size: fileUpload.size,
              owner_user_id: user.id,
            },
          ])
          .select()
          .single();
        assetId = assetData?.id;
      } else {
        toast.error("File upload failed");
        setSending(false);
        return;
      }
    }

    await supabase.from("conversation_messages").insert([
      {
        conversation_id: conversation.id,
        sender_id: user.id,
        message: messageText,
        attachment: assetId,
        created_at: new Date().toISOString(),
      },
    ]);
    setMessageText("");
    setFileUpload(null);
    fetchMessages(conversation.id);
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>
              <MessageCircle className="h-5 w-5 mr-2 inline" />
              Chat with Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            {/* Chat Area */}
            {conversation ? (
              <>
                <div className="flex-1 overflow-y-auto mb-2" style={{ minHeight: "250px", maxHeight: "350px" }}>
                  {messages.length === 0 ? (
                    <div className="text-muted-foreground text-xs text-center mt-8">No messages yet.</div>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} className={`mb-2 flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"}`}>
                        <div className={`rounded-lg px-3 py-2 ${msg.sender_id === user.id ? "bg-gradient-gold text-primary" : "bg-muted text-foreground"}`}>
                          <div className="text-sm">{msg.message}</div>
                          {msg.file_url && (
                            <div className="mt-2 flex items-center gap-2">
                              <Paperclip className="h-4 w-4 text-muted-foreground" />
                              <a
                                href={msg.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs underline flex items-center text-primary font-medium"
                                style={{ wordBreak: "break-all" }}
                              >
                                {msg.file_name || "Attachment"}
                              </a>
                            </div>
                          )}
                          <div className="text-[10px] text-muted-foreground text-right mt-1">
                            {new Date(msg.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
                <form className="flex items-center gap-2 border-t border-border pt-2"
                  onSubmit={handleSendMessage}>
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1"
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    disabled={sending}
                  />
                  <Input
                    type="file"
                    className="hidden"
                    id="chat-file-upload"
                    onChange={e => setFileUpload(e.target.files?.[0] || null)}
                    disabled={sending}
                  />
                  <label htmlFor="chat-file-upload" className="cursor-pointer">
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                    {fileUpload ? (
                      <span className="ml-1 text-xs">{fileUpload.name}</span>
                    ) : (
                      <span className="ml-1 text-xs">Attach</span>
                    )}
                  </label>
                  {fileUpload && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setFileUpload(null)}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                  <Button type="submit" className="bg-gradient-gold text-primary font-semibold" disabled={sending}>
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Loading chat...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffMessaging;
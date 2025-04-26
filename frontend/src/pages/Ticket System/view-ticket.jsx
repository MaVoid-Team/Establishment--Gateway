import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const apiUrl = import.meta.env.VITE_API_URL;

// Translation helper functions
function getStatusBadgeVariant(status, t) {
  switch (status.toLowerCase()) {
    case "open":
      return "warning";
    case "pending":
      return "warning";
    case "in progress":
      return "info";
    case "resolved":
      return "success";
    default:
      return "outline";
  }
}

function getPriorityBadgeVariant(priority, t) {
  switch (priority.toLowerCase()) {
    case "high":
      return "destructive";
    case "medium":
      return "warning";
    case "low":
      return "info";
    default:
      return "outline";
  }
}

export default function TicketDetails() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        // Fetch ticket details
        const ticketResponse = await axios.get(`${apiUrl}/api/v1/tickets/${id}`, {
          withCredentials: true,
        });
        setTicket(ticketResponse.data);

        // Check if user is admin
        const userResponse = await axios.get(`${apiUrl}/api/v1/employees/myData`, {
          withCredentials: true,
        });
        const userRole = userResponse.data?.data?.employee?.employeeRole?.permissions?.isAdmin;
        setIsAdmin(userRole === true || userRole === "True");
      } catch (err) {
        setError(t("ticketDetails.errors.fetchTicket"));
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [id, t]);

  const handleCloseTicket = async () => {
    try {
      const payload = { status_id: 3 }; // Set status to "Resolved"
      await axios.put(`${apiUrl}/api/v1/tickets/${id}`, payload, {
        withCredentials: true,
      });

      toast({
        title: t("ticketDetails.toast.successTitle"),
        description: t("ticketDetails.toast.ticketResolved"),
      });

      setTicket((prevTicket) => ({
        ...prevTicket,
        status: { ...prevTicket.status, status_name: "Resolved" },
      }));
    } catch (error) {
      toast({
        title: t("ticketDetails.toast.errorTitle"),
        description: t("ticketDetails.toast.ticketResolveError"),
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: t("ticketDetails.toast.validationErrorTitle"),
        description: t("ticketDetails.toast.emptyComment"),
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.post(
        `${apiUrl}/api/v1/tickets/${id}/comments`,
        { comment: newComment },
        { withCredentials: true }
      );

      toast({
        title: t("ticketDetails.toast.successTitle"),
        description: t("ticketDetails.toast.commentAdded"),
      });

      const updatedTicket = await axios.get(`${apiUrl}/api/v1/tickets/${id}`, {
        withCredentials: true,
      });
      setTicket(updatedTicket.data);

      setNewComment("");
    } catch (error) {
      toast({
        title: t("ticketDetails.toast.errorTitle"),
        description: t("ticketDetails.toast.commentAddError"),
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>{t("ticketDetails.loading")}</div>;
  if (error) return <div>{error}</div>;
  if (!ticket) return <div>{t("ticketDetails.noTicket")}</div>;

  return (
    <div className={`container mx-auto p-10 ${isRTL ? "text-right" : "text-left"}`}>
      <Card>
        <CardHeader>
          <CardTitle>{ticket.title || t("ticketDetails.noTitle")}</CardTitle>
          <CardDescription>
            {t("ticketDetails.ticketId")}: {ticket.ticket_id || t("ticketDetails.unknown")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <h3 className="text-lg font-semibold">{t("ticketDetails.description")}</h3>
              <p>{ticket.description || t("ticketDetails.noDescription")}</p>
            </div>
            <div className="flex justify-between">
              <div>
                <h3 className="text-sm font-semibold">{t("ticketDetails.status")}</h3>
                <Badge
                  variant={getStatusBadgeVariant(ticket.status?.status_name || "", t)}
                >
                  {t(`ticketDetails.statuses.${ticket.status?.status_name.toLowerCase()}`) || t("ticketDetails.unknown")}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-semibold">{t("ticketDetails.priority")}</h3>
                <Badge
                  variant={getPriorityBadgeVariant(ticket.priority?.priority_level || "", t)}
                >
                  {t(`ticketDetails.priorities.${ticket.priority?.priority_level.toLowerCase()}`) || t("ticketDetails.unspecified")}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-semibold">{t("ticketDetails.category")}</h3>
                <Badge variant="outline">
                  {ticket.category?.category_name || t("ticketDetails.uncategorized")}
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold">{t("ticketDetails.createdBy")}</h3>
                <UserInfo user={ticket.creator || { name: t("ticketDetails.unknown"), email: t("ticketDetails.noEmail") }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{t("ticketDetails.assignedTo")}</h3>
                <UserInfo user={ticket.assignee || { name: t("ticketDetails.unknown"), email: t("ticketDetails.noEmail") }} />
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold">{t("ticketDetails.replies")}</h3>
              {(ticket.comments || []).map((comment) => (
                <CommentItem key={comment.comment_id} comment={comment} />
              ))}
            </div>

            {ticket.status?.status_name.toLowerCase() !== "resolved" && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold">{t("ticketDetails.addReply")}</h3>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t("ticketDetails.replyPlaceholder")}
                    rows={4}
                  />
                  <Button className="mt-2" onClick={handleAddComment}>
                    {t("ticketDetails.submitReply")}
                  </Button>
                </div>
              </>
            )}
            <Separator />
            <div>
              <h3 className="text-lg font-semibold">{t("ticketDetails.attachments")}</h3>
              {(ticket.attachments || []).map((attachment) => (
                <AttachmentItem key={attachment.attachment_id} attachment={attachment} />
              ))}
            </div>
            {isAdmin && ticket.status?.status_name.toLowerCase() === "open" && (
              <div className="flex justify-end">
                <Button variant="destructive" onClick={handleCloseTicket}>
                  {t("ticketDetails.resolveTicket")}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UserInfo({ user }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center space-x-2">
      <Avatar>
        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name || "User"}`} />
        <AvatarFallback>
          {(user.name || "U N").split(" ").map((n) => n[0]).join("")}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">{user.name || t("ticketDetails.unknown")}</p>
        <p className="text-xs text-muted-foreground">{user.email || t("ticketDetails.noEmail")}</p>
      </div>
    </div>
  );
}

function CommentItem({ comment }) {
  const { t } = useTranslation();
  return (
    <Card className="mt-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <UserInfo user={comment.user || { name: t("ticketDetails.unknown"), email: t("ticketDetails.noEmail") }} />
          <span className="text-xs text-muted-foreground">
            {new Date(comment.created_at || Date.now()).toLocaleString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p>{comment.comment || t("ticketDetails.noComment")}</p>
      </CardContent>
    </Card>
  );
}

function AttachmentItem({ attachment }) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/v1/tickets/attachments/${attachment.attachment_id}/download`,
        { responseType: "blob", withCredentials: true }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: t("ticketDetails.toast.successTitle"),
        description: t("ticketDetails.toast.downloadStarted"),
      });
    } catch (error) {
      toast({
        title: t("ticketDetails.toast.errorTitle"),
        description: t("ticketDetails.toast.downloadError"),
        variant: "destructive",
      });
    }
  };

  return (
    <div 
      onClick={handleDownload}
      className="flex items-center gap-2 p-2 border rounded hover:bg-accent cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-blue-500"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
      <span className="text-sm text-blue-500 hover:underline">
        {attachment.file_name || t("ticketDetails.unnamedFile")}
      </span>
    </div>
  );
}


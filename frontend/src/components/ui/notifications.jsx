import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { SocketContext } from "../../../contexts/SocketContext";
import { Bell } from "lucide-react";

const NotificationIcon = () => {
  const [notifications, setNotifications] = useState([]); // All notifications currently shown
  const [realTimeNotifications, setRealTimeNotifications] = useState([]); // Newly received notifications
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const [recentlyReadIds, setRecentlyReadIds] = useState(new Set());

  const socket = useContext(SocketContext);
  const notificationListRef = useRef(null);
  const sentinelRef = useRef(null);

  // Clear recentlyRead notifications after delay
  useEffect(() => {
    if (recentlyReadIds.size > 0) {
      const timer = setTimeout(() => {
        setRecentlyReadIds(new Set());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [recentlyReadIds]);

  const fetchNotifications = useCallback(
    async (page = 1, limit = 20) => {
      if (isLoading || (page > 1 && !hasMore)) return;

      setIsLoading(true);
      setError(null);

      return new Promise((resolve) => {
        socket.emit("fetch_notifications", { page, limit }, (response) => {
          if (!response || !Array.isArray(response.notifications)) {
            console.error("Failed to fetch notifications");
            setError("Failed to load notifications. Please try again.");
            setIsLoading(false);
            resolve(false);
            return;
          }

          const {
            notifications: fetchedNotifications,
            currentPage: fetchedPage,
            totalPages: fetchedTotalPages,
          } = response;

          setNotifications((prevNotifications) => {
            if (page === 1) {
              const mergedNotifications = [
                ...realTimeNotifications,
                ...fetchedNotifications.filter(
                  (notif) =>
                    !realTimeNotifications.some(
                      (realTime) => realTime.id === notif.id
                    )
                ),
              ];

              const hasUnread = mergedNotifications.some(
                (notification) => !notification.is_read
              );
              setHasUnreadNotifications(hasUnread);

              return mergedNotifications;
            }

            const updatedNotifications = [
              ...prevNotifications,
              ...fetchedNotifications,
            ];
            const hasUnread = updatedNotifications.some(
              (notification) => !notification.is_read
            );
            setHasUnreadNotifications(hasUnread);

            return updatedNotifications;
          });

          if (page === 1) {
            setRealTimeNotifications([]);
          }

          setCurrentPage(fetchedPage);
          setTotalPages(fetchedTotalPages);
          setHasMore(fetchedPage < fetchedTotalPages);
          setIsLoading(false);
          resolve(true);
        });
      });
    },
    [isLoading, hasMore, realTimeNotifications, socket]
  );

  useEffect(() => {
    fetchNotifications(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNotification) => {
      console.log("Received new notification:", newNotification);

      if (!isOpen) {
        setRealTimeNotifications((prev) => [newNotification, ...prev]);
        setHasUnreadNotifications(true);
      } else {
        setNotifications((prev) => [newNotification, ...prev]);
        if (!isMarkingAsRead) {
          setHasUnreadNotifications(true);
        }
      }
    };

    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [socket, isOpen, isMarkingAsRead]);

  useEffect(() => {
    if (!socket) return;

    const handleReconnect = () => {
      console.log("Socket reconnected, resetting notifications");
      setNotifications([]);
      setRealTimeNotifications([]);
      setCurrentPage(1);
      setTotalPages(1);
      setHasMore(true);
      setHasUnreadNotifications(false);
      setError(null);
      setRecentlyReadIds(new Set());
      fetchNotifications(1);
    };

    socket.on("reconnect", handleReconnect);

    return () => {
      socket.off("reconnect", handleReconnect);
    };
  }, [socket, fetchNotifications]);

  const markNotificationsAsRead = useCallback(async () => {
    setIsMarkingAsRead(true);

    return new Promise((resolve) => {
      socket.emit("mark_notifications_read", (response) => {
        console.log("Notifications marked as read:", response);

        if (response.status === "success") {
          // Add all currently unread notification IDs to recentlyReadIds
          setNotifications((prevNotifications) => {
            const unreadIds = new Set(
              prevNotifications
                .filter((notification) => !notification.is_read)
                .map((notification) => notification.id)
            );
            setRecentlyReadIds(unreadIds);

            return prevNotifications.map((notification) => ({
              ...notification,
              is_read: true,
            }));
          });
          setRealTimeNotifications([]);
          setHasUnreadNotifications(false);
          resolve(true);
        } else {
          setError("Failed to mark notifications as read. Please try again.");
          resolve(false);
        }
        setIsMarkingAsRead(false);
      });
    });
  }, [socket]);

  const toggleNotifications = async () => {
    const wasOpen = isOpen;
    setIsOpen(!wasOpen);

    if (!wasOpen) {
      await fetchNotifications(1);
      if (hasUnreadNotifications) {
        await markNotificationsAsRead();
      }
    }
  };

  useEffect(() => {
    if (!isOpen || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          fetchNotifications(currentPage + 1);
        }
      },
      {
        root: notificationListRef.current,
        threshold: 1.0,
      }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [isOpen, hasMore, isLoading, currentPage, fetchNotifications]);

  // Check if a notification should appear as unread
  const shouldShowAsUnread = (notification) => {
    return !notification.is_read || recentlyReadIds.has(notification.id);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleNotifications}
        className="p-2 rounded-full hover:bg-stone-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#d4ab71] focus:ring-opacity-50"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Bell className="w-6 h-6 text-[#d4ab71]" />
        {hasUnreadNotifications && (
          <span
            className="absolute top-0 right-0 block w-3 h-3 bg-red-500 rounded-full animate-pulse"
            aria-label="New Notifications"
          ></span>
        )}
      </button>
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 bg-stone-800 rounded-lg shadow-lg py-1 z-10 max-h-96 overflow-y-auto"
          ref={notificationListRef}
        >
          {notifications.length === 0 && !isLoading ? (
            <div className="px-4 py-2 text-sm text-[#d4ab71]">
              No notifications
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-2 text-sm ${
                    shouldShowAsUnread(notification)
                      ? "text-[#d4ab71]"
                      : "text-stone-500"
                  } transition-colors duration-300`}
                >
                  <div className="flex justify-between items-center">
                    <span>{notification.message}</span>
                    {shouldShowAsUnread(notification) && (
                      <span className="new-badge">• New</span>
                    )}
                  </div>
                  <small>
                    {new Date(notification.created_at).toLocaleString()}
                  </small>
                </div>
              ))}
              <div ref={sentinelRef}></div>
              {isLoading && (
                <div className="px-4 py-2 text-sm text-[#d4ab71] text-center">
                  Loading...
                </div>
              )}
              {!hasMore && notifications.length > 0 && (
                <div className="px-4 py-2 text-sm text-[#d4ab71] text-center">
                  You've reached the end.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;

"use client";

import { useState } from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from "react-i18next";


// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

export default function Schedule() {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start: new Date(),
    end: new Date(),
  });
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEventInfoOpen, setIsEventInfoOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleSelectSlot = ({ start, end }) => {
    setNewEvent({ title: "", description: "", start, end });
    setIsAddEventOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsEventInfoOpen(true);
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (newEvent.title) {
      setEvents((prev) => [...prev, { ...newEvent, id: Date.now() }]);
      setNewEvent({
        title: "",
        description: "",
        start: new Date(),
        end: new Date(),
      });
      setIsAddEventOpen(false);
    }
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
      setIsEventInfoOpen(false);
      setIsDeleteConfirmOpen(false);
      setSelectedEvent(null);
    }
  };

  return (
    <div className="h-screen p-10 flex flex-col flex-grow backdrop-blur-3xl rounded-3xl shadow-lg hover:backdrop-blur-md transition-all duration-300">
      <h1 className="text-2xl font-bold mb-4 ">{t("schedule")}</h1>
      <div className="flex-grow backdrop-blur-lg">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          style={{ height: '100%' }}
          step={60}
          timeslots={1}
          components={{
            toolbar: CustomToolbar,
          }}
          messages={{
            today: t("today"),
            previous: t("previous"),
            next: t("next"),
            month: t("month"),
            week: t("week"),
            day: t("day"),
            agenda: t("agenda"),
          }}
        />
      </div>
      {/* Create Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogTrigger asChild >
          <div className="add-event-btn flex justify-end ">
            <Button size="sm" className="mt-4">
              {t("addEvent")}
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]"
         dir={i18n.language === "ar" ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-center">{t("addNewEvent")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div>
              <Label htmlFor="title">{t("eventTitle")}</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                placeholder={t("enterEventTitle")}
              />
            </div>
            <div>
              <Label htmlFor="description">{t("eventDescription")}</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                placeholder={t("enterEventDescription")}
              />
            </div>
            <div>
              <Label htmlFor="start">{t("startDate")}</Label>
              <Input 
                dir={i18n.language === "ar" ? "rtl" : "ltr"}
                id="start"
                type="datetime-local"
                value={moment(newEvent.start).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, start: new Date(e.target.value) })
                }
              />
            </div>
            <div dir={i18n.language === "ar" ? "rtl" : "ltr"}>
              <Label dir={i18n.language === "ar" ? "rtl" : "ltr"}
              htmlFor="end">{t("endDate")}</Label>
              <Input
                dir={i18n.language === "ar" ? "rtl" : "ltr"}
                id="end"
                type="datetime-local"
                value={moment(newEvent.end).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, end: new Date(e.target.value) })
                }
              />
            </div>
            <Button type="submit">{t("addEvent")}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={isEventInfoOpen} onOpenChange={setIsEventInfoOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              <strong>{t("description")}:</strong> {selectedEvent?.description}
            </p>
            <p>
              <strong>{t("start")}:</strong> {selectedEvent?.start.toLocaleString()}
            </p>
            <p>
              <strong>{t("end")}:</strong> {selectedEvent?.end.toLocaleString()}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteConfirmOpen(true)}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Event Confirmation */}
      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("deleteConfirmation")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent}>
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const CustomToolbar = (props) => {
  const { t } = useTranslation();

  const goToBack = () => {
    props.onNavigate('PREV');
  };

  const goToNext = () => {
    props.onNavigate('NEXT');
  };

  const goToCurrent = () => {
    props.onNavigate('TODAY');
  };

  const getViewNames = () => {
    const viewNames = ['month', 'week', 'day', 'agenda'];
    return viewNames.map((name) => (
      <Button
        key={name}
        onClick={() => props.onView(name)}
        variant={props.view === name ? "default" : "outline"}
        className="capitalize"
      >
        {t(name)}
      </Button>
    ));
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between p-4 gap-4  rounded-lg ">
      {/* Left section: "Today", left/right arrows */}
      <div className="flex items-center gap-2 order-1 md:order-none ">
        <Button onClick={goToCurrent}>{t("today")}</Button>
        <Button variant="outline" size="icon" onClick={goToBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={goToNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Center section: Date label */}
      <div className="order-2 md:order-none flex justify-center w-full md:w-auto ">
        <span className="text-lg font-semibold">{props.label}</span>
      </div>

      {/* Right section: View buttons */}
      <div className="flex gap-2 order-3 md:order-none ">
        {getViewNames()}
      </div>
    </div>
  );
};

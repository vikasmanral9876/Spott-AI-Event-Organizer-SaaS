/* eslint-disable react-hooks/purity */
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EventCard from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { Calendar, Loader2, MapPin, Ticket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { format } from "date-fns";

const MyTicketsPage = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const router = useRouter();

  const { data: registrations, isLoading } = useConvexQuery(
    api.registrations.getMyRegistrations,
  );

  const { mutate: cancelRegistration, isLoading: isCacelling } =
    useConvexMutation(api.registrations.cancelRegistration);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const now = Date.now();

  const upcomingTickets = registrations?.filter(
    (reg) =>
      reg.event &&
      (reg.event.startDate >= now ||
        (reg.event.startDate <= now && reg.event.endDate >= now)) &&
      reg.status === "confirmed",
  );

  const pastTickets = registrations?.filter(
    (reg) =>
      reg.event && (reg.event.endDate < now || reg.status === "cancelled"),
  );

  const handleCancelRegistration = async (registrationId) => {
    if (!window.confirm("Are you sure you want to cancel this registration?"))
      return;
    try {
      await cancelRegistration({ registrationId });
      toast.success("Registration cancelled successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to cancel registration");
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Tickets</h1>
          <p className="text-muted-foreground">
            View and manage your event registrations
          </p>
        </div>

        {/* Upcoming Tickets */}
        {upcomingTickets?.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTickets.map((registration) => (
                <EventCard
                  key={registration._id}
                  event={registration.event}
                  action="ticket"
                  onClick={() => setSelectedTicket(registration)}
                  onDelete={() => handleCancelRegistration(registration._id)}
                />
              ))}
            </div>
          </div>
        )}
        {/* Past Tickets */}
        {pastTickets?.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Past Events</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastTickets.map((registration) => (
                <EventCard
                  key={registration._id}
                  event={registration.event}
                  action={null}
                  className="opacity-60"
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty Tickets */}
        {upcomingTickets?.length === 0 && pastTickets?.length === 0 && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-6xl mb-4">🎟️</div>
              <h2 className="text-2xl font-bold">No tickets yet</h2>
              <p className="text-muted-foreground">
                Register for events to see your tickets here
              </p>
              <Button asChild className="gap-2">
                <Link href="/explore">
                  <Ticket className="w-4 h-4" /> Browse Events
                </Link>
              </Button>
            </div>
          </Card>
        )}

        {/* QR Code Modal */}
        {selectedTicket && (
          <Dialog
            open={!!selectedTicket}
            onOpenChange={() => setSelectedTicket(null)}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Your Ticket</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="text-center">
                  <p className="font-semibold mb-1">
                    {selectedTicket.attendeeName}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedTicket.event.title}
                  </p>
                </div>

                <div className="flex justify-center p-6 bg-white rounded-lg">
                  <QRCode value={selectedTicket.qrCode} size={200} level="H" />
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Ticket ID
                  </p>
                  <p className="font-mono text-sm">{selectedTicket.qrCode}</p>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(selectedTicket.event.startDate, "PPP, h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {`${selectedTicket.event.city}, ${
                        selectedTicket.event.state ||
                        selectedTicket.event.country
                      }`}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Show this QR code at the event entrance for check-in
                </p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage;


"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast"
import { Loader2, LogIn, LogOut, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import { getCalendarEvents } from '@/ai/flows/get-calendar-events';
import { createCalendarEvent, deleteCalendarEvent } from '@/ai/tools/calendar';
import { Calendar } from '@/components/ui/calendar-view';
import { DatePicker } from '@/components/ui/date-picker';
import { getLocalTimeZone, today, parseDateTime, type DateValue, ZonedDateTime } from '@internationalized/date';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TimeField } from '@/components/ui/date-picker';
import { I18nProvider } from 'react-aria';

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
}

export default function SchedulerPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { toast } = useToast();

  const fetchEvents = async (token: string) => {
    setIsSyncing(true);
    try {
      const result = await getCalendarEvents({ accessToken: token });
      setEvents(result.events);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch calendar events.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      if (currentUser) {
        setUser(currentUser);
        const storedToken = sessionStorage.getItem('google-access-token');
        if (storedToken) {
          setAccessToken(storedToken);
          await fetchEvents(storedToken);
        }
      } else {
        setUser(null);
        setAccessToken(null);
        setEvents([]);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar');
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
        sessionStorage.setItem('google-access-token', credential.accessToken);
        await fetchEvents(credential.accessToken);
      }
      setUser(result.user);
    } catch (error) {
      console.error("Google Sign-In Error", error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Failed to sign in with Google.",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setAccessToken(null);
    sessionStorage.removeItem('google-access-token');
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!accessToken) return;
    try {
      await deleteCalendarEvent({ eventId }, accessToken);
      toast({
        title: "Event Deleted",
        description: "The event has been successfully removed from your calendar.",
      });
      fetchEvents(accessToken); // Refresh events
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the event.",
      });
    }
  }

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [events]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <I18nProvider locale="en-US">
        <main className="flex flex-col h-full bg-secondary">
        <Card className="m-4 md:m-8 flex-1 flex flex-col shadow-lg">
            <CardHeader className="flex flex-row justify-between items-center">
            <div>
                <CardTitle className="font-serif text-2xl flex items-center gap-3">
                <CalendarIcon className="h-6 w-6" />
                Scheduler
                </CardTitle>
                <CardDescription>View, create, and manage your Google Calendar events.</CardDescription>
            </div>
            {user ? (
                <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground hidden md:inline">
                    Welcome, {user.displayName}
                </span>
                <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
                </div>
            ) : (
                <Button onClick={handleGoogleSignIn}>
                <LogIn className="mr-2 h-4 w-4" />
                Connect Google Calendar
                </Button>
            )}
            </CardHeader>
            <CardContent className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <Calendar
                    aria-label="Date (Unavailable)"
                    isDisabled
                    className='w-full'
                />
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full mt-4" disabled={!user}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Event
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>Create New Calendar Event</DialogTitle>
                    </DialogHeader>
                    <CreateEventForm accessToken={accessToken} onSuccess={() => {
                    if (accessToken) fetchEvents(accessToken);
                    setIsDialogOpen(false);
                    }} />
                </DialogContent>
                </Dialog>
            </div>
            <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 font-serif">Upcoming Events</h3>
                {isSyncing && <Loader2 className="h-5 w-5 animate-spin" />}
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {user && sortedEvents.length > 0 ? (
                    sortedEvents.map(event => (
                    <Card key={event.id} className="p-4 flex justify-between items-center">
                        <div>
                        <p className="font-semibold">{event.summary}</p>
                        <p className="text-sm text-muted-foreground">
                            {new Date(event.start).toLocaleString()} - {new Date(event.end).toLocaleString()}
                        </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </Card>
                    ))
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>{user ? "No upcoming events found." : "Please connect your Google Calendar to see your events."}</p>
                    </div>
                )}
                </div>
            </div>
            </CardContent>
        </Card>
        </main>
    </I18nProvider>
  );
}

function CreateEventForm({ accessToken, onSuccess }: { accessToken: string | null; onSuccess: () => void }) {
  const [summary, setSummary] = useState('');
  const [date, setDate] = useState<DateValue>(today(getLocalTimeZone()));
  const [startTime, setStartTime] = useState(parseDateTime(new Date().toISOString().substring(0, 16)));
  const [endTime, setEndTime] = useState(parseDateTime(new Date(Date.now() + 60 * 60 * 1000).toISOString().substring(0, 16)));

  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !summary) return;
    setIsCreating(true);

    try {
      const startDateTimeAbsolute = startTime.toAbsolute(getLocalTimeZone());
      const endDateTimeAbsolute = endTime.toAbsolute(getLocalTimeZone());

      const startZonedDateTime = new ZonedDateTime(date.year, date.month, date.day, getLocalTimeZone(), startDateTimeAbsolute);
      const endZonedDateTime = new ZonedDateTime(date.year, date.month, date.day, getLocalTimeZone(), endDateTimeAbsolute);

      await createCalendarEvent({
        summary,
        startDateTime: startZonedDateTime.toAbsoluteString(),
        endDateTime: endZonedDateTime.toAbsoluteString(),
      }, accessToken);

      toast({
        title: "Event Created",
        description: "The event has been added to your calendar.",
      });
      onSuccess();
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create the event.",
      });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="summary">Event Title</Label>
        <Input
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="e.g., Meeting with Client"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Date</Label>
        <DatePicker label="Event date" value={date} onChange={setDate} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Time</Label>
          <TimeField label="Start time" value={startTime} onChange={setStartTime} />
        </div>
        <div className="space-y-2">
          <Label>End Time</Label>
          <TimeField label="End time" value={endTime} onChange={setEndTime} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isCreating}>
        {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
        Add Event
      </Button>
    </form>
  )
}

    
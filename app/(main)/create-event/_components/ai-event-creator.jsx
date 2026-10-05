"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const MAX_PROMPT_LENGTH = 1000;

export default function AIEventCreator({ onEventGenerated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generateEvent = async () => {
    if (loading) return;

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      toast.error("Please describe your event");
      return;
    }

    if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
      toast.error("Please keep your event description within the allowed length.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmedPrompt }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate event");
      }

      onEventGenerated(data);
      toast.success("Event details generated! Review and customize below.");
      setIsOpen(false);
      setPrompt("");
    } catch (error) {
      toast.error(error?.message || "Failed to generate event. Please try again.");
      console.error("AI Event Generation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!loading) setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Event Creator
          </DialogTitle>
          <DialogDescription>
            Describe your event idea and let AI create the details for you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: A tech meetup about React 19 for developers in Bangalore. It should cover new features like Actions and use hook improvements..."
              rows={6}
              maxLength={MAX_PROMPT_LENGTH}
              disabled={loading}
              className="resize-none"
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
              <span>Be specific about topic, audience, and format</span>
              <span className={prompt.length > MAX_PROMPT_LENGTH ? "text-red-500" : ""}>
                {prompt.length}/{MAX_PROMPT_LENGTH}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={generateEvent}
              disabled={loading || !prompt.trim() || prompt.trim().length > MAX_PROMPT_LENGTH}
              className="flex-1 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

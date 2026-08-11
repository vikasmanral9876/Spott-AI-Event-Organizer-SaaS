/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, QrCode } from "lucide-react";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";

const QRScannerModal = ({ isOpen, onClose }) => {
  const [scannerReady, setScannerReady] = useState(false);
  const [error, setError] = useState(null);

  const { mutate: checkInAttendee } = useConvexMutation(
    api.registrations.checkInAttendee,
  );

  const handleCheckIn = async (qrCode) => {
    try {
      const result = await checkInAttendee({
        qrCode,
      });
      if (result.success) {
        toast.success("✅ Check in successful!");
        onClose();
      } else {
        toast.error(result.message || "Check-in failed");
      }
    } catch (error) {
      toast.error(error.message || "Invalid QR code");
    }
  };

  useEffect(() => {
    let scanner = null;
    let mounted = true;

    const initScanner = async () => {
      if (!isOpen) return;

      try {
        console.log("Initializing QR scanner...");

        try {
          await navigator.mediaDevices.getUserMedia({ video: true });
          console.log("Camera permission granted");
        } catch (permError) {
          console.error("Camera permission denied:", permError);
          setError("Camera permission denied. Please enable camera access.");
          return;
        }

        // Dynamically import the library
        const { Html5QrcodeScanner } = await import("html5-qrcode");

        if (!mounted) return;

        console.log("Creating scanner instance...");

        scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            videoConstraints: {
              facingMode: "environment",
            },
          },
          false,
        );

        const onScanSuccess = (decodedText) => {
          console.log("QR Code detected:", decodedText);
          if (scanner) {
            scanner.clear().catch(console.error);
          }
          handleCheckIn(decodedText);
        };

        const onScanError = (error) => {
          if (error && !error.includes("NotFoundException")) {
            console.debug("Scan error:", error);
          }
        };

        scanner.render(onScanSuccess, onScanError);
        setScannerReady(true);
        setError(null);
        console.log("Scanner rendered successfully");
      } catch (error) {
        console.error("Failed to initialize scanner:", error);
        setError(`Failed to start camera: ${error.message}`);
        toast.error("Camera failed. Please use manual entry.");
      }
    };

    initScanner();

    return () => {
      mounted = false;
      if (scanner) {
        console.log("Cleaning up scanner...");
        scanner.clear().catch(console.error);
      }
      setScannerReady(false);
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-purple-500" />
            Check-In Attendee
          </DialogTitle>
          <DialogDescription>
            Scan QR code or enter ticket ID manually
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : (
          <>
            <div
              id="qr-reader"
              className="w-full"
              style={{ minHeight: "350px" }}
            ></div>
            {!scannerReady && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Starting camera...
                </span>
              </div>
            )}
            <p className="text-sm text-muted-foreground text-center">
              {scannerReady
                ? "Position the QR code within the frame"
                : "Please allow camera access when prompted"}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QRScannerModal;
